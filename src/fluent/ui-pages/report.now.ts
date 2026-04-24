import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import reportPage from '../../client/report/index.html'

UiPage({
  $id: Now.ID['report-page'],
  endpoint: 'x_1119723_1mdataan_report.do',
  description: '1M Data Analyzer — printable HTML report',
  category: 'general',
  html: reportPage,
  direct: true,
})
