import React, { useState } from 'react'

export default function LogsMonitor({ clusterInfo }) {
  const [activeTab, setActiveTab] = useState('hiveserver2')

  if (!clusterInfo) {
    return (
      <section id="logs">
        <div className="container">
          <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>Cluster Health & Live Logs</h2>
          <div className="neo-box" style={{ padding: '24px', background: '#fff' }}>
            <p>No cluster log snapshot found. Run <code>.\sync-data.ps1</code> to refresh.</p>
          </div>
        </div>
      </section>
    )
  }

  const { timestamp, containers = [], logs = {} } = clusterInfo

  return (
    <section id="logs" style={{ background: 'var(--bg-main)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '6px' }}>Cluster Health & Logs</h2>
            <p style={{ fontSize: '1rem' }}>Real-time status of all 5 Docker containers and services:</p>
          </div>
          <div className="neo-tag" style={{ background: 'var(--yellow)', fontSize: '0.85rem' }}>
            LAST SYNC: {timestamp}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          {containers.map((c, i) => {
            const isRunning = c.status && c.status.toLowerCase().includes('running')
            return (
              <div
                key={i}
                className="neo-box"
                style={{
                  padding: '16px',
                  background: isRunning ? 'var(--green)' : 'var(--pink)',
                  color: 'var(--black)'
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>
                  {c.role || 'Service'}
                </div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', fontWeight: 700, margin: '6px 0' }}>
                  {c.name}
                </div>
                <div style={{
                  display: 'inline-block',
                  background: '#ffffff',
                  padding: '3px 8px',
                  border: '2px solid #000',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {c.status || 'unknown'}
                </div>
              </div>
            )
          })}
        </div>

        <div className="neo-box" style={{ background: '#ffffff' }}>
          <div style={{
            display: 'flex',
            borderBottom: 'var(--border-width) solid var(--black)',
            background: 'var(--yellow)',
            overflowX: 'auto'
          }}>
            <button
              onClick={() => setActiveTab('hiveserver2')}
              style={{
                padding: '12px 20px',
                fontFamily: 'Space Grotesk',
                fontWeight: 700,
                border: 'none',
                borderRight: 'var(--border-width) solid var(--black)',
                background: activeTab === 'hiveserver2' ? '#ffffff' : 'transparent',
                cursor: 'pointer'
              }}
            >
              HIVESERVER2 LOGS
            </button>
            <button
              onClick={() => setActiveTab('namenode')}
              style={{
                padding: '12px 20px',
                fontFamily: 'Space Grotesk',
                fontWeight: 700,
                border: 'none',
                borderRight: 'var(--border-width) solid var(--black)',
                background: activeTab === 'namenode' ? '#ffffff' : 'transparent',
                cursor: 'pointer'
              }}
            >
              NAMENODE LOGS
            </button>
            <button
              onClick={() => setActiveTab('resourcemanager')}
              style={{
                padding: '12px 20px',
                fontFamily: 'Space Grotesk',
                fontWeight: 700,
                border: 'none',
                background: activeTab === 'resourcemanager' ? '#ffffff' : 'transparent',
                cursor: 'pointer'
              }}
            >
              YARN RESOURCEMANAGER LOGS
            </button>
          </div>

          <div style={{ padding: '20px' }}>
            <div style={{
              background: '#0f172a',
              color: '#38bdf8',
              padding: '16px',
              border: 'var(--border-width) solid var(--black)',
              fontFamily: 'Space Mono',
              fontSize: '0.8rem',
              maxHeight: '340px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.4'
            }}>
              {logs[activeTab] || 'No logs available for this service.'}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
