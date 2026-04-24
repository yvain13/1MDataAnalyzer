import { useEffect, useState } from 'react'
import { AnalysisService } from '../services/AnalysisService'
import { WizardState, NavFn } from '../app'

export default function PreflightPage({ state, update, nav }: { state: WizardState; update: (p: Partial<WizardState>) => void; nav: NavFn }) {
  const [result, setResult]       = useState<{ totalCount: number; sampleRecords: any[] } | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [launching, setLaunching] = useState(false)

  useEffect(() => {
    AnalysisService.preflight({
      table_name: state.table, date_from: state.dateFrom, date_to: state.dateTo,
      selected_fields: state.fields, encoded_query: state.encodedQuery,
    })
      .then(setResult).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  async function launch() {
    setLaunching(true)
    try {
      const analysis = await AnalysisService.create({
        table_name: state.table, date_from: state.dateFrom, date_to: state.dateTo,
        selected_fields: state.fields, sampling_strategy: state.strategy,
        category_field: state.categoryField, subcategory_field: state.subcategoryField,
        encoded_query: state.encodedQuery, custom_instructions: state.customInstructions,
        sample_size: state.sampleSize, sampling_keywords: state.keywords,
      })
      nav('status', { id: analysis.sys_id })
    } catch(e: any) { setError(e.message); setLaunching(false) }
  }

  if (loading) return <div style={{ padding:'2rem', color:'var(--snx-text-muted)' }}>Running preflight check...</div>
  if (error)   return (
    <div>
      <div className="error-banner">{error}</div>
      <div className="page-actions"><button className="btn btn-secondary" onClick={() => nav('sampling')}>Back</button></div>
    </div>
  )

  return (
    <div>
      <div className="page-title">Preflight Check</div>
      <div className="card" style={{ marginBottom:'1rem' }}>
        <div style={{ display:'flex', gap:'2rem', marginBottom:'1.25rem' }}>
          <div><div style={{ fontSize:'2rem', fontWeight:700 }}>{result!.totalCount.toLocaleString()}</div><div style={{ fontSize:'0.8rem', color:'var(--snx-text-muted)' }}>Total records</div></div>
          <div><div style={{ fontSize:'2rem', fontWeight:700 }}>{state.sampleSize}</div><div style={{ fontSize:'0.8rem', color:'var(--snx-text-muted)' }}>Will sample</div></div>
          <div><div style={{ fontSize:'2rem', fontWeight:700 }}>{state.fields.length}</div><div style={{ fontSize:'0.8rem', color:'var(--snx-text-muted)' }}>Fields</div></div>
        </div>
        {result!.sampleRecords.map((r,i) => (
          <div key={i} style={{ padding:'0.5rem', background:'var(--snx-surface-alt)', borderRadius:4, marginBottom:'0.5rem', fontSize:'0.8rem' }}>
            <strong>{r.number}</strong> — {r.short_description}
          </div>
        ))}
      </div>
      <div className="card" style={{ marginBottom:'1rem' }}>
        <div className="form-group">
          <label className="form-label">Custom AI Instructions (optional)</label>
          <textarea className="form-input" rows={3} style={{ resize:'vertical' }}
            placeholder="e.g. Focus on network-related issues only..."
            value={state.customInstructions} onChange={e => update({ customInstructions: e.target.value })} />
        </div>
      </div>
      <div className="page-actions">
        <button className="btn btn-secondary" onClick={() => nav('sampling')}>Back</button>
        <button className="btn btn-primary" disabled={launching||result!.totalCount===0} onClick={launch}>
          {launching ? 'Launching...' : 'Run Analysis'}
        </button>
      </div>
    </div>
  )
}
