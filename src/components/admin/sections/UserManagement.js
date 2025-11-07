import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUser, FiEye, FiMail, FiPhone, FiCheck, FiX } from 'react-icons/fi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/admin/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Function to get profile picture URL or return initial avatar
  const getProfilePicture = (user) => {
    if (user.profile_picture) {
      return user.profile_picture;
    }
    return null;
  };

  // Function to get user initials for avatar placeholder
  const getUserInitials = (user) => {
    if (user.full_name && user.full_name.trim() !== '') {
      return user.full_name.charAt(0).toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <div className="user-management">
      <div className="section-header">
        <h2>User Management</h2>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading users...</div>
      ) : (
        <div className="user-list-container">
          {users.map(user => (
            <div className="user-card" key={user.id}>
              <div className="user-avatar">
                {getProfilePicture(user) ? (
                  <img src={getProfilePicture(user)} alt={user.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {getUserInitials(user)}
                  </div>
                )}
              </div>
              <div className="user-info">
                <h3 className="user-name">{user.full_name || 'No Name'}</h3>
                <p className="user-username">@{user.username}</p>
              </div>
              <button 
                className="btn btn-view" 
                onClick={() => handleViewUser(user)}
              >
                <FiEye /> View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') setShowModal(false);
        }}>
          <div className="modal user-detail-modal">
            <div className="modal-header">
              <h3><FiUser /> User Profile Details</h3>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="user-profile-detail">
                <div className="user-profile-header">
                  <div className="user-avatar-large">
                    {getProfilePicture(selectedUser) ? (
                      <img src={getProfilePicture(selectedUser)} alt={selectedUser.username} />
                    ) : (
                      <div className="avatar-placeholder-large">
                        {getUserInitials(selectedUser)}
                      </div>
                    )}
                  </div>
                  <div className="user-header-info">
                    <h2>{selectedUser.full_name || 'No Name'}</h2>
                    <p className="username">@{selectedUser.username}</p>
                    <div className="user-status">
                      <span className={`status-badge ${selectedUser.is_staff ? 'admin' : 'user'}`}>
                        {selectedUser.is_staff ? 'Admin' : 'User'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="user-details-grid">
                  <div className="detail-item">
                    <div className="detail-icon"><FiMail /></div>
                    <div className="detail-content">
                      <h4>Email</h4>
                      <p>{selectedUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon"><FiPhone /></div>
                    <div className="detail-content">
                      <h4>Phone</h4>
                      <p>{selectedUser.phone_number || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon"><FiUser /></div>
                    <div className="detail-content">
                      <h4>Gender</h4>
                      <p>{selectedUser.gender_display || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <div className="detail-content">
                      <h4>Age</h4>
                      <p>{selectedUser.age || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    </div>
                    <div className="detail-content">
                      <h4>Trips Created</h4>
                      <p>{selectedUser.created_trips_count || 0}</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                    </div>
                    <div className="detail-content">
                      <h4>Trips Joined</h4>
                      <p>{selectedUser.joined_trips_count || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-close" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
