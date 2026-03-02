import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './ProjectFeedback.css';

const ProjectFeedback = () => {
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fileName, setFileName] = useState('');

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

  return (
    <section className="project-feedback-section">
      <div className="project-feedback-file-input-wrapper">
        <span className="project-feedback-title-top">Project Feedback Upload</span>
        <input className="project-feedback-file-input" type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
      </div>
      <div className="project-feedback-header" />
      {fileName && <p>Showing: <strong>{fileName}</strong></p>}
      {columns.length > 0 && (
        <div className="feedback-table-container">
          <table className="feedback-table">
            <thead>
              <tr>
                {columns.map((col, idx) => <th key={idx}>{COLUMN_SHORT_NAMES[col] || col}</th>)}
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr><td colSpan={columns.length}>No data found.</td></tr>
              ) : (
                tableData.map((row, i) => (
                  <tr key={i}>
                    {columns.map((_, j) => <td key={j}>{row[j]}</td>)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ProjectFeedback;
