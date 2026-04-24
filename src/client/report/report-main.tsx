import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'

const BASE = '/api/x_1119723_1mdataan/analyzer'

function ReportPage() {
  const id = new URLSearchParams(window.location.search).get('id')
  const [html, setHtml] = useState('')

  useEffect(() => {
    if (!id) return
    fetch(`${BASE}/analyses/${id}/results`, { headers: { 'X-UserToken': (window as any).g_ck ?? '' } })
      .then(r => r.json()).then((d: any) => setHtml(d.llm_report || ''))
  }, [id])

  return <div dangerouslySetInnerHTML={{ __html: html }}/>
}

const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<ReportPage />)
}
