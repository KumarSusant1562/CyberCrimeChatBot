import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export const fetchReports = () => 
  axios.get(`${BASE}/api/reports`).then(r => r.data);

export const updateReport = (id, status) => 
  axios.patch(`${BASE}/api/reports/${id}`, { status }).then(r => r.data);

export const addNote = (id, note) => 
  axios.post(`${BASE}/api/reports/${id}/notes`, { note }).then(r => r.data);

export const sendImage = (id, imageUrl, message) => 
  axios.post(`${BASE}/api/reports/${id}/send-image`, { imageUrl, message }).then(r => r.data);

