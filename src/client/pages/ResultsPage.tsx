import { useEffect, useState } from 'react'
import { AnalysisService, AnalysisResult } from '../services/AnalysisService'
import { NavFn } from '../app'

export default function ResultsPage({ id, nav }: { id: string; nav: NavFn }) {
  const [data, setData]   = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) { nav('history'); return }
    AnalysisService.getResults(id).then(setData).catch(e => setError(e.message))
  }, [id])

  if (error) return <div className="error-banner">{error}</div>
  if (!data) return <div style={{ padding:'2rem', color:'var(--snx-text-muted)' }}>Loading results...</div>

  const { analysis, llm_report, category_breakdown, temporal_trend } = data

  function printReport() {
    const win = window.open('', '_blank')!
    win.document.write(`<html><head><title>Analysis Report — ${analysis.table_name}</title><style>body{font-family:system-ui;padding:2rem;max-width:900px;margin:auto;color:#101b1e}h2{margin-top:1.5rem;font-size:1.1rem;border-bottom:1px solid #cfd5d7;padding-bottom:.4rem}ul,ol{padding-left:1.4rem}li{margin-bottom:.3rem}@media print{body{padding:0}}</style></head><body>${llm_report}</body></html>`)
    win.document.close(); win.print()
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div className="page-title" style={{ margin:0 }}>Results — {analysis.table_name}</div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => nav('history')}>View History</button>
          <button className="btn btn-primary" onClick={printReport}>Download PDF</button>
        </div>
      </div>
      <div style={{ fontSize:'0.8rem', color:'var(--snx-text-muted)', marginBottom:'1rem' }}>
        {analysis.date_from} → {analysis.date_to} · {(analysis.estimated_records||0).toLocaleString()} records · {(analysis.processed_records||0).toLocaleString()} sampled
      </div>
      <div className="card" style={{ marginBottom:'1rem' }}>
        <div dangerouslySetInnerHTML={{ __html: llm_report }} style={{ fontSize:'0.9rem', lineHeight:1.6 }}/>
      </div>
      {category_breakdown.length > 0 && (
        <div className="card" style={{ marginBottom:'1rem' }}>
          <div style={{ fontWeight:600, marginBottom:'0.75rem' }}>Category Breakdown</div>
          {category_breakdown.slice(0,10).map((c,i) => (
            <div key={i} style={{ marginBottom:'0.5rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:'0.2rem' }}>
                <span>{c.display}</span><span>{c.count.toLocaleString()} ({c.pct}%)</span>
              </div>
              <div className="progress-bar" style={{ height:'0.35rem' }}>
                <div className="progress-bar__fill" style={{ width:`${c.pct}%` }}/>
              </div>
            </div>
          ))}
        </div>
      )}
      {temporal_trend.length > 0 && (
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:'0.75rem' }}>Volume Over Time</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:'0.4rem', height:'80px' }}>
            {temporal_trend.map((t,i) => {
              const max = Math.max(...temporal_trend.map(x=>x.count))
              return <div key={i} title={`${t.period}: ${t.count}`}
                style={{ flex:1, background:'var(--snx-primary)', height:`${max?(t.count/max)*100:0}%`, borderRadius:'2px 2px 0 0', minHeight:4 }}/>
            })}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.65rem', color:'var(--snx-text-muted)', marginTop:'0.25rem' }}>
            <span>{temporal_trend[0]?.period}</span>
            <span>{temporal_trend[temporal_trend.length-1]?.period}</span>
          </div>
        </div>
      )}
    </div>
  )
}
