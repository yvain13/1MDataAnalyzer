# ServiceNow Data Analyzer — Scoped App Design

**Date:** 2026-04-19  
**Scope:** `x_1119723_1mdataan`  
**App name:** 1MDataAnalyzer  
**SDK:** `@servicenow/sdk` 4.6.0 (now-sdk / Fluent DSL)  
**Target:** Same-instance analysis (Australia region)  
**LLM:** OpenAI only, via SN Connection & Credential Aliases + Outbound REST Message  

---

## Overview

Convert the existing Node.js/Express ServiceNow Data Analyzer into a native ServiceNow scoped app. The app lets users run AI-powered analysis on any of 6 standard SN tables (incidents, changes, cases, requests, problems, tasks), sampling records via GlideRecord, sending batches to OpenAI for pattern extraction, and synthesizing a final HTML report stored in a scoped table.

Since the app runs on the same instance it analyzes, there is no external SN connection concept — GlideRecord/GlideAggregate replace all outbound REST calls to ServiceNow. ACLs handle per-user record visibility automatically.

---

## Architecture

```
React UiPage (client)
  └── fetch() → Scripted REST API (/api/x_1119723_1mdataan/analyzer/...)
        └── Script Includes (server-side, scoped)
              ├── AnalyzerFieldService     → sys_dictionary (GlideRecord)
              ├── AnalyzerPreflightService → GlideAggregate + GlideRecord
              ├── AnalyzerJobService       → CRUD on scoped tables
              └── AnalyzerEngineService    → analysis pipeline
                    └── AnalyzerLLMService → RESTMessageV2 → OpenAI API
```

---

## Data Model

### Tables (Fluent — `src/fluent/tables/`)

#### `x_1119723_1mdataan_analysis`
One row per analysis run.

| Field | Type | Notes |
|---|---|---|
| `table_name` | String(80) | e.g. `incident` |
| `date_from` | String(20) | ISO date string |
| `date_to` | String(20) | ISO date string |
| `status` | Choice | queued / sampling / analyzing / completed / failed |
| `progress_pct` | Integer | 0–100 |
| `phase_label` | String(200) | Human-readable phase description |
| `estimated_records` | Integer | Total matching records |
| `processed_records` | Integer | Records actually sampled |
| `sampling_strategy` | Choice | temporal / category / cluster / keyword |
| `selected_fields` | String(2000) | JSON array of field names |
| `category_field` | String(80) | Optional field for stratification |
| `subcategory_field` | String(80) | Optional sub-field |
| `encoded_query` | String(2000) | Optional SN encoded query filter |
| `custom_instructions` | String(2000) | Extra prompt instructions from user |
| `sample_size` | Integer | Target sample size (100–2000) |
| `error_message` | String(1000) | Populated on failure |
| `completed_at` | GlideDateTime | Completion timestamp |

#### `x_1119723_1mdataan_result`
One row per completed analysis.

| Field | Type | Notes |
|---|---|---|
| `analysis` | Reference → `x_1119723_1mdataan_analysis` | |
| `llm_report` | HTML (rich_text) | Full HTML report for rendering + print-to-PDF |
| `category_breakdown` | String(4000) | JSON array `[{label, count, pct}]` |
| `temporal_trend` | String(2000) | JSON array `[{period, count}]` |

#### `x_1119723_1mdataan_field_cache`
Cache for field discovery (avoids repeated sys_dictionary queries).

| Field | Type | Notes |
|---|---|---|
| `sn_table` | String(80) | Table name |
| `fields_json` | String(8000) | JSON array of field descriptors |
| `cached_at` | GlideDateTime | Cache timestamp; TTL = 1 hour |

### LLM Configuration

No custom table. Uses SN-native **Connection & Credential Aliases**:
- **Connection Alias**: `x_1119723_1mdataan_openai` → `https://api.openai.com`
- **Credential**: Basic auth, username = `apikey`, password = OpenAI API key
- **Outbound REST Message**: `OpenAI_ChatCompletions`, references the alias above
- **OpenAI model**: Stored in sys_property `x_1119723_1mdataan.openai_model` (default: `gpt-4.1-nano`)

---

## API Layer

### Scripted REST API
**Base path:** `/api/x_1119723_1mdataan/analyzer`  
**Auth:** Session cookie (same-instance, no extra auth headers)

| Method | Path | Purpose | Delegate |
|---|---|---|---|
| GET | `/tables` | Static list of 6 supported tables | inline |
| GET | `/tables/{table}/fields` | Field discovery grouped by type | `AnalyzerFieldService` |
| POST | `/analyses/preflight` | Total count + 3 sample records preview | `AnalyzerPreflightService` |
| POST | `/analyses` | Create analysis record + enqueue background job | `AnalyzerJobService` |
| GET | `/analyses` | List all analysis records | `AnalyzerJobService` |
| GET | `/analyses/{id}/status` | Poll progress (status, pct, phase_label) | `AnalyzerJobService` |
| GET | `/analyses/{id}/results` | Fetch completed result | `AnalyzerJobService` |
| DELETE | `/analyses/{id}` | Delete analysis + linked result | `AnalyzerJobService` |

**Background job pattern:** `POST /analyses` creates the analysis record (status=`queued`) then calls `new GlideExecutionTracker().start('AnalyzerEngineService', 'runAnalysis', id)` asynchronously. The React wizard polls `GET /analyses/{id}/status` every 2 seconds.

---

## Script Includes

All scoped to `x_1119723_1mdataan`, `server_side_only: true`.

### `AnalyzerFieldService`
- Queries `sys_dictionary` via GlideRecord for a given table's fields
- Groups by normalized type (string, integer, datetime, reference, boolean, other)
- Reads/writes `x_1119723_1mdataan_field_cache`; cache TTL 1 hour

### `AnalyzerPreflightService`
- Uses `GlideAggregate` for total record count (fast, no row scan)
- Fetches 3 sample records via GlideRecord with `setLimit(3)`
- Returns `{ totalCount, sampleRecords }` for the preflight step

### `AnalyzerJobService`
Thin GlideRecord wrapper for both tables:
- `createAnalysis(data)`, `getAnalysis(id)`, `updateAnalysis(id, data)`, `listAnalyses()`, `deleteAnalysis(id)`
- `createResult(data)`, `getResultByAnalysis(analysisId)`

### `AnalyzerLLMService`
OpenAI client via `RESTMessageV2`:
- `complete(prompt, maxTokens)` → calls `/v1/chat/completions` via Outbound REST Message
- Model read from sys_property `x_1119723_1mdataan.openai_model`
- Returns `{ content, model }` or throws with clear error message

### `AnalyzerEngineService`
Main analysis pipeline (direct port of `analysis-engine.ts`). Called by background job.

**Phases:**
1. **Count** (5%): `GlideAggregate` for total count
2. **Sample** (15–34%): Stratified sampling via GlideRecord — same 4 strategies (temporal, category, cluster, keyword)
3. **LLM extraction** (35–65%): Batch records → OpenAI extraction prompt → JSON themes/anomalies
4. **Temporal trend** (68%): Monthly count aggregation via `GlideAggregate`
5. **Category breakdown** (70%): Category distribution via `GlideAggregate`
6. **LLM synthesis** (72–88%): Merge extracted insights → OpenAI synthesis prompt → HTML report
7. **Save** (100%): Write result record; update analysis status to `completed`

Updates `progress_pct` and `phase_label` on the analysis record between each phase.

---

## React UI

### Stack
- React 18.2.0 (required by now-sdk — update from 19.x in package.json)
- `@servicenow/react-components` for all UI elements
- Horizon Design System CSS tokens for theming (auto dark/light mode)
- URLSearchParams for routing (no external router library)
- `fetch()` with `X-UserToken: window.g_ck` header for API calls

### Navigation (URLSearchParams)
```
?view=table               Step 1 — Select Table
?view=fields              Step 2 — Select Fields
?view=dates               Step 3 — Date Range
?view=sampling            Step 4 — Sampling Strategy
?view=preflight           Step 5 — Preflight Check
?view=status&id={id}      Step 6 — Run Status (polls every 2s)
?view=results&id={id}     Step 7 — Results
?view=history             Past Runs
```

### Layout
- Left sidebar (240px, `content-tree` tokens): app logo + wizard step list + History link
- Main content area: current wizard step
- Stepper indicator at top of main area showing all 6 steps with `stepper_step--done/partial/none` tokens

### Components Used
| View | Key Components |
|---|---|
| All | `Button`, sidebar with `content-tree` CSS |
| Select Table | `Card` grid of 6 table options |
| Select Fields | `Checkbox` list grouped by field type |
| Date Range | `Input` (date type), preset `Button` group |
| Sampling | `RadioButtons` for strategy, conditional `Input` for keywords |
| Preflight | `Card` with record count + sample rows |
| Run Status | `ProgressBar`, `Badge` for status, phase label text |
| Results | HTML render of `llm_report` + `<canvas>` charts |
| History | `NowRecordListConnected` on analysis table |

### Report Download
A **UI Action** on `x_1119723_1mdataan_result`:
- Label: "Download Report"
- Opens new window: `window.open('/x_1119723_1mdataan_report.do?id=' + sys_id)`
- A second UiPage (`x_1119723_1mdataan_report.do`) renders only the raw HTML from `llm_report`
- User prints to PDF via browser `Ctrl+P` / Print dialog

---

## File Structure

```
src/
  client/
    tsconfig.json
    index.html
    main.tsx
    app.tsx                          # URLSearchParams router + layout shell
    app.css                          # Horizon token aliases + layout
    utils/
      fields.ts                      # display() + value() helpers
      api.ts                         # fetch wrapper with g_ck header
    components/
      Sidebar.tsx / Sidebar.css
      Stepper.tsx / Stepper.css
      ProgressBar.tsx
    pages/
      SelectTablePage.tsx
      SelectFieldsPage.tsx
      DateRangePage.tsx
      SamplingPage.tsx
      PreflightPage.tsx
      RunStatusPage.tsx
      ResultsPage.tsx
      HistoryPage.tsx
    services/
      AnalysisService.ts             # All REST API calls
  fluent/
    tables/
      analysis-table.now.ts
      result-table.now.ts
      field-cache-table.now.ts
    scripted-rest/
      analyzer-api.now.ts
    ui-pages/
      analyzer.now.ts                # Main wizard UiPage
      report.now.ts                  # Print/download UiPage
    ui-actions/
      download-report.now.ts
    sys-properties/
      openai-model.now.ts
  server/
    AnalyzerFieldService.ts
    AnalyzerPreflightService.ts
    AnalyzerJobService.ts
    AnalyzerLLMService.ts
    AnalyzerEngineService.ts
    tsconfig.json
```

---

## Key Differences from Node App

| Node App | Scoped App |
|---|---|
| Express routes | Scripted REST API |
| better-sqlite3 | Scoped GlideRecord tables |
| SN REST client (outbound) | GlideRecord / GlideAggregate (in-process) |
| LLM client (Node fetch) | RESTMessageV2 + Connection Alias |
| PDFKit | HTML rich_text field + browser print |
| In-memory analysis queue | GlideExecutionTracker background job |
| Basic auth stored base64 | No SN credentials needed (same instance) |
| React 19 + Tailwind + wouter | React 18.2 + SN Horizon tokens + URLSearchParams |
| No Connect step | No Connect step (same instance) |

---

## Out of Scope

- Ollama / Anthropic / Azure OpenAI support (OpenAI only)
- Store/Share publication (build first, publish later)
- Multi-instance analysis
- Scheduled/recurring analyses
