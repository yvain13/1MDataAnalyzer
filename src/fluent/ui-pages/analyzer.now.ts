import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import analyzerPage from '../../client/index.html'

UiPage({
  $id: Now.ID['analyzer-page'],
  endpoint: 'x_1119723_1mdataan_analyzer.do',
  description: '1M Data Analyzer — AI-powered ServiceNow table analysis',
  category: 'general',
  html: analyzerPage,
  direct: true,
})
