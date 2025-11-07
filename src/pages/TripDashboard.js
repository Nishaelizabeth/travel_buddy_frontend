import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import ChatWindow from '../components/chat/ChatWindow';
import './TripDashboard.scss';
import Modal from '../components/common/Modal';
import Navbar from '../components/layout/Navbar';

const TripDashboard = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [showBuddiesModal, setShowBuddiesModal] = useState(false);
  const [removingMember, setRemovingMember] = useState(false);
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchTripDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);
  
  // We're using eslint-disable-next-line above because fetchTripDetails is defined
  // after this useEffect, and adding it to the dependency array would cause
  // a reference error. In a larger refactoring, we could move the function
  // definition before the useEffect.

  const fetchTripDetails = async () => {
    try {
      const response = await axiosInstance.get(`/trip/${tripId}/`);
      setTrip(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching trip details:', err);
      setError('Failed to load trip details');
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateDaysUntil = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const canModifyTrip = (startDate) => {
    // Check if it's at least 3 days before the trip starts
    return calculateDaysUntil(startDate) >= 3;
  };

  const handleCancelTrip = async () => {
    try {
      // Reset any previous messages
      setActionError(null);
      setActionSuccess(null);
      
      console.log('Attempting to cancel trip with ID:', tripId);
      // Make sure we're using the correct API endpoint path
      const response = await axiosInstance.post(`trip/${tripId}/cancel/`);
      console.log('Cancel trip response:', response.data);
      
      // Verify the trip was actually cancelled
      if (response.data && response.data.message) {
        console.log('Trip cancelled successfully');
        setActionSuccess(response.data.message);
        setShowCancelModal(false);
        
        // IMPORTANT: Mark this trip for complete removal from the UI
        try {
          // Get current trips from localStorage if available
          const currentTripsJson = localStorage.getItem('myTrips');
          if (currentTripsJson) {
            const currentTrips = JSON.parse(currentTripsJson);
            // Remove the cancelled trip completely
            const updatedTrips = currentTrips.filter(trip => trip.id !== parseInt(tripId));
            console.log(`Completely removing trip ${tripId} from localStorage`);
            // Save back to localStorage
            localStorage.setItem('myTrips', JSON.stringify(updatedTrips));
          }
        } catch (e) {
          console.error('Error updating trips in localStorage:', e);
        }
        
        // Force refresh the trip list in MyTrips when we navigate back
        localStorage.setItem('refreshTrips', 'true');
        localStorage.setItem('removedTripId', tripId);
        
        // Show success message briefly before redirecting
        // Add a message about notifications being sent to all members
        setActionSuccess(response.data.message + ' Notifications have been sent to all trip members.');
        setTimeout(() => {
          // Redirect to MyTrips page after successful cancellation
          navigate('/my-trips');
        }, 2000);
      }
    } catch (err) {
      console.error('Error cancelling trip:', err);
      console.error('Error details:', err.response?.data);
      setActionError(err.response?.data?.error || 'Failed to cancel trip');
    }
  };

  const handleLeaveTrip = async () => {
    try {
      // Reset any previous messages
      setActionError(null);
      setActionSuccess(null);
      
      console.log('Attempting to leave trip with ID:', tripId);
      // Make sure we're using the correct API endpoint path
      const response = await axiosInstance.post(`trip/${tripId}/leave/`);
      console.log('Leave trip response:', response.data);
      // Add a message about notifications being sent to all members
      setActionSuccess(response.data.message + ' Notifications have been sent to all trip members.');
      setShowLeaveModal(false);
      
      // Navigate back to my trips after leaving
      setTimeout(() => {
        navigate('/my-trips');
      }, 2000);
    } catch (err) {
      console.error('Error leaving trip:', err);
      console.error('Error details:', err.response?.data);
      setActionError(err.response?.data?.error || 'Failed to leave trip');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      // Reset any previous messages
      setActionError(null);
      setActionSuccess(null);
      setRemovingMember(true);
      
      console.log(`Attempting to remove member ${memberId} from trip ${tripId}`);
      // Make the API call to remove the member
      const response = await axiosInstance.post(`trip/${tripId}/remove-member/${memberId}/`);
      console.log('Remove member response:', response.data);
      
      // Show success message
      setActionSuccess(response.data.message + ' Notifications have been sent to all trip members.');
      setShowRemoveConfirmModal(false);
      setSelectedMember(null);
      
      // Refresh trip details to update the members list
      await fetchTripDetails();
    } catch (err) {
      console.error('Error removing member:', err);
      console.error('Error details:', err.response?.data);
      setActionError(err.response?.data?.error || 'Failed to remove member');
    } finally {
      setRemovingMember(false);
    }
  };

  const openRemoveConfirmModal = (member) => {
    setSelectedMember(member);
    setShowRemoveConfirmModal(true);
  };

  if (loading) return <div className="loading">Loading trip details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!trip) return <div className="error">Trip not found</div>;

  return (
    <div className="trip-dashboard">
      <Navbar />
      
      <div className="dashboard-content">
        {/* Show success message if action was successful */}
        {actionSuccess && <div className="success-message">{actionSuccess}</div>}
        
        {/* Show error message if there was an error */}
        {actionError && <div className="error-message">{actionError}</div>}
        
        <div className="action-buttons">
          <div className="left-buttons">
            <button 
              className="back-button"
              onClick={() => navigate('/my-trips')}
            >
              ← Back to My Trips
            </button>
          </div>
          
          <div className="right-buttons">
            {/* Show Leave Trip button only for trips joined by the user (not created) */}
            {trip.creator.id !== JSON.parse(localStorage.getItem('user')).id && (
              <button 
                className={`leave-button ${!canModifyTrip(trip.start_date) ? 'disabled' : ''}`}
                onClick={() => canModifyTrip(trip.start_date) ? setShowLeaveModal(true) : null}
                disabled={!canModifyTrip(trip.start_date) || trip.status === 'cancelled'}
                title={!canModifyTrip(trip.start_date) ? "You can only leave a trip at least 3 days before it starts!" : ""}
              >
                Leave Trip
              </button>
            )}
            
            {/* Show Cancel Trip button only for trips created by the user */}
            {trip.creator.id === JSON.parse(localStorage.getItem('user')).id && (
              <button 
                className={`secondary-button ${!canModifyTrip(trip.start_date) ? 'disabled' : ''}`}
                onClick={() => canModifyTrip(trip.start_date) ? setShowCancelModal(true) : null}
                disabled={!canModifyTrip(trip.start_date) || trip.status === 'cancelled'}
                title={!canModifyTrip(trip.start_date) ? "Cancellations are closed. You needed to cancel at least 3 days before the trip!" : ""}
              >
                {trip.status === 'cancelled' ? 'Trip Cancelled' : 'Cancel Trip'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Chat Window Modal */}
      <ChatWindow
        tripId={tripId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <div className="trip-container">
        <div className="trip-layout">
          {/* Left side - Destination Image */}
          <div className="image-container">
            <img 
              src={`http://localhost:8000${trip.destination.image}`} 
              alt={trip.destination.name}
              className="destination-image"
            />
          </div>
          
          {/* Right side - Content */}
          <div className="content-container">
            {/* Destination Title */}
            <h2 className="destination-title">{trip.destination.name}</h2>
            
            {/* Dates Section */}
            <div className="dates-section">
              <p className="trip-dates">
                {formatDateTime(trip.start_date)} - {formatDateTime(trip.end_date)}
              </p>
              {trip.start_date && calculateDaysUntil(trip.start_date) > 0 && (
                <p className="countdown">
                  {calculateDaysUntil(trip.start_date)} days to go
                </p>
              )}
            </div>
            
            {/* Two Column Section */}
            <div className="two-column-section">
              {/* Left Column - Activities */}
              <div className="activities-column">
                <h3>Activities</h3>
                <ul className="activities-list">
                  {trip.activities.map(activity => (
                    <li key={activity.id}>{activity.name}</li>
                  ))}
                </ul>
              </div>
              
              {/* Right Column - Creator, Members, Chat */}
              <div className="info-column">
                <div className="creator-section">
                  <h3>Created by</h3>
                  <div className="creator-info">
                    <img 
                      src={`http://localhost:8000${trip.creator.profile_picture}`} 
                      alt={trip.creator.username}
                      className="creator-avatar"
                    />
                    <span>{trip.creator.username}</span>
                  </div>
                  
                  {/* Description Section - Below creator info */}
                  {trip.description && (
                    <div className="description-section">
                      <h4>Description</h4>
                      <p>{trip.description}</p>
                    </div>
                  )}
                </div>
                
                <div className="members-section">
                  <div className="members-header">
                    <h3>Members</h3>
                    <button 
                      className="view-buddies-button"
                      onClick={() => setShowBuddiesModal(true)}
                    >
                      View Buddies
                    </button>
                  </div>
                  <p className="spots">
                    {trip.members.length}/{trip.max_members} spots filled
                  </p>
                  <div className="member-list">
                    {trip.members.map(member => (
                      <div key={member.id} className="member-item">
                        <img 
                          src={`http://localhost:8000${member.profile_picture}`} 
                          alt={member.username}
                          className="member-avatar"
                        />
                        <span>{member.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button 
                  className="chat-button"
                  onClick={() => setIsChatOpen(true)}
                >
                  Chat with Buddies
                </button>
              </div>
            </div>
            
            {/* Description moved to below the creator info */}
          </div>
        </div>
      </div>
      {/* Cancel Trip Confirmation Modal */}
      {showCancelModal && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Trip Confirmation"
        >
          <div className="confirmation-modal">
            <p>Are you sure you want to cancel this trip to {trip.destination.name}?</p>
            <p>This action cannot be undone and all members will be notified.</p>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={handleCancelTrip}>Yes, Cancel Trip</button>
              <button className="back-button" onClick={() => setShowCancelModal(false)}>No, Keep Trip</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Leave Trip Confirmation Modal */}
      {showLeaveModal && (
        <Modal
          isOpen={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          title="Leave Trip Confirmation"
        >
          <div className="confirmation-modal">
            <p>Are you sure you want to leave this trip to {trip.destination.name}?</p>
            <p>You will need to rejoin if you change your mind, subject to availability.</p>
            <div className="modal-buttons">
              <button className="leave-button" onClick={handleLeaveTrip}>Yes, Leave Trip</button>
              <button className="back-button" onClick={() => setShowLeaveModal(false)}>No, Stay in Trip</button>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Buddies Modal */}
      {showBuddiesModal && (
        <Modal
          isOpen={showBuddiesModal}
          onClose={() => setShowBuddiesModal(false)}
          title="Trip Buddies"
        >
          <div className="buddies-modal">
            <p>Other members of this trip to {trip.destination.name}</p>
            <div className="buddies-list">
              {trip.members
                .filter(member => member.id !== JSON.parse(localStorage.getItem('user')).id) // Filter out current user
                .map(member => (
                  <div key={member.id} className="buddy-item">
                    <div className="buddy-info">
                      <img 
                        src={`http://localhost:8000${member.profile_picture}`} 
                        alt={member.username}
                        className="buddy-avatar"
                      />
                      <span>{member.username}</span>
                    </div>
                    {/* Only show remove button for trip creator */}
                    {trip.creator.id === JSON.parse(localStorage.getItem('user')).id && (
                    <button 
                      className="remove-buddy-button"
                      onClick={() => openRemoveConfirmModal(member)}
                      disabled={!canModifyTrip(trip.start_date) || trip.status === 'cancelled'}
                      title={!canModifyTrip(trip.start_date) ? "Members can only be removed at least 3 days before the trip starts!" : ""}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="modal-buttons">
              <button className="back-button" onClick={() => setShowBuddiesModal(false)}>Close</button>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Remove Member Confirmation Modal */}
      {showRemoveConfirmModal && selectedMember && (
        <Modal
          isOpen={showRemoveConfirmModal}
          onClose={() => setShowRemoveConfirmModal(false)}
          title="Remove Member Confirmation"
        >
          <div className="confirmation-modal">
            <p>Are you sure you want to remove {selectedMember.username} from this trip?</p>
            <p>They will be notified and will need to rejoin if they want to participate again, subject to availability.</p>
            <div className="modal-buttons">
              <button 
                className="remove-button" 
                onClick={() => handleRemoveMember(selectedMember.id)}
                disabled={removingMember}
              >
                {removingMember ? 'Removing...' : 'Yes, Remove Member'}
              </button>
              <button 
                className="back-button" 
                onClick={() => setShowRemoveConfirmModal(false)}
                disabled={removingMember}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TripDashboard;
