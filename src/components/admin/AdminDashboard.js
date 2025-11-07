import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUsers, FiMap, FiCompass, FiCalendar, FiStar, FiHome, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.scss';

// Component imports for different management sections
import UserManagement from './sections/UserManagement';
import DestinationManagement from './sections/DestinationManagement';
import InterestManagement from './sections/InterestManagement';
import TripManagement from './sections/TripManagement';
import TripReviews from './sections/TripReviews';

const AdminDashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    users: 0,
    destinations: 0,
    interests: 0,
    trips: 0,
    reviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if user is admin, if not redirect to dashboard
    if (isAuthenticated && user && !user.is_staff && !user.is_superuser) {
      navigate('/dashboard');
      toast.error('You do not have permission to access the admin dashboard');
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/admin/stats/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        toast.error('Failed to load admin statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'destinations':
        return <DestinationManagement />;
      case 'interests':
        return <InterestManagement />;
      case 'trips':
        return <TripManagement />;
      case 'reviews':
        return <TripReviews />;
      default:
        return (
          <div className="dashboard-overview">
            <h2>Admin Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card users" onClick={() => setActiveSection('users')}>
                <FiUsers className="stat-icon" />
                <div className="stat-info">
                  <h3>Total Users</h3>
                  <p>{stats.users}</p>
                </div>
              </div>
              <div className="stat-card destinations" onClick={() => setActiveSection('destinations')}>
                <FiMap className="stat-icon" />
                <div className="stat-info">
                  <h3>Destinations</h3>
                  <p>{stats.destinations}</p>
                </div>
              </div>
              <div className="stat-card interests" onClick={() => setActiveSection('interests')}>
                <FiCompass className="stat-icon" />
                <div className="stat-info">
                  <h3>Travel Interests</h3>
                  <p>{stats.interests}</p>
                </div>
              </div>
              <div className="stat-card trips" onClick={() => setActiveSection('trips')}>
                <FiCalendar className="stat-icon" />
                <div className="stat-info">
                  <h3>Total Trips</h3>
                  <p>{stats.trips}</p>
                </div>
              </div>
              <div className="stat-card reviews" onClick={() => setActiveSection('reviews')}>
                <FiStar className="stat-icon" />
                <div className="stat-info">
                  <h3>Reviews</h3>
                  <p>{stats.reviews}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  return (
    <div className={`admin-dashboard ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>TravelBuddy</h2>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>
        <div className="sidebar-content">
          <div className="admin-info">
            <div className="admin-avatar">
              {user?.first_name?.charAt(0) || 'A'}
            </div>
            <div className="admin-details">
              <h3>{user?.first_name || 'Admin'} {user?.last_name || 'User'}</h3>
              <p>{user?.email || 'admin@example.com'}</p>
            </div>
          </div>
          <div className="sidebar-nav">
            <ul>
              <li className={activeSection === 'dashboard' ? 'active' : ''} onClick={() => setActiveSection('dashboard')}>
                <FiHome className="nav-icon" />
                <span>Dashboard</span>
              </li>
              <li className={activeSection === 'users' ? 'active' : ''} onClick={() => setActiveSection('users')}>
                <FiUsers className="nav-icon" />
                <span>Users</span>
              </li>
              <li className={activeSection === 'destinations' ? 'active' : ''} onClick={() => setActiveSection('destinations')}>
                <FiMap className="nav-icon" />
                <span>Destinations</span>
              </li>
              <li className={activeSection === 'interests' ? 'active' : ''} onClick={() => setActiveSection('interests')}>
                <FiCompass className="nav-icon" />
                <span>Travel Interests</span>
              </li>
              <li className={activeSection === 'trips' ? 'active' : ''} onClick={() => setActiveSection('trips')}>
                <FiCalendar className="nav-icon" />
                <span>Trips</span>
              </li>
              <li className={activeSection === 'reviews' ? 'active' : ''} onClick={() => setActiveSection('reviews')}>
                <FiStar className="nav-icon" />
                <span>Reviews</span>
              </li>
              <li className="logout" onClick={handleLogout}>
                <FiLogOut className="nav-icon" />
                <span>Logout</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="main-content">
        {loading ? (
          <div className="loading-spinner">Loading dashboard data...</div>
        ) : (
          renderActiveSection()
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
