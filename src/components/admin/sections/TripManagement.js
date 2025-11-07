import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEye, FiTrash2, FiPlus, FiUsers, FiX, FiCalendar, FiFilter, FiChevronDown } from 'react-icons/fi';
import './TripManagement.scss'; // Import the custom styles

const TripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tripMembers, setTripMembers] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [formData, setFormData] = useState({
    user: '',
    destination: '',
    start_date: '',
    end_date: '',
    max_members: 4,
    status: 'open',
    description: '',
    activities: []
  });
  const [filteredTrips, setFilteredTrips] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    // Apply status filters when trips or active filter changes
    if (trips.length > 0) {
      applyStatusFilter();
    }
  }, [trips, activeFilter]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [tripsRes, destinationsRes, usersRes, activitiesRes] = await Promise.all([
        axios.get('http://localhost:8000/api/admin/trips/', { headers }),
        axios.get('http://localhost:8000/api/admin/destinations/', { headers }),
        axios.get('http://localhost:8000/api/admin/users/', { headers }),
        axios.get('http://localhost:8000/api/admin/interests/', { headers }) // Using interests as activities
      ]);

      // Sort trips by created_at date (newest first - latest created)
      const sortedTrips = tripsRes.data.sort((a, b) => {
        return new Date(b.created_at || b.start_date) - new Date(a.created_at || a.start_date);
      });

      setTrips(sortedTrips);
      setFilteredTrips(sortedTrips);
      setDestinations(destinationsRes.data);
      setUsers(usersRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (trip) => {
    setSelectedTrip(trip);
    setFormData({
      user: trip.user.id,
      destination: trip.destination.id,
      start_date: trip.start_date.split('T')[0], // Format date for input
      end_date: trip.end_date.split('T')[0], // Format date for input
      max_members: trip.max_members,
      status: trip.status,
      description: trip.description || '',
      activities: trip.activities && Array.isArray(trip.activities) ? trip.activities.map(activity => activity.id) : []
    });
    setShowModal(true);
  };

  const handleViewMembers = async (trip) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:8000/api/admin/trips/${trip.id}/members/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setTripMembers(response.data);
      setSelectedTrip(trip);
      setShowMembersModal(true);
    } catch (error) {
      console.error('Error fetching trip members:', error);
      toast.error('Failed to load trip members');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:8000/api/admin/trips/${selectedTrip.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      toast.success('Trip deleted successfully');
      setShowDeleteConfirm(false);
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete trip');
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (name === 'activities') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData({
        ...formData,
        activities: selectedOptions
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (selectedTrip) {
        // Update existing trip
        await axios.put(
          `http://localhost:8000/api/admin/trips/${selectedTrip.id}/`, 
          formData,
          { headers }
        );
        toast.success('Trip updated successfully');
      } else {
        // Create new trip
        await axios.post(
          'http://localhost:8000/api/admin/trips/', 
          formData,
          { headers }
        );
        toast.success('Trip created successfully');
      }
      setShowModal(false);
      setSelectedTrip(null);
      setFormData({
        user: '',
        destination: '',
        start_date: '',
        end_date: '',
        max_members: 4,
        status: 'open',
        description: '',
        activities: []
      });
      fetchData();
    } catch (error) {
      console.error('Error saving trip:', error);
      toast.error(error.response?.data?.message || 'Failed to save trip');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const applyStatusFilter = () => {
    if (activeFilter === 'all') {
      setFilteredTrips(trips);
      return;
    }
    
    // Special handling for cancelled trips - use the is_cancelled flag
    if (activeFilter === 'cancelled') {
      const cancelledTrips = trips.filter(trip => trip.is_cancelled || trip.status === 'cancelled');
      setFilteredTrips(cancelledTrips);
      return;
    }
    
    // For other statuses, use the computed status from getTripStatus
    const filtered = trips.filter(trip => {
      // Skip cancelled trips for other filters
      if (trip.is_cancelled || trip.status === 'cancelled') {
        return false;
      }
      
      const status = getTripStatus(trip);
      return status.className === activeFilter;
    });
    
    setFilteredTrips(filtered);
  };
  
  const statusColors = {
    all: { bg: '#6c757d', hover: '#5a6268', active: '#495057' },
    upcoming: { bg: '#3498db', hover: '#2980b9', active: '#1f6aa8' },
    ongoing: { bg: '#f39c12', hover: '#e67e22', active: '#d35400' },
    completed: { bg: '#2ecc71', hover: '#27ae60', active: '#219653' },
    cancelled: { bg: '#e74c3c', hover: '#c0392b', active: '#a93226' }
  };
  
  const getTripStatus = (trip) => {
    // First check if the trip is cancelled (this overrides other statuses)
    if (trip.is_cancelled || trip.status === 'cancelled') {
      return { text: 'Cancelled', className: 'cancelled', color: statusColors.cancelled.bg };
    }
    
    const now = new Date();
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    
    if (endDate < now) {
      return { text: 'Completed', className: 'completed', color: statusColors.completed.bg };
    } else if (startDate > now) {
      return { text: 'Upcoming', className: 'upcoming', color: statusColors.upcoming.bg };
    } else {
      return { text: 'Ongoing', className: 'ongoing', color: statusColors.ongoing.bg };
    }
  };
  
  const getMemberCount = (trip) => {
    // The members_count from the API doesn't include the creator
    // We need to add 1 to include the creator in the total count
    const memberCount = (trip.members_count || 0) + 1;
    return memberCount;
  };

  return (
    <div className="trip-management">
      <div className="section-header">
        <h2>Trip Management</h2>
      </div>

      <div className="status-filter-tabs">
        {Object.keys(statusColors).map(status => (
          <button 
            key={status}
            className={`status-tab ${activeFilter === status ? 'active' : ''}`}
            onClick={() => setActiveFilter(status)}
            style={{
              backgroundColor: activeFilter === status ? statusColors[status].active : statusColors[status].bg,
              borderColor: statusColors[status].hover,
              color: '#ffffff',
              fontWeight: 'bold',
              padding: '8px 16px',
              margin: '0 5px 10px 0',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeFilter === status ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
            }}
            onMouseOver={(e) => {
              if (activeFilter !== status) {
                e.target.style.backgroundColor = statusColors[status].hover;
              }
            }}
            onMouseOut={(e) => {
              if (activeFilter !== status) {
                e.target.style.backgroundColor = statusColors[status].bg;
              }
            }}
          >
            {status === 'all' ? 'All Trips' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="loading-spinner">Loading trips...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Destination</th>
                <th>Date Range</th>
                <th>Created By</th>
                <th>Members</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length > 0 ? (
                filteredTrips.map(trip => {
                  const status = getTripStatus(trip);
                  return (
                    <tr key={trip.id}>
                      <td>{trip.destination.name}</td>
                      <td>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</td>
                      <td>{trip.user.username}</td>
                      <td>
                        <button 
                          className="btn btn-rectangle btn-members" 
                          onClick={() => handleViewMembers(trip)}
                        >
                          <FiUsers /> {getMemberCount(trip)}
                        </button>
                      </td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: status.color }}>
                          {status.text}
                          {trip.status === 'cancelled' && trip.cancelled_by && (
                            <span className="cancelled-info" title={`Cancelled on ${new Date(trip.cancelled_at).toLocaleString()}`}>
                              by {trip.cancelled_by.username}
                            </span>
                          )}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-rectangle btn-danger" onClick={() => {
                          setSelectedTrip(trip);
                          setShowDeleteConfirm(true);
                        }}>
                          <FiTrash2 /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">No trips found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal destination-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedTrip ? 'Trip Details' : 'Add New Trip'}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="user">Created By</label>
                <select
                  id="user"
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="destination">Destination</label>
                <select
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Destination</option>
                  {destinations.map(destination => (
                    <option key={destination.id} value={destination.id}>
                      {destination.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_date">Start Date</label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="end_date">End Date</label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="max_members">Max Members</label>
                  <input
                    type="number"
                    id="max_members"
                    name="max_members"
                    value={formData.max_members}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="open">Open</option>
                    <option value="full">Full</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="activities">Activities</label>
                <select
                  id="activities"
                  name="activities"
                  value={formData.activities}
                  onChange={handleChange}
                  multiple
                  size="5"
                >
                  {activities.map(activity => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
                <small>Hold Ctrl/Cmd to select multiple activities</small>
              </div>
              <div className="modal-footer">
                {selectedTrip ? (
                  <>
                    <button 
                      type="button" 
                      className="btn btn-danger" 
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <FiTrash2 /> Delete Trip
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                    >
                      Create Trip
                    </button>
                  </>
                )}
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {showMembersModal && selectedTrip && (
        <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
          <div className="modal destination-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Trip Members - {selectedTrip.destination.name}</h3>
              <button className="modal-close-btn" onClick={() => setShowMembersModal(false)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-body">
            <div className="members-list">
              {tripMembers.length > 0 ? (
                <ul>
                  {tripMembers.map(member => (
                    <li key={member.id} className="member-item">
                      <div className="member-avatar">
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-info">
                        <h4>{member.username}</h4>
                        <p>{member.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-members">No members have joined this trip yet.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowMembersModal(false)}>Close</button>
            </div>
            </div>
          </div>
        </div>
      )}
      
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal delete-confirm-modal">
            <div className="modal-header">
              <h3><FiTrash2 /> Confirm Deletion</h3>
              <button className="modal-close-btn" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the trip to <strong>{selectedTrip?.destination.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDelete}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripManagement;
