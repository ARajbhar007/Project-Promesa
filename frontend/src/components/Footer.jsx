import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span>🏢</span>
              <strong>Promesa Midtown</strong>
            </div>
            <p className="footer-address">
              Pestom Sagar Road No 4,<br />
              Chembur West 400089,<br />
              Mumbai, Maharashtra
            </p>
            <p className="footer-contact">
              📞 +91 98765 43210<br />
              ✉️ admin@promesa-midtown.in
            </p>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/complaints">Complaints</Link></li>
              <li><Link to="/vehicles">Vehicles</Link></li>
              <li><Link to="/compound-requests">Compound Space</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Promesa Midtown. All rights reserved.</p>
          <p>Built with ❤️ for the residents of Promesa Midtown</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
