import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setFormData(data);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', formData);
      updateUser(data);
      toast.success('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-center" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <span className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container fade-in">
        <div className="page-header">
          <h1>My Profile</h1>
          <p>View and manage your personal information</p>
        </div>

        <div className="profile-layout">
          {/* Avatar sidebar */}
          <div className="profile-sidebar card">
            <div className="profile-avatar">
              {formData.fullName?.charAt(0).toUpperCase()}
            </div>
            <h3>{formData.fullName}</h3>
            <p className="profile-flat">Flat {formData.flatNumber}</p>
            <span className={`badge badge-${formData.role === 'Admin' ? 'danger' : 'info'}`}>
              {formData.role}
            </span>
            <div className="profile-meta">
              <div className="meta-item">
                <span className="meta-label">Tower</span>
                <span>{formData.tower || '—'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Flat Type</span>
                <span>{formData.flatType || '—'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Ownership</span>
                <span>{formData.ownershipType || '—'}</span>
              </div>
            </div>
            {!editMode && (
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            )}
          </div>

          {/* Main form */}
          <form onSubmit={handleSubmit} className="profile-form card">
            <div className="profile-section">
              <h4>Personal Information</h4>
              <div className="grid-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="fullName" className="form-control" value={formData.fullName || ''} onChange={handleChange} disabled={!editMode} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" className="form-control" value={formData.email || ''} onChange={handleChange} disabled={!editMode} />
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input name="mobile" className="form-control" value={formData.mobile || ''} onChange={handleChange} disabled={!editMode} />
                </div>
                <div className="form-group">
                  <label>Emergency Contact</label>
                  <input name="emergencyContact" className="form-control" value={formData.emergencyContact || ''} onChange={handleChange} disabled={!editMode} />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input name="dateOfBirth" type="date" className="form-control" value={formData.dateOfBirth?.split('T')[0] || ''} onChange={handleChange} disabled={!editMode} />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" className="form-control" value={formData.gender || ''} onChange={handleChange} disabled={!editMode}>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h4>Flat Information</h4>
              <div className="grid-2">
                <div className="form-group">
                  <label>Tower</label>
                  <input name="tower" className="form-control" value={formData.tower || ''} onChange={handleChange} disabled={!editMode} />
                </div>
                <div className="form-group">
                  <label>Flat Number</label>
                  <input name="flatNumber" className="form-control" value={formData.flatNumber || ''} onChange={handleChange} disabled={!editMode} />
                </div>
                <div className="form-group">
                  <label>Floor Number</label>
                  <input name="floorNumber" type="number" className="form-control" value={formData.floorNumber || ''} onChange={handleChange} disabled={!editMode} />
                </div>
                <div className="form-group">
                  <label>Flat Type</label>
                  <select name="flatType" className="form-control" value={formData.flatType || ''} onChange={handleChange} disabled={!editMode}>
                    <option value="">Select</option>
                    <option>1BHK</option>
                    <option>2BHK</option>
                    <option>3BHK</option>
                    <option>Studio</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ownership Type</label>
                  <select name="ownershipType" className="form-control" value={formData.ownershipType || ''} onChange={handleChange} disabled={!editMode}>
                    <option value="">Select</option>
                    <option>Owner</option>
                    <option>Tenant</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Move-in Date</label>
                  <input name="moveInDate" type="date" className="form-control" value={formData.moveInDate?.split('T')[0] || ''} onChange={handleChange} disabled={!editMode} />
                </div>
              </div>
            </div>

            {editMode && (
              <div className="profile-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
