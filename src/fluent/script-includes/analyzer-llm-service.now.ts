import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
  $id: Now.ID['analyzer-llm-service'],
  name: 'AnalyzerLLMService',
  active: true,
  apiName: 'x_1119723_1mdataan.AnalyzerLLMService',
  script: Now.include('../../server/AnalyzerLLMService.js'),
})
