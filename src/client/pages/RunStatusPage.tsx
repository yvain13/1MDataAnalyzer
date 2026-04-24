import { useEffect, useState } from 'react'
import { AnalysisService, Analysis } from '../services/AnalysisService'
import { NavFn } from '../app'

export default function RunStatusPage({ id, nav }: { id: string; nav: NavFn }) {
  const [status, setStatus] = useState<Analysis | null>(null)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!id) { nav('table'); return }
    let cancelled = false
    const poll = async () => {
      try {
        const s = await AnalysisService.getStatus(id)
        if (cancelled) return
        setStatus(s)
        if (s.status === 'completed') { nav('results', { id }); return }
        if (s.status !== 'failed') setTimeout(poll, 2000)
      } catch(e: any) { if (!cancelled) setError(e.message) }
    }
    poll()
    return () => { cancelled = true }
  }, [id])

  if (error)   return <div className="error-banner">{error}</div>
  if (!status) return <div style={{ padding:'2rem', color:'var(--snx-text-muted)' }}>Starting analysis...</div>

  return (
    <div>
      <div className="page-title">Analysis Running</div>
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <span style={{ fontSize:'0.875rem' }}>{status.phase_label}</span>
          <span className={`badge badge-${status.status}`}>{status.status}</span>
        </div>
        <div className="progress-bar" style={{ marginBottom:'0.5rem' }}>
          <div className="progress-bar__fill" style={{ width:`${status.progress_pct||0}%` }}/>
        </div>
        <div style={{ fontSize:'0.75rem', color:'var(--snx-text-muted)' }}>{status.progress_pct||0}% complete</div>
        {status.estimated_records > 0 && (
          <div style={{ marginTop:'1rem', fontSize:'0.875rem', color:'var(--snx-text-muted)' }}>
            {(status.processed_records||0).toLocaleString()} of {status.estimated_records.toLocaleString()} records sampled
          </div>
        )}
        {status.status === 'failed' && (
          <div className="error-banner" style={{ marginTop:'1rem' }}>{status.error_message||'Analysis failed'}</div>
        )}
      </div>
    </div>
  )
}
