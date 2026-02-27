import React from 'react';

const Trends = ({ trendsData }) => (
  <section className="trends-section">
    <div className="trends-content">
      {trendsData.length === 0 ? (
        <p>No trends data available.</p>
      ) : (
        <ul className="trends-list">
          {trendsData.map((trend, idx) => (
            <li key={idx}>
              <strong>{trend.label}:</strong> {trend.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  </section>
);

export default Trends;
