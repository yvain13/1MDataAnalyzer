import { useState, useEffect, StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import './app.css'

function Root() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const h = () => setTick(t => t + 1)
    window.addEventListener('popstate', h)
    return () => window.removeEventListener('popstate', h)
  }, [])
  return <App />
}

const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <Root />
    </StrictMode>,
  )
}
