import React from 'react'
import './Navbar.css'

export default function Navbar({ dataSource = 'BUNDLED' }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const isLocal = dataSource === 'LOCAL'

  return (
    <nav className="sticky-nav">
      <div className="nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="nav-brand" onClick={() => scrollTo('hero')}>
            BDA // MOVIELENS
          </div>
          <span
            className="neo-tag"
            style={{
              background: isLocal ? 'var(--green)' : 'var(--orange)',
              fontSize: '0.7rem',
              padding: '2px 8px'
            }}
            title={isLocal ? 'Serving fresh data from local server (http://localhost:4000)' : 'Serving bundled data from /data fallback'}
          >
            SOURCE: {dataSource}
          </span>
        </div>
        <div className="nav-links">
          <button onClick={() => scrollTo('pipeline')}>PIPELINE</button>
          <button onClick={() => scrollTo('dataset')}>DATASET</button>
          <button onClick={() => scrollTo('analytics')}>ANALYTICS</button>
          <button onClick={() => scrollTo('mapreduce')}>MAPREDUCE</button>
          <button onClick={() => scrollTo('logs')}>LOGS</button>
          <button onClick={() => scrollTo('links')}>UIs</button>
        </div>
      </div>
    </nav>
  )
}
