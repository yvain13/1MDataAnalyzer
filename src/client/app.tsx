import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Stepper from './components/Stepper'
import SelectTablePage from './pages/SelectTablePage'
import SelectFieldsPage from './pages/SelectFieldsPage'
import DateRangePage from './pages/DateRangePage'
import SamplingPage from './pages/SamplingPage'
import PreflightPage from './pages/PreflightPage'
import RunStatusPage from './pages/RunStatusPage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'

export interface WizardState {
  table: string; fields: string[]; categoryField: string; subcategoryField: string
  dateFrom: string; dateTo: string; strategy: string; keywords: string
  encodedQuery: string; customInstructions: string; sampleSize: number
}

const INIT: WizardState = {
  table:'', fields:[], categoryField:'', subcategoryField:'',
  dateFrom:'', dateTo:'', strategy:'temporal', keywords:'',
  encodedQuery:'', customInstructions:'', sampleSize:1000,
}

const STEPS = ['Table','Fields','Dates','Sampling','Preflight','Running']
const STEP_VIEWS = ['table','fields','dates','sampling','preflight','status']

export type NavFn = (view: string, extra?: Record<string,string>) => void

export default function App() {
  const [state, setState] = useState<WizardState>(INIT)
  const params  = new URLSearchParams(window.location.search)
  const view    = params.get('view') || 'table'
  const id      = params.get('id') || ''
  const update  = (patch: Partial<WizardState>) => setState(s => ({ ...s, ...patch }))
  const nav: NavFn = (v, extra) => {
    const p = new URLSearchParams({ view: v, ...(extra ?? {}) })
    window.history.pushState({}, '', '?' + p.toString())
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  const stepIdx = STEP_VIEWS.indexOf(view)

  return (
    <div className="app-shell">
      <Sidebar view={view} nav={nav} />
      <main className="main-content">
        {view === 'history' ? (
          <HistoryPage nav={nav} />
        ) : (
          <div className="page-body page-body--wide">
            {stepIdx >= 0 && <Stepper steps={STEPS} current={stepIdx} />}
            {view === 'table'    && <SelectTablePage  state={state} update={update} nav={nav} />}
            {view === 'fields'   && <SelectFieldsPage state={state} update={update} nav={nav} />}
            {view === 'dates'    && <DateRangePage    state={state} update={update} nav={nav} />}
            {view === 'sampling' && <SamplingPage     state={state} update={update} nav={nav} />}
            {view === 'preflight'&& <PreflightPage    state={state} update={update} nav={nav} />}
            {view === 'status'   && <RunStatusPage    id={id}       nav={nav} />}
            {view === 'results'  && <ResultsPage      id={id}       nav={nav} />}
          </div>
        )}
      </main>
    </div>
  )
}
