import React from 'react'

export default function Links() {
  return (
    <section id="links">
      <div className="container">
        <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>Cluster Monitoring UIs</h2>
        <p style={{ marginBottom: '30px', fontSize: '1.05rem' }}>
          Direct links to native Hadoop web dashboards running on localhost:
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          <div className="neo-box" style={{ padding: '26px', background: 'var(--blue)', color: '#fff' }}>
            <div style={{ display: 'inline-block', background: '#000', color: '#fff', padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '10px' }}>
              LOCAL ONLY
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>HDFS NameNode UI</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.4 }}>
              Inspect live DataNodes, HDFS storage capacity, block allocations, and health logs.
            </p>
            <a
              href="http://localhost:9870"
              target="_blank"
              rel="noreferrer"
              className="neo-btn"
              style={{ background: '#ffffff', color: '#000' }}
            >
              OPEN HDFS (PORT 9870) ↗
            </a>
          </div>

          <div className="neo-box" style={{ padding: '26px', background: 'var(--orange)' }}>
            <div style={{ display: 'inline-block', background: '#000', color: '#fff', padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '10px' }}>
              LOCAL ONLY
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>YARN ResourceManager</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.4 }}>
              Track MapReduce execution progress, allocated memory, vcores, and active NodeManagers.
            </p>
            <a
              href="http://localhost:8088"
              target="_blank"
              rel="noreferrer"
              className="neo-btn"
              style={{ background: '#ffffff', color: '#000' }}
            >
              OPEN YARN (PORT 8088) ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
