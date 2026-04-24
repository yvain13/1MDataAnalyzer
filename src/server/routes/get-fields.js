response.setContentType('application/json');
try {
  var svc    = new x_1119723_1mdataan.AnalyzerFieldService();
  var fields = svc.getFields(request.pathParams.table);
  var grouped = {};
  fields.forEach(function(f) {
    if (!grouped[f.group]) grouped[f.group] = [];
    grouped[f.group].push(f);
  });
  response.setBody({ fields: fields, grouped: grouped });
} catch(e) { response.setStatus(500); response.setBody({ error: e.message }); }
