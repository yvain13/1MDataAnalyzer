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
    var seen   = {};
    var namesCsv = String(new GlideTableHierarchy(tableName).getTables() || tableName);
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'IN', namesCsv);
    gr.addQuery('internal_type', '!=', 'collection');
    gr.addNotNullQuery('element');
    gr.query();
    while (gr.next()) {
      var name = gr.getValue('element');
      if (seen[name]) continue;
      seen[name] = true;
      var it = gr.getValue('internal_type');
      fields.push({
        name:         name,
        label:        gr.getDisplayValue('column_label'),
        internalType: it,
        group:        this._normalizeType(it),
        parentTable:  gr.getValue('reference') || null,
        fromTable:    gr.getValue('name'),
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

  CACHE_VERSION: 2,

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
    try {
      var parsed = JSON.parse(gr.getValue('fields_json'));
      if (!parsed || parsed._v !== this.CACHE_VERSION) { gr.deleteRecord(); return null; }
      return parsed.fields;
    } catch(e) { return null; }
  },

  _writeCache: function(tableName, fields) {
    var payload = JSON.stringify({ _v: this.CACHE_VERSION, fields: fields });
    var gr = new GlideRecord('x_1119723_1mdataan_field_cache');
    gr.addQuery('sn_table', tableName);
    gr.query();
    if (gr.next()) {
      gr.fields_json = payload;
      gr.cached_at   = new GlideDateTime().getValue();
      gr.update();
    } else {
      gr.initialize();
      gr.sn_table    = tableName;
      gr.fields_json = payload;
      gr.cached_at   = new GlideDateTime().getValue();
      gr.insert();
    }
  },

  type: 'AnalyzerFieldService',
};
