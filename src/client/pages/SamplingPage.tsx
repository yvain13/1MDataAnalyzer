import { WizardState, NavFn } from '../app'

const STRATEGIES = [
  { value:'temporal', label:'Temporal',  desc:'Evenly distributed across the date range' },
  { value:'category', label:'Category',  desc:'Stratified by a category field' },
  { value:'cluster',  label:'Cluster',   desc:'Sampled across category + subcategory combinations' },
  { value:'keyword',  label:'Keyword',   desc:'Filter records matching specific keywords' },
]

export default function SamplingPage({ state, update, nav }: { state: WizardState; update: (p: Partial<WizardState>) => void; nav: NavFn }) {
  return (
    <div>
      <div className="page-title">Sampling Strategy</div>
      <div className="card" style={{ marginBottom:'1rem' }}>
        {STRATEGIES.map(s => (
          <label key={s.value} style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', cursor:'pointer', marginBottom:'0.75rem' }}>
            <input type="radio" name="strategy" value={s.value} checked={state.strategy===s.value} onChange={() => update({ strategy: s.value })} style={{ marginTop:'0.2rem' }} />
            <div><div style={{ fontWeight:600, fontSize:'0.875rem' }}>{s.label}</div><div style={{ fontSize:'0.8rem', color:'var(--snx-text-muted)' }}>{s.desc}</div></div>
          </label>
        ))}
      </div>

      {(state.strategy==='category'||state.strategy==='cluster') && (
        <div className="card" style={{ marginBottom:'1rem' }}>
          <div className="form-group">
            <label className="form-label">Category Field</label>
            <input className="form-input" placeholder="e.g. category" value={state.categoryField} onChange={e => update({ categoryField: e.target.value })} />
          </div>
          {state.strategy==='cluster' && (
            <div className="form-group">
              <label className="form-label">Subcategory Field</label>
              <input className="form-input" placeholder="e.g. subcategory" value={state.subcategoryField} onChange={e => update({ subcategoryField: e.target.value })} />
            </div>
          )}
        </div>
      )}

      {state.strategy==='keyword' && (
        <div className="card" style={{ marginBottom:'1rem' }}>
          <div className="form-group">
            <label className="form-label">Keywords (comma separated)</label>
            <input className="form-input" placeholder="e.g. login, password, VPN" value={state.keywords} onChange={e => update({ keywords: e.target.value })} />
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom:'1rem' }}>
        <div className="form-group">
          <label className="form-label">Sample Size (100–2000)</label>
          <input className="form-input" type="number" min={100} max={2000} value={state.sampleSize} onChange={e => update({ sampleSize: parseInt(e.target.value,10)||1000 })} />
        </div>
        <div className="form-group">
          <label className="form-label">Custom Encoded Query (optional)</label>
          <input className="form-input" placeholder="e.g. active=true^priority=1" value={state.encodedQuery} onChange={e => update({ encodedQuery: e.target.value })} />
        </div>
      </div>

      <div className="page-actions">
        <button className="btn btn-secondary" onClick={() => nav('dates')}>Back</button>
        <button className="btn btn-primary" onClick={() => nav('preflight')}>Next — Preflight</button>
      </div>
    </div>
  )
}
