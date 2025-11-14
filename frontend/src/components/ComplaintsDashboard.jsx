import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export default function ComplaintsDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    complaintType: 'all',
    priority: 'all',
    searchTerm: ''
  });
  const [note, setNote] = useState('');
  const [assignedAgent, setAssignedAgent] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('Medium');

  async function loadComplaints() {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/api/complaints`);
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
      alert('Failed to load complaints. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
    const interval = setInterval(loadComplaints, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function updateStatus(complaint, newStatus) {
    try {
      await axios.patch(`${BASE}/api/complaints/${complaint.ticketNumber || complaint._id}`, {
        status: newStatus
      });
      await loadComplaints();
      if (selectedComplaint && selectedComplaint._id === complaint._id) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }
      alert(`✅ Status updated to "${newStatus}" and user notified via WhatsApp!`);
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update status. Please try again.');
    }
  }

  async function updatePriority(complaint, newPriority) {
    try {
      await axios.patch(`${BASE}/api/complaints/${complaint.ticketNumber || complaint._id}`, {
        priority: newPriority
      });
      await loadComplaints();
      if (selectedComplaint && selectedComplaint._id === complaint._id) {
        setSelectedComplaint({ ...selectedComplaint, priority: newPriority });
      }
      alert(`✅ Priority updated to "${newPriority}"!`);
    } catch (err) {
      console.error('Priority update error:', err);
      alert('Failed to update priority. Please try again.');
    }
  }

  async function assignAgent(complaint) {
    if (!assignedAgent.trim()) {
      alert('Please enter agent name');
      return;
    }

    try {
      await axios.patch(`${BASE}/api/complaints/${complaint.ticketNumber || complaint._id}`, {
        assignedTo: assignedAgent.trim()
      });
      await loadComplaints();
      setAssignedAgent('');
      alert(`✅ Complaint assigned to "${assignedAgent}"!`);
    } catch (err) {
      console.error('Agent assignment error:', err);
      alert('Failed to assign agent. Please try again.');
    }
  }

  async function addAdminNote(complaint) {
    if (!note.trim()) {
      alert('Please enter a note');
      return;
    }

    try {
      await axios.post(`${BASE}/api/complaints/${complaint.ticketNumber || complaint._id}/notes`, {
        note: note.trim(),
        addedBy: 'Admin'
      });
      setNote('');
      await loadComplaints();
      alert('✅ Note added and user notified via WhatsApp!');
    } catch (err) {
      console.error('Add note error:', err);
      alert('Failed to add note. Please try again.');
    }
  }

  function viewDetails(complaint) {
    setSelectedComplaint(complaint);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedComplaint(null);
  }

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    if (filters.status !== 'all' && c.status !== filters.status) return false;
    if (filters.complaintType !== 'all' && c.complaintType !== filters.complaintType) return false;
    if (filters.priority !== 'all' && c.priority !== filters.priority) return false;
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      return (
        c.ticketNumber?.toLowerCase().includes(search) ||
        c.name?.toLowerCase().includes(search) ||
        c.phone?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const statusCounts = {
    total: complaints.length,
    registered: complaints.filter(c => c.status === 'Registered').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    critical: complaints.filter(c => c.priority === 'Critical').length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Registered': return '#3498db';
      case 'In Progress': return '#f39c12';
      case 'Under Investigation': return '#9b59b6';
      case 'Escalated': return '#e74c3c';
      case 'Resolved': return '#2ecc71';
      case 'Closed': return '#95a5a6';
      default: return '#7f8c8d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return '#95a5a6';
      case 'Medium': return '#3498db';
      case 'High': return '#f39c12';
      case 'Critical': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const getFraudTypeLabel = (complaint) => {
    if (complaint.financialFraudType) {
      return complaint.financialFraudType.replace(/_/g, ' ').toUpperCase();
    }
    if (complaint.socialMediaFraudType) {
      return complaint.socialMediaFraudType.replace(/_/g, ' ').toUpperCase();
    }
    return 'N/A';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🚨 1930 Cyber Crime Helpline - Odisha</h1>
          <p style={styles.subtitle}>Comprehensive Complaint Management Dashboard</p>
        </div>
        <button onClick={loadComplaints} style={styles.refreshButton}>
          🔄 Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #667eea' }}>
          <div style={styles.statValue}>{statusCounts.total}</div>
          <div style={styles.statLabel}>Total Complaints</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #3498db' }}>
          <div style={styles.statValue}>{statusCounts.registered}</div>
          <div style={styles.statLabel}>Registered</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #f39c12' }}>
          <div style={styles.statValue}>{statusCounts.inProgress}</div>
          <div style={styles.statLabel}>In Progress</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #2ecc71' }}>
          <div style={styles.statValue}>{statusCounts.resolved}</div>
          <div style={styles.statLabel}>Resolved</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #e74c3c' }}>
          <div style={styles.statValue}>{statusCounts.critical}</div>
          <div style={styles.statLabel}>Critical Priority</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="🔍 Search by ticket, name, phone, email..."
          value={filters.searchTerm}
          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          style={styles.searchInput}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="Registered">Registered</option>
          <option value="In Progress">In Progress</option>
          <option value="Under Investigation">Under Investigation</option>
          <option value="Escalated">Escalated</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select
          value={filters.complaintType}
          onChange={(e) => setFilters({ ...filters, complaintType: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="all">All Types</option>
          <option value="new_complaint">New Complaint</option>
          <option value="status_check">Status Check</option>
          <option value="account_unfreeze">Account Unfreeze</option>
          <option value="other_query">Other Query</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="all">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading complaints...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3>No Complaints Found</h3>
          <p>No complaints match your current filters.</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ticket #</th>
                <th style={styles.th}>Complainant</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Fraud Category</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Assigned To</th>
                <th style={styles.th}>Documents</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map(complaint => (
                <tr key={complaint._id} style={styles.tr}>
                  <td style={styles.td}>
                    <code style={styles.ticketCode}>
                      {complaint.ticketNumber}
                    </code>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.nameCell}>
                      <strong>{complaint.name}</strong>
                      <small style={styles.smallText}>
                        {complaint.gender} • {complaint.dateOfBirth}
                      </small>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.contactCell}>
                      📱 {complaint.phone}<br/>
                      {complaint.email && <small>📧 {complaint.email}</small>}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.locationCell}>
                      <strong>{complaint.district}</strong><br/>
                      <small>{complaint.pinCode}</small>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.typeBadge}>
                      {complaint.complaintType?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {complaint.fraudCategory === 'financial_fraud' && (
                      <span style={{ ...styles.badge, background: '#fff3cd', color: '#856404' }}>
                        💰 {getFraudTypeLabel(complaint)}
                      </span>
                    )}
                    {complaint.fraudCategory === 'social_media_fraud' && (
                      <span style={{ ...styles.badge, background: '#d1ecf1', color: '#0c5460' }}>
                        📱 {getFraudTypeLabel(complaint)}
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      background: getStatusColor(complaint.status)
                    }}>
                      {complaint.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.priorityBadge,
                      background: getPriorityColor(complaint.priority)
                    }}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {complaint.assignedTo ? (
                      <span style={styles.agentBadge}>
                        👤 {complaint.assignedTo}
                      </span>
                    ) : (
                      <span style={styles.unassignedBadge}>
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {complaint.documents && complaint.documents.length > 0 ? (
                      <span style={styles.docBadge}>
                        📎 {complaint.documents.length} files
                      </span>
                    ) : (
                      <span style={styles.noDocBadge}>No docs</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.dateCell}>
                      {new Date(complaint.createdAt).toLocaleDateString('en-IN')}<br/>
                      <small style={styles.smallText}>
                        {new Date(complaint.createdAt).toLocaleTimeString('en-IN')}
                      </small>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => viewDetails(complaint)}
                      style={styles.viewButton}
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedComplaint && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  🎫 Complaint Details
                </h2>
                <code style={styles.modalTicket}>
                  {selectedComplaint.ticketNumber}
                </code>
              </div>
              <button onClick={closeModal} style={styles.closeButton}>×</button>
            </div>

            {/* Modal Content */}
            <div style={styles.modalContent}>
              {/* Personal Information */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>👤 Personal Information</h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <label>Name:</label>
                    <span>{selectedComplaint.name}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <label>Father/Spouse/Guardian:</label>
                    <span>{selectedComplaint.fatherSpouseName || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <label>Date of Birth:</label>
                    <span>{selectedComplaint.dateOfBirth || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <label>Gender:</label>
                    <span>{selectedComplaint.gender || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <label>Phone:</label>
                    <span>{selectedComplaint.phone}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <label>Email:</label>
                    <span>{selectedComplaint.email || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <label>WhatsApp:</label>
                    <span>{selectedComplaint.whatsappNumber}</span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📍 Address Details</h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <label>Village:</label>
                    <span>{selectedComplaint.village || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <label>Post Office:</label>
                    <span>{selectedComplaint.postOffice || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <label>Police Station:</label>
                    <span>{selectedComplaint.policeStation || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <label>District:</label>
                    <span>{selectedComplaint.district || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <label>PIN Code:</label>
                    <span>{selectedComplaint.pinCode || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Complaint Details */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📋 Complaint Information</h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <label>Complaint Type:</label>
                    <span style={styles.typeBadge}>
                      {selectedComplaint.complaintType?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  {selectedComplaint.fraudCategory && (
                    <div style={styles.infoItem}>
                      <label>Fraud Category:</label>
                      <span>{selectedComplaint.fraudCategory.replace(/_/g, ' ').toUpperCase()}</span>
                    </div>
                  )}
                  {selectedComplaint.financialFraudType && (
                    <div style={styles.infoItem}>
                      <label>Financial Fraud Type:</label>
                      <span>{selectedComplaint.financialFraudType.replace(/_/g, ' ').toUpperCase()}</span>
                    </div>
                  )}
                  {selectedComplaint.socialMediaFraudType && (
                    <div style={styles.infoItem}>
                      <label>Social Media Fraud Type:</label>
                      <span>{selectedComplaint.socialMediaFraudType.replace(/_/g, ' ').toUpperCase()}</span>
                    </div>
                  )}
                  {selectedComplaint.amount && (
                    <div style={styles.infoItem}>
                      <label>Amount (₹):</label>
                      <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                        ₹ {selectedComplaint.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              {selectedComplaint.documents && selectedComplaint.documents.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>
                    📎 Documents ({selectedComplaint.documents.length})
                  </h3>
                  <div style={styles.documentsGrid}>
                    {selectedComplaint.documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.documentCard}
                      >
                        <img
                          src={doc.url}
                          alt={`Document ${idx + 1}`}
                          style={styles.documentImage}
                        />
                        <div style={styles.documentLabel}>
                          {doc.type?.replace(/_/g, ' ').toUpperCase() || `Document ${idx + 1}`}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Management */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>⚙️ Manage Complaint</h3>
                <div style={styles.actionGrid}>
                  <div>
                    <label style={styles.actionLabel}>Update Status:</label>
                    <select
                      defaultValue={selectedComplaint.status}
                      onChange={(e) => updateStatus(selectedComplaint, e.target.value)}
                      style={styles.actionSelect}
                    >
                      <option value="Registered">Registered</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Under Investigation">Under Investigation</option>
                      <option value="Escalated">Escalated</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label style={styles.actionLabel}>Set Priority:</label>
                    <select
                      defaultValue={selectedComplaint.priority}
                      onChange={(e) => updatePriority(selectedComplaint, e.target.value)}
                      style={styles.actionSelect}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <label style={styles.actionLabel}>Assign Agent:</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={assignedAgent}
                      onChange={(e) => setAssignedAgent(e.target.value)}
                      placeholder="Enter agent name..."
                      style={styles.textInput}
                    />
                    <button
                      onClick={() => assignAgent(selectedComplaint)}
                      style={styles.assignButton}
                    >
                      Assign
                    </button>
                  </div>
                  {selectedComplaint.assignedTo && (
                    <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                      Currently assigned to: <strong>{selectedComplaint.assignedTo}</strong>
                    </small>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedComplaint.adminNotes && selectedComplaint.adminNotes.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>💬 Admin Notes</h3>
                  <div style={styles.notesContainer}>
                    {selectedComplaint.adminNotes.map((note, idx) => (
                      <div key={idx} style={styles.noteCard}>
                        <div style={styles.noteContent}>{note.note}</div>
                        <div style={styles.noteMeta}>
                          {new Date(note.addedAt).toLocaleString('en-IN')} • by {note.addedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Note */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>✍️ Add Note (Sent to User)</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter update note to send to complainant via WhatsApp..."
                  style={styles.noteTextarea}
                />
                <button
                  onClick={() => addAdminNote(selectedComplaint)}
                  style={styles.sendNoteButton}
                >
                  📤 Send Note to User
                </button>
              </div>

              {/* Timeline */}
              {selectedComplaint.timeline && selectedComplaint.timeline.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>⏱️ Activity Timeline</h3>
                  <div style={styles.timeline}>
                    {selectedComplaint.timeline.map((event, idx) => (
                      <div key={idx} style={styles.timelineItem}>
                        <div style={styles.timelineDot}></div>
                        <div style={styles.timelineContent}>
                          <div style={styles.timelineAction}>{event.action}</div>
                          <div style={styles.timelineDescription}>{event.description}</div>
                          <div style={styles.timelineMeta}>
                            {new Date(event.timestamp).toLocaleString('en-IN')} • by {event.performedBy}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: '#f5f7fa',
    minHeight: '100vh'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '30px',
    borderRadius: '15px',
    color: 'white',
    marginBottom: '25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  title: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '700'
  },
  subtitle: {
    margin: '8px 0 0 0',
    opacity: 0.95,
    fontSize: '16px'
  },
  refreshButton: {
    padding: '12px 24px',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s',
    ':hover': {
      background: 'rgba(255,255,255,0.3)'
    }
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '25px'
  },
  statCard: {
    background: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s, box-shadow 0.3s'
  },
  statValue: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#7f8c8d',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  filterBar: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '25px',
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  searchInput: {
    flex: '2',
    minWidth: '250px',
    padding: '12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.3s',
    ':focus': {
      outline: 'none',
      borderColor: '#667eea'
    }
  },
  filterSelect: {
    flex: '1',
    minWidth: '150px',
    padding: '12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'white',
    transition: 'border-color 0.3s'
  },
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    background: '#f8f9fa',
    padding: '18px 15px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '13px',
    color: '#495057',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #dee2e6'
  },
  tr: {
    borderBottom: '1px solid #f1f3f5',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '15px',
    fontSize: '14px',
    color: '#495057',
    verticalAlign: 'top'
  },
  ticketCode: {
    background: '#e8f4fd',
    color: '#2c5282',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'inline-block'
  },
  nameCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  contactCell: {
    fontSize: '13px',
    lineHeight: '1.6'
  },
  locationCell: {
    lineHeight: '1.6'
  },
  smallText: {
    fontSize: '12px',
    color: '#868e96'
  },
  typeBadge: {
    background: '#e7f5ff',
    color: '#1864ab',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-block',
    textTransform: 'uppercase'
  },
  badge: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-block'
  },
  statusBadge: {
    color: 'white',
    padding: '7px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
    textAlign: 'center'
  },
  priorityBadge: {
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-block',
    textTransform: 'uppercase'
  },
  agentBadge: {
    background: '#d3f9d8',
    color: '#2b8a3e',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block'
  },
  unassignedBadge: {
    background: '#f1f3f5',
    color: '#868e96',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    display: 'inline-block'
  },
  docBadge: {
    background: '#fff3bf',
    color: '#f08c00',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block'
  },
  noDocBadge: {
    color: '#adb5bd',
    fontSize: '12px',
    fontStyle: 'italic'
  },
  dateCell: {
    lineHeight: '1.6'
  },
  viewButton: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'background 0.3s'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'white',
    borderRadius: '12px'
  },
  spinner: {
    width: '50px',
    height: '50px',
    margin: '0 auto 20px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'white',
    borderRadius: '12px'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
    overflow: 'auto'
  },
  modal: {
    background: 'white',
    borderRadius: '15px',
    maxWidth: '1000px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '25px 30px',
    borderRadius: '15px 15px 0 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  modalTitle: {
    margin: '0 0 10px 0',
    fontSize: '24px',
    fontWeight: '700'
  },
  modalTicket: {
    background: 'rgba(255,255,255,0.2)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700'
  },
  closeButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    fontSize: '32px',
    cursor: 'pointer',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.3s'
  },
  modalContent: {
    padding: '30px'
  },
  section: {
    marginBottom: '30px',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '10px'
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#667eea',
    borderBottom: '2px solid #667eea',
    paddingBottom: '10px'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  documentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '15px'
  },
  documentCard: {
    textDecoration: 'none',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'transform 0.3s, box-shadow 0.3s'
  },
  documentImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover'
  },
  documentLabel: {
    padding: '10px',
    background: '#f8f9fa',
    fontSize: '11px',
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center'
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  actionLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#495057'
  },
  actionSelect: {
    width: '100%',
    padding: '10px',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'white'
  },
  textInput: {
    flex: 1,
    padding: '10px 15px',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '14px'
  },
  assignButton: {
    padding: '10px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  notesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  noteCard: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    borderLeft: '4px solid #667eea'
  },
  noteContent: {
    marginBottom: '10px',
    color: '#495057',
    lineHeight: '1.6'
  },
  noteMeta: {
    fontSize: '12px',
    color: '#868e96'
  },
  noteTextarea: {
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    marginBottom: '12px'
  },
  sendNoteButton: {
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background 0.3s'
  },
  timeline: {
    borderLeft: '3px solid #667eea',
    paddingLeft: '30px',
    marginLeft: '10px'
  },
  timelineItem: {
    position: 'relative',
    marginBottom: '25px'
  },
  timelineDot: {
    position: 'absolute',
    left: '-36px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: '#667eea',
    border: '3px solid white',
    boxShadow: '0 0 0 3px #f8f9fa'
  },
  timelineContent: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px'
  },
  timelineAction: {
    fontWeight: '700',
    color: '#667eea',
    marginBottom: '5px'
  },
  timelineDescription: {
    color: '#495057',
    marginBottom: '8px',
    fontSize: '14px'
  },
  timelineMeta: {
    fontSize: '12px',
    color: '#868e96'
  }
};
