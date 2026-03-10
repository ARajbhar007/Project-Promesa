import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './Vehicles.css';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [form, setForm] = useState({ vehicleType: '', vehicleNumber: '', parkingSlot: '', vehicleModel: '' });
  const [saving, setSaving] = useState(false);

  const fetchVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data);
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const openAdd = () => {
    setEditingVehicle(null);
    setForm({ vehicleType: '', vehicleNumber: '', parkingSlot: '', vehicleModel: '' });
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditingVehicle(v);
    setForm({ vehicleType: v.vehicleType, vehicleNumber: v.vehicleNumber, parkingSlot: v.parkingSlot || '', vehicleModel: v.vehicleModel || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehicleType || !form.vehicleNumber) return toast.error('Vehicle type and number are required');

    setSaving(true);
    try {
      if (editingVehicle) {
        const { data } = await api.put(`/vehicles/${editingVehicle._id}`, form);
        setVehicles((p) => p.map((v) => (v._id === data._id ? data : v)));
        toast.success('Vehicle updated!');
      } else {
        const { data } = await api.post('/vehicles', form);
        setVehicles((p) => [data, ...p]);
        toast.success('Vehicle added!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles((p) => p.filter((v) => v._id !== id));
      toast.success('Vehicle removed');
    } catch (err) {
      toast.error('Failed to delete vehicle');
    }
  };

  const vehicleIcon = (type) => ({ Car: '🚗', Bike: '🏍️', Other: '🚐' }[type] || '🚗');

  return (
    <div className="page-wrapper">
      <div className="container fade-in">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>My Vehicles</h1>
            <p>Manage your registered vehicles and parking slots</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Vehicle</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <span className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🚗</div>
            <h3>No vehicles registered</h3>
            <p>Add your first vehicle to get started</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={openAdd}>Add Vehicle</button>
          </div>
        ) : (
          <div className="vehicles-grid">
            {vehicles.map((v) => (
              <div key={v._id} className="vehicle-card card">
                <div className="vehicle-icon">{vehicleIcon(v.vehicleType)}</div>
                <div className="vehicle-info">
                  <h3>{v.vehicleNumber}</h3>
                  <p>{v.vehicleModel || v.vehicleType}</p>
                  <div className="vehicle-meta">
                    <span className={`badge badge-${v.vehicleType === 'Car' ? 'info' : 'warning'}`}>{v.vehicleType}</span>
                    {v.parkingSlot && <span className="badge badge-gray">Slot: {v.parkingSlot}</span>}
                    {v.userId?.fullName && <span className="badge badge-gray">{v.userId.fullName}</span>}
                  </div>
                </div>
                <div className="vehicle-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(v)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Vehicle Type *</label>
                  <select className="form-control" value={form.vehicleType} onChange={(e) => setForm((p) => ({ ...p, vehicleType: e.target.value }))} required>
                    <option value="">Select type</option>
                    <option>Car</option>
                    <option>Bike</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Vehicle Number *</label>
                  <input className="form-control" placeholder="MH 01 AB 1234" value={form.vehicleNumber} onChange={(e) => setForm((p) => ({ ...p, vehicleNumber: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Vehicle Model</label>
                  <input className="form-control" placeholder="Honda City" value={form.vehicleModel} onChange={(e) => setForm((p) => ({ ...p, vehicleModel: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Parking Slot</label>
                  <input className="form-control" placeholder="B-12" value={form.parkingSlot} onChange={(e) => setForm((p) => ({ ...p, parkingSlot: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                    {saving ? 'Saving...' : editingVehicle ? 'Update' : 'Add Vehicle'}
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

export default Vehicles;
