import React from 'react';
import logo from '../assets/ValueMomentum_logo.png';

const Loader = ({ message = 'Loading...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', padding: '40px' }}>
    <img src={logo} alt="ValueMomentum Logo" style={{ height: '48px', marginBottom: '24px' }} />
    <div style={{ width: '48px', height: '48px', border: '6px solid #e0e0e0', borderTop: '6px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <div style={{ color: '#333', marginTop: '18px', fontSize: '16px', fontWeight: 500 }}>{message}</div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default Loader;
