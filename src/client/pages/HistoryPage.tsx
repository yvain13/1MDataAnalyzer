import { useEffect, useState } from 'react'
import { AnalysisService, Analysis } from '../services/AnalysisService'
import { NavFn } from '../app'
import PageHeader from '../components/PageHeader'

function BarChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  )
}

function ClockIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

export default function HistoryPage({ nav }: { nav: NavFn }) {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const load = () => {
    setLoading(true)
    AnalysisService.list().then(setAnalyses).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  return (
    <div>
      <PageHeader title="Past Runs" subtitle="History of all analysis jobs." />
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}

        {loading && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading history…</div>
        )}

        {!loading && analyses.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon"><ClockIcon /></div>
            <div>No analyses yet. Run your first one.</div>
            <button className="btn btn-primary btn-sm" onClick={() => nav('table')}>Start Analysis</button>
          </div>
        )}

        {!loading && analyses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analyses.map(a => (
              <div key={a.sys_id} className="history-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
                  <div className="history-row__icon"><BarChartIcon /></div>
                  <div style={{ minWidth: 0 }}>
                    <div className="history-row__title">
                      {a.table_name} · {a.date_from} → {a.date_to}
                    </div>
                    <div className="history-row__meta">
                      {(a.estimated_records || 0).toLocaleString()} records · {(a.created_at || '').slice(0, 10)}
                    </div>
                  </div>
                </div>
                <div className="history-row__actions">
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                  {a.status === 'completed' && (
                    <button className="btn btn-primary btn-sm" onClick={() => nav('results', { id: a.sys_id })}>View</button>
                  )}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={async () => {
                      if (window.confirm('Delete this analysis?')) {
                        await AnalysisService.delete(a.sys_id)
                        load()
                      }
                    }}
                  >Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
