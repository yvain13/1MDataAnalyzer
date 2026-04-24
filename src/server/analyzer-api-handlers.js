function handleGetTables(request, response) {
  response.setContentType('application/json');
  response.setBody(JSON.stringify([
    { name: 'incident',                  label: 'Incidents',              description: 'IT service incidents and outages' },
    { name: 'change_request',            label: 'Change Requests',        description: 'Planned changes and releases' },
    { name: 'sn_customerservice_case',   label: 'Customer Service Cases', description: 'External customer support cases' },
    { name: 'sc_req_item',               label: 'Service Requests',       description: 'Service catalog requests' },
    { name: 'problem',                   label: 'Problems',               description: 'Root cause investigations' },
    { name: 'task',                      label: 'Tasks',                  description: 'General task records' },
  ]));
}

function handleGetFields(request, response) {
  response.setContentType('application/json');
  try {
    var svc    = new x_1119723_1mdataan.AnalyzerFieldService();
    var fields = svc.getFields(request.pathParams.table);
    var grouped = {};
    fields.forEach(function(f) {
      if (!grouped[f.group]) grouped[f.group] = [];
      grouped[f.group].push(f);
    });
    response.setBody(JSON.stringify({ fields: fields, grouped: grouped }));
  } catch(e) { response.setStatus(500); response.setBody(JSON.stringify({ error: e.message })); }
}

function handlePreflight(request, response) {
  response.setContentType('application/json');
  try {
    var body = JSON.parse(request.body);
    var svc  = new x_1119723_1mdataan.AnalyzerPreflightService();
    response.setBody(JSON.stringify(svc.preflight(body)));
  } catch(e) { response.setStatus(500); response.setBody(JSON.stringify({ error: e.message })); }
}

function handleCreateAnalysis(request, response) {
  response.setContentType('application/json');
  try {
    var body     = JSON.parse(request.body);
    var jobSvc   = new x_1119723_1mdataan.AnalyzerJobService();
    var analysis = jobSvc.createAnalysis(body);

    var worker = new GlideScriptedHierarchicalWorker();
    worker.setProgressName('1MDataAnalyzer — analysis ' + analysis.sys_id);
    worker.setBackground(true);
    worker.setScriptIncludeName('AnalyzerEngineService');
    worker.setScriptIncludeMethod('runAnalysis');
    worker.putMethodArg('analysisSysId', analysis.sys_id);
    worker.start();

    response.setStatus(201);
    response.setBody(JSON.stringify(analysis));
  } catch(e) { response.setStatus(500); response.setBody(JSON.stringify({ error: e.message })); }
}

function handleListAnalyses(request, response) {
  response.setContentType('application/json');
  response.setBody(JSON.stringify(new x_1119723_1mdataan.AnalyzerJobService().listAnalyses()));
}

function handleGetStatus(request, response) {
  response.setContentType('application/json');
  var analysis = new x_1119723_1mdataan.AnalyzerJobService().getAnalysis(request.pathParams.id);
  if (!analysis) { response.setStatus(404); response.setBody(JSON.stringify({ error: 'Not found' })); return; }
  response.setBody(JSON.stringify({
    sys_id: analysis.sys_id, status: analysis.status,
    progress_pct: analysis.progress_pct, phase_label: analysis.phase_label,
    estimated_records: analysis.estimated_records, processed_records: analysis.processed_records,
    error_message: analysis.error_message, completed_at: analysis.completed_at,
  }));
}

function handleGetResults(request, response) {
  response.setContentType('application/json');
  var svc      = new x_1119723_1mdataan.AnalyzerJobService();
  var analysis = svc.getAnalysis(request.pathParams.id);
  if (!analysis) { response.setStatus(404); response.setBody(JSON.stringify({ error: 'Not found' })); return; }
  if (analysis.status !== 'completed') { response.setStatus(202); response.setBody(JSON.stringify({ message: 'Not complete' })); return; }
  var result = svc.getResultByAnalysis(analysis.sys_id);
  if (!result)  { response.setStatus(404); response.setBody(JSON.stringify({ error: 'Results not found' })); return; }
  response.setBody(JSON.stringify({
    analysis:           analysis,
    llm_report:         result.llm_report,
    category_breakdown: result.category_breakdown ? JSON.parse(result.category_breakdown) : [],
    temporal_trend:     result.temporal_trend     ? JSON.parse(result.temporal_trend)     : [],
  }));
}

function handleDeleteAnalysis(request, response) {
  response.setContentType('application/json');
  var ok = new x_1119723_1mdataan.AnalyzerJobService().deleteAnalysis(request.pathParams.id);
  if (!ok) { response.setStatus(404); response.setBody(JSON.stringify({ error: 'Not found' })); return; }
  response.setBody(JSON.stringify({ ok: true }));
}
