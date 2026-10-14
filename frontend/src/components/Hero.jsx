import React from 'react'

export default function Hero() {
  return (
    <section id="hero" style={{ background: 'var(--bg-main)', paddingTop: '80px', paddingBottom: '70px' }}>
      <div className="container">
        <div style={{
          display: 'inline-block',
          background: 'var(--pink)',
          transform: 'rotate(-2deg)',
          padding: '6px 14px',
          fontWeight: 700,
          border: 'var(--border-width) solid var(--black)',
          boxShadow: '3px 3px 0px var(--black)',
          marginBottom: '20px'
        }}>
          FINAL YEAR B.TECH CSE // BDA LAB PROJECT
        </div>

        <h1 style={{ fontSize: '3.4rem', lineHeight: '1.05', marginBottom: '20px' }}>
          MovieLens Analytics on Hadoop
        </h1>

        <p style={{ fontSize: '1.2rem', maxWidth: '780px', lineHeight: '1.5', marginBottom: '30px' }}>
          Distributed batch data processing, analytical query execution, and theme mining over 25 million movie ratings using HDFS, Apache Hive, and MapReduce.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <span className="neo-tag" style={{ background: 'var(--yellow)', transform: 'rotate(1deg)' }}>HDFS 3.3.6</span>
          <span className="neo-tag" style={{ background: 'var(--blue)', color: '#fff', transform: 'rotate(-1deg)' }}>APACHE HIVE 4.0</span>
          <span className="neo-tag" style={{ background: 'var(--green)', transform: 'rotate(2deg)' }}>MAPREDUCE</span>
          <span className="neo-tag" style={{ background: 'var(--orange)', transform: 'rotate(-1deg)' }}>YARN</span>
          <span className="neo-tag" style={{ background: '#ffffff', transform: 'rotate(1deg)' }}>DOCKER</span>
        </div>
      </div>
    </section>
  )
}
