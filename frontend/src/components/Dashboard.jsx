import React, { useEffect, useState } from 'react';
import { fetchReports, updateReport } from '../api';

export default function Dashboard(){
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(()=>{ load(); }, []);

  async function changeStatus(id, status){
    await updateReport(id, status);
    load();
  }

  return (
    <div>
      {loading ? <p>Loading...</p> : (
        <>
          <p>Total reports: <strong>{reports.length}</strong></p>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>From</th><th>Description</th><th>Category</th><th>Media</th><th>Status</th><th>Created</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r._id}>
                  <td style={{width:220}}>{r._id}</td>
                  <td>{r.from}</td>
                  <td style={{maxWidth:280}}>{r.description}</td>
                  <td>{r.category}</td>
                  <td className="media">{(r.media||[]).map((m,i)=>
                    <a key={i} href={m.url} target="_blank" rel="noreferrer"><img src={m.url} alt="media"/></a>
                  )}</td>
                  <td><span className="badge">{r.status}</span></td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>
                    <select defaultValue={r.status} onChange={(e)=>changeStatus(r._id, e.target.value)}>
                      <option value="Received">Received</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
