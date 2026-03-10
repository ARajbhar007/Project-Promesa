import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Register.css';
import './Login.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Personal
    fullName: '', email: '', mobile: '', dateOfBirth: '',
    gender: '', emergencyContact: '',
    // Flat
    tower: '', flatNumber: '', floorNumber: '', flatType: '',
    ownershipType: '', moveInDate: '',
    // Account
    username: '', password: '', confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.mobile) {
        return toast.error('Please fill in required fields (Full Name, Email, Mobile)');
      }
    }
    if (step === 2) {
      if (!formData.flatNumber) {
        return toast.error('Flat number is required');
      }
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      return toast.error('Username and password are required');
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      await register(submitData);
      toast.success('Welcome to Promesa Midtown!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="register-card card">
        <div className="auth-header">
          <div className="auth-logo">🏢</div>
          <h1>Create Account</h1>
          <p>Join the Promesa Midtown community portal</p>
        </div>

        {/* Progress Steps */}
        <div className="register-steps">
          {['Personal Info', 'Flat Details', 'Account'].map((label, i) => (
            <div key={i} className={`step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
              <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="form-step fade-in">
              <div className="grid-2">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="fullName" className="form-control" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input name="email" type="email" className="form-control" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Mobile *</label>
                  <input name="mobile" className="form-control" placeholder="+91 98765 43210" value={formData.mobile} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Emergency Contact</label>
                  <input name="emergencyContact" className="form-control" placeholder="+91 98765 43210" value={formData.emergencyContact} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input name="dateOfBirth" type="date" className="form-control" value={formData.dateOfBirth} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <button type="button" className="btn btn-primary step-btn" onClick={nextStep}>Next: Flat Details →</button>
            </div>
          )}

          {/* Step 2: Flat Info */}
          {step === 2 && (
            <div className="form-step fade-in">
              <div className="grid-2">
                <div className="form-group">
                  <label>Tower / Building</label>
                  <input name="tower" className="form-control" placeholder="Tower A" value={formData.tower} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Flat Number *</label>
                  <input name="flatNumber" className="form-control" placeholder="A-101" value={formData.flatNumber} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Floor Number</label>
                  <input name="floorNumber" type="number" className="form-control" placeholder="1" value={formData.floorNumber} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Flat Type</label>
                  <select name="flatType" className="form-control" value={formData.flatType} onChange={handleChange}>
                    <option value="">Select type</option>
                    <option>1BHK</option>
                    <option>2BHK</option>
                    <option>3BHK</option>
                    <option>Studio</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ownership Type</label>
                  <select name="ownershipType" className="form-control" value={formData.ownershipType} onChange={handleChange}>
                    <option value="">Select type</option>
                    <option>Owner</option>
                    <option>Tenant</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Move-in Date</label>
                  <input name="moveInDate" type="date" className="form-control" value={formData.moveInDate} onChange={handleChange} />
                </div>
              </div>
              <div className="step-actions">
                <button type="button" className="btn btn-secondary" onClick={prevStep}>← Back</button>
                <button type="button" className="btn btn-primary" onClick={nextStep}>Next: Account →</button>
              </div>
            </div>
          )}

          {/* Step 3: Account */}
          {step === 3 && (
            <div className="form-step fade-in">
              <div className="grid-2">
                <div className="form-group">
                  <label>Username *</label>
                  <input name="username" className="form-control" placeholder="johndoe123" value={formData.username} onChange={handleChange} required />
                </div>
                <div className="form-group" />
                <div className="form-group">
                  <label>Password *</label>
                  <input name="password" type="password" className="form-control" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input name="confirmPassword" type="password" className="form-control" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
              </div>
              <div className="step-actions">
                <button type="button" className="btn btn-secondary" onClick={prevStep}>← Back</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Creating...</> : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
