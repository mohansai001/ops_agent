import * as XLSX from 'xlsx';
import './ProjectFeedback.css';
import React, { useState, useRef } from 'react';
const ProjectFeedback = () => {
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fileName, setFileName] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const DISPLAY_COLUMNS = [
    "Manager Name",
    "VM ID",
    "Associate Name",
    "Reason for Release",
    "Please specify the skill category",
    "Project End Date",
    "End Date",
    "Comment on the technical knowledge",
    "Quality of Work - Project Specific (Consider the associate's ability to meet deadlines, quality standards, and project goals.)",
    "Comment on the Communication Skills",
    "StrengthsAdaptability (Measure how quickly associates can learn and adapt to new technologies or processes introduced in the project)"
  ];

  const COLUMN_SHORT_NAMES = {
    "Manager Name": "Manager",
    "VM ID": "VM ID",
    "Associate Name": "Associate",
    "Reason for Release": "Release Reason",
    "Please specify the skill category": "Skill Category",
    "Project End Date": "End Date",
    "End Date": "End Date",
    "Comment on the technical knowledge": "Tech Knowledge",
    "Quality of Work - Project Specific (Consider the associate's ability to meet deadlines, quality standards, and project goals.)": "Quality of Work",
    "Comment on the Communication Skills": "Communication",
    "StrengthsAdaptability (Measure how quickly associates can learn and adapt to new technologies or processes introduced in the project)": "Adaptability"
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // Normalize column names for robust matching
      const normalize = str => (str || "").toLowerCase().replace(/\s+/g, "").trim();
      const allColumns = (data[0] || []).map(normalize);
      const displayNormalized = DISPLAY_COLUMNS.map(normalize);
      // Map display columns to actual columns in the file
      const filteredColumns = DISPLAY_COLUMNS.reduce((acc, col, i) => {
        let normCol = normalize(col);
        // Special handling for End Date
        if (normCol === normalize("Project End Date")) {
          const idx = allColumns.indexOf(normalize("End Date"));
          if (idx !== -1) {
            acc.push(data[0][idx]);
            return acc;
          }
        }
        const idx = allColumns.indexOf(normCol);
        if (idx !== -1) {
          acc.push(data[0][idx]);
        }
        return acc;
      }, []);
      setColumns(filteredColumns);
      // Filter table data by column name
      const filteredData = data.slice(1).map(row => {
        return filteredColumns.map(col => {
          const colIdx = data[0].indexOf(col);
          return colIdx !== -1 ? row[colIdx] : "";
        });
      });
      setTableData(filteredData);
    };
    reader.readAsBinaryString(file);
  };

  const fileInputRef = useRef();
  return (
    <section className="project-feedback-section">
      <div className="project-feedback-file-input-wrapper">
        <span className="project-feedback-title-top">Project Feedback Upload</span>
        <input
          ref={fileInputRef}
          id="customFileInput"
          className="project-feedback-file-input"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <label htmlFor="customFileInput" className="custom-file-label">
          <span role="img" aria-label="upload" style={{marginRight: '8px'}}>📁</span>
          {fileName ? 'Change File' : 'Choose File'}
        </label>
      </div>
      <div className="project-feedback-header" />
  {/* File name is already shown under the button, so no need to show again */}
      {columns.length > 0 && (
        <div className="feedback-grid-container">
          <input
            type="text"
            className="feedback-search-input"
            placeholder="Search by name or skill..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{marginBottom: '1.2rem', padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', maxWidth: '400px'}}
          />
          {tableData.length === 0 ? (
            <div className="no-data">No data found.</div>
          ) : (
            <div className="feedback-grid">
              {tableData
                .map((row, i) => ({ row, i }))
                .filter(({ row }) => {
                  const name = row[columns.indexOf("Associate Name")]?.toLowerCase() || "";
                  const skill = row[columns.indexOf("Please specify the skill category")]?.toLowerCase() || row[columns.indexOf("Skill Category")]?.toLowerCase() || "";
                  const term = searchTerm.toLowerCase();
                  return name.includes(term) || skill.includes(term);
                })
                .map(({ row, i }) => {
                  // Robust VM ID lookup
                  const normalize = str => (str || "").toLowerCase().replace(/\s+/g, "").trim();
                  let vmidIdx = columns.findIndex(
                    c => normalize(c) === "vmid" || normalize(c) === "vm id" || normalize(c) === "vm_id"
                  );
                  return (
                    <div className="feedback-card" key={i} onClick={() => setSelectedIdx(i)}>
                      <div className="feedback-card-label"><strong>Name:</strong></div>
                      <div className="feedback-card-title">{row[columns.indexOf("Associate Name")]}</div>
                      <div className="feedback-card-label"><strong>Skill:</strong></div>
                      <div className="feedback-card-skill">{row[columns.indexOf("Please specify the skill category")] || row[columns.indexOf("Skill Category")]}</div>
                      <div className="feedback-card-label"><strong>VM ID:</strong></div>
                      <div className="feedback-card-vmid">{vmidIdx !== -1 ? row[vmidIdx] : ""}</div>
                    </div>
                  );
                })}
            </div>
          )}
          {selectedIdx !== null && (
            <div className="feedback-modal-overlay" onClick={() => setSelectedIdx(null)}>
              <div className="feedback-modal" onClick={e => e.stopPropagation()}>
                <h3>Feedback Details</h3>
                <ul>
                  {columns.map((col, idx) => (
                    <li key={idx}><strong>{COLUMN_SHORT_NAMES[col] || col}:</strong> {tableData[selectedIdx][idx]}</li>
                  ))}
                </ul>
                <button className="modal-close-btn" onClick={() => setSelectedIdx(null)}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProjectFeedback;
