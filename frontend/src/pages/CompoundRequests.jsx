import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './CompoundRequests.css';

const CompoundRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    purpose: '', requestedDate: '', startTime: '', endTime: '', description: '',
  });

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/compound-requests');
      setRequests(data);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.purpose || !form.requestedDate) return toast.error('Purpose and date are required');

    setSaving(true);
    try {
      const { data } = await api.post('/compound-requests', form);
      setRequests((p) => [data, ...p]);
      toast.success('Compound request submitted!');
      setShowModal(false);
      setForm({ purpose: '', requestedDate: '', startTime: '', endTime: '', description: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSaving(false);
    }
  };

  const updateRequest = async (id, status, adminRemarks = '') => {
    try {
      const { data } = await api.put(`/compound-requests/${id}`, { status, adminRemarks });
      setRequests((p) => p.map((r) => (r._id === id ? data : r)));
      toast.success(`Request ${status.toLowerCase()}`);
    } catch (err) {
      toast.error('Failed to update request');
    }
  };

  const statusBadge = (status) => ({
    Pending: 'badge-warning',
    Approved: 'badge-success',
    Rejected: 'badge-danger',
  }[status] || 'badge-gray');

  return (
    <div className="page-wrapper">
      <div className="container fade-in">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Compound Space Requests</h1>
            <p>Book common area for events and gatherings</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Request</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <span className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🏟️</div>
            <h3>No requests yet</h3>
            <p>Submit a request to book the compound space for your event</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowModal(true)}>Book Now</button>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((r) => (
              <div key={r._id} className="request-card card">
                <div className="request-header">
                  <div className="request-icon">🏟️</div>
                  <div className="request-meta">
                    <h3>{r.purpose}</h3>
                    <div className="request-tags">
                      <span className={`badge ${statusBadge(r.status)}`}>{r.status}</span>
                      <span className="badge badge-gray">
                        📅 {new Date(r.requestedDate).toLocaleDateString('en-IN')}
                      </span>
                      {r.startTime && <span className="badge badge-gray">⏰ {r.startTime} – {r.endTime}</span>}
                      {r.userId?.fullName && <span className="badge badge-gray">{r.userId.fullName} · {r.userId.flatNumber}</span>}
                    </div>
                  </div>
                  <span className="request-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                {r.description && <p className="request-desc">{r.description}</p>}
                {r.adminRemarks && (
                  <p className="request-remarks">Admin: {r.adminRemarks}</p>
                )}
                {user?.role === 'Admin' && r.status === 'Pending' && (
                  <div className="request-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => updateRequest(r._id, 'Approved')}>Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => updateRequest(r._id, 'Rejected', 'Request declined')}>Reject</button>
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
                <h2>Book Compound Space</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Purpose *</label>
                  <input className="form-control" placeholder="e.g. Birthday Party, Society Meeting" value={form.purpose} onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Requested Date *</label>
                  <input type="date" className="form-control" value={form.requestedDate} onChange={(e) => setForm((p) => ({ ...p, requestedDate: e.target.value }))} required />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input type="time" className="form-control" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input type="time" className="form-control" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Additional details about the event..."
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                    {saving ? 'Submitting...' : 'Submit Request'}
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

export default CompoundRequests;
