import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏢</span>
          <div className="brand-text">
            <span className="brand-name">Promesa Midtown</span>
          </div>
        </Link>

        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          {user && (
            <>
              <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
              <Link to="/vehicles" className={isActive('/vehicles') ? 'active' : ''}>Vehicles</Link>
              <Link to="/maintenance" className={isActive('/maintenance') ? 'active' : ''}>Maintenance</Link>
              <Link to="/complaints" className={isActive('/complaints') ? 'active' : ''}>Complaints</Link>
              <Link to="/compound-requests" className={isActive('/compound-requests') ? 'active' : ''}>Compound</Link>
              {user.role === 'Admin' && (
                <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>Admin</Link>
              )}
            </>
          )}
        </div>

        <div className={`navbar-actions ${menuOpen ? 'open' : ''}`}>
          {user ? (
            <div className="user-menu">
              <Link to="/profile" className="user-avatar" title={user.fullName}>
                {user.fullName?.charAt(0).toUpperCase()}
              </Link>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
