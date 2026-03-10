import Hero from '../components/Hero';
import { Link } from 'react-router-dom';
import './Home.css';

const features = [
  { icon: '👤', title: 'Profile Management', desc: 'Manage your personal and flat information in one place.' },
  { icon: '🚗', title: 'Vehicle Tracking', desc: 'Register and manage your vehicles and parking slots.' },
  { icon: '💰', title: 'Maintenance', desc: 'Track monthly maintenance payments and pending dues.' },
  { icon: '🔧', title: 'Complaints', desc: 'File and track complaints with real-time status updates.' },
  { icon: '🏟️', title: 'Compound Requests', desc: 'Book compound space for events and get admin approval.' },
  { icon: '🔐', title: 'Secure Access', desc: 'JWT-secured authentication with role-based access control.' },
];

const Home = () => {
  return (
    <div className="home">
      <Hero />

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Everything you need to manage your society</h2>
            <p>A comprehensive portal built for Promesa Midtown residents and management</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to get started?</h2>
            <p>Join the Promesa Midtown community portal today.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary">Create Account</Link>
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
