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
