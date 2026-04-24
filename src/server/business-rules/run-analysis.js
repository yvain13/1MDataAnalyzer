(function executeRule(current, previous /*null when async*/) {
  var sysId = current.getUniqueValue();
  try {
    new x_1119723_1mdataan.AnalyzerEngineService().runAnalysis(sysId);
  } catch (e) {
    gs.error('[run-analysis BR] ' + sysId + ': ' + (e.message || e));
    new x_1119723_1mdataan.AnalyzerJobService().updateAnalysis(sysId, {
      status: 'failed',
      error_message: e.message || String(e),
    });
  }
})(current, previous);
