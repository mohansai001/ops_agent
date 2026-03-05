import React, { useEffect, useState } from 'react';
import axios from 'axios';


const Dashboard = () => {
  const [benchCount, setBenchCount] = useState(0);
  const [rrfCount, setRrfCount] = useState(0);
  const [showRrfTable, setShowRrfTable] = useState(false);
  const [showBenchTable, setShowBenchTable] = useState(false);
  const [rrfRows, setRrfRows] = useState([]);
  const [benchRows, setBenchRows] = useState([]);
  const [loadingRrf, setLoadingRrf] = useState(false);
  const [loadingBench, setLoadingBench] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/dashboard')
      .then(res => {
        const val = res.data && res.data.value ? res.data.value : {};
        setBenchCount(val.bench_count || 0);
        setRrfCount(val.rrf_count || 0);
        setInitialLoading(false);
      })
      .catch(() => {
        setBenchCount(0);
        setRrfCount(0);
        setInitialLoading(false);
      });
  }, []);

  // Fetch RRF table
  const handleShowRrfTable = () => {
    setLoadingRrf(true);
    axios.get('http://127.0.0.1:8000/rrf')
      .then(res => {
        let arr = [];
        if (Array.isArray(res.data)) arr = res.data;
        else if (res.data && Array.isArray(res.data.rrf)) arr = res.data.rrf;
        setRrfRows(arr);
        setShowRrfTable(true);
        setShowBenchTable(false);
      })
      .catch(() => {
        setRrfRows([]);
        setShowRrfTable(true);
        setShowBenchTable(false);
      })
      .finally(() => setLoadingRrf(false));
  };

  // Fetch Bench table
  const handleShowBenchTable = () => {
    setLoadingBench(true);
    axios.get('http://127.0.0.1:8000/candidates')
      .then(res => {
        let arr = [];
        if (Array.isArray(res.data)) arr = res.data;
        else if (res.data && Array.isArray(res.data.candidates)) arr = res.data.candidates;
        setBenchRows(arr.map(c => ({
          vamid: c.vamid,
          name: c.name,
          skill: c.primary_skill || c.current_skill || '-',
          grade: c.grade
        })));
        setShowBenchTable(true);
        setShowRrfTable(false);
      })
      .catch(() => {
        setBenchRows([]);
        setShowBenchTable(true);
        setShowRrfTable(false);
      })
      .finally(() => setLoadingBench(false));
  };

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#2f3b4a' }}>
        <div style={{ width: '48px', height: '48px', border: '6px solid #fff', borderTop: '6px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ color: '#fff', marginTop: '18px', fontSize: '18px', fontWeight: 500 }}>Loading Dashboard...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <section className="dashboard-section">
      <h2>Overview</h2>
      <div className="dashboard-cards">
        <div className="card" style={{ cursor: 'pointer' }} onClick={handleShowRrfTable}>
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h3>Open RRFs</h3>
            <p className="card-value">{rrfCount}</p>
          </div>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={handleShowBenchTable}>
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Bench People</h3>
            <p className="card-value">{benchCount}</p>
          </div>
        </div>
      </div>
      {showRrfTable && (
        <div className="dashboard-table-container">
          <h3>Open RRFs Table</h3>
          {loadingRrf ? (
            <div className="dashboard-loading">Loading RRFs...</div>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>RRF ID</th>
                  <th>Account</th>
                  <th>Position</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Project Name</th>
                </tr>
              </thead>
              <tbody>
                {rrfRows.length === 0 ? (
                  <tr><td colSpan="6">No RRFs found.</td></tr>
                ) : (
                  rrfRows.map((row, idx) => (
                    <tr key={row.rrf_id || idx}>
                      <td>{row.rrf_id}</td>
                      <td>{row.account}</td>
                      <td>{row.pos_title}</td>
                      <td>{row.role}</td>
                      <td>{row.status}</td>
                      <td>{row.project_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
      {showBenchTable && (
        <div className="dashboard-table-container">
          <h3>Bench People Table</h3>
          {loadingBench ? (
            <div className="dashboard-loading">Loading Bench People...</div>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>VAM ID</th>
                  <th>Name</th>
                  <th>Skill</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {benchRows.length === 0 ? (
                  <tr><td colSpan="4">No Bench People found.</td></tr>
                ) : (
                  benchRows.map((row, idx) => (
                    <tr key={row.vamid || idx}>
                      <td>{row.vamid}</td>
                      <td>{row.name}</td>
                      <td>{row.skill}</td>
                      <td>{row.grade}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
};

export default Dashboard;
