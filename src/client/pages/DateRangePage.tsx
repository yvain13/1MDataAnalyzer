import { WizardState, NavFn } from '../app'

const PRESETS = [
  { label:'Last 7 days',   days:7   },
  { label:'Last 30 days',  days:30  },
  { label:'Last 90 days',  days:90  },
  { label:'Last 6 months', days:180 },
  { label:'Last year',     days:365 },
]

const toISO = (d: Date) => d.toISOString().slice(0,10)

export default function DateRangePage({ state, update, nav }: { state: WizardState; update: (p: Partial<WizardState>) => void; nav: NavFn }) {
  const applyPreset = (days: number) => {
    const to = new Date(); const from = new Date(to.getTime() - days*86400000)
    update({ dateFrom: toISO(from), dateTo: toISO(to) })
  }
  return (
    <div>
      <div className="page-title">Select Date Range</div>
      <div className="card">
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
          {PRESETS.map(p => <button key={p.days} className="btn btn-secondary" style={{ fontSize:'0.8rem' }} onClick={() => applyPreset(p.days)}>{p.label}</button>)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <div className="form-group">
            <label className="form-label">From</label>
            <input className="form-input" type="date" value={state.dateFrom} onChange={e => update({ dateFrom: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">To</label>
            <input className="form-input" type="date" value={state.dateTo} onChange={e => update({ dateTo: e.target.value })} />
          </div>
        </div>
      </div>
      <div className="page-actions">
        <button className="btn btn-secondary" onClick={() => nav('fields')}>Back</button>
        <button className="btn btn-primary" disabled={!state.dateFrom||!state.dateTo} onClick={() => nav('sampling')}>Next — Sampling</button>
      </div>
    </div>
  )
}
