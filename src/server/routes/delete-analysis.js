response.setContentType('application/json');
var ok = new x_1119723_1mdataan.AnalyzerJobService().deleteAnalysis(request.pathParams.id);
if (!ok) { response.setStatus(404); response.setBody({ error: 'Not found' }); }
else response.setBody({ ok: true });
