import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    vehicles: 0,
    maintenance: { paid: 0, pending: 0, overdue: 0 },
    complaints: { open: 0, inProgress: 0, resolved: 0 },
    compoundRequests: { pending: 0, approved: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [v, m, c, cr] = await Promise.all([
          api.get('/vehicles'),
          api.get('/maintenance'),
          api.get('/complaints'),
          api.get('/compound-requests'),
        ]);

        const maintenance = m.data;
        const complaints = c.data;
        const compoundRequests = cr.data;

        setStats({
          vehicles: v.data.length,
          maintenance: {
            paid: maintenance.filter((r) => r.status === 'Paid').length,
            pending: maintenance.filter((r) => r.status === 'Pending').length,
            overdue: maintenance.filter((r) => r.status === 'Overdue').length,
          },
          complaints: {
            open: complaints.filter((r) => r.status === 'Open').length,
            inProgress: complaints.filter((r) => r.status === 'In Progress').length,
            resolved: complaints.filter((r) => r.status === 'Resolved').length,
          },
          compoundRequests: {
            pending: compoundRequests.filter((r) => r.status === 'Pending').length,
            approved: compoundRequests.filter((r) => r.status === 'Approved').length,
          },
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      icon: '👤', title: 'My Profile',
      value: user?.fullName || '—',
      sub: `Flat ${user?.flatNumber || '—'} • ${user?.role || 'Resident'}`,
      link: '/profile', color: '#0071e3',
    },
    {
      icon: '🚗', title: 'My Vehicles',
      value: stats.vehicles,
      sub: 'Registered vehicles',
      link: '/vehicles', color: '#34c759',
    },
    {
      icon: '💰', title: 'Maintenance',
      value: stats.maintenance.pending + stats.maintenance.overdue > 0
        ? `${stats.maintenance.pending + stats.maintenance.overdue} Due`
        : 'All Paid',
      sub: `${stats.maintenance.paid} paid · ${stats.maintenance.overdue} overdue`,
      link: '/maintenance', color: stats.maintenance.overdue > 0 ? '#ff3b30' : '#34c759',
    },
    {
      icon: '🔧', title: 'Complaints',
      value: stats.complaints.open,
      sub: `${stats.complaints.inProgress} in progress · ${stats.complaints.resolved} resolved`,
      link: '/complaints', color: '#ff9f0a',
    },
    {
      icon: '🏟️', title: 'Compound Requests',
      value: stats.compoundRequests.pending,
      sub: `${stats.compoundRequests.approved} approved`,
      link: '/compound-requests', color: '#5e5ce6',
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="container fade-in">
        <div className="page-header">
          <h1>Good day, {user?.fullName?.split(' ')[0] || 'Resident'} 👋</h1>
          <p>Here's an overview of your Promesa Midtown portal</p>
        </div>

        {loading ? (
          <div className="loading-center">
            <span className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : (
          <>
            <div className="dashboard-grid">
              {cards.map((card, i) => (
                <Link to={card.link} key={i} className="dash-card card">
                  <div className="dash-card-icon" style={{ background: `${card.color}18`, color: card.color }}>
                    {card.icon}
                  </div>
                  <div className="dash-card-body">
                    <p className="dash-card-title">{card.title}</p>
                    <p className="dash-card-value">{card.value}</p>
                    <p className="dash-card-sub">{card.sub}</p>
                  </div>
                  <div className="dash-card-arrow">→</div>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="qa-grid">
                <Link to="/complaints" className="qa-btn">🔧 File a Complaint</Link>
                <Link to="/vehicles" className="qa-btn">🚗 Add Vehicle</Link>
                <Link to="/compound-requests" className="qa-btn">🏟️ Book Compound</Link>
                <Link to="/profile" className="qa-btn">👤 Update Profile</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
