import React, { useEffect, useState } from 'react';
import { fetchReports, updateReport } from '../api';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export default function Dashboard(){
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMessage, setImageMessage] = useState('');

  async function load(){
    setLoading(true);
    try {
      const data = await fetchReports();
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load reports. Is backend running?');
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ 
    load(); 
    // Auto-refresh every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  async function changeStatus(report, status){
    const id = report.reportId || report._id;
    try {
      await axios.patch(`${BASE}/api/reports/${id}`, { status });
      await load();
      setSelectedReport(prev => prev && prev._id === report._id ? {...prev, status} : prev);
      alert('Status updated to "' + status + '" and user notified via WhatsApp!');
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update status. Please try again.');
    }
  }

  async function addNote(report) {
    if (!note.trim()) {
      alert('Please enter a note before sending');
      return;
    }
    
    const id = report.reportId || report._id;
    const noteToSend = note;
    try {
      await axios.post(`${BASE}/api/reports/${id}/notes`, { note: noteToSend });
      setNote('');
      await load();
      const preview = noteToSend.length > 50 ? noteToSend.substring(0, 50) + '...' : noteToSend;
      alert('Note sent to user via WhatsApp!\n\n"' + preview + '"');
    } catch (err) {
      console.error('Add note error:', err);
      alert('Failed to send note. Please try again.');
    }
  }

  async function sendImage(report) {
    if (!imageUrl.trim()) {
      alert('Please enter an image URL');
      return;
    }
    
    const id = report.reportId || report._id;
    try {
      await axios.post(`${BASE}/api/reports/${id}/send-image`, { 
        imageUrl,
        message: imageMessage || 'Please review this image from our team.'
      });
      setImageUrl('');
      setImageMessage('');
      await load();
      alert('Image sent to user via WhatsApp!');
    } catch (err) {
      console.error('Send image error:', err);
      alert('Failed to send image. Please check the URL and try again.');
    }
  }

  function viewDetails(report) {
    setSelectedReport(report);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedReport(null);
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Received': return '#3498db';
      case 'In Progress': return '#f39c12';
      case 'Closed': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '10px',
        color: 'white',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: 0, fontSize: '32px' }}>🛡️ CyberCrime Admin Dashboard</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          Comprehensive cyber crime reporting and management system
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>Loading reports...</p>
        </div>
      ) : (
        <>
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}>
            <div style={statCardStyle}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>
                {reports.length}
              </div>
              <div style={{ color: '#666', marginTop: '8px' }}>Total Reports</div>
            </div>
            
            <div style={statCardStyle}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3498db' }}>
                {reports.filter(r => r.status === 'Received').length}
              </div>
              <div style={{ color: '#666', marginTop: '8px' }}>Received</div>
            </div>
            
            <div style={statCardStyle}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f39c12' }}>
                {reports.filter(r => r.status === 'In Progress').length}
              </div>
              <div style={{ color: '#666', marginTop: '8px' }}>In Progress</div>
            </div>
            
            <div style={statCardStyle}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2ecc71' }}>
                {reports.filter(r => r.status === 'Closed').length}
              </div>
              <div style={{ color: '#666', marginTop: '8px' }}>Closed</div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Report ID</th>
                  <th style={thStyle}>From</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Business Type</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Media</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Created</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>
                      <code style={{ 
                        fontSize: '14px',
                        fontWeight: 'bold',
                        background: '#e8f4fd',
                        color: '#2c5282',
                        padding: '6px 12px',
                        borderRadius: '6px'
                      }}>
                        {r.reportId || r._id.slice(0, 8) + '...'}
                      </code>
                    </td>
                    <td style={tdStyle}>{r.from}</td>
                    <td style={tdStyle}>
                      <span style={{
                        background: '#e8f4fd',
                        color: '#2c5282',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        {r.category}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {r.subCategory ? (
                        <span style={{
                          background: '#fff3cd',
                          color: '#856404',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {r.subCategory}
                        </span>
                      ) : (
                        <span style={{ color: '#999', fontSize: '12px' }}>N/A</span>
                      )}
                    </td>
                    <td style={{...tdStyle, maxWidth: '250px'}}>
                      {r.description.length > 80 
                        ? r.description.substring(0, 80) + '...' 
                        : r.description}
                    </td>
                    <td style={tdStyle}>
                      {(r.media||[]).length > 0 && (
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          {r.media.map((m,i)=>
                            <a key={i} href={m.url} target="_blank" rel="noreferrer">
                              <img src={m.url} alt="evidence" style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '2px solid #ddd'
                              }}/>
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        background: getStatusColor(r.status),
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {new Date(r.createdAt).toLocaleDateString()}<br/>
                      <small style={{ color: '#999' }}>
                        {new Date(r.createdAt).toLocaleTimeString()}
                      </small>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <select 
                          defaultValue={r.status} 
                          onChange={(e)=>changeStatus(r, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          <option value="Received">Received</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <button 
                          onClick={() => viewDetails(r)}
                          style={{
                            padding: '6px 12px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          📋 View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Detailed Report Modal */}
      {showModal && selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          overflow: 'auto',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <div style={{
              position: 'sticky',
              top: 0,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0 }}>📋 Report Details</h2>
              <button 
                onClick={closeModal}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              {/* Basic Info */}
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📄 Basic Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <strong>Report ID:</strong><br/>
                    <code style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      background: '#e8f4fd', 
                      color: '#2c5282',
                      padding: '8px 16px', 
                      borderRadius: '8px' 
                    }}>
                      {selectedReport.reportId || selectedReport._id}
                    </code>
                  </div>
                  <div>
                    <strong>From:</strong><br/>
                    {selectedReport.from}
                  </div>
                  <div>
                    <strong>Category:</strong><br/>
                    <span style={{
                      background: '#e8f4fd',
                      color: '#2c5282',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      display: 'inline-block'
                    }}>
                      {selectedReport.category}
                    </span>
                  </div>
                  {selectedReport.subCategory && (
                    <div>
                      <strong>Business Type:</strong><br/>
                      <span style={{
                        background: '#fff3cd',
                        color: '#856404',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        display: 'inline-block'
                      }}>
                        {selectedReport.subCategory}
                      </span>
                    </div>
                  )}
                  <div>
                    <strong>Status:</strong><br/>
                    <span style={{
                      background: getStatusColor(selectedReport.status),
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      display: 'inline-block'
                    }}>
                      {selectedReport.status}
                    </span>
                  </div>
                  <div>
                    <strong>Created:</strong><br/>
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </div>
                  {selectedReport.updatedAt && (
                    <div>
                      <strong>Last Updated:</strong><br/>
                      {new Date(selectedReport.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📝 Description</h3>
                <p style={{ lineHeight: '1.6', color: '#444' }}>{selectedReport.description}</p>
              </div>

              {/* Media */}
              {selectedReport.media && selectedReport.media.length > 0 && (
                <div style={sectionStyle}>
                  <h3 style={sectionTitleStyle}>📷 Evidence Images ({selectedReport.media.length})</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {selectedReport.media.map((m,i)=>
                      <a key={i} href={m.url} target="_blank" rel="noreferrer">
                        <img src={m.url} alt={`evidence-${i}`} style={{
                          width: '150px',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid #ddd',
                          cursor: 'pointer'
                        }}/>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {selectedReport.timeline && selectedReport.timeline.length > 0 && (
                <div style={sectionStyle}>
                  <h3 style={sectionTitleStyle}>⏱️ Timeline</h3>
                  <div style={{ borderLeft: '3px solid #667eea', paddingLeft: '20px' }}>
                    {selectedReport.timeline.map((item, idx) => (
                      <div key={idx} style={{ marginBottom: '15px', position: 'relative' }}>
                        <div style={{
                          position: 'absolute',
                          left: '-27px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#667eea',
                          border: '3px solid white'
                        }}/>
                        <div style={{ fontWeight: 'bold', color: '#667eea' }}>{item.action}</div>
                        <div style={{ fontSize: '13px', color: '#666' }}>{item.description}</div>
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                          {new Date(item.timestamp).toLocaleString()} • by {item.performedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedReport.notes && selectedReport.notes.length > 0 && (
                <div style={sectionStyle}>
                  <h3 style={sectionTitleStyle}>💬 Admin Notes</h3>
                  {selectedReport.notes.map((n, idx) => (
                    <div key={idx} style={{
                      background: '#f8f9fa',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      borderLeft: '4px solid #667eea'
                    }}>
                      <div style={{ marginBottom: '8px' }}>{n.content}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        {new Date(n.addedAt).toLocaleString()} • by {n.addedBy}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Note Section */}
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📝 Add Note (Sent to User via WhatsApp)</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter note to send to user..."
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    fontFamily: 'Arial, sans-serif',
                    resize: 'vertical'
                  }}
                />
                <button
                  onClick={() => addNote(selectedReport)}
                  style={{
                    marginTop: '10px',
                    padding: '10px 20px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  📤 Send Note to User
                </button>
              </div>

              {/* Send Image Section */}
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📷 Send Image to User (via WhatsApp)</h3>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    marginBottom: '10px'
                  }}
                />
                <textarea
                  value={imageMessage}
                  onChange={(e) => setImageMessage(e.target.value)}
                  placeholder="Optional message with the image..."
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    fontFamily: 'Arial, sans-serif',
                    resize: 'vertical'
                  }}
                />
                <button
                  onClick={() => sendImage(selectedReport)}
                  style={{
                    marginTop: '10px',
                    padding: '10px 20px',
                    background: '#2ecc71',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  📤 Send Image to User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const statCardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  flex: '1',
  minWidth: '150px',
  textAlign: 'center'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  background: 'white',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const thStyle = {
  background: '#f8f9fa',
  padding: '15px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#444',
  borderBottom: '2px solid #dee2e6'
};

const tdStyle = {
  padding: '15px',
  verticalAlign: 'top'
};

const sectionStyle = {
  marginBottom: '25px',
  padding: '20px',
  background: '#f8f9fa',
  borderRadius: '8px'
};

const sectionTitleStyle = {
  margin: '0 0 15px 0',
  color: '#667eea',
  fontSize: '18px',
  fontWeight: '600'
};
