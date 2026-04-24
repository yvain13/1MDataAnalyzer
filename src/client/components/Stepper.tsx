import { Fragment } from 'react'
import './Stepper.css'

export default function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="stepper">
      {steps.map((label, i) => {
        const cls = i < current ? 'done' : i === current ? 'active' : 'idle'
        return (
          <Fragment key={i}>
            <div className={`stepper__step stepper__step--${cls}`}>
              <div className="stepper__circle">
                {i < current
                  ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  : <span>{i+1}</span>}
              </div>
              <span className="stepper__label">{label}</span>
            </div>
            {i < steps.length-1 && <div className={`stepper__line${i<current?' stepper__line--done':''}`}/>}
          </Fragment>
        )
      })}
    </div>
  )
}
