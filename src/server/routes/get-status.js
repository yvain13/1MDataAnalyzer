response.setContentType('application/json');
var analysis = new x_1119723_1mdataan.AnalyzerJobService().getAnalysis(request.pathParams.id);
if (!analysis) { response.setStatus(404); response.setBody({ error: 'Not found' }); }
else response.setBody({
  sys_id: analysis.sys_id, status: analysis.status,
  progress_pct: analysis.progress_pct, phase_label: analysis.phase_label,
  estimated_records: analysis.estimated_records, processed_records: analysis.processed_records,
  error_message: analysis.error_message, completed_at: analysis.completed_at,
});
