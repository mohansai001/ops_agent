import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './ProjectFeedback.css';

const ProjectFeedback = () => {
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fileName, setFileName] = useState('');

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
      setColumns(data[0] || []);
      setTableData(data.slice(1));
    };
    reader.readAsBinaryString(file);
  };

  return (
    <section className="project-feedback-section">
      <h2>Project Feedback Upload</h2>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
      {fileName && <p>Showing: <strong>{fileName}</strong></p>}
      {columns.length > 0 && (
        <div className="feedback-table-container">
          <table className="feedback-table">
            <thead>
              <tr>
                {columns.map((col, idx) => <th key={idx}>{col}</th>)}
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
