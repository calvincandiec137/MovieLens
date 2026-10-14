import React from 'react'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--yellow)',
      borderTop: 'var(--border-width) solid var(--black)',
      padding: '40px 0',
      marginTop: '20px'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          
        </div>

        <div style={{
          background: '#fff',
          padding: '8px 14px',
          border: 'var(--border-width) solid var(--black)',
          boxShadow: '3px 3px 0px var(--black)',
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          HADOOP + HIVE + MAPREDUCE
        </div>
      </div>
    </footer>
  )
}
