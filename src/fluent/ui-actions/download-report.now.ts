import '@servicenow/sdk/global'
import { UiAction } from '@servicenow/sdk/core'

UiAction({
  $id: Now.ID['download-report-action'],
  name: 'Download Report',
  table: 'x_1119723_1mdataan_result',
  actionName: 'download_report',
  active: true,
  hint: 'Open printable HTML report in new tab — use Ctrl+P to save as PDF',
  form: {
    showButton: true,
    style: 'primary',
  },
  client: {
    isClient: true,
    onClick: `window.open('/x_1119723_1mdataan_report.do?id=' + g_form.getUniqueValue(), '_blank')`,
  },
})
