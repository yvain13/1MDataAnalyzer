var AnalyzerEngineService = Class.create();
AnalyzerEngineService.prototype = {
  initialize: function() {
    this.BATCH_SIZE = 100;
    this.jobSvc     = new x_1119723_1mdataan.AnalyzerJobService();
    this.llm        = new x_1119723_1mdataan.AnalyzerLLMService();
  },

  runAnalysis: function(analysisSysId) {
    if (analysisSysId && typeof analysisSysId === 'object' && analysisSysId.analysisSysId) {
      analysisSysId = analysisSysId.analysisSysId;
    }
    gs.info('[AnalyzerEngine] runAnalysis called with sys_id=' + analysisSysId);
    var analysis = this.jobSvc.getAnalysis(analysisSysId);
    if (!analysis) { gs.warn('[AnalyzerEngine] analysis not found: ' + analysisSysId); return; }
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
