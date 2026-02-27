

import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import axios from 'axios';
import './Candidates.css';


const Candidates = ({ statuses, handleCandidateTableChange, handleCandidateSave }) => {
  const [candidatesTableData, setCandidatesTableData] = useState([]);
  const [positions, setPositions] = useState([]); // Will hold rrf_id list
  const [accounts, setAccounts] = useState([]);
  const [rrfMap, setRrfMap] = useState({}); // rrf_id -> rrf object
  // No need for rrfSearch with react-select

  useEffect(() => {
    // Fetch candidates
    axios.get('http://127.0.0.1:8000/candidates')
      .then(res => {
        // If response is { candidates: [...] }, extract names only
        let arr = [];
        if (Array.isArray(res.data)) {
          arr = res.data;
        } else if (res.data && Array.isArray(res.data.candidates)) {
          arr = res.data.candidates;
        }
  // Only keep vamid and name for each candidate
  setCandidatesTableData(arr.map(c => ({ vamid: c.vamid, name: c.name })));
      })
      .catch(() => setCandidatesTableData([]));
    // Fetch RRFs for positions and accounts
    axios.get('http://127.0.0.1:8000/rrf')
      .then(res => {
        let rrfList = [];
        if (Array.isArray(res.data)) {
          rrfList = res.data;
        } else if (res.data && Array.isArray(res.data.rrf)) {
          rrfList = res.data.rrf;
        }
        setPositions([...new Set(rrfList.map(r => r.rrf_id).filter(Boolean))]);
        setAccounts([...new Set(rrfList.map(r => r.account).filter(Boolean))]);
        // Build rrf_id -> rrf object map
        const map = {};
        rrfList.forEach(r => { if (r.rrf_id) map[r.rrf_id] = r; });
        setRrfMap(map);
      })
      .catch(() => {
        setPositions([]);
        setAccounts([]);
        setRrfMap({});
      });
  }, []);

  // Local state for table edits
  const [tableRows, setTableRows] = useState([]);

  // Sync fetched candidatesTableData to local tableRows
  useEffect(() => {
    setTableRows(candidatesTableData.map(row => ({ ...row })));
  }, [candidatesTableData]);

  // Handler for table changes
  const handleTableChange = (idx, field, value) => {
    setTableRows(prev => {
      const updated = [...prev];
      let row = { ...updated[idx] };
      if (field === 'position') {
        row.position = value;
        // Auto-set account if rrfMap has it
        if (value && rrfMap[value]) {
          row.account = rrfMap[value].account || '';
        }
      } else if (field === 'account') {
        row.account = value;
      } else if (field === 'status') {
        row.status = value;
      }
      updated[idx] = row;
      return updated;
    });
  };

  // Save handler
  const handleSave = (row) => {
    if (row.position && row.vamid) {
      axios.post(`http://127.0.0.1:8000/update_position/${row.position}/${row.vamid}`)
        .then(() => {
          toast.success('Position updated successfully!');
          setTimeout(() => window.location.reload(), 1200);
        })
        .catch(() => {
          toast.error('Failed to update position.');
        });
    } else {
      toast.warn('Please select both RRF ID and candidate VAM ID.');
    }
    if (typeof handleCandidateSave === 'function') {
      handleCandidateSave(row);
    }
  };

  return (
    <section className="candidates-section">
      <h2>Candidates Table</h2>
      <div className="candidates-table-container">
        <table className="candidates-table">
          <thead>
            <tr>
              <th>VAM ID</th>
              <th>Candidate Name</th>
              <th>Position</th>
              <th>Status</th>
              <th>Account</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.length === 0 ? (
              <tr><td colSpan="6">No candidates found.</td></tr>
            ) : (
              tableRows.map((row, idx) => (
                <tr key={row.vamid || row.name || row.id || idx}>
                  <td>{row.vamid}</td>
                  <td>{row.name}</td>
                  <td>
                    <Select
                      options={positions.map(rrfId => ({ value: rrfId, label: rrfId }))}
                      value={row.position ? { value: row.position, label: row.position } : null}
                      onChange={option => handleTableChange(idx, 'position', option ? option.value : '')}
                      placeholder="Select or search RRF ID"
                      isClearable
                      styles={{ container: base => ({ ...base, minWidth: 180 }) }}
                    />
                  </td>
                  <td>
                    <select value={row.status || ''} onChange={e => handleTableChange(idx, 'status', e.target.value)}>
                      <option value="">Select Status</option>
                      {statuses.map((status, i) => <option key={i} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.account || ''}
                      readOnly={!!row.position}
                      placeholder="Account will auto-fill"
                      style={{ background: row.position ? '#f7f9fa' : undefined }}
                    />
                  </td>
                  <td>
                    <button className="btn-primary" onClick={() => handleSave(row)}>Save</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ToastContainer position="top-right" autoClose={1200} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </section>
  );
};

export default Candidates;
