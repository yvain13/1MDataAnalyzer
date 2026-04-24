import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
  $id: Now.ID['analyzer-engine-service'],
  name: 'AnalyzerEngineService',
  active: true,
  apiName: 'x_1119723_1mdataan.AnalyzerEngineService',
  script: Now.include('../../server/AnalyzerEngineService.js'),
})
