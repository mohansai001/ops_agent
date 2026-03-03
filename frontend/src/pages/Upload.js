import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Loader from '../components/Loader';
import './Upload.css';
import axios from 'axios';

const Upload = ({
  rrfFile, benchFile, uploadingRrf, uploadingBench, rrfCount, benchCount, handleRrfUpload, handleBenchUpload, useEnhancedMatching, setUseEnhancedMatching, handleMatchCandidates, matching, matches, handleDownloadExcel
}) => {
  // State for rrf_id dropdown and analysis results
  const [rrfIdList, setRrfIdList] = useState([]);
  const [selectedRrfId, setSelectedRrfId] = useState(null);
  const [analyzeResults, setAnalyzeResults] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch RRF IDs for dropdown
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/rrf')
      .then(res => {
        let rrfList = Array.isArray(res.data) ? res.data : (res.data.rrf || []);
        setRrfIdList([...new Set(rrfList.map(r => r.rrf_id).filter(Boolean))]);
      })
      .catch(() => setRrfIdList([]))
      .finally(() => setLoading(false));
  }, []);

  // Analyze candidates for selected RRF ID
  const handleAnalyzeRrf = async () => {
    if (!selectedRrfId) return;
    setAnalyzing(true);
    setAnalyzeResults([]);
    setError(null);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/match_candidate/${selectedRrfId}`);
      console.log('API response for match_candidate:', response.data);
      let results = [];
      // Handle nested ai_matching.ai_matching.recommended_candidates
      if (response.data && response.data.ai_matching && response.data.ai_matching.ai_matching && Array.isArray(response.data.ai_matching.ai_matching.recommended_candidates)) {
        results = response.data.ai_matching.ai_matching.recommended_candidates;
      } else if (Array.isArray(response.data.candidates)) {
        results = response.data.candidates;
      } else if (Array.isArray(response.data.matches)) {
        results = response.data.matches;
      } else if (response.data && response.data.matching) {
        results = response.data.matching;
      }
      setAnalyzeResults(results);
      console.log('Parsed results:', results);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze candidates');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <Loader message="Loading upload page..." />;

  return (
    <section className="upload-section">
    <div className="upload-grid">
      <div className="upload-card">
        <h3>RRF File (Open Positions)</h3>
        <p className="upload-description">
          Upload an Excel file containing open RRF positions with columns: 
          account, rrf_id, pos_title, role, status
        </p>
        <div className="upload-controls">
          <label className="file-input-label">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleRrfUpload}
              disabled={!!uploadingRrf}
              className="upload-file-btn"
            />
            <span className="upload-file-label">{uploadingRrf ? 'Uploading...' : rrfFile ? rrfFile.name : 'Choose RRF File'}</span>
          </label>
        </div>
        {rrfCount > 0 && (
          <div className="upload-status">
            ✓ {rrfCount} RRF(s) loaded in database
          </div>
        )}
      </div>
      <div className="upload-card">
        <h3>Bench File (Available Employees)</h3>
        <p className="upload-description">
          Upload an Excel file containing bench employees with columns: 
          name, skill, open_positions
        </p>
        <div className="upload-controls">
          <label className="file-input-label">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleBenchUpload}
              disabled={!!uploadingBench}
              className="upload-file-btn"
            />
            <span className="upload-file-label">{uploadingBench ? 'Uploading...' : benchFile ? benchFile.name : 'Choose Bench File'}</span>
          </label>
        </div>
        {benchCount > 0 && (
          <div className="upload-status">
            ✓ {benchCount} Bench employee(s) loaded in database
          </div>
        )}
      </div>
    </div>
    {/* RRF ID Analyze Section: always show if rrfIdList is available */}
    {rrfIdList.length > 0 && (
      <div className="analyze-section">
        <h3>Analyze Candidates by RRF ID</h3>
        <div className="analyze-controls">
          <Select
            options={rrfIdList.map(id => ({ value: id, label: id }))}
            value={selectedRrfId ? { value: selectedRrfId, label: selectedRrfId } : null}
            onChange={option => setSelectedRrfId(option ? option.value : null)}
            isClearable
            isSearchable
            placeholder="Select or search RRF ID..."
            classNamePrefix="react-select"
            styles={{ container: base => ({ ...base, minWidth: 220 }) }}
            isDisabled={analyzing || rrfIdList.length === 0}
          />
          <button
            className="btn-primary styled-analyze-btn"
            onClick={handleAnalyzeRrf}
            disabled={analyzing || !selectedRrfId}
          >
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        {/* Results Table */}
        {error && <div className="analyze-error">{error}</div>}
        {analyzeResults.length > 0 && (
          <div className="analyze-results-table">
            <h4>Analysis Results for RRF ID: {selectedRrfId}</h4>
            <table className="analyze-table">
              <thead>
                <tr>
                  <th>VAM ID</th>
                  <th>Skill</th>
                  <th>Score</th>
                  <th>Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {analyzeResults.map((candidate, idx) => (
                  <tr key={idx}>
                    <td>{candidate.vamid || '-'}</td>
                    <td>{candidate.skill_alignment || candidate.skill || '-'}</td>
                    <td>{candidate.match_score || candidate.score || '-'}</td>
                    <td>{candidate.reasoning || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}
    {/* Matching Section in Upload */}
    {rrfCount > 0 && benchCount > 0 && (
      <div className="matching-in-upload">
        {/* RRF ID Analyze Section */}
        <div className="analyze-section" style={{ marginBottom: 32 }}>
          <h3>Analyze Candidates by RRF ID</h3>
          <div className="analyze-controls" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select
              value={selectedRrfId}
              onChange={e => setSelectedRrfId(e.target.value)}
              disabled={analyzing || rrfIdList.length === 0}
              style={{ minWidth: 180 }}
            >
              <option value="">Select RRF ID</option>
              {rrfIdList.map(rrfId => (
                <option key={rrfId} value={rrfId}>{rrfId}</option>
              ))}
            </select>
            <button
              className="btn-primary"
              onClick={handleAnalyzeRrf}
              disabled={analyzing || !selectedRrfId}
              style={{ minWidth: 120 }}
            >
              {analyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          {/* Results Table */}
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
          {analyzeResults.length > 0 && (
            <div className="analyze-results-table" style={{ marginTop: 16 }}>
              <h4>Analysis Results for RRF ID: {selectedRrfId}</h4>
              <table className="analyze-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ccc', padding: '6px' }}>Name</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px' }}>Skill</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px' }}>Score</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px' }}>Reasoning</th>
                  </tr>
                </thead>
                <tbody>
                  {analyzeResults.map((candidate, idx) => (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #eee', padding: '6px' }}>{candidate.name || candidate.vamid || '-'}</td>
                      <td style={{ border: '1px solid #eee', padding: '6px' }}>{candidate.skill || '-'}</td>
                      <td style={{ border: '1px solid #eee', padding: '6px' }}>{candidate.score || '-'}</td>
                      <td style={{ border: '1px solid #eee', padding: '6px' }}>{candidate.reasoning || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <h3>Candidate Matching</h3>
        <div className="matching-info-inline">
          <p>Ready to match: <strong>{rrfCount} RRFs</strong> with <strong>{benchCount} Bench employees</strong></p>
        </div>
        <div className="matching-controls">
          <div className="matching-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useEnhancedMatching}
                onChange={(e) => setUseEnhancedMatching(e.target.checked)}
              />
              <span>Use Enhanced Matching (Multi-factor scoring)</span>
            </label>
          </div>
          <button
            className="btn-primary"
            onClick={handleMatchCandidates}
            disabled={matching || rrfCount === 0 || benchCount === 0}
          >
            {matching ? 'Matching Candidates...' : 'Get Top 5 Candidates per RRF'}
          </button>
        </div>
        {matches.length > 0 && (
          <div className="matches-container">
            <div className="matches-header">
              <h3>Matching Results</h3>
              <button
                className="btn-download"
                onClick={handleDownloadExcel}
                title="Download results as Excel file"
              >
                📥 Download Excel
              </button>
            </div>
            {matches.map((match, index) => (
              <div key={index} className="match-card">
                <div className="match-header">
                  <h4>
                    {match.rrf?.pos_title || 'Position'}
                    {match.rrf?.rrf_id && ` (RRF ID: ${match.rrf.rrf_id})`}
                  </h4>
                  <div className="match-meta">
                    {match.rrf?.account && <span className="badge">{match.rrf.account}</span>}
                    {match.rrf?.role && <span className="badge">{match.rrf.role}</span>}
                  </div>
                </div>
                <div className="candidates-list">
                  {match.candidates && match.candidates.length > 0 ? (
                    match.candidates.map((candidate, idx) => (
                      <div key={idx} className="candidate-item">
                        <div className="candidate-header">
                          <span className="candidate-name">{candidate.name}</span>
                          <span className="candidate-score">Score: {candidate.score || 'N/A'}</span>
                        </div>
                        {candidate.skill && (
                          <div className="candidate-skill">Skills: {candidate.skill}</div>
                        )}
                        {candidate.reasoning && (
                          <div className="candidate-reasoning">{candidate.reasoning}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-candidates">No matching candidates found</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </section>
  );
};

export default Upload;
