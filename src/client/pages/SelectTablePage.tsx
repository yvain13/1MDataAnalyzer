import { WizardState, NavFn } from '../app'

const TABLES = [
  { name:'incident',                  label:'Incidents',              description:'IT service incidents and outages' },
  { name:'change_request',            label:'Change Requests',        description:'Planned changes and releases' },
  { name:'sn_customerservice_case',   label:'Customer Service Cases', description:'External customer support cases' },
  { name:'sc_req_item',               label:'Service Requests',       description:'Service catalog requests' },
  { name:'problem',                   label:'Problems',               description:'Root cause investigations' },
  { name:'task',                      label:'Tasks',                  description:'General task records' },
]

export default function SelectTablePage({ state, update, nav }: { state: WizardState; update: (p: Partial<WizardState>) => void; nav: NavFn }) {
  return (
    <div>
      <div className="page-title">Select a Table to Analyze</div>
      <div className="table-grid">
        {TABLES.map(t => (
          <button key={t.name} className="table-card" onClick={() => { update({ table: t.name }); nav('fields') }}>
            <div className="card" style={{
              borderColor: state.table === t.name ? 'var(--snx-primary)' : '',
              borderWidth: state.table === t.name ? 2 : 1,
              cursor: 'pointer',
            }}>
              <div style={{ fontWeight:600, marginBottom:'0.25rem' }}>{t.label}</div>
              <div style={{ fontSize:'0.8rem', color:'var(--snx-text-muted)' }}>{t.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
