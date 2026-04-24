# 1M Data Analyzer

A ServiceNow scoped application that uses an LLM to analyze large data tables (incidents, requests, any custom table) for patterns, root causes, and trends. Built with the [ServiceNow Fluent SDK](https://developer.servicenow.com/dev.do#!/reference/now-sdk).

**Scope:** `x_1119723_1mdataan`
**Stack:** Fluent SDK · React 18 (UI page) · Scripted REST API · async Business Rule · OpenAI

---

## What it does

A wizard-driven UI lets a user:

1. Pick any ServiceNow table (Incident, Request, etc.)
2. Choose fields to feed the LLM
3. Set a date range
4. Pick a sampling strategy (temporal, category, keyword, cluster)
5. Run a preflight check (record count, sampling math)
6. Submit — the analysis runs in the background and produces an LLM-written report with category breakdowns, temporal trends, and recommendations

A "Past Runs" view lists every analysis with status badges (`queued → sampling → analyzing → completed/failed`).

---

## Prerequisites

- Node.js 20.x or 22.x
- A ServiceNow PDI (Personal Developer Instance) or sub-prod instance with admin
- An OpenAI API key

---

## Install

```bash
# 1. Clone and install
git clone https://github.com/yvain13/1MDataAnalyzer.git
cd 1MDataAnalyzer
npm install

# 2. Authenticate against your instance
npx now-sdk auth --add <your-instance>.service-now.com
npx now-sdk auth --use <your-instance>.service-now.com

# 3. Deploy the app
npm run deploy
```

After `npm run deploy` completes, navigate in your instance to:

```
https://<your-instance>.service-now.com/x_1119723_1mdataan_analyzer.do
```

---

## One-time configuration

The OpenAI key is **not** stored in source. After the first deploy:

1. In your instance, go to `sys_properties.list`
2. Find `x_1119723_1mdataan.openai_api_key`
3. Paste your `sk-...` key into the **Value** field, save

(Optional) Adjust the model in `x_1119723_1mdataan.openai_model` — defaults to `gpt-4.1-nano`.

---

## How it runs (architecture)

```
[REST POST /api/x_1119723_1mdataan/analyzer/analyses]
        │
        ▼
   inserts row in x_1119723_1mdataan_analysis (status = queued)
        │
        ▼
   async Business Rule on insert fires
        │
        ▼
   AnalyzerEngineService.runAnalysis(sysId)
   ├── _count    → estimate total records
   ├── _sample   → temporal/category/keyword/cluster
   ├── _extractionPass → batch LLM calls (OpenAI)
   ├── _monthlyTrend
   ├── _categoryDistribution
   └── _synthesize → final LLM report
        │
        ▼
   inserts row in x_1119723_1mdataan_result (status = completed)
```

The UI polls `GET /api/x_1119723_1mdataan/analyzer/analyses/{id}/status` for live progress.

---

## Project layout

```
src/
  client/                  React UI page (wizard + history)
    components/
    pages/
    services/
  server/                  Server JS (script includes + REST handlers)
    AnalyzerEngineService.js
    AnalyzerJobService.js
    AnalyzerLLMService.js
    AnalyzerFieldService.js
    AnalyzerPreflightService.js
    business-rules/
      run-analysis.js
    routes/                Scripted REST endpoint scripts
  fluent/                  Fluent metadata (.now.ts)
    business-rules/
    script-includes/
    scripted-rest/
    sys-properties/
    tables/
    ui-actions/
    ui-pages/
```

---

## Development

```bash
npm run build       # build only (no deploy)
npm run dev         # watch + redeploy on save
npm run types       # regenerate TypeScript types from instance schema
npm run transform   # convert legacy XML → Fluent (when seeding from an existing app)
```

---

## Credits

Crafted by **Tushar Mishra** — [reacademy.ai](https://reacademy.ai)
