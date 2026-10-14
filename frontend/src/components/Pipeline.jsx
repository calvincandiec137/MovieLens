import React from 'react'

export default function Pipeline() {
  const steps = [
    {
      num: '01',
      title: 'MovieLens CSV',
      color: 'var(--yellow)',
      desc: 'Raw ratings (646MB), movies (3MB) and tags (38MB) stored locally.'
    },
    {
      num: '02',
      title: 'HDFS Storage',
      color: 'var(--blue)',
      textColor: '#ffffff',
      desc: 'Distributed ingestion into HDFS directories under /movielens/.'
    },
    {
      num: '03',
      title: 'Hive Queries',
      color: 'var(--green)',
      desc: 'Schema-on-read external tables and analytical aggregation queries.'
    },
    {
      num: '04',
      title: 'CSV Export',
      color: 'var(--orange)',
      desc: 'Aggregated analytical outputs exported via Beeline to CSV.'
    },
    {
      num: '05',
      title: 'React Dashboard',
      color: 'var(--pink)',
      desc: 'Interactive runtime visualization of analytical metrics.'
    }
  ]

  return (
    <section id="pipeline">
      <div className="container">
        <h2 style={{ fontSize: '2.2rem', marginBottom: '35px' }}>Architecture Pipeline</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="neo-box"
              style={{
                padding: '24px 18px',
                background: step.color,
                color: step.textColor || 'var(--black)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{
                  fontFamily: 'Space Grotesk',
                  fontWeight: 900,
                  fontSize: '2rem',
                  opacity: 0.7,
                  marginBottom: '10px'
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
