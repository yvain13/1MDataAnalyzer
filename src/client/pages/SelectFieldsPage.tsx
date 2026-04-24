import { useEffect, useState } from 'react'
import { AnalysisService } from '../services/AnalysisService'
import { WizardState, NavFn } from '../app'

export default function SelectFieldsPage({ state, update, nav }: { state: WizardState; update: (p: Partial<WizardState>) => void; nav: NavFn }) {
  const [grouped, setGrouped] = useState<Record<string,any[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!state.table) { nav('table'); return }
    AnalysisService.getFields(state.table)
      .then(r => setGrouped(r?.grouped || {}))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [state.table])

  const toggle = (name: string) => {
    update({ fields: state.fields.includes(name) ? state.fields.filter(f=>f!==name) : [...state.fields, name] })
  }

  if (loading) return <div style={{ padding:'2rem', color:'var(--snx-text-muted)' }}>Loading fields...</div>
  if (error)   return <div className="error-banner">{error}</div>

  return (
    <div>
      <div className="page-title">Select Text Fields to Analyze</div>
      <p style={{ marginBottom:'1rem', color:'var(--snx-text-muted)', fontSize:'0.875rem' }}>
        Choose fields whose text the AI will read. String fields are recommended.
      </p>
      {Object.entries(grouped).map(([group, fields]) => (
        <div key={group} className="card" style={{ marginBottom:'1rem' }}>
          <div style={{ fontWeight:600, marginBottom:'0.75rem', textTransform:'capitalize' }}>{group} fields</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'0.5rem' }}>
            {(fields as any[]).map((f:any) => (
              <label key={f.name} style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontSize:'0.875rem' }}>
                <input type="checkbox" checked={state.fields.includes(f.name)} onChange={() => toggle(f.name)} />
                <span>{f.label} <span style={{ color:'var(--snx-text-muted)', fontSize:'0.75rem' }}>({f.name})</span></span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="page-actions">
        <button className="btn btn-secondary" onClick={() => nav('table')}>Back</button>
        <button className="btn btn-primary" disabled={state.fields.length===0} onClick={() => nav('dates')}>Next — Date Range</button>
      </div>
    </div>
  )
}
