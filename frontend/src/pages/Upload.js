import React from 'react';

const Upload = ({
  rrfFile, benchFile, uploadingRrf, uploadingBench, rrfCount, benchCount, handleRrfUpload, handleBenchUpload, useEnhancedMatching, setUseEnhancedMatching, handleMatchCandidates, matching, matches, handleDownloadExcel
}) => (
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
              disabled={uploadingRrf}
            />
            {uploadingRrf ? 'Uploading...' : rrfFile ? rrfFile.name : 'Choose RRF File'}
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
              disabled={uploadingBench}
            />
            {uploadingBench ? 'Uploading...' : benchFile ? benchFile.name : 'Choose Bench File'}
          </label>
        </div>
        {benchCount > 0 && (
          <div className="upload-status">
            ✓ {benchCount} Bench employee(s) loaded in database
          </div>
        )}
      </div>
    </div>
    {/* Matching Section in Upload */}
    {rrfCount > 0 && benchCount > 0 && (
      <div className="matching-in-upload">
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

export default Upload;
