import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
  $id: Now.ID['analyzer-job-service'],
  name: 'AnalyzerJobService',
  active: true,
  apiName: 'x_1119723_1mdataan.AnalyzerJobService',
  script: Now.include('../../server/AnalyzerJobService.js'),
})
