import { NavFn } from '../app'
import './Sidebar.css'

type IconProps = { size?: number }
const I = {
  Logo: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
      <line x1="19.5" y1="19.5" x2="22" y2="22"/>
    </svg>
  ),
  Table: ({ size = 16 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0H5a2 2 0 0 1-2-2V9m6 12h10a2 2 0 0 0 2-2V9M3 9h18"/>
    </svg>
  ),
  Fields: ({ size = 16 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
  ),
  Calendar: ({ size = 16 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Shuffle: ({ size = 16 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
      <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>
    </svg>
  ),
  Microscope: ({ size = 16 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1"/>
      <path d="M9 14h2M9 12a2 2 0 0 1-2-2V6h4v4a2 2 0 0 1-2 2ZM12 6h0v0a2 2 0 1 0-4 0v0"/>
    </svg>
  ),
  Clock: ({ size = 16 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
}

const NAV = [
  { view:'table',    label:'Select Table',  Icon: I.Table,      group:'wizard' },
  { view:'fields',   label:'Select Fields', Icon: I.Fields,     group:'wizard' },
  { view:'dates',    label:'Date Range',    Icon: I.Calendar,   group:'wizard' },
  { view:'sampling', label:'Sampling',      Icon: I.Shuffle,    group:'wizard' },
  { view:'preflight',label:'Preflight',     Icon: I.Microscope, group:'wizard' },
  { view:'history',  label:'Past Runs',     Icon: I.Clock,      group:'history' },
] as const

export default function Sidebar({ view, nav }: { view: string; nav: NavFn }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo"><I.Logo /></div>
        <div className="sidebar__brand-text">
          <div className="sidebar__name">ServiceNow</div>
          <div className="sidebar__sub">Data Analyzer</div>
          <a
            className="sidebar__by"
            href="https://reacademy.ai"
            target="_blank"
            rel="noopener noreferrer"
          >by reacademy.ai</a>
        </div>
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__group">Analysis</div>
        {NAV.filter(n => n.group === 'wizard').map(n => (
          <button
            key={n.view}
            className={`sidebar__item${view === n.view ? ' sidebar__item--active' : ''}`}
            onClick={() => nav(n.view)}
          >
            <n.Icon />
            <span>{n.label}</span>
          </button>
        ))}

        <div className="sidebar__group sidebar__group--spaced">History</div>
        {NAV.filter(n => n.group === 'history').map(n => (
          <button
            key={n.view}
            className={`sidebar__item${view === n.view ? ' sidebar__item--active' : ''}`}
            onClick={() => nav(n.view)}
          >
            <n.Icon />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__version">v1.0 · 1M Data Analyzer</div>
        <div className="sidebar__crafted">
          Crafted by <span className="sidebar__author">Tushar Mishra</span>
          {' · '}
          <a href="https://reacademy.ai" target="_blank" rel="noopener noreferrer">reacademy.ai</a>
        </div>
      </div>
    </aside>
  )
}
