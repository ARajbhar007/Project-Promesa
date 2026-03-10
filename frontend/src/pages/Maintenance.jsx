import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Maintenance.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const Maintenance = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    flatNumber: '', month: '', year: new Date().getFullYear(),
    amount: '', status: 'Pending', paidOn: '', pendingDues: '',
  });

  const fetchRecords = async () => {
    try {
      const { data } = await api.get('/maintenance');
      setRecords(data);
    } catch (err) {
      toast.error('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.month || !form.year || !form.amount) return toast.error('Month, year, and amount are required');

    setSaving(true);
    try {
      const { data } = await api.post('/maintenance', form);
      setRecords((p) => [data, ...p]);
      toast.success('Maintenance record added!');
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add record');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/maintenance/${id}`, { status, ...(status === 'Paid' ? { paidOn: new Date() } : {}) });
      setRecords((p) => p.map((r) => (r._id === id ? data : r)));
      toast.success('Status updated!');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const statusBadge = (status) => ({
    Paid: 'badge-success',
    Pending: 'badge-warning',
    Overdue: 'badge-danger',
  }[status] || 'badge-gray');

  const totalPaid = records.filter((r) => r.status === 'Paid').reduce((s, r) => s + r.amount, 0);
  const totalPending = records.filter((r) => r.status !== 'Paid').reduce((s, r) => s + r.amount + (r.pendingDues || 0), 0);

  return (
    <div className="page-wrapper">
      <div className="container fade-in">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Maintenance</h1>
            <p>Track your monthly maintenance payments</p>
          </div>
          {user?.role === 'Admin' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Record</button>
          )}
        </div>

        {/* Summary */}
        <div className="maintenance-summary">
          <div className="summary-card card">
            <div className="summary-icon" style={{ background: '#d1fae5', color: '#065f46' }}>✓</div>
            <div>
              <p className="summary-label">Total Paid</p>
              <p className="summary-value">₹{totalPaid.toLocaleString()}</p>
            </div>
          </div>
          <div className="summary-card card">
            <div className="summary-icon" style={{ background: '#fef3c7', color: '#92400e' }}>⏳</div>
            <div>
              <p className="summary-label">Total Due</p>
              <p className="summary-value">₹{totalPending.toLocaleString()}</p>
            </div>
          </div>
          <div className="summary-card card">
            <div className="summary-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>📋</div>
            <div>
              <p className="summary-label">Total Records</p>
              <p className="summary-value">{records.length}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <span className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="icon">💰</div>
            <h3>No maintenance records</h3>
            <p>Records will appear here once added by admin</p>
          </div>
        ) : (
          <div className="maintenance-table-wrap card">
            <table className="maintenance-table">
              <thead>
                <tr>
                  <th>Flat</th>
                  <th>Month/Year</th>
                  <th>Amount</th>
                  <th>Pending Dues</th>
                  <th>Status</th>
                  <th>Paid On</th>
                  {user?.role === 'Admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{r.userId?.flatNumber || r.flatNumber || '—'}</td>
                    <td>{r.month} {r.year}</td>
                    <td>₹{r.amount?.toLocaleString()}</td>
                    <td>{r.pendingDues > 0 ? `₹${r.pendingDues.toLocaleString()}` : '—'}</td>
                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                    <td>{r.paidOn ? new Date(r.paidOn).toLocaleDateString('en-IN') : '—'}</td>
                    {user?.role === 'Admin' && (
                      <td>
                        <select
                          className="form-control"
                          style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}
                          value={r.status}
                          onChange={(e) => updateStatus(r._id, e.target.value)}
                        >
                          <option>Pending</option>
                          <option>Paid</option>
                          <option>Overdue</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Maintenance Record</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Flat Number</label>
                    <input className="form-control" placeholder="A-101" value={form.flatNumber} onChange={(e) => setForm((p) => ({ ...p, flatNumber: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Month *</label>
                    <select className="form-control" value={form.month} onChange={(e) => setForm((p) => ({ ...p, month: e.target.value }))} required>
                      <option value="">Select month</option>
                      {MONTHS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Year *</label>
                    <input type="number" className="form-control" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Amount (₹) *</label>
                    <input type="number" className="form-control" placeholder="3000" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                      <option>Pending</option>
                      <option>Paid</option>
                      <option>Overdue</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Pending Dues (₹)</label>
                    <input type="number" className="form-control" placeholder="0" value={form.pendingDues} onChange={(e) => setForm((p) => ({ ...p, pendingDues: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                    {saving ? 'Adding...' : 'Add Record'}
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

export default Maintenance;
