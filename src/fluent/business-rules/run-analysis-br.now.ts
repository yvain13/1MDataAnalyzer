import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'

BusinessRule({
  $id: Now.ID['br-run-analysis'],
  name: 'Run Analysis (async)',
  table: 'x_1119723_1mdataan_analysis',
  when: 'async',
  action: ['insert'],
  active: true,
  script: Now.include('../../server/business-rules/run-analysis.js'),
})
