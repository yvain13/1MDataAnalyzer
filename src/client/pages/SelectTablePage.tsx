import { useState } from 'react'
import { WizardState, NavFn } from '../app'

const TABLES = [
  { name:'incident',                  label:'Incidents',              description:'IT service incidents and outages' },
  { name:'change_request',            label:'Change Requests',        description:'Planned changes and releases' },
  { name:'sn_customerservice_case',   label:'Customer Service Cases', description:'External customer support cases' },
  { name:'sc_req_item',               label:'Service Requests',       description:'Service catalog requests' },
  { name:'problem',                   label:'Problems',               description:'Root cause investigations' },
  { name:'task',                      label:'Tasks',                  description:'General task records' },
]

const PRESET_NAMES = TABLES.map(t => t.name)

export default function SelectTablePage({ state, update, nav }: { state: WizardState; update: (p: Partial<WizardState>) => void; nav: NavFn }) {
  const isCustom = state.table !== '' && !PRESET_NAMES.includes(state.table)
  const [showCustom, setShowCustom] = useState(isCustom)
  const [customName, setCustomName] = useState(isCustom ? state.table : '')

  function submitCustom() {
    const name = customName.trim()
    if (!name) return
    update({ table: name })
    nav('fields')
  }

  return (
    <div>
      <div className="page-title">Select a Table to Analyze</div>
      <div className="table-grid">
        {TABLES.map(t => (
          <button key={t.name} className="table-card" onClick={() => { setShowCustom(false); update({ table: t.name }); nav('fields') }}>
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
        <button className="table-card" onClick={() => setShowCustom(true)}>
          <div className="card" style={{
            borderColor: isCustom ? 'var(--snx-primary)' : '',
            borderWidth: isCustom ? 2 : 1,
            borderStyle: 'dashed',
            cursor: 'pointer',
          }}>
            <div style={{ fontWeight:600, marginBottom:'0.25rem' }}>Custom Table…</div>
            <div style={{ fontSize:'0.8rem', color:'var(--snx-text-muted)' }}>Enter any ServiceNow table name</div>
          </div>
        </button>
      </div>

      {showCustom && (
        <div className="card" style={{ marginTop:'1rem', maxWidth:480 }}>
          <div className="form-group">
            <label className="form-label">Table name</label>
            <input
              className="form-input"
              autoFocus
              placeholder="e.g. cmdb_ci, kb_knowledge, u_my_custom_table"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitCustom() }}
            />
            <div style={{ fontSize:'0.75rem', color:'var(--snx-text-muted)', marginTop:'0.35rem' }}>
              Enter the technical name of any table you have read access to.
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.5rem', justifyContent:'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowCustom(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={!customName.trim()} onClick={submitCustom}>Use this table</button>
          </div>
        </div>
      )}
    </div>
  )
}
