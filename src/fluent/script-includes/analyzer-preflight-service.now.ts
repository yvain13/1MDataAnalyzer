import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
  $id: Now.ID['analyzer-preflight-service'],
  name: 'AnalyzerPreflightService',
  active: true,
  apiName: 'x_1119723_1mdataan.AnalyzerPreflightService',
  script: Now.include('../../server/AnalyzerPreflightService.js'),
})
