import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/Toast.css';
import Navbar from './components/layout/Navbar';
import HomePage from './components/HomePage';
import SignIn from './components/auth/SignIn';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Destinations from './components/destinations/Destinations';
import DestinationDetails from './components/destinations/DestinationDetails';
import Profile from './components/profile/Profile';
import UserDashboard from './components/profile/UserDashboard';
import MyTrips from './components/trips/MyTrips';
import CompatibleTrips from './pages/CompatibleTripsPage';
import TripDashboard from './pages/TripDashboard';
import PaymentPage from './pages/PaymentPage';
import AdminDashboard from './components/admin/AdminDashboard';
import axios from 'axios';
import './App.scss';

function App() {
  const { user, isAuthenticated } = useAuth();
  const [preferencesSet, setPreferencesSet] = useState(false);

  useEffect(() => {
    const checkPreferences = async () => {
      if (isAuthenticated) {
        try {
          const token = localStorage.getItem('accessToken');

          const response = await axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/profile/', {

            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          setPreferencesSet(!!response.data.preferences?.travel_frequency && !!response.data.preferences?.travel_budget);
        } catch (error) {
          console.error('Error checking preferences:', error);
        }
      }
    };

    checkPreferences();
  }, [isAuthenticated]);

  // Check if user is on admin dashboard to hide navbar
  const isAdminDashboard = window.location.pathname === '/admin-dashboard';
  const shouldShowNavbar = !(isAuthenticated && user?.is_staff && isAdminDashboard);

  return (
    <div className="app">
      {shouldShowNavbar && <Navbar />}
      <main className={`main-content ${!shouldShowNavbar ? 'no-navbar' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
                <SignIn /> : 
                <Navigate to={preferencesSet ? "/destinations" : "/profile"} replace />
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route 
            path="/destinations" 
            element={
              isAuthenticated && preferencesSet ? 
                <Destinations /> : 
                <Navigate to={isAuthenticated ? "/profile" : "/login"} replace />
            }
          />
          <Route 
            path="/destinations/:id" 
            element={
              isAuthenticated && preferencesSet ? 
                <DestinationDetails /> : 
                <Navigate to={isAuthenticated ? "/profile" : "/login"} replace />
            }
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? 
                <Profile /> : 
                <Navigate to="/login" replace />
            }
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
                <UserDashboard /> : 
                <Navigate to="/login" replace />
            }
          />
          <Route 
            path="/admin-dashboard" 
            element={
              isAuthenticated ? 
                (user?.is_staff || user?.is_superuser) ? <AdminDashboard /> : <Navigate to="/dashboard" replace /> :
                <Navigate to="/login" replace />
            }
          />
          <Route 
            path="/trip/:tripId" 
            element={
              isAuthenticated ? 
                <TripDashboard /> : 
                <Navigate to="/login" replace />
            }
          />
          {/* Buddy Profile route removed - component not available */}
          {/* Buddy Requests Page route removed - component not available */}
          {/* Buddy Requests route removed - component not available */}
          <Route 
            path="/my-trips" 
            element={isAuthenticated ? <MyTrips /> : <Navigate to="/login" replace />}
          />
          {/* Travel Buddies route removed - component not available */}
          {/* My Buddies route removed - component not available */}
          <Route 
            path="/compatible-trips" 
            element={
              isAuthenticated && preferencesSet ? 
                <CompatibleTrips /> : 
                <Navigate to={isAuthenticated ? "/profile" : "/login"} replace />
            }
          />
          <Route 
            path="/trips/:tripId" 
            element={
              isAuthenticated && preferencesSet ? 
                <TripDashboard /> : 
                <Navigate to={isAuthenticated ? "/profile" : "/login"} replace />
            }
          />
          <Route 
            path="/browse-trips" 
            element={<Navigate to="/" replace />} 
          />

          <Route 
            path="/payment" 
            element={
              isAuthenticated ? 
                <PaymentPage /> : 
                <Navigate to="/login" replace />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

// Assign arrow function to a variable before exporting to fix ESLint warning
const AppWithProvider = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWithProvider;
