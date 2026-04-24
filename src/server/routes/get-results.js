response.setContentType('application/json');
var svc      = new x_1119723_1mdataan.AnalyzerJobService();
var analysis = svc.getAnalysis(request.pathParams.id);
if (!analysis) { response.setStatus(404); response.setBody({ error: 'Not found' }); }
else if (analysis.status !== 'completed') { response.setStatus(202); response.setBody({ message: 'Not complete' }); }
else {
  var result = svc.getResultByAnalysis(analysis.sys_id);
  if (!result) { response.setStatus(404); response.setBody({ error: 'Results not found' }); }
  else response.setBody({
    analysis:           analysis,
    llm_report:         result.llm_report,
    category_breakdown: result.category_breakdown ? JSON.parse(result.category_breakdown) : [],
    temporal_trend:     result.temporal_trend     ? JSON.parse(result.temporal_trend)     : [],
  });
}
