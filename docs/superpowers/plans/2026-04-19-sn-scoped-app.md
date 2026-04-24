# ServiceNow Data Analyzer — Scoped App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Node.js ServiceNow Data Analyzer into a native SN scoped app (`x_1119723_1mdataan`) using now-sdk Fluent DSL, React 18.2 UiPages, and OpenAI via SN Connection Alias.

**Architecture:** React wizard UiPage → Scripted REST API → Script Includes (GlideRecord/GlideAggregate for data, RESTMessageV2 for OpenAI) → 3 scoped tables. Analysis runs as a background GlideScriptedHierarchicalWorker so progress polling works within REST timeouts.

**Tech Stack:** `@servicenow/sdk` 4.6.0, React 18.2.0, `@servicenow/react-components`, ServiceNow Fluent DSL, GlideRecord, GlideAggregate, RESTMessageV2, Connection & Credential Aliases.

---

## File Map

```
src/
  client/
    tsconfig.json                         MODIFY
    index.html                            MODIFY
    main.tsx                              MODIFY
    app.tsx                               MODIFY
    app.css                               MODIFY
    utils/
      fields.ts                           CREATE
      api.ts                              CREATE
    components/
      Sidebar.tsx + Sidebar.css           CREATE
      Stepper.tsx + Stepper.css           CREATE
    pages/
      SelectTablePage.tsx                 CREATE
      SelectFieldsPage.tsx                CREATE
      DateRangePage.tsx                   CREATE
      SamplingPage.tsx                    CREATE
      PreflightPage.tsx                   CREATE
      RunStatusPage.tsx                   CREATE
      ResultsPage.tsx                     CREATE
      HistoryPage.tsx                     CREATE
    services/
      AnalysisService.ts                  CREATE
    report/
      index.html                          CREATE
      report-main.tsx                     CREATE
  fluent/
    tables/
      analysis-table.now.ts              CREATE
      result-table.now.ts                CREATE
      field-cache-table.now.ts           CREATE
    script-includes/
      analyzer-field-service.now.ts      CREATE
      analyzer-preflight-service.now.ts  CREATE
      analyzer-job-service.now.ts        CREATE
      analyzer-llm-service.now.ts        CREATE
      analyzer-engine-service.now.ts     CREATE
    scripted-rest/
      analyzer-api.now.ts                CREATE
    ui-pages/
      analyzer.now.ts                    MODIFY
      report.now.ts                      CREATE
    ui-actions/
      download-report.now.ts             CREATE
    sys-properties/
      openai-config.now.ts               CREATE
  server/
    AnalyzerFieldService.js              CREATE
    AnalyzerPreflightService.js          CREATE
    AnalyzerJobService.js                CREATE
    AnalyzerLLMService.js                CREATE
    AnalyzerEngineService.js             CREATE
    analyzer-api-handlers.js             CREATE
```

---

## Task 1: Update package.json — React 18.2 + react-components

**Files:**
- Modify: `package.json`
- Modify: `src/client/tsconfig.json`

- [ ] **Step 1: Update package.json**

```json
{
  "name": "1mdataanalyzer",
  "version": "0.0.1",
  "description": "",
  "license": "UNLICENSED",
  "imports": {
    "#now:*": "./@types/servicenow/fluent/*/index.js"
  },
  "scripts": {
    "build": "now-sdk build",
    "deploy": "now-sdk install",
    "transform": "now-sdk transform",
    "types": "now-sdk dependencies",
    "dev": "now-sdk run dev"
  },
  "devDependencies": {
    "@servicenow/sdk": "4.6.0",
    "@servicenow/glide": "27.0.5",
    "typescript": "5.5.4",
    "@servicenow/isomorphic-rollup": "^1.3.0",
    "@types/react": "18.3.12",
    "@types/react-dom": "18.3.5"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@servicenow/react-components": "^0.1.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: no errors, `node_modules/@servicenow/react-components` present.

- [ ] **Step 3: Update client tsconfig.json**

Replace `src/client/tsconfig.json`:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "module": "es2022",
    "target": "es2022",
    "lib": ["ES2022", "DOM"],
    "jsx": "preserve",
    "strict": false
  }
}
```

- [ ] **Step 4: Build to verify**

```bash
npx @servicenow/sdk build
```

Expected: `Build succeeded`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/client/tsconfig.json
git commit -m "chore: pin React 18.2 and add @servicenow/react-components"
```

---

## Task 2: Scoped Tables

**Files:**
- Create: `src/fluent/tables/analysis-table.now.ts`
- Create: `src/fluent/tables/result-table.now.ts`
- Create: `src/fluent/tables/field-cache-table.now.ts`

- [ ] **Step 1: Create analysis table**

```typescript
// src/fluent/tables/analysis-table.now.ts
import '@servicenow/sdk/global'
import { Table, StringColumn, IntegerColumn, DateTimeColumn } from '@servicenow/sdk/core'

export const analysisTable = Table({
  name: 'x_1119723_1mdataan_analysis',
  label: 'Data Analysis',
  schema: {
    table_name:          StringColumn({ label: 'Table Name', maxLength: 80, mandatory: true }),
    date_from:           StringColumn({ label: 'Date From', maxLength: 20, mandatory: true }),
    date_to:             StringColumn({ label: 'Date To', maxLength: 20, mandatory: true }),
    status:              StringColumn({
      label: 'Status', maxLength: 20,
      choices: { queued: 'Queued', sampling: 'Sampling', analyzing: 'Analyzing', completed: 'Completed', failed: 'Failed' },
    }),
    progress_pct:        IntegerColumn({ label: 'Progress %' }),
    phase_label:         StringColumn({ label: 'Phase', maxLength: 200 }),
    estimated_records:   IntegerColumn({ label: 'Estimated Records' }),
    processed_records:   IntegerColumn({ label: 'Processed Records' }),
    sampling_strategy:   StringColumn({
      label: 'Sampling Strategy', maxLength: 20,
      choices: { temporal: 'Temporal', category: 'Category', cluster: 'Cluster', keyword: 'Keyword' },
    }),
    selected_fields:     StringColumn({ label: 'Selected Fields (JSON)', maxLength: 2000 }),
    category_field:      StringColumn({ label: 'Category Field', maxLength: 80 }),
    subcategory_field:   StringColumn({ label: 'Subcategory Field', maxLength: 80 }),
    encoded_query:       StringColumn({ label: 'Encoded Query', maxLength: 2000 }),
    custom_instructions: StringColumn({ label: 'Custom Instructions', maxLength: 2000 }),
    sample_size:         IntegerColumn({ label: 'Sample Size' }),
    sampling_keywords:   StringColumn({ label: 'Sampling Keywords', maxLength: 1000 }),
    error_message:       StringColumn({ label: 'Error Message', maxLength: 1000 }),
    completed_at:        DateTimeColumn({ label: 'Completed At' }),
  },
})
```

- [ ] **Step 2: Create result table**

```typescript
// src/fluent/tables/result-table.now.ts
import '@servicenow/sdk/global'
import { Table, StringColumn } from '@servicenow/sdk/core'

export const resultTable = Table({
  name: 'x_1119723_1mdataan_result',
  label: 'Analysis Result',
  schema: {
    analysis:           StringColumn({ label: 'Analysis Sys ID', maxLength: 32 }),
    llm_report:         StringColumn({ label: 'LLM Report (HTML)', maxLength: 65536 }),
    category_breakdown: StringColumn({ label: 'Category Breakdown (JSON)', maxLength: 4000 }),
    temporal_trend:     StringColumn({ label: 'Temporal Trend (JSON)', maxLength: 2000 }),
  },
})
```

> After first deploy: change `llm_report` field type to HTML/rich_text on the instance via sys_dictionary.

- [ ] **Step 3: Create field cache table**

```typescript
// src/fluent/tables/field-cache-table.now.ts
import '@servicenow/sdk/global'
import { Table, StringColumn, DateTimeColumn } from '@servicenow/sdk/core'

export const fieldCacheTable = Table({
  name: 'x_1119723_1mdataan_field_cache',
  label: 'Field Cache',
  schema: {
    sn_table:    StringColumn({ label: 'Table Name', maxLength: 80, mandatory: true }),
    fields_json: StringColumn({ label: 'Fields JSON', maxLength: 8000 }),
    cached_at:   DateTimeColumn({ label: 'Cached At' }),
  },
})
```

- [ ] **Step 4: Build**

```bash
npx @servicenow/sdk build
```

Expected: `Build succeeded`.

- [ ] **Step 5: Commit**

```bash
git add src/fluent/tables/
git commit -m "feat: add scoped tables — analysis, result, field-cache"
```

---

## Task 3: Sys Property

**Files:**
- Create: `src/fluent/sys-properties/openai-config.now.ts`

- [ ] **Step 1: Create property record**

```typescript
// src/fluent/sys-properties/openai-config.now.ts
import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

Record({
  $id: Now.ID['openai-model-property'],
  table: 'sys_properties',
  data: {
    name:        'x_1119723_1mdataan.openai_model',
    value:       'gpt-4.1-nano',
    description: '1MDataAnalyzer: OpenAI model used for analysis',
    type:        'string',
    private:     false,
  },
})
```

- [ ] **Step 2: Build and commit**

```bash
npx @servicenow/sdk build
git add src/fluent/sys-properties/
git commit -m "feat: add sys_property for OpenAI model"
```

---

## Task 4: AnalyzerJobService

**Files:**
- Create: `src/server/AnalyzerJobService.js`
- Create: `src/fluent/script-includes/analyzer-job-service.now.ts`

- [ ] **Step 1: Create server script**

```javascript
// src/server/AnalyzerJobService.js
var AnalyzerJobService = Class.create();
AnalyzerJobService.prototype = {
  initialize: function() {},

  createAnalysis: function(data) {
    var gr = new GlideRecord('x_1119723_1mdataan_analysis');
    gr.initialize();
    gr.table_name          = data.table_name;
    gr.date_from           = data.date_from;
    gr.date_to             = data.date_to;
    gr.status              = 'queued';
    gr.progress_pct        = 0;
    gr.phase_label         = 'Queued — waiting to start';
    gr.sampling_strategy   = data.sampling_strategy || 'temporal';
    gr.selected_fields     = data.selected_fields ? JSON.stringify(data.selected_fields) : '';
    gr.category_field      = data.category_field || '';
    gr.subcategory_field   = data.subcategory_field || '';
    gr.encoded_query       = data.encoded_query || '';
    gr.custom_instructions = data.custom_instructions || '';
    gr.sample_size         = data.sample_size || 1000;
    gr.sampling_keywords   = data.sampling_keywords ? JSON.stringify(data.sampling_keywords) : '';
    var sysId = gr.insert();
    return this.getAnalysis(sysId);
  },

  getAnalysis: function(sysId) {
    var gr = new GlideRecord('x_1119723_1mdataan_analysis');
    if (!gr.get(sysId)) return null;
    return this._toObj(gr);
  },

  updateAnalysis: function(sysId, data) {
    var gr = new GlideRecord('x_1119723_1mdataan_analysis');
    if (!gr.get(sysId)) return false;
    ['status','progress_pct','phase_label','estimated_records',
     'processed_records','error_message','completed_at'].forEach(function(f) {
      if (data[f] !== undefined) gr.setValue(f, data[f]);
    });
    gr.update();
    return true;
  },

  listAnalyses: function() {
    var results = [];
    var gr = new GlideRecord('x_1119723_1mdataan_analysis');
    gr.orderByDesc('sys_created_on');
    gr.setLimit(100);
    gr.query();
    while (gr.next()) results.push(this._toObj(gr));
    return results;
  },

  deleteAnalysis: function(sysId) {
    var gr = new GlideRecord('x_1119723_1mdataan_analysis');
    if (!gr.get(sysId)) return false;
    gr.deleteRecord();
    var res = new GlideRecord('x_1119723_1mdataan_result');
    res.addQuery('analysis', sysId);
    res.query();
    while (res.next()) res.deleteRecord();
    return true;
  },

  createResult: function(data) {
    var gr = new GlideRecord('x_1119723_1mdataan_result');
    gr.initialize();
    gr.analysis           = data.analysis_sys_id;
    gr.llm_report         = data.llm_report;
    gr.category_breakdown = data.category_breakdown || '';
    gr.temporal_trend     = data.temporal_trend || '';
    gr.insert();
  },

  getResultByAnalysis: function(analysisSysId) {
    var gr = new GlideRecord('x_1119723_1mdataan_result');
    gr.addQuery('analysis', analysisSysId);
    gr.query();
    if (!gr.next()) return null;
    return {
      sys_id:             gr.getUniqueValue(),
      llm_report:         gr.getValue('llm_report'),
      category_breakdown: gr.getValue('category_breakdown'),
      temporal_trend:     gr.getValue('temporal_trend'),
    };
  },

  _toObj: function(gr) {
    return {
      sys_id:             gr.getUniqueValue(),
      table_name:         gr.getValue('table_name'),
      date_from:          gr.getValue('date_from'),
      date_to:            gr.getValue('date_to'),
      status:             gr.getValue('status'),
      progress_pct:       parseInt(gr.getValue('progress_pct') || '0', 10),
      phase_label:        gr.getValue('phase_label'),
      estimated_records:  parseInt(gr.getValue('estimated_records') || '0', 10),
      processed_records:  parseInt(gr.getValue('processed_records') || '0', 10),
      sampling_strategy:  gr.getValue('sampling_strategy'),
      selected_fields:    gr.getValue('selected_fields'),
      category_field:     gr.getValue('category_field'),
      subcategory_field:  gr.getValue('subcategory_field'),
      encoded_query:      gr.getValue('encoded_query'),
      custom_instructions:gr.getValue('custom_instructions'),
      sample_size:        parseInt(gr.getValue('sample_size') || '1000', 10),
      sampling_keywords:  gr.getValue('sampling_keywords'),
      error_message:      gr.getValue('error_message'),
      completed_at:       gr.getValue('completed_at'),
      created_at:         gr.getValue('sys_created_on'),
    };
  },

  type: 'AnalyzerJobService',
};
```

- [ ] **Step 2: Create Fluent definition**

```typescript
// src/fluent/script-includes/analyzer-job-service.now.ts
import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
  $id: Now.ID['analyzer-job-service'],
  name: 'AnalyzerJobService',
  active: true,
  apiName: 'x_1119723_1mdataan.AnalyzerJobService',
  script: Now.include('../../server/AnalyzerJobService.js'),
})
```

- [ ] **Step 3: Build and commit**

```bash
npx @servicenow/sdk build
git add src/server/AnalyzerJobService.js src/fluent/script-includes/analyzer-job-service.now.ts
git commit -m "feat: add AnalyzerJobService CRUD script include"
```

---

## Task 5: AnalyzerFieldService

**Files:**
- Create: `src/server/AnalyzerFieldService.js`
- Create: `src/fluent/script-includes/analyzer-field-service.now.ts`

- [ ] **Step 1: Create server script**

```javascript
// src/server/AnalyzerFieldService.js
var AnalyzerFieldService = Class.create();
AnalyzerFieldService.prototype = {
  initialize: function() { this.CACHE_TTL_MS = 3600000; },

  getFields: function(tableName) {
    var cached = this._readCache(tableName);
    if (cached) return cached;
    var fields = this._queryDictionary(tableName);
    this._writeCache(tableName, fields);
    return fields;
  },

  _queryDictionary: function(tableName) {
    var fields = [];
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', tableName);
    gr.addQuery('internal_type', '!=', 'collection');
    gr.addNotNullQuery('element');
    gr.query();
    while (gr.next()) {
      var it = gr.getValue('internal_type');
      fields.push({
        name:         gr.getValue('element'),
        label:        gr.getDisplayValue('column_label'),
        internalType: it,
        group:        this._normalizeType(it),
        parentTable:  gr.getValue('reference') || null,
      });
    }
    return fields;
  },

  _normalizeType: function(t) {
    if (['string','html','url','email','phone','translated_text','script','xml',
         'journal_input','journal','journal_list'].indexOf(t) >= 0) return 'string';
    if (['integer','decimal','float','currency','percent_complete'].indexOf(t) >= 0) return 'integer';
    if (['glide_date_time','glide_date','glide_time','due_date','timer'].indexOf(t) >= 0) return 'datetime';
    if (t === 'reference' || t === 'glide_list') return 'reference';
    if (t === 'boolean') return 'boolean';
    return 'other';
  },

  _readCache: function(tableName) {
    var gr = new GlideRecord('x_1119723_1mdataan_field_cache');
    gr.addQuery('sn_table', tableName);
    gr.query();
    if (!gr.next()) return null;
    var cachedAt = new GlideDateTime(gr.getValue('cached_at'));
    var now = new GlideDateTime();
    if (now.getNumericValue() - cachedAt.getNumericValue() > this.CACHE_TTL_MS) {
      gr.deleteRecord();
      return null;
    }
    try { return JSON.parse(gr.getValue('fields_json')); } catch(e) { return null; }
  },

  _writeCache: function(tableName, fields) {
    var gr = new GlideRecord('x_1119723_1mdataan_field_cache');
    gr.addQuery('sn_table', tableName);
    gr.query();
    if (!gr.next()) { gr.initialize(); gr.sn_table = tableName; }
    gr.fields_json = JSON.stringify(fields);
    gr.cached_at   = new GlideDateTime().getValue();
    gr.save();
  },

  type: 'AnalyzerFieldService',
};
```

- [ ] **Step 2: Create Fluent definition**

```typescript
// src/fluent/script-includes/analyzer-field-service.now.ts
import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
  $id: Now.ID['analyzer-field-service'],
  name: 'AnalyzerFieldService',
  active: true,
  apiName: 'x_1119723_1mdataan.AnalyzerFieldService',
  script: Now.include('../../server/AnalyzerFieldService.js'),
})
```

- [ ] **Step 3: Build and commit**

```bash
npx @servicenow/sdk build
git add src/server/AnalyzerFieldService.js src/fluent/script-includes/analyzer-field-service.now.ts
git commit -m "feat: add AnalyzerFieldService with 1-hour cache"
```

---

## Task 6: AnalyzerPreflightService

**Files:**
- Create: `src/server/AnalyzerPreflightService.js`
- Create: `src/fluent/script-includes/analyzer-preflight-service.now.ts`

- [ ] **Step 1: Create server script**

```javascript
// src/server/AnalyzerPreflightService.js
var AnalyzerPreflightService = Class.create();
AnalyzerPreflightService.prototype = {
  initialize: function() {},

  preflight: function(params) {
    var query = 'sys_created_on>=' + params.date_from + '^sys_created_on<=' + params.date_to;
    if (params.encoded_query) query += '^' + params.encoded_query;

    var agg = new GlideAggregate(params.table_name);
    agg.addEncodedQuery(query);
    agg.addAggregate('COUNT');
    agg.query();
    var totalCount = agg.next() ? parseInt(agg.getAggregate('COUNT'), 10) : 0;

    var sampleRecords = [];
    var gr = new GlideRecord(params.table_name);
    gr.addEncodedQuery(query);
    gr.setLimit(3);
    gr.query();
    var fields = params.selected_fields || [];
    while (gr.next()) {
      var rec = {
        number:            gr.getDisplayValue('number'),
        short_description: gr.getDisplayValue('short_description'),
      };
      fields.forEach(function(f) { rec[f] = gr.getDisplayValue(f); });
      sampleRecords.push(rec);
    }

    return { totalCount: totalCount, sampleRecords: sampleRecords };
  },

  type: 'AnalyzerPreflightService',
};
```

- [ ] **Step 2: Create Fluent definition**

```typescript
// src/fluent/script-includes/analyzer-preflight-service.now.ts
import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
  $id: Now.ID['analyzer-preflight-service'],
  name: 'AnalyzerPreflightService',
  active: true,
  apiName: 'x_1119723_1mdataan.AnalyzerPreflightService',
  script: Now.include('../../server/AnalyzerPreflightService.js'),
})
```

- [ ] **Step 3: Build and commit**

```bash
npx @servicenow/sdk build
git add src/server/AnalyzerPreflightService.js src/fluent/script-includes/analyzer-preflight-service.now.ts
git commit -m "feat: add AnalyzerPreflightService"
```

---

## Task 7: AnalyzerLLMService

> **Prerequisite before deploying this task:** Create Connection & Credential Alias on the instance:
> 1. Navigate to **Connections & Credentials → Connection & Credential Aliases → New**
> 2. Name: `OpenAI`, Type: `Connection and Credential`, Connection Type: `HTTP`
> 3. Create **Basic Auth Credential**: username = `apikey`, password = your OpenAI API key
> 4. Create **HTTP Connection**: URL = `https://api.openai.com`, assign the credential
> 5. Assign connection to the alias. Note the alias sys_id.

**Files:**
- Create: `src/server/AnalyzerLLMService.js`
- Create: `src/fluent/script-includes/analyzer-llm-service.now.ts`

- [ ] **Step 1: Create server script**

```javascript
// src/server/AnalyzerLLMService.js
var AnalyzerLLMService = Class.create();
AnalyzerLLMService.prototype = {
  initialize: function() {
    this.model = gs.getProperty('x_1119723_1mdataan.openai_model', 'gpt-4.1-nano');
  },

  complete: function(prompt, maxTokens) {
    var rm = new sn_ws.RESTMessageV2();
    rm.setEndpoint('https://api.openai.com/v1/chat/completions');
    rm.setHttpMethod('POST');
    rm.setRequestHeader('Content-Type', 'application/json');
    rm.setConnectionAlias('x_1119723_1mdataan.OpenAI');

    rm.setRequestBody(JSON.stringify({
      model:      this.model,
      max_tokens: maxTokens || 1200,
      messages:   [{ role: 'user', content: prompt }],
    }));

    var response   = rm.execute();
    var statusCode = response.getStatusCode();
    var body       = response.getBody();

    if (statusCode !== 200) throw new Error('OpenAI error ' + statusCode + ': ' + body);

    var parsed  = JSON.parse(body);
    var content = (parsed.choices && parsed.choices[0] && parsed.choices[0].message)
      ? parsed.choices[0].message.content.trim() : '';

    return { content: content, model: this.model };
  },

  type: 'AnalyzerLLMService',
};
```

- [ ] **Step 2: Create Fluent definition**

```typescript
// src/fluent/script-includes/analyzer-llm-service.now.ts
import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
  $id: Now.ID['analyzer-llm-service'],
  name: 'AnalyzerLLMService',
  active: true,
  apiName: 'x_1119723_1mdataan.AnalyzerLLMService',
  script: Now.include('../../server/AnalyzerLLMService.js'),
})
```

- [ ] **Step 3: Build and commit**

```bash
npx @servicenow/sdk build
git add src/server/AnalyzerLLMService.js src/fluent/script-includes/analyzer-llm-service.now.ts
git commit -m "feat: add AnalyzerLLMService — OpenAI via RESTMessageV2 + Connection Alias"
```

---

## Task 8: AnalyzerEngineService — full analysis pipeline

**Files:**
- Create: `src/server/AnalyzerEngineService.js`
- Create: `src/fluent/script-includes/analyzer-engine-service.now.ts`

- [ ] **Step 1: Create server script**

```javascript
// src/server/AnalyzerEngineService.js
var AnalyzerEngineService = Class.create();
AnalyzerEngineService.prototype = {
  initialize: function() {
    this.BATCH_SIZE = 100;
    this.jobSvc     = new x_1119723_1mdataan.AnalyzerJobService();
    this.llm        = new x_1119723_1mdataan.AnalyzerLLMService();
  },

  runAnalysis: function(analysisSysId) {
    var analysis = this.jobSvc.getAnalysis(analysisSysId);
    if (!analysis) return;
    try {
      // Phase 1 — Count
      this.jobSvc.updateAnalysis(analysisSysId, { status: 'sampling', progress_pct: 5, phase_label: 'Counting records...' });
      var totalCount = this._count(analysis);
      if (totalCount === 0) {
        this.jobSvc.updateAnalysis(analysisSysId, { status: 'failed', error_message: 'No records found for the selected date range.' });
        return;
      }
      this.jobSvc.updateAnalysis(analysisSysId, { estimated_records: totalCount, progress_pct: 10 });

      // Phase 2 — Sample
      this.jobSvc.updateAnalysis(analysisSysId, { progress_pct: 15, phase_label: 'Building sample...' });
      var fields     = this._parseFields(analysis.selected_fields);
      var targetSize = Math.min(totalCount, analysis.sample_size || this.BATCH_SIZE * 10);
      var records    = this._sample(analysis, fields, targetSize, totalCount);

      this.jobSvc.updateAnalysis(analysisSysId, {
        status: 'analyzing', processed_records: records.length,
        progress_pct: 35, phase_label: 'AI is reading patterns...',
      });

      // Phase 3 — LLM extraction batches
      var insights = this._extractionPass(analysisSysId, analysis, records, fields);

      // Phase 4 — Temporal trend
      this.jobSvc.updateAnalysis(analysisSysId, { progress_pct: 68, phase_label: 'Computing volume trends...' });
      var temporalTrend = this._monthlyTrend(analysis);

      // Phase 5 — Category breakdown
      var categoryBreakdown = [];
      if (analysis.category_field) {
        categoryBreakdown = this._categoryDistribution(analysis, analysis.category_field, totalCount);
      }

      // Phase 6 — Synthesis
      this.jobSvc.updateAnalysis(analysisSysId, { progress_pct: 72, phase_label: 'Generating report...' });
      var report = this._synthesize(analysis, insights, temporalTrend, categoryBreakdown, totalCount, records.length, fields);

      // Save
      this.jobSvc.createResult({
        analysis_sys_id:    analysisSysId,
        llm_report:         report,
        category_breakdown: JSON.stringify(categoryBreakdown),
        temporal_trend:     JSON.stringify(temporalTrend),
      });
      var now = new GlideDateTime();
      this.jobSvc.updateAnalysis(analysisSysId, {
        status: 'completed', progress_pct: 100,
        phase_label: 'Analysis complete', completed_at: now.getValue(),
      });
    } catch(e) {
      this.jobSvc.updateAnalysis(analysisSysId, { status: 'failed', error_message: e.message || 'Unknown error' });
    }
  },

  // ── Helpers ──────────────────────────────────────────────────────────────────

  _parseFields: function(json) {
    if (!json) return [];
    try { var v = JSON.parse(json); return Array.isArray(v) ? v : []; } catch(e) { return []; }
  },

  _buildBaseQuery: function(analysis) {
    var q = 'sys_created_on>=' + analysis.date_from + '^sys_created_on<=' + analysis.date_to;
    if (analysis.encoded_query) q += '^' + analysis.encoded_query;
    return q;
  },

  _count: function(analysis) {
    var agg = new GlideAggregate(analysis.table_name);
    agg.addEncodedQuery(this._buildBaseQuery(analysis));
    agg.addAggregate('COUNT');
    agg.query();
    return agg.next() ? parseInt(agg.getAggregate('COUNT'), 10) : 0;
  },

  _fetchPage: function(tableName, query, fields, limit, offset) {
    var records = [];
    var gr = new GlideRecord(tableName);
    gr.addEncodedQuery(query);
    gr.chooseWindow(offset, offset + limit);
    gr.query();
    while (gr.next()) {
      var rec = { sys_created_on: gr.getValue('sys_created_on') };
      fields.forEach(function(f) { rec[f] = gr.getDisplayValue(f); });
      records.push(rec);
    }
    return records;
  },

  _categoryDistribution: function(analysis, field, totalCount) {
    var result = [];
    var agg = new GlideAggregate(analysis.table_name);
    agg.addEncodedQuery(this._buildBaseQuery(analysis));
    agg.addAggregate('COUNT');
    agg.groupBy(field);
    agg.query();
    while (agg.next()) {
      var cnt = parseInt(agg.getAggregate('COUNT'), 10);
      result.push({ value: agg.getValue(field), display: agg.getDisplayValue(field), count: cnt, pct: Math.round((cnt / totalCount) * 100) });
    }
    return result.sort(function(a, b) { return b.count - a.count; }).slice(0, 15);
  },

  _monthlyTrend: function(analysis) {
    var result = [];
    var agg = new GlideAggregate(analysis.table_name);
    agg.addEncodedQuery(this._buildBaseQuery(analysis));
    agg.addAggregate('COUNT');
    agg.groupBy('sys_created_on');
    agg.addTrend('sys_created_on', 'month');
    agg.query();
    while (agg.next()) {
      result.push({ period: agg.getValue('sys_created_on'), count: parseInt(agg.getAggregate('COUNT'), 10) });
    }
    return result;
  },

  // ── Sampling ─────────────────────────────────────────────────────────────────

  _sample: function(analysis, fields, targetSize, totalCount) {
    var s = analysis.sampling_strategy || 'temporal';
    if (s === 'category') return this._categorySample(analysis, fields, targetSize, totalCount);
    if (s === 'keyword')  return this._keywordSample(analysis, fields, targetSize, totalCount);
    if (s === 'cluster')  return this._categorySample(analysis, fields, targetSize, totalCount);
    return this._temporalSample(analysis, fields, targetSize, totalCount);
  },

  _temporalSample: function(analysis, fields, targetSize, totalCount) {
    var baseQuery  = this._buildBaseQuery(analysis);
    var fromDT     = new GlideDateTime(analysis.date_from);
    var toDT       = new GlideDateTime(analysis.date_to);
    var totalMs    = toDT.getNumericValue() - fromDT.getNumericValue();
    var totalDays  = Math.max(1, Math.round(totalMs / 86400000));
    var maxWindows = Math.ceil(targetSize / this.BATCH_SIZE);
    var windowCount = Math.min(maxWindows, totalDays <= 60 ? Math.ceil(totalDays / 7) : Math.ceil(totalDays / 30));
    var windowDays  = Math.ceil(totalDays / windowCount);
    var perWindow   = Math.ceil(targetSize / windowCount);
    var records = [];
    for (var i = 0; i < windowCount; i++) {
      var winFromMs = fromDT.getNumericValue() + i * windowDays * 86400000;
      var winToMs   = Math.min(winFromMs + windowDays * 86400000 - 1, toDT.getNumericValue());
      var winFrom   = new GlideDateTime(); winFrom.setNumericValue(winFromMs);
      var winTo     = new GlideDateTime(); winTo.setNumericValue(winToMs);
      var q = baseQuery + '^sys_created_on>=' + winFrom.getValue() + '^sys_created_on<=' + winTo.getValue();
      records = records.concat(this._fetchPage(analysis.table_name, q, fields, perWindow, 0));
    }
    return records;
  },

  _categorySample: function(analysis, fields, targetSize, totalCount) {
    if (!analysis.category_field) return this._temporalSample(analysis, fields, targetSize, totalCount);
    var dist = this._categoryDistribution(analysis, analysis.category_field, totalCount);
    if (dist.length === 0) return this._temporalSample(analysis, fields, targetSize, totalCount);
    var baseQuery = this._buildBaseQuery(analysis);
    var allFields = fields.indexOf(analysis.category_field) < 0 ? fields.concat([analysis.category_field]) : fields;
    var records = [];
    for (var i = 0; i < dist.length; i++) {
      var toFetch = Math.max(1, Math.round((dist[i].count / totalCount) * targetSize));
      var q = baseQuery + '^' + analysis.category_field + '=' + dist[i].value;
      records = records.concat(this._fetchPage(analysis.table_name, q, allFields, toFetch, 0));
    }
    return records;
  },

  _keywordSample: function(analysis, fields, targetSize, totalCount) {
    var keywords = [];
    try { keywords = JSON.parse(analysis.sampling_keywords || '[]'); } catch(e) {}
    if (keywords.length === 0) return this._temporalSample(analysis, fields, targetSize, totalCount);
    var baseQuery = this._buildBaseQuery(analysis);
    var clauses = [];
    keywords.forEach(function(kw) {
      fields.forEach(function(f) { clauses.push(f + 'CONTAINS' + kw.trim()); });
    });
    var q = baseQuery + '^' + clauses.join('^OR');
    var records = this._fetchPage(analysis.table_name, q, fields, targetSize, 0);
    if (records.length === 0) return this._temporalSample(analysis, fields, targetSize, totalCount);
    return records;
  },

  // ── LLM passes ───────────────────────────────────────────────────────────────

  _extractionPass: function(analysisSysId, analysis, records, fields) {
    var insights = [];
    var batchSize = this.BATCH_SIZE;
    var totalBatches = Math.ceil(records.length / batchSize);
    var self = this;
    for (var i = 0; i < totalBatches; i++) {
      var batch = records.slice(i * batchSize, (i + 1) * batchSize);
      var recordTexts = batch.map(function(r, idx) {
        var parts = fields.map(function(f) { return f + ': ' + (r[f] || '').substring(0, 300); });
        if (analysis.category_field && r[analysis.category_field]) parts.unshift('category: ' + r[analysis.category_field]);
        return '[' + (idx + 1) + '] ' + (r.sys_created_on || '').substring(0, 10) + ' | ' + parts.join(' | ');
      }).join('\n');

      var prompt = 'Analyze these ' + batch.length + ' ServiceNow records from table "' + analysis.table_name + '".\n\nRECORDS:\n' + recordTexts + '\n\nReturn ONLY valid JSON:\n{"top_themes":["theme1"],"anomalies":["anomaly1"],"category_notes":{"cat":"observation"}}\n\nNo prose. Pure JSON only.';

      try {
        var resp = self.llm.complete(prompt, 400);
        if (resp.content) insights.push(resp.content);
      } catch(e) {
        gs.warn('AnalyzerEngineService: extraction batch ' + i + ' failed: ' + e.message);
      }

      self.jobSvc.updateAnalysis(analysisSysId, {
        progress_pct: 35 + Math.round(((i + 1) / totalBatches) * 30),
        phase_label: 'Extracting patterns: batch ' + (i + 1) + '/' + totalBatches,
      });
    }
    return insights;
  },

  _synthesize: function(analysis, insights, temporalTrend, categoryBreakdown, totalCount, sampledCount, fields) {
    var themes = {}, anomalies = [], catNotes = {};
    insights.forEach(function(raw) {
      try {
        var clean  = raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
        var parsed = JSON.parse(clean);
        (parsed.top_themes || []).forEach(function(t) { themes[t] = (themes[t] || 0) + 1; });
        (parsed.anomalies  || []).forEach(function(a) { anomalies.push(a); });
        Object.keys(parsed.category_notes || {}).forEach(function(k) {
          if (!catNotes[k]) catNotes[k] = [];
          catNotes[k].push(parsed.category_notes[k]);
        });
      } catch(e) { anomalies.push(raw.substring(0, 200)); }
    });

    var topThemes = Object.keys(themes).sort(function(a,b){return themes[b]-themes[a];}).slice(0,10)
      .map(function(t){return '• '+t+' ('+themes[t]+' batches)';}).join('\n') || 'None identified';
    var uniqueAnomalies = anomalies.filter(function(v,i,a){return a.indexOf(v)===i;}).slice(0,8)
      .map(function(a){return '• '+a;}).join('\n') || 'None identified';
    var catContext = Object.keys(catNotes).slice(0,8)
      .map(function(k){return '  • '+k+': '+catNotes[k][0];}).join('\n') || 'N/A';
    var catText = categoryBreakdown.slice(0,10)
      .map(function(c){return '  • '+c.display+': '+c.count+' ('+c.pct+'%)';}).join('\n');
    var trendText = temporalTrend.map(function(t){return t.period+': '+t.count;}).join(', ');
    var custom = analysis.custom_instructions ? '\nADDITIONAL INSTRUCTIONS (higher priority):\n' + analysis.custom_instructions : '';

    var prompt = 'You are a data analyst writing a business report.\n\nDataset: "' + analysis.table_name + '" · ' + totalCount + ' total records · ' + sampledCount + ' analyzed · ' + analysis.date_from + ' → ' + analysis.date_to + '\nText fields: ' + fields.join(', ') + (analysis.category_field ? ' | Category: ' + analysis.category_field : '') + (catText ? '\n\nCategory distribution:\n' + catText : '') + (trendText ? '\nMonthly volume: ' + trendText : '') + '\n\nTOP THEMES:\n' + topThemes + '\n\nANOMALIES:\n' + uniqueAnomalies + '\n\nCATEGORY NOTES:\n' + catContext + '\n\nWrite a report in HTML (not markdown). Use <h2> for sections, <ul>/<li> for bullets. Sections: Executive Summary (3 sentences), Key Findings (5-7 bullets with numbers), Category Analysis, Anomalies & Outliers (3-5 bullets), Recommended Actions (3 bullets). Under 600 words. Numbers over adjectives. No hedging language.' + custom;

    var resp = this.llm.complete(prompt, 1500);
    return resp.content || '<p>Report generation failed — no content returned.</p>';
  },

  type: 'AnalyzerEngineService',
};
```

- [ ] **Step 2: Create Fluent definition**

```typescript
// src/fluent/script-includes/analyzer-engine-service.now.ts
import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
  $id: Now.ID['analyzer-engine-service'],
  name: 'AnalyzerEngineService',
  active: true,
  apiName: 'x_1119723_1mdataan.AnalyzerEngineService',
  script: Now.include('../../server/AnalyzerEngineService.js'),
})
```

- [ ] **Step 3: Build and commit**

```bash
npx @servicenow/sdk build
git add src/server/AnalyzerEngineService.js src/fluent/script-includes/analyzer-engine-service.now.ts
git commit -m "feat: add AnalyzerEngineService — 6-phase analysis pipeline"
```

---

## Task 9: Scripted REST API

**Files:**
- Create: `src/server/analyzer-api-handlers.js`
- Create: `src/fluent/scripted-rest/analyzer-api.now.ts`

- [ ] **Step 1: Create handler script**

```javascript
// src/server/analyzer-api-handlers.js

function handleGetTables(request, response) {
  response.setContentType('application/json');
  response.setBody(JSON.stringify([
    { name: 'incident',                  label: 'Incidents',              description: 'IT service incidents and outages' },
    { name: 'change_request',            label: 'Change Requests',        description: 'Planned changes and releases' },
    { name: 'sn_customerservice_case',   label: 'Customer Service Cases', description: 'External customer support cases' },
    { name: 'sc_req_item',               label: 'Service Requests',       description: 'Service catalog requests' },
    { name: 'problem',                   label: 'Problems',               description: 'Root cause investigations' },
    { name: 'task',                      label: 'Tasks',                  description: 'General task records' },
  ]));
}

function handleGetFields(request, response) {
  response.setContentType('application/json');
  try {
    var svc    = new x_1119723_1mdataan.AnalyzerFieldService();
    var fields = svc.getFields(request.pathParams.table);
    var grouped = {};
    fields.forEach(function(f) {
      if (!grouped[f.group]) grouped[f.group] = [];
      grouped[f.group].push(f);
    });
    response.setBody(JSON.stringify({ fields: fields, grouped: grouped }));
  } catch(e) { response.setStatus(500); response.setBody(JSON.stringify({ error: e.message })); }
}

function handlePreflight(request, response) {
  response.setContentType('application/json');
  try {
    var body = JSON.parse(request.body);
    var svc  = new x_1119723_1mdataan.AnalyzerPreflightService();
    response.setBody(JSON.stringify(svc.preflight(body)));
  } catch(e) { response.setStatus(500); response.setBody(JSON.stringify({ error: e.message })); }
}

function handleCreateAnalysis(request, response) {
  response.setContentType('application/json');
  try {
    var body     = JSON.parse(request.body);
    var jobSvc   = new x_1119723_1mdataan.AnalyzerJobService();
    var analysis = jobSvc.createAnalysis(body);

    var worker = new GlideScriptedHierarchicalWorker();
    worker.setProgressName('1MDataAnalyzer — analysis ' + analysis.sys_id);
    worker.setBackground(true);
    worker.setScriptIncludeName('AnalyzerEngineService');
    worker.setScriptIncludeMethod('runAnalysis');
    worker.putMethodArg('analysisSysId', analysis.sys_id);
    worker.start();

    response.setStatus(201);
    response.setBody(JSON.stringify(analysis));
  } catch(e) { response.setStatus(500); response.setBody(JSON.stringify({ error: e.message })); }
}

function handleListAnalyses(request, response) {
  response.setContentType('application/json');
  response.setBody(JSON.stringify(new x_1119723_1mdataan.AnalyzerJobService().listAnalyses()));
}

function handleGetStatus(request, response) {
  response.setContentType('application/json');
  var analysis = new x_1119723_1mdataan.AnalyzerJobService().getAnalysis(request.pathParams.id);
  if (!analysis) { response.setStatus(404); response.setBody(JSON.stringify({ error: 'Not found' })); return; }
  response.setBody(JSON.stringify({
    sys_id: analysis.sys_id, status: analysis.status,
    progress_pct: analysis.progress_pct, phase_label: analysis.phase_label,
    estimated_records: analysis.estimated_records, processed_records: analysis.processed_records,
    error_message: analysis.error_message, completed_at: analysis.completed_at,
  }));
}

function handleGetResults(request, response) {
  response.setContentType('application/json');
  var svc      = new x_1119723_1mdataan.AnalyzerJobService();
  var analysis = svc.getAnalysis(request.pathParams.id);
  if (!analysis) { response.setStatus(404); response.setBody(JSON.stringify({ error: 'Not found' })); return; }
  if (analysis.status !== 'completed') { response.setStatus(202); response.setBody(JSON.stringify({ message: 'Not complete' })); return; }
  var result = svc.getResultByAnalysis(analysis.sys_id);
  if (!result)  { response.setStatus(404); response.setBody(JSON.stringify({ error: 'Results not found' })); return; }
  response.setBody(JSON.stringify({
    analysis:           analysis,
    llm_report:         result.llm_report,
    category_breakdown: result.category_breakdown ? JSON.parse(result.category_breakdown) : [],
    temporal_trend:     result.temporal_trend     ? JSON.parse(result.temporal_trend)     : [],
  }));
}

function handleDeleteAnalysis(request, response) {
  response.setContentType('application/json');
  var ok = new x_1119723_1mdataan.AnalyzerJobService().deleteAnalysis(request.pathParams.id);
  if (!ok) { response.setStatus(404); response.setBody(JSON.stringify({ error: 'Not found' })); return; }
  response.setBody(JSON.stringify({ ok: true }));
}
```

- [ ] **Step 2: Create Fluent REST API**

```typescript
// src/fluent/scripted-rest/analyzer-api.now.ts
import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import {
  handleGetTables, handleGetFields, handlePreflight,
  handleCreateAnalysis, handleListAnalyses,
  handleGetStatus, handleGetResults, handleDeleteAnalysis,
} from '../../server/analyzer-api-handlers.js'

RestApi({
  $id: Now.ID['analyzer-rest-api'],
  name: 'Analyzer API',
  serviceId: 'analyzer',
  active: true,
  consumes: 'application/json',
  produces: 'application/json',
  routes: [
    { $id: Now.ID['rt-tables'],          name: 'Get Tables',      path: '/tables',                     method: 'GET',    active: true, authentication: true, authorization: false, script: handleGetTables },
    { $id: Now.ID['rt-fields'],          name: 'Get Fields',      path: '/tables/{table}/fields',      method: 'GET',    active: true, authentication: true, authorization: false, script: handleGetFields },
    { $id: Now.ID['rt-preflight'],       name: 'Preflight',       path: '/analyses/preflight',         method: 'POST',   active: true, authentication: true, authorization: false, script: handlePreflight },
    { $id: Now.ID['rt-create'],          name: 'Create Analysis', path: '/analyses',                   method: 'POST',   active: true, authentication: true, authorization: false, script: handleCreateAnalysis },
    { $id: Now.ID['rt-list'],            name: 'List Analyses',   path: '/analyses',                   method: 'GET',    active: true, authentication: true, authorization: false, script: handleListAnalyses },
    { $id: Now.ID['rt-status'],          name: 'Get Status',      path: '/analyses/{id}/status',       method: 'GET',    active: true, authentication: true, authorization: false, script: handleGetStatus },
    { $id: Now.ID['rt-results'],         name: 'Get Results',     path: '/analyses/{id}/results',      method: 'GET',    active: true, authentication: true, authorization: false, script: handleGetResults },
    { $id: Now.ID['rt-delete'],          name: 'Delete Analysis', path: '/analyses/{id}',              method: 'DELETE', active: true, authentication: true, authorization: false, script: handleDeleteAnalysis },
  ],
})
```

- [ ] **Step 3: Build and commit**

```bash
npx @servicenow/sdk build
git add src/server/analyzer-api-handlers.js src/fluent/scripted-rest/
git commit -m "feat: add Scripted REST API — 8 endpoints"
```

---

## Task 10: React foundation — layout, routing, utilities

**Files:**
- Modify: `src/client/index.html`
- Modify: `src/client/main.tsx`
- Modify: `src/client/app.tsx`
- Modify: `src/client/app.css`
- Create: `src/client/utils/fields.ts`
- Create: `src/client/utils/api.ts`
- Create: `src/client/services/AnalysisService.ts`

- [ ] **Step 1: Update index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>1M Data Analyzer</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./main.tsx"></script>
</body>
</html>
```

- [ ] **Step 2: Rewrite main.tsx**

```tsx
// src/client/main.tsx
import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
import './app.css'

function Root() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const h = () => setTick(t => t + 1)
    window.addEventListener('popstate', h)
    return () => window.removeEventListener('popstate', h)
  }, [])
  return <App />
}

createRoot(document.getElementById('root')!).render(<Root />)
```

- [ ] **Step 3: Create utils/fields.ts**

```typescript
// src/client/utils/fields.ts
export function value(field: any): string {
  if (!field) return ''
  if (typeof field === 'object') return field.value ?? ''
  return String(field)
}

export function display(field: any): string {
  if (!field) return ''
  if (typeof field === 'object') return field.display_value ?? field.value ?? ''
  return String(field)
}
```

- [ ] **Step 4: Create utils/api.ts**

```typescript
// src/client/utils/api.ts
const BASE = '/api/x_1119723_1mdataan/analyzer'

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-UserToken': (window as any).g_ck ?? '',
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, { ...init, headers: { ...headers(), ...(init?.headers ?? {}) } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as any).error ?? res.statusText)
  }
  return res.json() as Promise<T>
}
```

- [ ] **Step 5: Create AnalysisService.ts**

```typescript
// src/client/services/AnalysisService.ts
import { apiFetch } from '../utils/api'

export interface AnalysisParams {
  table_name: string
  date_from: string
  date_to: string
  selected_fields: string[]
  sampling_strategy: string
  category_field?: string
  subcategory_field?: string
  encoded_query?: string
  custom_instructions?: string
  sample_size?: number
  sampling_keywords?: string
}

export interface Analysis {
  sys_id: string
  table_name: string
  date_from: string
  date_to: string
  status: string
  progress_pct: number
  phase_label: string
  estimated_records: number
  processed_records: number
  error_message: string
  completed_at: string
  created_at: string
}

export interface AnalysisResult {
  analysis: Analysis
  llm_report: string
  category_breakdown: Array<{ display: string; count: number; pct: number }>
  temporal_trend: Array<{ period: string; count: number }>
}

export const AnalysisService = {
  getTables: () =>
    apiFetch<Array<{ name: string; label: string; description: string }>>('/tables'),

  getFields: (table: string) =>
    apiFetch<{ fields: any[]; grouped: Record<string, any[]> }>(`/tables/${table}/fields`),

  preflight: (params: Partial<AnalysisParams> & { table_name: string; date_from: string; date_to: string }) =>
    apiFetch<{ totalCount: number; sampleRecords: any[] }>('/analyses/preflight', {
      method: 'POST', body: JSON.stringify(params),
    }),

  create: (params: AnalysisParams) =>
    apiFetch<Analysis>('/analyses', { method: 'POST', body: JSON.stringify(params) }),

  list: () => apiFetch<Analysis[]>('/analyses'),

  getStatus: (id: string) => apiFetch<Analysis>(`/analyses/${id}/status`),

  getResults: (id: string) => apiFetch<AnalysisResult>(`/analyses/${id}/results`),

  delete: (id: string) => apiFetch<{ ok: boolean }>(`/analyses/${id}`, { method: 'DELETE' }),
}
```

- [ ] **Step 6: Write app.css (Horizon tokens)**

```css
/* src/client/app.css */
:root {
  --snx-surface:      rgb(var(--now-color_background--primary, 255, 255, 255));
  --snx-surface-alt:  rgb(var(--now-color_background--secondary, 245, 246, 247));
  --snx-border:       rgb(var(--now-container--border-color, 207, 213, 215));
  --snx-text:         rgb(var(--now-color_text--primary, 16, 23, 26));
  --snx-text-muted:   rgb(var(--now-color_text--secondary, 75, 85, 89));
  --snx-primary:      rgb(var(--now-actionable--primary--background-color, 0, 128, 163));
  --snx-primary-text: rgb(var(--now-actionable_label--primary--color, 255, 255, 255));
  --snx-focus:        rgb(var(--now-color_focus-ring, 53, 147, 37));
  --snx-sidebar-bg:   rgb(var(--now-content-tree--background-color, 22, 27, 51));
  --snx-sidebar-text: rgb(var(--now-content-tree--color, 200, 210, 220));
  --snx-sidebar-active: rgb(var(--now-content-tree--background-color--selected, 40, 50, 80));
  --snx-space-sm: var(--now-static-space--sm, 0.5rem);
  --snx-space-md: var(--now-static-space--md, 0.75rem);
  --snx-space-lg: var(--now-static-space--lg, 1rem);
  --snx-space-xl: var(--now-static-space--xl, 1.5rem);
  --snx-radius:   var(--now-container--border-radius, 8px);
  --snx-font:     var(--now-font-family, system-ui, sans-serif);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--snx-font); background: var(--snx-surface); color: var(--snx-text); }

.app-shell { display: flex; height: 100vh; overflow: hidden; }

.main-content { flex: 1; overflow-y: auto; padding: var(--snx-space-xl); background: var(--snx-surface-alt); }

.page-title { font-size: 1.25rem; font-weight: 600; margin-bottom: var(--snx-space-xl); }

.card {
  background: var(--snx-surface);
  border: 1px solid var(--snx-border);
  border-radius: var(--snx-radius);
  padding: var(--snx-space-xl);
  box-shadow: var(--now-static-drop-shadow--sm);
}

.btn {
  display: inline-flex; align-items: center; gap: var(--snx-space-sm);
  padding: 0.5rem 1.25rem;
  border: 1px solid transparent;
  border-radius: var(--now-actionable--border-radius, 6px);
  font-family: var(--snx-font); font-size: 0.875rem; font-weight: 500;
  cursor: pointer; transition: background-color 120ms ease;
}

.btn-primary { background: var(--snx-primary); color: var(--snx-primary-text); border-color: var(--snx-primary); }
.btn-primary:hover { filter: brightness(1.08); }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-secondary { background: transparent; color: var(--snx-primary); border-color: var(--snx-primary); }
.btn-secondary:hover { background: rgba(0,128,163,0.08); }

.form-group { display: flex; flex-direction: column; gap: var(--snx-space-sm); margin-bottom: var(--snx-space-lg); }
.form-label { font-size: 0.875rem; font-weight: 600; }

.form-input {
  padding: 0.5rem var(--snx-space-md);
  border: 1px solid var(--snx-border); border-radius: 4px;
  font-size: 0.875rem; background: var(--snx-surface); color: var(--snx-text);
}
.form-input:focus-visible { outline: none; border-color: var(--snx-focus); box-shadow: inset 0 0 0 1px var(--snx-focus); }

.badge { display: inline-flex; align-items: center; padding: 0.2rem 0.6rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }
.badge-queued    { background: rgb(var(--now-indicator--primary_info--background-color,0,128,163)); color:#fff; }
.badge-sampling  { background: rgb(var(--now-indicator--primary_warning--background-color,255,193,7)); color:#000; }
.badge-analyzing { background: rgb(var(--now-indicator--primary_warning--background-color,255,193,7)); color:#000; }
.badge-completed { background: rgb(var(--now-indicator--primary_positive--background-color,62,134,0)); color:#fff; }
.badge-failed    { background: rgb(var(--now-indicator--primary_critical--background-color,229,34,57)); color:#fff; }

.progress-bar { width:100%; height:0.5rem; background:rgb(var(--now-progress-bar--background-color,230,232,234)); border-radius:99px; overflow:hidden; }
.progress-bar__fill { height:100%; background:rgb(var(--now-progress-bar_path--initial--background-color,0,128,163)); transition:width 300ms ease; }

.page-actions { display:flex; justify-content:flex-end; gap:var(--snx-space-md); margin-top:var(--snx-space-xl); }

.error-banner {
  background: rgb(var(--now-alert--critical--background-color,253,233,235));
  border: 1px solid rgb(var(--now-alert--critical--border-color,229,34,57));
  border-radius: var(--snx-radius); padding: var(--snx-space-md) var(--snx-space-lg);
  margin-bottom: var(--snx-space-lg); font-size:0.875rem;
}
```

- [ ] **Step 7: Rewrite app.tsx**

```tsx
// src/client/app.tsx
import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Stepper from './components/Stepper'
import SelectTablePage from './pages/SelectTablePage'
import SelectFieldsPage from './pages/SelectFieldsPage'
import DateRangePage from './pages/DateRangePage'
import SamplingPage from './pages/SamplingPage'
import PreflightPage from './pages/PreflightPage'
import RunStatusPage from './pages/RunStatusPage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'

export interface WizardState {
  table: string; fields: string[]; categoryField: string; subcategoryField: string
  dateFrom: string; dateTo: string; strategy: string; keywords: string
  encodedQuery: string; customInstructions: string; sampleSize: number
}

const INIT: WizardState = {
  table:'', fields:[], categoryField:'', subcategoryField:'',
  dateFrom:'', dateTo:'', strategy:'temporal', keywords:'',
  encodedQuery:'', customInstructions:'', sampleSize:1000,
}

const STEPS = ['Table','Fields','Dates','Sampling','Preflight','Running']
const STEP_VIEWS = ['table','fields','dates','sampling','preflight','status']

export type NavFn = (view: string, extra?: Record<string,string>) => void

export default function App() {
  const [state, setState] = useState<WizardState>(INIT)
  const params  = new URLSearchParams(window.location.search)
  const view    = params.get('view') || 'table'
  const id      = params.get('id') || ''
  const update  = (patch: Partial<WizardState>) => setState(s => ({ ...s, ...patch }))
  const nav: NavFn = (v, extra) => {
    const p = new URLSearchParams({ view: v, ...extra })
    window.history.pushState({}, '', '?' + p.toString())
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  const stepIdx = STEP_VIEWS.indexOf(view)

  return (
    <div className="app-shell">
      <Sidebar view={view} nav={nav} />
      <main className="main-content">
        {stepIdx >= 0 && <Stepper steps={STEPS} current={stepIdx} />}
        {view === 'table'    && <SelectTablePage  state={state} update={update} nav={nav} />}
        {view === 'fields'   && <SelectFieldsPage state={state} update={update} nav={nav} />}
        {view === 'dates'    && <DateRangePage    state={state} update={update} nav={nav} />}
        {view === 'sampling' && <SamplingPage     state={state} update={update} nav={nav} />}
        {view === 'preflight'&& <PreflightPage    state={state} update={update} nav={nav} />}
        {view === 'status'   && <RunStatusPage    id={id}       nav={nav} />}
        {view === 'results'  && <ResultsPage      id={id}       nav={nav} />}
        {view === 'history'  && <HistoryPage      nav={nav} />}
      </main>
    </div>
  )
}
```

- [ ] **Step 8: Build and commit**

```bash
npx @servicenow/sdk build
git add src/client/index.html src/client/main.tsx src/client/app.tsx src/client/app.css src/client/utils/ src/client/services/
git commit -m "feat: React foundation — layout, routing, Horizon CSS, API service"
```

---

## Task 11: Sidebar + Stepper components

**Files:**
- Create: `src/client/components/Sidebar.tsx`
- Create: `src/client/components/Sidebar.css`
- Create: `src/client/components/Stepper.tsx`
- Create: `src/client/components/Stepper.css`

- [ ] **Step 1: Create Sidebar.tsx**

```tsx
// src/client/components/Sidebar.tsx
import React from 'react'
import { NavFn } from '../app'
import './Sidebar.css'

const NAV = [
  { view:'table',    label:'Select Table',  group:'wizard' },
  { view:'fields',   label:'Select Fields', group:'wizard' },
  { view:'dates',    label:'Date Range',    group:'wizard' },
  { view:'sampling', label:'Sampling',      group:'wizard' },
  { view:'preflight',label:'Preflight',     group:'wizard' },
  { view:'history',  label:'Past Runs',     group:'history'},
]

export default function Sidebar({ view, nav }: { view: string; nav: NavFn }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="2.5"/>
          <line x1="19.5" y1="19.5" x2="22" y2="22"/>
        </svg>
        <div>
          <div className="sidebar__name">1M Data Analyzer</div>
          <div className="sidebar__sub">ServiceNow Analytics</div>
        </div>
      </div>
      <nav className="sidebar__nav">
        <div className="sidebar__group">Analysis Wizard</div>
        {NAV.filter(n=>n.group==='wizard').map(n=>(
          <button key={n.view} className={`sidebar__item${view===n.view?' sidebar__item--active':''}`} onClick={()=>nav(n.view)}>
            {n.label}
          </button>
        ))}
        <div className="sidebar__group sidebar__group--spaced">History</div>
        {NAV.filter(n=>n.group==='history').map(n=>(
          <button key={n.view} className={`sidebar__item${view===n.view?' sidebar__item--active':''}`} onClick={()=>nav(n.view)}>
            {n.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Create Sidebar.css**

```css
/* src/client/components/Sidebar.css */
.sidebar { width:220px; min-width:220px; background:var(--snx-sidebar-bg,#161b33); color:var(--snx-sidebar-text,#c8d2dc); display:flex; flex-direction:column; border-right:1px solid rgba(255,255,255,0.08); }
.sidebar__logo { display:flex; align-items:center; gap:0.75rem; padding:1.25rem 1rem; border-bottom:1px solid rgba(255,255,255,0.08); color:#fff; }
.sidebar__name { font-size:0.875rem; font-weight:600; color:#fff; }
.sidebar__sub  { font-size:0.7rem; color:rgba(255,255,255,0.45); }
.sidebar__nav  { flex:1; padding:0.75rem 0; }
.sidebar__group { font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:rgba(255,255,255,0.35); padding:0.75rem 1rem 0.25rem; }
.sidebar__group--spaced { margin-top:0.5rem; }
.sidebar__item { display:block; width:100%; text-align:left; padding:0.6rem 1rem; background:transparent; border:none; border-left:3px solid transparent; color:var(--snx-sidebar-text,#c8d2dc); font-size:0.875rem; cursor:pointer; transition:background 120ms,color 120ms; }
.sidebar__item:hover { background:rgba(255,255,255,0.06); color:#fff; }
.sidebar__item--active { background:var(--snx-sidebar-active,rgba(255,255,255,0.1)); border-left-color:var(--snx-primary,#0080a3); color:#fff; font-weight:600; }
```

- [ ] **Step 3: Create Stepper.tsx**

```tsx
// src/client/components/Stepper.tsx
import React from 'react'
import './Stepper.css'

export default function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="stepper">
      {steps.map((label, i) => {
        const cls = i < current ? 'done' : i === current ? 'active' : 'idle'
        return (
          <React.Fragment key={i}>
            <div className={`stepper__step stepper__step--${cls}`}>
              <div className="stepper__circle">
                {i < current
                  ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  : <span>{i+1}</span>}
              </div>
              <span className="stepper__label">{label}</span>
            </div>
            {i < steps.length-1 && <div className={`stepper__line${i<current?' stepper__line--done':''}`}/>}
          </React.Fragment>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Create Stepper.css**

```css
/* src/client/components/Stepper.css */
.stepper { display:flex; align-items:center; margin-bottom:1.5rem; overflow-x:auto; }
.stepper__step { display:flex; flex-direction:column; align-items:center; gap:0.25rem; min-width:64px; }
.stepper__circle { width:2rem; height:2rem; border-radius:50%; border:2px solid; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; }
.stepper__step--done   .stepper__circle { background:rgb(var(--now-indicator--primary_positive--background-color,62,134,0)); border-color:rgb(var(--now-indicator--primary_positive--background-color,62,134,0)); color:#fff; }
.stepper__step--active .stepper__circle { background:#fff; border-color:var(--snx-primary,#0080a3); color:var(--snx-primary,#0080a3); }
.stepper__step--idle   .stepper__circle { background:#fff; border-color:var(--snx-border); color:var(--snx-text-muted); }
.stepper__label { font-size:0.7rem; color:var(--snx-text-muted); white-space:nowrap; }
.stepper__step--active .stepper__label { color:var(--snx-primary,#0080a3); font-weight:600; }
.stepper__step--done   .stepper__label { color:rgb(var(--now-indicator--primary_positive--background-color,62,134,0)); }
.stepper__line { flex:1; height:2px; background:var(--snx-border); margin:0 0.25rem; margin-bottom:1.1rem; }
.stepper__line--done   { background:rgb(var(--now-indicator--primary_positive--background-color,62,134,0)); }
```

- [ ] **Step 5: Build and commit**

```bash
npx @servicenow/sdk build
git add src/client/components/
git commit -m "feat: Sidebar and Stepper components with Horizon tokens"
```

---

## Task 12: Wizard pages — Table, Fields, Dates, Sampling

**Files:**
- Create: `src/client/pages/SelectTablePage.tsx`
- Create: `src/client/pages/SelectFieldsPage.tsx`
- Create: `src/client/pages/DateRangePage.tsx`
- Create: `src/client/pages/SamplingPage.tsx`

- [ ] **Step 1: SelectTablePage.tsx**

```tsx
// src/client/pages/SelectTablePage.tsx
import React from 'react'
import { WizardState, NavFn } from '../app'

const TABLES = [
  { name:'incident',                  label:'Incidents',              description:'IT service incidents and outages' },
  { name:'change_request',            label:'Change Requests',        description:'Planned changes and releases' },
  { name:'sn_customerservice_case',   label:'Customer Service Cases', description:'External customer support cases' },
  { name:'sc_req_item',               label:'Service Requests',       description:'Service catalog requests' },
  { name:'problem',                   label:'Problems',               description:'Root cause investigations' },
  { name:'task',                      label:'Tasks',                  description:'General task records' },
]

export default function SelectTablePage({ state, update, nav }: { state: WizardState; update: (p: Partial<WizardState>) => void; nav: NavFn }) {
  return (
    <div>
      <div className="page-title">Select a Table to Analyze</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1rem' }}>
        {TABLES.map(t => (
          <button key={t.name} onClick={() => { update({ table: t.name }); nav('fields') }}
            style={{ textAlign:'left', cursor:'pointer', background:'none', border:'none', padding:0 }}>
            <div className="card" style={{ borderColor: state.table===t.name ? 'var(--snx-primary)' : '', borderWidth: state.table===t.name ? 2 : 1, cursor:'pointer' }}>
              <div style={{ fontWeight:600, marginBottom:'0.25rem' }}>{t.label}</div>
              <div style={{ fontSize:'0.8rem', color:'var(--snx-text-muted)' }}>{t.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: SelectFieldsPage.tsx**

```tsx
// src/client/pages/SelectFieldsPage.tsx
import React, { useEffect, useState } from 'react'
import { AnalysisService } from '../services/AnalysisService'
import { WizardState, NavFn } from '../app'

export default function SelectFieldsPage({ state, update, nav }: { state: WizardState; update: (p: Partial<WizardState>) => void; nav: NavFn }) {
  const [grouped, setGrouped] = useState<Record<string,any[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!state.table) { nav('table'); return }
    AnalysisService.getFields(state.table)
      .then(r => setGrouped(r.grouped))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [state.table])

  const toggle = (name: string) => {
    update({ fields: state.fields.includes(name) ? state.fields.filter(f=>f!==name) : [...state.fields, name] })
  }

  if (loading) return <div>Loading fields...</div>
  if (error)   return <div className="error-banner">{error}</div>

  return (
    <div>
      <div className="page-title">Select Text Fields to Analyze</div>
      <p style={{ marginBottom:'1rem', color:'var(--snx-text-muted)', fontSize:'0.875rem' }}>
        Choose fields whose text the AI will read. String fields are recommended.
      </p>
      {Object.entries(grouped).map(([group, fields]) => (
        <div key={group} className="card" style={{ marginBottom:'1rem' }}>
          <div style={{ fontWeight:600, marginBottom:'0.75rem', textTransform:'capitalize' }}>{group} fields</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'0.5rem' }}>
            {fields.map((f:any) => (
              <label key={f.name} style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontSize:'0.875rem' }}>
                <input type="checkbox" checked={state.fields.includes(f.name)} onChange={() => toggle(f.name)} />
                <span>{f.label} <span style={{ color:'var(--snx-text-muted)', fontSize:'0.75rem' }}>({f.name})</span></span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="page-actions">
        <button className="btn btn-secondary" onClick={() => nav('table')}>Back</button>
        <button className="btn btn-primary" disabled={state.fields.length===0} onClick={() => nav('dates')}>Next — Date Range</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: DateRangePage.tsx**

```tsx
// src/client/pages/DateRangePage.tsx
import React from 'react'
import { WizardState, NavFn } from '../app'

const PRESETS = [
  { label:'Last 7 days',   days:7   },
  { label:'Last 30 days',  days:30  },
  { label:'Last 90 days',  days:90  },
  { label:'Last 6 months', days:180 },
  { label:'Last year',     days:365 },
]

const toISO = (d: Date) => d.toISOString().slice(0,10)

export default function DateRangePage({ state, update, nav }: { state: WizardState; update: (p: Partial<WizardState>) => void; nav: NavFn }) {
  const applyPreset = (days: number) => {
    const to = new Date(); const from = new Date(to.getTime() - days*86400000)
    update({ dateFrom: toISO(from), dateTo: toISO(to) })
  }
  return (
    <div>
      <div className="page-title">Select Date Range</div>
      <div className="card">
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
          {PRESETS.map(p => <button key={p.days} className="btn btn-secondary" style={{ fontSize:'0.8rem' }} onClick={() => applyPreset(p.days)}>{p.label}</button>)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <div className="form-group">
            <label className="form-label">From</label>
            <input className="form-input" type="date" value={state.dateFrom} onChange={e => update({ dateFrom: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">To</label>
            <input className="form-input" type="date" value={state.dateTo} onChange={e => update({ dateTo: e.target.value })} />
          </div>
        </div>
      </div>
      <div className="page-actions">
        <button className="btn btn-secondary" onClick={() => nav('fields')}>Back</button>
        <button className="btn btn-primary" disabled={!state.dateFrom||!state.dateTo} onClick={() => nav('sampling')}>Next — Sampling</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: SamplingPage.tsx**

```tsx
// src/client/pages/SamplingPage.tsx
import React from 'react'
import { WizardState, NavFn } from '../app'

const STRATEGIES = [
  { value:'temporal', label:'Temporal',  desc:'Evenly distributed across the date range' },
  { value:'category', label:'Category',  desc:'Stratified by a category field' },
  { value:'cluster',  label:'Cluster',   desc:'Sampled across category + subcategory combinations' },
  { value:'keyword',  label:'Keyword',   desc:'Filter records matching specific keywords' },
]

export default function SamplingPage({ state, update, nav }: { state: WizardState; update: (p: Partial<WizardState>) => void; nav: NavFn }) {
  return (
    <div>
      <div className="page-title">Sampling Strategy</div>
      <div className="card" style={{ marginBottom:'1rem' }}>
        {STRATEGIES.map(s => (
          <label key={s.value} style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', cursor:'pointer', marginBottom:'0.75rem' }}>
            <input type="radio" name="strategy" value={s.value} checked={state.strategy===s.value} onChange={() => update({ strategy: s.value })} style={{ marginTop:'0.2rem' }} />
            <div><div style={{ fontWeight:600, fontSize:'0.875rem' }}>{s.label}</div><div style={{ fontSize:'0.8rem', color:'var(--snx-text-muted)' }}>{s.desc}</div></div>
          </label>
        ))}
      </div>

      {(state.strategy==='category'||state.strategy==='cluster') && (
        <div className="card" style={{ marginBottom:'1rem' }}>
          <div className="form-group">
            <label className="form-label">Category Field</label>
            <input className="form-input" placeholder="e.g. category" value={state.categoryField} onChange={e => update({ categoryField: e.target.value })} />
          </div>
          {state.strategy==='cluster' && (
            <div className="form-group">
              <label className="form-label">Subcategory Field</label>
              <input className="form-input" placeholder="e.g. subcategory" value={state.subcategoryField} onChange={e => update({ subcategoryField: e.target.value })} />
            </div>
          )}
        </div>
      )}

      {state.strategy==='keyword' && (
        <div className="card" style={{ marginBottom:'1rem' }}>
          <div className="form-group">
            <label className="form-label">Keywords (comma separated)</label>
            <input className="form-input" placeholder="e.g. login, password, VPN" value={state.keywords} onChange={e => update({ keywords: e.target.value })} />
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom:'1rem' }}>
        <div className="form-group">
          <label className="form-label">Sample Size (100–2000)</label>
          <input className="form-input" type="number" min={100} max={2000} value={state.sampleSize} onChange={e => update({ sampleSize: parseInt(e.target.value,10)||1000 })} />
        </div>
        <div className="form-group">
          <label className="form-label">Custom Encoded Query (optional)</label>
          <input className="form-input" placeholder="e.g. active=true^priority=1" value={state.encodedQuery} onChange={e => update({ encodedQuery: e.target.value })} />
        </div>
      </div>

      <div className="page-actions">
        <button className="btn btn-secondary" onClick={() => nav('dates')}>Back</button>
        <button className="btn btn-primary" onClick={() => nav('preflight')}>Next — Preflight</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Build and commit**

```bash
npx @servicenow/sdk build
git add src/client/pages/SelectTablePage.tsx src/client/pages/SelectFieldsPage.tsx src/client/pages/DateRangePage.tsx src/client/pages/SamplingPage.tsx
git commit -m "feat: wizard pages — table, fields, dates, sampling"
```

---

## Task 13: Wizard pages — Preflight, RunStatus, Results, History

**Files:**
- Create: `src/client/pages/PreflightPage.tsx`
- Create: `src/client/pages/RunStatusPage.tsx`
- Create: `src/client/pages/ResultsPage.tsx`
- Create: `src/client/pages/HistoryPage.tsx`

- [ ] **Step 1: PreflightPage.tsx**

```tsx
// src/client/pages/PreflightPage.tsx
import React, { useEffect, useState } from 'react'
import { AnalysisService } from '../services/AnalysisService'
import { WizardState, NavFn } from '../app'

export default function PreflightPage({ state, update, nav }: { state: WizardState; update: (p: Partial<WizardState>) => void; nav: NavFn }) {
  const [result, setResult]     = useState<{ totalCount: number; sampleRecords: any[] } | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [launching, setLaunching] = useState(false)

  useEffect(() => {
    AnalysisService.preflight({ table_name: state.table, date_from: state.dateFrom, date_to: state.dateTo, selected_fields: state.fields, encoded_query: state.encodedQuery })
      .then(setResult).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  async function launch() {
    setLaunching(true)
    try {
      const analysis = await AnalysisService.create({
        table_name: state.table, date_from: state.dateFrom, date_to: state.dateTo,
        selected_fields: state.fields, sampling_strategy: state.strategy,
        category_field: state.categoryField, subcategory_field: state.subcategoryField,
        encoded_query: state.encodedQuery, custom_instructions: state.customInstructions,
        sample_size: state.sampleSize, sampling_keywords: state.keywords,
      })
      nav('status', { id: analysis.sys_id })
    } catch(e: any) { setError(e.message); setLaunching(false) }
  }

  if (loading) return <div>Running preflight check...</div>
  if (error)   return <div><div className="error-banner">{error}</div><div className="page-actions"><button className="btn btn-secondary" onClick={() => nav('sampling')}>Back</button></div></div>

  return (
    <div>
      <div className="page-title">Preflight Check</div>
      <div className="card" style={{ marginBottom:'1rem' }}>
        <div style={{ display:'flex', gap:'2rem', marginBottom:'1rem' }}>
          <div><div style={{ fontSize:'2rem', fontWeight:700 }}>{result!.totalCount.toLocaleString()}</div><div style={{ fontSize:'0.8rem', color:'var(--snx-text-muted)' }}>Total records</div></div>
          <div><div style={{ fontSize:'2rem', fontWeight:700 }}>{state.sampleSize}</div><div style={{ fontSize:'0.8rem', color:'var(--snx-text-muted)' }}>Will sample</div></div>
          <div><div style={{ fontSize:'2rem', fontWeight:700 }}>{state.fields.length}</div><div style={{ fontSize:'0.8rem', color:'var(--snx-text-muted)' }}>Fields</div></div>
        </div>
        {result!.sampleRecords.map((r,i) => (
          <div key={i} style={{ padding:'0.5rem', background:'var(--snx-surface-alt)', borderRadius:4, marginBottom:'0.5rem', fontSize:'0.8rem' }}>
            <strong>{r.number}</strong> — {r.short_description}
          </div>
        ))}
      </div>
      <div className="card" style={{ marginBottom:'1rem' }}>
        <div className="form-group">
          <label className="form-label">Custom AI Instructions (optional)</label>
          <textarea className="form-input" rows={3} style={{ resize:'vertical', height:'auto', paddingTop:'0.5rem' }}
            placeholder="e.g. Focus on network-related issues only..."
            value={state.customInstructions} onChange={e => update({ customInstructions: e.target.value })} />
        </div>
      </div>
      <div className="page-actions">
        <button className="btn btn-secondary" onClick={() => nav('sampling')}>Back</button>
        <button className="btn btn-primary" disabled={launching||result!.totalCount===0} onClick={launch}>
          {launching ? 'Launching...' : 'Run Analysis'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: RunStatusPage.tsx**

```tsx
// src/client/pages/RunStatusPage.tsx
import React, { useEffect, useState } from 'react'
import { AnalysisService, Analysis } from '../services/AnalysisService'
import { NavFn } from '../app'

export default function RunStatusPage({ id, nav }: { id: string; nav: NavFn }) {
  const [status, setStatus] = useState<Analysis | null>(null)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!id) { nav('table'); return }
    let cancelled = false
    const poll = async () => {
      try {
        const s = await AnalysisService.getStatus(id)
        if (cancelled) return
        setStatus(s)
        if (s.status === 'completed') { nav('results', { id }); return }
        if (s.status !== 'failed') setTimeout(poll, 2000)
      } catch(e: any) { if (!cancelled) setError(e.message) }
    }
    poll()
    return () => { cancelled = true }
  }, [id])

  if (error)   return <div className="error-banner">{error}</div>
  if (!status) return <div>Starting analysis...</div>

  return (
    <div>
      <div className="page-title">Analysis Running</div>
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <span style={{ fontSize:'0.875rem' }}>{status.phase_label}</span>
          <span className={`badge badge-${status.status}`}>{status.status}</span>
        </div>
        <div className="progress-bar" style={{ marginBottom:'0.5rem' }}>
          <div className="progress-bar__fill" style={{ width:`${status.progress_pct||0}%` }}/>
        </div>
        <div style={{ fontSize:'0.75rem', color:'var(--snx-text-muted)' }}>{status.progress_pct||0}% complete</div>
        {status.estimated_records > 0 && (
          <div style={{ marginTop:'1rem', fontSize:'0.875rem', color:'var(--snx-text-muted)' }}>
            {(status.processed_records||0).toLocaleString()} of {status.estimated_records.toLocaleString()} records sampled
          </div>
        )}
        {status.status === 'failed' && <div className="error-banner" style={{ marginTop:'1rem' }}>{status.error_message||'Analysis failed'}</div>}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: ResultsPage.tsx**

```tsx
// src/client/pages/ResultsPage.tsx
import React, { useEffect, useState } from 'react'
import { AnalysisService, AnalysisResult } from '../services/AnalysisService'
import { NavFn } from '../app'

export default function ResultsPage({ id, nav }: { id: string; nav: NavFn }) {
  const [data, setData]   = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) { nav('history'); return }
    AnalysisService.getResults(id).then(setData).catch(e => setError(e.message))
  }, [id])

  if (error) return <div className="error-banner">{error}</div>
  if (!data) return <div>Loading results...</div>

  const { analysis, llm_report, category_breakdown, temporal_trend } = data

  function printReport() {
    const win = window.open('', '_blank')!
    win.document.write(`<html><head><title>Analysis Report</title><style>body{font-family:system-ui;padding:2rem;max-width:900px;margin:auto;color:#101b1e}h2{margin-top:1.5rem;font-size:1.1rem;border-bottom:1px solid #cfd5d7;padding-bottom:.4rem}ul,ol{padding-left:1.4rem}li{margin-bottom:.3rem}@media print{body{padding:0}}</style></head><body>${llm_report}</body></html>`)
    win.document.close(); win.print()
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div className="page-title" style={{ margin:0 }}>Results — {analysis.table_name}</div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => nav('history')}>View History</button>
          <button className="btn btn-primary" onClick={printReport}>Download PDF</button>
        </div>
      </div>
      <div style={{ fontSize:'0.8rem', color:'var(--snx-text-muted)', marginBottom:'1rem' }}>
        {analysis.date_from} → {analysis.date_to} · {(analysis.estimated_records||0).toLocaleString()} records · {(analysis.processed_records||0).toLocaleString()} sampled
      </div>
      <div className="card" style={{ marginBottom:'1rem' }}>
        <div dangerouslySetInnerHTML={{ __html: llm_report }} style={{ fontSize:'0.9rem', lineHeight:1.6 }}/>
      </div>
      {category_breakdown.length > 0 && (
        <div className="card" style={{ marginBottom:'1rem' }}>
          <div style={{ fontWeight:600, marginBottom:'0.75rem' }}>Category Breakdown</div>
          {category_breakdown.slice(0,10).map((c,i) => (
            <div key={i} style={{ marginBottom:'0.5rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:'0.2rem' }}>
                <span>{c.display}</span><span>{c.count.toLocaleString()} ({c.pct}%)</span>
              </div>
              <div className="progress-bar" style={{ height:'0.35rem' }}>
                <div className="progress-bar__fill" style={{ width:`${c.pct}%` }}/>
              </div>
            </div>
          ))}
        </div>
      )}
      {temporal_trend.length > 0 && (
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:'0.75rem' }}>Volume Over Time</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:'0.4rem', height:'80px' }}>
            {temporal_trend.map((t,i) => {
              const max = Math.max(...temporal_trend.map(x=>x.count))
              return <div key={i} title={`${t.period}: ${t.count}`}
                style={{ flex:1, background:'var(--snx-primary)', height:`${max?(t.count/max)*100:0}%`, borderRadius:'2px 2px 0 0', minHeight:4 }}/>
            })}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.65rem', color:'var(--snx-text-muted)', marginTop:'0.25rem' }}>
            <span>{temporal_trend[0]?.period}</span>
            <span>{temporal_trend[temporal_trend.length-1]?.period}</span>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: HistoryPage.tsx**

```tsx
// src/client/pages/HistoryPage.tsx
import React, { useEffect, useState } from 'react'
import { AnalysisService, Analysis } from '../services/AnalysisService'
import { NavFn } from '../app'

export default function HistoryPage({ nav }: { nav: NavFn }) {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const load = () => {
    setLoading(true)
    AnalysisService.list().then(setAnalyses).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  if (loading) return <div>Loading history...</div>
  if (error)   return <div className="error-banner">{error}</div>

  return (
    <div>
      <div className="page-title">Past Analyses</div>
      {analyses.length === 0
        ? <div className="card" style={{ textAlign:'center', color:'var(--snx-text-muted)' }}>No analyses yet.</div>
        : analyses.map(a => (
          <div key={a.sys_id} className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
            <div>
              <div style={{ fontWeight:600, marginBottom:'0.25rem' }}>{a.table_name} — {a.date_from} → {a.date_to}</div>
              <div style={{ fontSize:'0.8rem', color:'var(--snx-text-muted)' }}>{(a.estimated_records||0).toLocaleString()} records · {(a.created_at||'').slice(0,10)}</div>
            </div>
            <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
              <span className={`badge badge-${a.status}`}>{a.status}</span>
              {a.status==='completed' && <button className="btn btn-primary" style={{ fontSize:'0.8rem', padding:'0.3rem 0.8rem' }} onClick={() => nav('results',{id:a.sys_id})}>View</button>}
              <button className="btn btn-secondary" style={{ fontSize:'0.8rem', padding:'0.3rem 0.8rem' }}
                onClick={async () => { if(confirm('Delete?')) { await AnalysisService.delete(a.sys_id); load() } }}>Delete</button>
            </div>
          </div>
        ))
      }
    </div>
  )
}
```

- [ ] **Step 5: Build and commit**

```bash
npx @servicenow/sdk build
git add src/client/pages/
git commit -m "feat: wizard pages — preflight, status, results, history"
```

---

## Task 14: UiPages + UI Action

**Files:**
- Modify: `src/fluent/ui-pages/analyzer.now.ts`
- Create: `src/client/report/index.html`
- Create: `src/client/report/report-main.tsx`
- Create: `src/fluent/ui-pages/report.now.ts`
- Create: `src/fluent/ui-actions/download-report.now.ts`

- [ ] **Step 1: Update analyzer UiPage**

```typescript
// src/fluent/ui-pages/analyzer.now.ts
import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import analyzerPage from '../../client/index.html'

UiPage({
  $id: Now.ID['analyzer-page'],
  endpoint: 'x_1119723_1mdataan_analyzer.do',
  description: '1M Data Analyzer — AI-powered ServiceNow table analysis',
  category: 'general',
  html: analyzerPage,
  direct: true,
})
```

- [ ] **Step 2: Create report/index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" /><title>Analysis Report</title>
  <style>
    body{font-family:system-ui,sans-serif;padding:2rem;max-width:900px;margin:auto;color:#101b1e}
    h2{margin-top:1.5rem;font-size:1.1rem;border-bottom:1px solid #cfd5d7;padding-bottom:.4rem}
    ul,ol{padding-left:1.4rem}li{margin-bottom:.3rem}
    @media print{body{padding:0}}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./report-main.tsx"></script>
</body>
</html>
```

- [ ] **Step 3: Create report/report-main.tsx**

```tsx
// src/client/report/report-main.tsx
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

const BASE = '/api/x_1119723_1mdataan/analyzer'

function ReportPage() {
  const id = new URLSearchParams(window.location.search).get('id')
  const [html, setHtml] = useState('')

  useEffect(() => {
    if (!id) return
    fetch(`${BASE}/analyses/${id}/results`, { headers: { 'X-UserToken': (window as any).g_ck ?? '' } })
      .then(r => r.json()).then((d: any) => setHtml(d.llm_report || ''))
  }, [id])

  return <div dangerouslySetInnerHTML={{ __html: html }}/>
}

createRoot(document.getElementById('root')!).render(<ReportPage />)
```

- [ ] **Step 4: Create report UiPage**

```typescript
// src/fluent/ui-pages/report.now.ts
import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import reportPage from '../../client/report/index.html'

UiPage({
  $id: Now.ID['report-page'],
  endpoint: 'x_1119723_1mdataan_report.do',
  description: '1M Data Analyzer — printable HTML report',
  category: 'general',
  html: reportPage,
  direct: true,
})
```

- [ ] **Step 5: Create UI Action**

```typescript
// src/fluent/ui-actions/download-report.now.ts
import '@servicenow/sdk/global'
import { UiAction } from '@servicenow/sdk/core'

UiAction({
  $id: Now.ID['download-report-action'],
  name: 'Download Report',
  table: 'x_1119723_1mdataan_result',
  action_name: 'download_report',
  client: true,
  onclick: `window.open('/x_1119723_1mdataan_report.do?id=' + g_form.getUniqueValue(), '_blank')`,
  form_button: true,
  hint: 'Open printable HTML report in new tab — use Ctrl+P to save as PDF',
})
```

- [ ] **Step 6: Build and commit**

```bash
npx @servicenow/sdk build
git add src/fluent/ui-pages/ src/fluent/ui-actions/ src/client/report/
git commit -m "feat: analyzer UiPage, report print page, Download Report UI action"
```

---

## Task 15: Deploy and end-to-end verification

- [ ] **Step 1: Authenticate**

```bash
npx @servicenow/sdk auth --list
```

If no alias: `npx @servicenow/sdk auth --add https://yourinstance.service-now.com --type basic`

- [ ] **Step 2: Final build**

```bash
npx @servicenow/sdk build
```

Expected: `Build succeeded` with zero errors.

- [ ] **Step 3: Deploy**

```bash
npx @servicenow/sdk install
```

Expected: `Install succeeded`.

- [ ] **Step 4: Post-deploy one-time instance steps**

1. **Change llm_report to HTML field type:**
   sys_dictionary → table `x_1119723_1mdataan_result` → field `llm_report` → change Type to HTML.

2. **Create Connection & Credential Alias:**
   - System Web Services → Connections & Credentials → Connection & Credential Aliases → New
   - Name: `OpenAI`, Type: `Connection and Credential`
   - Create Credential: Basic Auth, username `apikey`, password = your OpenAI API key
   - Create Connection: HTTP, URL `https://api.openai.com`, attach credential
   - Assign connection to alias. Alias name must match `x_1119723_1mdataan.OpenAI` in `AnalyzerLLMService.js`.

3. **Verify sys_property:**
   Navigate to sys_properties → search `x_1119723_1mdataan.openai_model` → confirm value is `gpt-4.1-nano`.

- [ ] **Step 5: Smoke test**

1. Open `https://yourinstance.service-now.com/x_1119723_1mdataan_analyzer.do`
2. Select **Incidents** → choose 2–3 string fields (short_description, comments) → set Last 30 Days → Temporal → Next
3. Preflight shows record count and 3 sample records → click **Run Analysis**
4. Progress bar advances every 2 seconds showing phase labels
5. On completion: redirects to Results — HTML report rendered, category bars and trend chart visible
6. Click **Download PDF** → new tab opens with clean report → `Ctrl+P` → Save as PDF

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "chore: complete 1MDataAnalyzer scoped app deployment"
```


claude --resume "sn-scoped-app-implementation"