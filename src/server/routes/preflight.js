response.setContentType('application/json');
try {
  var body = request.body && request.body.data ? request.body.data : {};
  var svc  = new x_1119723_1mdataan.AnalyzerPreflightService();
  response.setBody(svc.preflight(body));
} catch(e) { response.setStatus(500); response.setBody({ error: e.message }); }
