response.setContentType('application/json');
try {
  var body     = request.body && request.body.data ? request.body.data : {};
  var jobSvc   = new x_1119723_1mdataan.AnalyzerJobService();
  var analysis = jobSvc.createAnalysis(body);

  response.setStatus(201);
  response.setBody(analysis);
} catch(e) { response.setStatus(500); response.setBody({ error: e.message }); }
