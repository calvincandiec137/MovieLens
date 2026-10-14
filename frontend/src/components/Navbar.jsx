import React from 'react'
import './Navbar.css'

export default function Navbar() {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="sticky-nav">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => scrollTo('hero')}>
          BDA // MOVIELENS
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
