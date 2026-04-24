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
