import React from 'react';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <div className="container">
      <div className="header">
        <h1>Cyber Crime Reports — Admin Dashboard</h1>
        <div className="controls">
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      </div>
      <Dashboard />
    </div>
  );
}
