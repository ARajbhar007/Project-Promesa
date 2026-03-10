import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Complaints.css';

const CATEGORIES = ['Plumbing', 'Electrical', 'Housekeeping', 'Parking', 'Noise', 'Security', 'Other'];

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '' });

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get('/complaints');
      setComplaints(data);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) return toast.error('All fields are required');

    setSaving(true);
    try {
      const { data } = await api.post('/complaints', form);
      setComplaints((p) => [data, ...p]);
      toast.success('Complaint filed successfully!');
      setShowModal(false);
      setForm({ title: '', description: '', category: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to file complaint');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/complaints/${id}`, { status });
      setComplaints((p) => p.map((c) => (c._id === id ? data : c)));
      toast.success('Status updated!');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const statusBadge = (status) => ({
    Open: 'badge-danger',
    'In Progress': 'badge-warning',
    Resolved: 'badge-success',
    Closed: 'badge-gray',
  }[status] || 'badge-gray');

  const categoryIcon = (cat) => ({
    Plumbing: '🔧', Electrical: '⚡', Housekeeping: '🧹',
    Parking: '🅿️', Noise: '🔊', Security: '🔒', Other: '📋',
  }[cat] || '📋');

  return (
    <div className="page-wrapper">
      <div className="container fade-in">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Complaints</h1>
            <p>File and track your society complaints</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ File Complaint</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <span className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔧</div>
            <h3>No complaints filed</h3>
            <p>File a complaint to get assistance from the management</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowModal(true)}>File Complaint</button>
          </div>
        ) : (
          <div className="complaints-list">
            {complaints.map((c) => (
              <div key={c._id} className="complaint-card card">
                <div className="complaint-header">
                  <div className="complaint-icon">{categoryIcon(c.category)}</div>
                  <div className="complaint-meta">
                    <h3>{c.title}</h3>
                    <div className="complaint-tags">
                      <span className="badge badge-info">{c.category}</span>
                      <span className={`badge ${statusBadge(c.status)}`}>{c.status}</span>
                      {c.userId?.fullName && <span className="badge badge-gray">{c.userId.fullName} · {c.userId.flatNumber}</span>}
                    </div>
                  </div>
                  <span className="complaint-date">{new Date(c.date || c.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <p className="complaint-desc">{c.description}</p>
                {user?.role === 'Admin' && (
                  <div className="complaint-actions">
                    <select
                      className="form-control"
                      style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
                      value={c.status}
                      onChange={(e) => updateStatus(c._id, e.target.value)}
                    >
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                      <option>Closed</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>File a Complaint</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title *</label>
                  <input className="form-control" placeholder="Brief title of the issue" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select className="form-control" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} required>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Describe the issue in detail..."
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                    {saving ? 'Filing...' : 'Submit Complaint'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;
