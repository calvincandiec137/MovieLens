import React, { useState } from 'react'

export default function MapReduce({ mapReduceData }) {
  if (!mapReduceData || mapReduceData.length === 0) {
    return null
  }

  const [searchTerm, setSearchTerm] = useState('')

  const filtered = mapReduceData
    .filter(item => item.word && item.word.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 50)

  return (
    <section id="mapreduce">
      <div className="container">
        <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>MapReduce Word Count</h2>
        <p style={{ marginBottom: '25px', fontSize: '1.05rem' }}>
          Word frequency aggregations executed directly via MapReduce job on user movie tags:
        </p>

        <div className="neo-box" style={{ background: '#ffffff', padding: '24px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Filter tag word..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 14px',
                border: 'var(--border-width) solid var(--black)',
                boxShadow: '2px 2px 0px var(--black)',
                fontFamily: 'Space Mono',
                outline: 'none',
                flexGrow: 1,
                maxWidth: '300px'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            maxHeight: '350px',
            overflowY: 'auto',
            padding: '10px',
            border: 'var(--border-width) solid var(--black)',
            background: 'var(--bg-main)'
          }}>
            {filtered.map((item, idx) => (
              <div
                key={idx}
                className="neo-tag"
                style={{
                  background: idx % 3 === 0 ? 'var(--yellow)' : idx % 3 === 1 ? 'var(--green)' : 'var(--pink)',
                  fontSize: '0.85rem'
                }}
              >
                {item.word}: <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
