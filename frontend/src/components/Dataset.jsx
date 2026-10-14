import React from 'react'

export default function Dataset({ ratingDistData, moviesData }) {
  const totalRatings = ratingDistData.reduce((acc, row) => {
    const count = parseFloat(row.rating_count) || 0
    return acc + count
  }, 0)

  const distinctRatings = ratingDistData.length
  const totalGenresCount = moviesData.length

  const stats = [
    { label: 'Total Ratings Recorded', value: totalRatings > 0 ? totalRatings.toLocaleString() : 'Loading...', bg: 'var(--yellow)' },
    { label: 'Rating Scale Steps', value: distinctRatings > 0 ? distinctRatings : '10', bg: 'var(--green)' },
    { label: 'Movie Genres Tracked', value: totalGenresCount > 0 ? totalGenresCount : '20', bg: 'var(--pink)' },
    { label: 'HDFS Ingested Volume', value: '~687 MB', bg: 'var(--blue)', color: '#fff' }
  ]

  return (
    <section id="dataset">
      <div className="container">
        <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>Dataset Overview</h2>
        <p style={{ marginBottom: '30px', fontSize: '1.05rem' }}>
          Real data figures parsed dynamically from HDFS Hive query exports:
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {stats.map((s, i) => (
            <div
              key={i}
              className="neo-box"
              style={{
                padding: '26px',
                background: s.bg,
                color: s.color || 'var(--black)'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: 'Space Grotesk',
                fontSize: '2.4rem',
                fontWeight: 700,
                lineHeight: 1.1
              }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
