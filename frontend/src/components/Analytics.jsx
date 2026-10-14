import React, { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

function AnalyticsCard({ title, insight, data, renderChart, color = 'var(--yellow)' }) {
  const [showTable, setShowTable] = useState(false)

  if (!data || data.length === 0) {
    return (
      <div className="neo-box" style={{ padding: '24px', background: '#fff' }}>
        <h3>{title}</h3>
        <p style={{ marginTop: '10px', color: 'red' }}>No data found. Ensure sync-data.ps1 has been run.</p>
      </div>
    )
  }

  const columns = Object.keys(data[0] || {})

  return (
    <div className="neo-box" style={{ background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '16px 20px',
        background: color,
        borderBottom: 'var(--border-width) solid var(--black)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ fontSize: '1.25rem' }}>{title}</h3>
        <button
          className="neo-btn"
          style={{ padding: '5px 12px', fontSize: '0.75rem', background: '#ffffff' }}
          onClick={() => setShowTable(!showTable)}
        >
          {showTable ? 'SHOW CHART' : 'SHOW TABLE'}
        </button>
      </div>

      <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: '0.95rem', marginBottom: '20px', fontWeight: 600 }}>
          {insight}
        </p>

        {showTable ? (
          <div style={{ overflowX: 'auto', maxHeight: '320px', border: 'var(--border-width) solid var(--black)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--yellow)', borderBottom: '2px solid #000' }}>
                  {columns.map(c => (
                    <th key={c} style={{ padding: '8px 12px', textTransform: 'uppercase' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 15).map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #ccc', background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                    {columns.map(c => (
                      <td key={c} style={{ padding: '8px 12px' }}>{row[c]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ height: '300px', width: '100%', border: 'var(--border-width) solid var(--black)', background: '#fff', padding: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart(data)}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Analytics({
  ratingDist,
  mostRated,
  highestRated,
  ratingsYear,
  genreDist,
  activeUsers
}) {
  return (
    <section id="analytics">
      <div className="container">
        <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>Hive Analytics</h2>
        <p style={{ marginBottom: '35px', fontSize: '1.05rem' }}>
          Interactive visualization of analytical workloads queried across 25M movie ratings:
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '30px'
        }}>
          <AnalyticsCard
            title="Rating Distribution"
            insight="Ratings 4.0 and 3.0 are the most frequent across users, followed by 5.0."
            data={ratingDist}
            color="var(--blue)"
            renderChart={(data) => (
              <BarChart data={data}>
                <XAxis dataKey="rating" stroke="#000" />
                <YAxis stroke="#000" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip />
                <Bar dataKey="rating_count" fill="#4D96FF" stroke="#000" strokeWidth={2} />
              </BarChart>
            )}
          />

          <AnalyticsCard
            title="Most Rated Movies"
            insight="Classic 90s cinema (Forrest Gump, Shawshank Redemption) leads in total review volume."
            data={mostRated}
            color="var(--green)"
            renderChart={(data) => (
              <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" stroke="#000" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="title" type="category" stroke="#000" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="total_reviews" fill="#6BCB77" stroke="#000" strokeWidth={2} />
              </BarChart>
            )}
          />

          <AnalyticsCard
            title="Highest Rated (1000+ reviews)"
            insight="Documentaries and prestige dramas maintain the highest average rating score."
            data={highestRated}
            color="var(--yellow)"
            renderChart={(data) => (
              <BarChart data={data} margin={{ bottom: 40 }}>
                <XAxis dataKey="title" stroke="#000" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis domain={[3.5, 5]} stroke="#000" />
                <Tooltip />
                <Bar dataKey="avg_rating" fill="#FFD93D" stroke="#000" strokeWidth={2} />
              </BarChart>
            )}
          />

          <AnalyticsCard
            title="Ratings Per Year"
            insight="Rating activity peaked between 2000 and 2016, aligning with digital platform growth."
            data={ratingsYear}
            color="var(--pink)"
            renderChart={(data) => (
              <LineChart data={data}>
                <XAxis dataKey="rating_year" stroke="#000" />
                <YAxis stroke="#000" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip />
                <Line type="linear" dataKey="ratings_count" stroke="#FF6B9D" strokeWidth={3} dot={{ stroke: '#000', strokeWidth: 2, r: 4 }} />
              </LineChart>
            )}
          />

          <AnalyticsCard
            title="Genre Distribution"
            insight="Drama and Comedy represent the vast majority of catalogued movies."
            data={genreDist}
            color="var(--orange)"
            renderChart={(data) => (
              <BarChart data={data} margin={{ bottom: 30 }}>
                <XAxis dataKey="genre" stroke="#000" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis stroke="#000" />
                <Tooltip />
                <Bar dataKey="movie_count" fill="#FF9F45" stroke="#000" strokeWidth={2} />
              </BarChart>
            )}
          />

          <AnalyticsCard
            title="Top Active Users"
            insight="Super-users contribute tens of thousands of individual ratings each."
            data={activeUsers}
            color="var(--yellow)"
            renderChart={(data) => (
              <BarChart data={data}>
                <XAxis dataKey="userid" stroke="#000" />
                <YAxis stroke="#000" />
                <Tooltip />
                <Bar dataKey="ratings_given" fill="#FFD93D" stroke="#000" strokeWidth={2} />
              </BarChart>
            )}
          />
        </div>
      </div>
    </section>
  )
}
