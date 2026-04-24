import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
  $id: Now.ID['analyzer-field-service'],
  name: 'AnalyzerFieldService',
  active: true,
  apiName: 'x_1119723_1mdataan.AnalyzerFieldService',
  script: Now.include('../../server/AnalyzerFieldService.js'),
})
