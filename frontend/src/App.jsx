import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Pipeline from './components/Pipeline'
import Dataset from './components/Dataset'
import Analytics from './components/Analytics'
import MapReduce from './components/MapReduce'
import LogsMonitor from './components/LogsMonitor'
import Links from './components/Links'
import Footer from './components/Footer'
import { parseCsv } from './utils/csvParser'

export default function App() {
  const [ratingDist, setRatingDist] = useState([])
  const [mostRated, setMostRated] = useState([])
  const [highestRated, setHighestRated] = useState([])
  const [ratingsYear, setRatingsYear] = useState([])
  const [genreDist, setGenreDist] = useState([])
  const [activeUsers, setActiveUsers] = useState([])
  const [mapReduceData, setMapReduceData] = useState([])
  const [clusterInfo, setClusterInfo] = useState(null)
  const [missingFiles, setMissingFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const files = [
        { name: 'rating_distribution.csv', setter: setRatingDist, numericFields: ['rating', 'rating_count'] },
        { name: 'most_rated_movies.csv', setter: setMostRated, numericFields: ['total_reviews'] },
        { name: 'highest_rated_movies.csv', setter: setHighestRated, numericFields: ['review_count', 'avg_rating'] },
        { name: 'ratings_per_year.csv', setter: setRatingsYear, numericFields: ['ratings_count'] },
        { name: 'genre_distribution.csv', setter: setGenreDist, numericFields: ['movie_count'] },
        { name: 'most_active_users.csv', setter: setActiveUsers, numericFields: ['ratings_given'] }
      ]

      const missing = []

      for (const item of files) {
        try {
          const res = await fetch(`/data/${item.name}`)
          if (!res.ok) {
            missing.push(item.name)
            continue
          }
          const text = await res.text()
          const rows = parseCsv(text)
          const formatted = rows.map(r => {
            const rowCopy = { ...r }
            if (item.numericFields) {
              item.numericFields.forEach(f => {
                if (rowCopy[f] !== undefined) {
                  rowCopy[f] = parseFloat(rowCopy[f]) || 0
                }
              })
            }
            return rowCopy
          })
          item.setter(formatted)
        } catch {
          missing.push(item.name)
        }
      }

      try {
        const mrRes = await fetch('/data/tag_wordcount.csv')
        if (mrRes.ok) {
          const mrText = await mrRes.text()
          setMapReduceData(parseCsv(mrText))
        }
      } catch {
        // MapReduce CSV is optional
      }

      try {
        const logRes = await fetch('/data/cluster_logs.json')
        if (logRes.ok) {
          const logData = await logRes.json()
          setClusterInfo(logData)
        }
      } catch {
        // Cluster logs optional
      }

      setMissingFiles(missing)
      setLoading(false)
    }

    loadData()
  }, [])

  return (
    <div>
      <Navbar />

      {missingFiles.length > 0 && (
        <div className="container" style={{ marginTop: '20px' }}>
          <div className="neo-box" style={{ background: 'var(--pink)', padding: '20px', color: '#000' }}>
            <h3 style={{ marginBottom: '8px' }}>⚠️ Missing Data Files ({missingFiles.length})</h3>
            <p style={{ marginBottom: '12px' }}>
              The following files were not found in <code>frontend/public/data/</code>:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
              {missingFiles.map(f => <li key={f}>{f}</li>)}
            </ul>
            <p style={{ fontWeight: 700 }}>
              Please run <code>.\sync-data.ps1</code> in the root directory to copy your Hive exports.
            </p>
          </div>
        </div>
      )}

      <Hero />
      <Pipeline />
      <Dataset ratingDistData={ratingDist} moviesData={genreDist} />
      <Analytics
        ratingDist={ratingDist}
        mostRated={mostRated}
        highestRated={highestRated}
        ratingsYear={ratingsYear}
        genreDist={genreDist}
        activeUsers={activeUsers}
      />
      <MapReduce mapReduceData={mapReduceData} />
      <LogsMonitor clusterInfo={clusterInfo} />
      <Links />
      <Footer />
    </div>
  )
}
