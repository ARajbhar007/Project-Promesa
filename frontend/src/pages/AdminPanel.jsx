import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [complaints, setComplaints] = useState([]);
  const [compoundRequests, setCompoundRequests] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [u, c, cr, m] = await Promise.all([
          api.get('/users'),
          api.get('/complaints'),
          api.get('/compound-requests'),
          api.get('/maintenance'),
        ]);
        setUsers(u.data);
        setComplaints(c.data);
        setCompoundRequests(cr.data);
        setMaintenance(m.data);
      } catch (err) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const updateComplaintStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/complaints/${id}`, { status });
      setComplaints((p) => p.map((c) => (c._id === id ? data : c)));
      toast.success('Updated!');
    } catch { toast.error('Failed'); }
  };

  const updateCRStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/compound-requests/${id}`, { status });
      setCompoundRequests((p) => p.map((r) => (r._id === id ? data : r)));
      toast.success('Updated!');
    } catch { toast.error('Failed'); }
  };

  const stats = [
    { label: 'Total Residents', value: users.length, icon: '👥', color: '#0071e3' },
    { label: 'Open Complaints', value: complaints.filter(c => c.status === 'Open').length, icon: '🔧', color: '#ff9f0a' },
    { label: 'Pending Requests', value: compoundRequests.filter(r => r.status === 'Pending').length, icon: '🏟️', color: '#5e5ce6' },
    { label: 'Overdue Maintenance', value: maintenance.filter(m => m.status === 'Overdue').length, icon: '💰', color: '#ff3b30' },
  ];

  const tabs = [
    { key: 'users', label: `Residents (${users.length})` },
    { key: 'complaints', label: `Complaints (${complaints.length})` },
    { key: 'compound', label: `Compound (${compoundRequests.length})` },
    { key: 'maintenance', label: `Maintenance (${maintenance.length})` },
  ];

  return (
    <div className="page-wrapper">
      <div className="container fade-in">
        <div className="page-header">
          <h1>Admin Panel</h1>
          <p>Manage all society residents and data</p>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          {stats.map((s, i) => (
            <div key={i} className="admin-stat card">
              <div className="admin-stat-icon" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
              <div>
                <p className="admin-stat-label">{s.label}</p>
                <p className="admin-stat-value">{loading ? '…' : s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {tabs.map((t) => (
            <button key={t.key} className={`tab-btn ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <span className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : (
          <div className="admin-content card">
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Flat</th>
                      <th>Tower</th>
                      <th>Flat Type</th>
                      <th>Ownership</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.fullName}</td>
                        <td>{u.email}</td>
                        <td>{u.flatNumber}</td>
                        <td>{u.tower || '—'}</td>
                        <td>{u.flatType || '—'}</td>
                        <td>{u.ownershipType || '—'}</td>
                        <td>
                          <span className={`badge badge-${u.role === 'Admin' ? 'danger' : u.role === 'Security' ? 'warning' : 'info'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Complaints Tab */}
            {activeTab === 'complaints' && (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Title</th><th>Category</th><th>Resident</th><th>Flat</th><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr key={c._id}>
                        <td>{c.title}</td>
                        <td>{c.category}</td>
                        <td>{c.userId?.fullName || '—'}</td>
                        <td>{c.userId?.flatNumber || '—'}</td>
                        <td>{new Date(c.date || c.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          <select
                            className="form-control"
                            style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}
                            value={c.status}
                            onChange={(e) => updateComplaintStatus(c._id, e.target.value)}
                          >
                            <option>Open</option>
                            <option>In Progress</option>
                            <option>Resolved</option>
                            <option>Closed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Compound Requests Tab */}
            {activeTab === 'compound' && (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Purpose</th><th>Resident</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {compoundRequests.map((r) => (
                      <tr key={r._id}>
                        <td>{r.purpose}</td>
                        <td>{r.userId?.fullName || '—'} · {r.userId?.flatNumber || '—'}</td>
                        <td>{new Date(r.requestedDate).toLocaleDateString('en-IN')}</td>
                        <td>{r.startTime ? `${r.startTime}–${r.endTime}` : '—'}</td>
                        <td>
                          <span className={`badge badge-${r.status === 'Approved' ? 'success' : r.status === 'Rejected' ? 'danger' : 'warning'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          {r.status === 'Pending' && (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-primary btn-sm" onClick={() => updateCRStatus(r._id, 'Approved')}>Approve</button>
                              <button className="btn btn-danger btn-sm" onClick={() => updateCRStatus(r._id, 'Rejected')}>Reject</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Flat</th><th>Month/Year</th><th>Amount</th><th>Pending Dues</th><th>Status</th><th>Paid On</th></tr>
                  </thead>
                  <tbody>
                    {maintenance.map((m) => (
                      <tr key={m._id}>
                        <td>{m.userId?.flatNumber || m.flatNumber || '—'}</td>
                        <td>{m.month} {m.year}</td>
                        <td>₹{m.amount?.toLocaleString()}</td>
                        <td>{m.pendingDues > 0 ? `₹${m.pendingDues.toLocaleString()}` : '—'}</td>
                        <td>
                          <span className={`badge badge-${m.status === 'Paid' ? 'success' : m.status === 'Overdue' ? 'danger' : 'warning'}`}>
                            {m.status}
                          </span>
                        </td>
                        <td>{m.paidOn ? new Date(m.paidOn).toLocaleDateString('en-IN') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
