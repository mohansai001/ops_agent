
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import Upload from './pages/Upload';
import Matches from './pages/Matches';
import History from './pages/History';
import Trends from './pages/Trends';
import NotFound from './pages/NotFound';
import ProjectFeedback from './pages/ProjectFeedback';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  // Use React Router's location to determine the current route
  const location = typeof window !== 'undefined' && window.location ? { pathname: window.location.pathname } : { pathname: '/' };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rrfCount, setRrfCount] = useState(0);
  const [benchCount, setBenchCount] = useState(0);
  const [rrfFile, setRrfFile] = useState(null);
  const [benchFile, setBenchFile] = useState(null);
  const [uploadingRrf, setUploadingRrf] = useState(false);
  const [uploadingBench, setUploadingBench] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [useEnhancedMatching, setUseEnhancedMatching] = useState(true);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [trends, setTrends] = useState(null);
  // Remove activeSection, use routing instead
  // For Candidates Table
  const [candidatesTableData, setCandidatesTableData] = useState([]);
  const [positions, setPositions] = useState([]);
  const [statuses, setStatuses] = useState(['Available', 'Matched', 'On Hold', 'Closed']);
  const [accounts, setAccounts] = useState([]);
  // Fetch bench candidates, positions, and accounts for Candidates table
  // Fetch bench candidates, positions, and accounts for Candidates table
  useEffect(() => {
    // Only fetch when on /candidates route
    if (window.location.pathname === '/candidates') {
      axios.get(`${API_BASE_URL}/bench`)
        .then(res => {
          setCandidatesTableData(res.data.bench || []);
        })
        .catch(() => setCandidatesTableData([]));
      axios.get(`${API_BASE_URL}/rrf`)
        .then(res => {
          setPositions(res.data.rrfs ? res.data.rrfs.map(r => r.pos_title).filter(Boolean) : []);
          setAccounts(res.data.rrfs ? Array.from(new Set(res.data.rrfs.map(r => r.account).filter(Boolean))) : []);
        })
        .catch(() => {
          setPositions([]);
          setAccounts([]);
        });
    }
  }, []);
  // Handler for dropdown changes in Candidates table
  const handleCandidateTableChange = (idx, field, value) => {
    setCandidatesTableData(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  // Handler for Save button in Candidates table
  const handleCandidateSave = (row) => {
    toast.success(`Saved: ${row.name}, Position: ${row.position}, Status: ${row.status}, Account: ${row.account}`);
  };

  // Fetch counts on component mount and after uploads
  const fetchCounts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/counts`);
      setRrfCount(response.data.rrfCount);
      setBenchCount(response.data.benchCount);
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleRrfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setRrfFile(file);
    setUploadingRrf(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload/rrf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setRrfCount(response.data.count);
      if (response.data.warnings && response.data.warnings.length > 0) {
        setWarnings(response.data.warnings);
      } else {
        setWarnings([]);
      }
      alert(`RRF file uploaded successfully! ${response.data.count} records processed.`);
      fetchCounts();
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.join('; '));
        setWarnings(err.response.data.warnings || []);
      } else {
        setError(err.response?.data?.error || 'Failed to upload RRF file');
      }
      console.error('Error uploading RRF file:', err);
    } finally {
      setUploadingRrf(false);
    }
  };

  const handleBenchUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBenchFile(file);
    setUploadingBench(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload/bench`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setBenchCount(response.data.count);
      if (response.data.warnings && response.data.warnings.length > 0) {
        setWarnings(response.data.warnings);
      } else {
        setWarnings([]);
      }
      alert(`Bench file uploaded successfully! ${response.data.count} records processed.`);
      fetchCounts();
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.join('; '));
        setWarnings(err.response.data.warnings || []);
      } else {
        setError(err.response?.data?.error || 'Failed to upload Bench file');
      }
      console.error('Error uploading Bench file:', err);
    } finally {
      setUploadingBench(false);
    }
  };

  const handleMatchCandidates = async () => {


    setMatching(true);
    setError(null);
    setMatches([]);

    try {
      const response = await axios.get('http://127.0.0.1:8000/matching');
      // Support new API response structure
      let matches = [];
      if (response.data && response.data.ai_matching && response.data.ai_matching.gemini_analysis && Array.isArray(response.data.ai_matching.gemini_analysis.matches)) {
        matches = response.data.ai_matching.gemini_analysis.matches.map(m => ({
          ...m,
          rrf_id: m.rrf_id,
          pos_title: m.pos_title,
          account: m.account || (m.employee_details && m.employee_details.account) || '',
          candidates: Array.isArray(m.recommended_candidates) ? m.recommended_candidates.map(rc => ({
            ...rc,
            ...rc.employee_details,
            score: rc.match_score,
            reasoning: rc.reasoning
          })) : []
        }));
      } else if (Array.isArray(response.data.matches)) {
        matches = response.data.matches;
      }
      setMatches(matches);
      // Print only the candidates data for each match
      if (matches.length > 0) {
        matches.forEach((match, idx) => {
          console.log(`Candidates for RRF #${idx + 1}:`, match.candidates);
        });
        // Print candidate analysis for each match
        matches.forEach((match, idx) => {
          console.log(`RRF #${idx + 1}:`, match.rrf);
          if (match.candidates && Array.isArray(match.candidates)) {
            match.candidates.forEach((candidate, cidx) => {
              console.log(`  Candidate #${cidx + 1}:`, candidate);
            });
          } else {
            console.log('  No candidates found for this RRF.');
          }
        });
      }
      if (response.data.batchCount) {
        console.log(`Processed in ${response.data.batchCount} batches`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to match candidates');
      console.error('Error matching candidates:', err);
    } finally {
      setMatching(false);
    }
  };

  const fetchUploadHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/upload-history?limit=20`);
      setUploadHistory(response.data.history);
    } catch (err) {
      console.error('Error fetching upload history:', err);
      setError('Failed to load upload history');
    }
  };

  const fetchTrends = async () => {
    try {
      const summaryResponse = await axios.get(`${API_BASE_URL}/trends/summary?days=30`);
      setTrends(summaryResponse.data);
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError('Failed to load trends');
    }
  };

  // Fetch data when switching to history or trends sections
  // Fetch history and trends when those pages are visited
  useEffect(() => {
    if (window.location.pathname === '/history') {
      fetchUploadHistory();
    }
    if (window.location.pathname === '/trends') {
      fetchTrends();
    }
  }, []);
  
  // Remove hash/activeSection logic

  const handleDownloadExcel = async () => {
    if (matches.length === 0) {
      alert('No matching results to download. Please run matching first.');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/download-matches`,
        { matches },
        {
          responseType: 'blob',
        }
      );

      // Check if response is actually an error (JSON error response)
      // When responseType is 'blob', error responses might still be blobs
      if (response.headers['content-type'] && response.headers['content-type'].includes('application/json')) {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || 'Failed to download Excel file');
      }

      // Verify it's actually an Excel file
      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty file from server');
      }

      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `rrf_matching_results_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      let errorMessage = 'Failed to download Excel file';
      
      if (err.response) {
        // If it's a blob error response, try to parse it
        if (err.response.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const errorData = JSON.parse(text);
            errorMessage = errorData.error || errorMessage;
          } catch (parseErr) {
            errorMessage = err.response.statusText || errorMessage;
          }
        } else {
          errorMessage = err.response.data?.error || err.response.statusText || errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error downloading Excel:', err);
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <Router>
      <div className="app">
        <ToastContainer position="top-right" autoClose={1200} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        <div className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
          <div className="sidebar-header">
            <h2 style={{ display: sidebarCollapsed ? 'none' : 'block' }}>Ops Agent</h2>
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{ marginLeft: sidebarCollapsed ? 0 : 'auto', marginRight: 0 }}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
          <nav className="sidebar-nav">
              <Link to="/candidates" className="nav-item" title="Candidates">
                {sidebarCollapsed ? '👤' : 'Candidates'}
              </Link>
              <Link to="/dashboard" className="nav-item" title="Dashboard">
                {sidebarCollapsed ? '🏠' : 'Dashboard'}
              </Link>
              <Link to="/upload" className="nav-item" title="Upload Files">
                {sidebarCollapsed ? '⬆️' : 'Upload Files'}
              </Link>
              <Link to="/matches" className="nav-item" title="Matches">
                {sidebarCollapsed ? '🔗' : 'Matches'}
              </Link>
              <Link to="/history" className="nav-item" title="History">
                {sidebarCollapsed ? '🕑' : 'History'}
              </Link>
              <Link to="/trends" className="nav-item" title="Trends">
                {sidebarCollapsed ? '📈' : 'Trends'}
              </Link>
              <Link to="/project-feedback" className="nav-item" title="Project Feedback">
                {sidebarCollapsed ? '📝' : 'Project Feedback'}
              </Link>
          </nav>
        </div>
        <div className="main-content">
          <div className="content">
            {/* Header is now rendered only inside the Dashboard route below */}
            {error && (
                  <div className="error-banner">
                    <strong>Error:</strong> {error}
                  </div>
                )}
                {warnings.length > 0 && (
                  <div className="warning-banner">
                    <strong>Warnings:</strong>
                    <ul>
                      {warnings.slice(0, 5).map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                      {warnings.length > 5 && <li>... and {warnings.length - 5} more warnings</li>}
                    </ul>
                  </div>
                )}
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                <>
                  <header className="header">
                    <h1>Operations Dashboard</h1>
                    <p className="subtitle">Automated RRF Allocation System</p>
                  </header>
                  <Dashboard rrfCount={rrfCount} benchCount={benchCount} />
                </>
              } />
              <Route path="/candidates" element={<Candidates candidatesTableData={candidatesTableData} positions={positions} statuses={statuses} accounts={accounts} handleCandidateTableChange={handleCandidateTableChange} handleCandidateSave={handleCandidateSave} />} />
              <Route path="/upload" element={<Upload rrfFile={rrfFile} benchFile={benchFile} uploadingRrf={uploadingRrf} uploadingBench={uploadingBench} rrfCount={rrfCount} benchCount={benchCount} handleRrfUpload={handleRrfUpload} handleBenchUpload={handleBenchUpload} useEnhancedMatching={useEnhancedMatching} setUseEnhancedMatching={setUseEnhancedMatching} handleMatchCandidates={handleMatchCandidates} matching={matching} matches={matches} handleDownloadExcel={handleDownloadExcel} />} />
              <Route path="/matches" element={<Matches rrfCount={rrfCount} benchCount={benchCount} useEnhancedMatching={useEnhancedMatching} setUseEnhancedMatching={setUseEnhancedMatching} handleMatchCandidates={handleMatchCandidates} matching={matching} matches={matches} handleDownloadExcel={handleDownloadExcel} />} />
              <Route path="/history" element={<History historyData={uploadHistory} />} />
              <Route path="/trends" element={<Trends trendsData={trends ? [
                { label: 'Current RRFs', value: trends.current?.rrfCount },
                { label: 'Current Bench', value: trends.current?.benchCount },
                { label: 'Unique RRFs Matched (30d)', value: trends.matching?.unique_rrfs_matched },
                { label: 'Total Matches (30d)', value: trends.matching?.total_matches },
                { label: 'Avg Match Score (30d)', value: trends.matching?.avg_match_score ? Math.round(trends.matching.avg_match_score * 100) / 100 : 'N/A' }
              ] : []} />} />
              <Route path="/project-feedback" element={<ProjectFeedback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
