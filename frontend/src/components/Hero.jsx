import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Hero.css';

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-content container">
        <div className="hero-badge">Society Management Portal</div>
        <h1 className="hero-title">
          Welcome to<br />
          <span className="hero-title-accent">Promesa Midtown</span>
        </h1>
        <p className="hero-subtitle">
          Pestom Sagar Road No 4, Chembur West 400089
        </p>
        <p className="hero-description">
          Your all-in-one society management platform. Manage maintenance, complaints,
          vehicles, and compound space requests — seamlessly.
        </p>
        <div className="hero-actions">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary hero-btn">
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary hero-btn">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary hero-btn">
                Sign In
              </Link>
            </>
          )}
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="stat-number">3+</span>
            <span className="stat-label">Towers</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="stat-number">200+</span>
            <span className="stat-label">Residents</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Support</span>
          </div>
        </div>
      </div>

      <div className="hero-scroll-indicator">
        <div className="scroll-dot" />
      </div>
    </section>
  );
};

export default Hero;
