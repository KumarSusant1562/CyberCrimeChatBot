import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ComplaintsDashboard from './components/ComplaintsDashboard';

export default function App() {
  const [activeView, setActiveView] = useState('1930'); // '1930' or 'reports'

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={styles.navLogo}>🛡️</span>
          <span style={styles.navTitle}>Cyber Crime Management System</span>
        </div>
        <div style={styles.navTabs}>
          <button
            onClick={() => setActiveView('1930')}
            style={{
              ...styles.navTab,
              ...(activeView === '1930' ? styles.navTabActive : {})
            }}
          >
            🚨 1930 Helpline Complaints
          </button>
          <button
            onClick={() => setActiveView('reports')}
            style={{
              ...styles.navTab,
              ...(activeView === 'reports' ? styles.navTabActive : {})
            }}
          >
            📋 General Reports
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={styles.content}>
        {activeView === '1930' ? <ComplaintsDashboard /> : <Dashboard />}
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  navLogo: {
    fontSize: '32px'
  },
  navTitle: {
    color: 'white',
    fontSize: '20px',
    fontWeight: '700',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  navTabs: {
    display: 'flex',
    gap: '10px'
  },
  navTab: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  navTabActive: {
    background: 'white',
    color: '#667eea'
  },
  content: {
    minHeight: 'calc(100vh - 70px)'
  }
};
