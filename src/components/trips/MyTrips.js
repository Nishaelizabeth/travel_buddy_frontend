import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import './MyTrips.scss';
import { FaMapMarkerAlt, FaCalendarAlt, FaPlane, FaArrowRight, FaPlus, FaStar, FaRegStar, FaTimes, FaCheck, FaEye, FaEdit } from 'react-icons/fa';
import { MdTravelExplore, MdLocationOn, MdDateRange, MdRateReview } from 'react-icons/md';
import { BsCalendarRange, BsCalendarCheck } from 'react-icons/bs';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [reviews, setReviews] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyTrips();
    fetchReviews();
    
    // Check if we need to refresh trips (set by TripDashboard after cancellation)
    const refreshTrips = localStorage.getItem('refreshTrips');
    const showCancelledTrips = localStorage.getItem('showCancelledTrips');
    const lastCancelledTripId = localStorage.getItem('lastCancelledTripId');
    
    if (refreshTrips === 'true') {
      console.log('Refresh flag detected, refreshing trips');
      // Clear the refresh flag
      localStorage.removeItem('refreshTrips');
      
      // Set a small delay to ensure the backend has processed the cancellation
      setTimeout(() => {
        // Fetch fresh data from the server
        fetchMyTrips();
        
        // If showCancelledTrips flag is set, switch to the cancelled filter
        if (showCancelledTrips === 'true') {
          console.log('Showing cancelled trips as requested');
          localStorage.removeItem('showCancelledTrips');
          setActiveFilter('cancelled');
          
          // If we have a specific cancelled trip ID, log it for debugging
          if (lastCancelledTripId) {
            console.log(`Looking for recently cancelled trip with ID: ${lastCancelledTripId}`);
            localStorage.removeItem('lastCancelledTripId');
          }
        }
      }, 1000);  // Increased delay to ensure backend processing is complete
    }
    
    // Add an event listener to refresh trips when the component is focused
    // This ensures trips are refreshed when returning from TripDashboard after cancellation
    const handleFocus = () => {
      console.log('Window focused, refreshing trips');
      fetchMyTrips();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  useEffect(() => {
    if (trips.length > 0) {
      filterTrips(activeFilter);
    }
  }, [trips, activeFilter]);

  const fetchMyTrips = async () => {
    try {
      console.log('Fetching trips from server...');
      const response = await axiosInstance.get('/my-trips/');
      console.log('Trips received:', response.data);
      
      // Check if we have a recently removed trip ID
      const removedTripId = localStorage.getItem('removedTripId');
      
      // Process trips and remove any cancelled trips
      const processedTrips = response.data.filter(trip => {
        // Remove any trips with 'cancelled' status
        if (trip.status === 'cancelled') {
          console.log(`Removing cancelled trip: ID=${trip.id}, Destination=${trip.destination_name}`);
          return false;
        }
        
        // Also remove the specific trip that was just cancelled
        if (removedTripId && trip.id === parseInt(removedTripId)) {
          console.log(`Removing recently cancelled trip: ID=${trip.id}`);
          return false;
        }
        
        // Log each remaining trip for debugging
        console.log(`Trip ID: ${trip.id}, Destination: ${trip.destination_name}, Status: ${trip.status}`);
        return true;
      });
      
      // Save processed trips to localStorage for future reference
      localStorage.setItem('myTrips', JSON.stringify(processedTrips));
      
      console.log(`Removed all cancelled trips. Remaining trips: ${processedTrips.length}`);
      
      // Update the trips state with filtered trips (no cancelled trips)
      setTrips(processedTrips);
      
      // Update filtered trips based on current filter
      if (activeFilter === 'all') {
        // For 'all' filter, explicitly exclude any trips with 'cancelled' status
        const filtered = processedTrips.filter(trip => trip.status !== 'cancelled');
        console.log('All active trips (excluding cancelled):', filtered);
        setFilteredTrips(filtered);
      } else if (activeFilter === 'cancelled') {
        // For cancelled filter, only show trips with 'cancelled' status
        const filtered = processedTrips.filter(trip => trip.status === 'cancelled');
        console.log('Cancelled trips found:', filtered);
        
        if (filtered.length === 0) {
          console.warn('No cancelled trips found in the data from the server');
        }
        
        setFilteredTrips(filtered);
      } else {
        // For other filters, filter by status and exclude cancelled
        const filtered = processedTrips.filter(trip => trip.status === activeFilter);
        console.log(`Filtered ${activeFilter} trips:`, filtered);
        setFilteredTrips(filtered);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to fetch your trips. Please try again later.');
      setLoading(false);
    }
  };
  
  const filterTrips = (status) => {
    console.log(`Filtering trips by status: ${status}`);
    console.log('All trips before filtering:', trips);
    
    if (status === 'all') {
      // For 'all' filter, show all trips (cancelled trips are already removed)
      console.log('Showing all active trips');
      setFilteredTrips(trips);
    } else {
      // For other filters (upcoming, ongoing, completed)
      const filtered = trips.filter(trip => trip.status === status);
      console.log(`Filtered ${status} trips:`, filtered);
      setFilteredTrips(filtered);
    }
    setActiveFilter(status);
  };

  const fetchReviews = async () => {
    try {
      const response = await axiosInstance.get('/trip-reviews/');
      const reviewsData = {};
      response.data.forEach(review => {
        reviewsData[review.trip] = review;  // Changed from trip_id to trip to match backend model
      });
      setReviews(reviewsData);
      console.log('Fetched reviews:', reviewsData);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleOpenReviewModal = (trip) => {
    // Check if the trip is actually completed based on dates
    const currentDate = new Date();
    const endDate = new Date(trip.end_date);
    
    // If the trip's end date is in the past and it's not cancelled, it should be marked as completed
    if (endDate < currentDate && trip.status !== 'cancelled') {
      // Update the local trip status to completed
      const updatedTrip = { ...trip, status: 'completed' };
      setSelectedTrip(updatedTrip);
      
      // Also update the trip in the trips array
      const updatedTrips = trips.map(t => {
        if (t.id === trip.id) {
          return { ...t, status: 'completed' };
        }
        return t;
      });
      setTrips(updatedTrips);
      
      console.log(`Updated trip ${trip.id} status to 'completed' locally`);
    } else {
      setSelectedTrip(trip);
    }
    
    setRating(reviews[trip.id]?.rating || 0);
    setReviewText(reviews[trip.id]?.comment || '');
    setShowReviewModal(true);
    setSubmitSuccess(false);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedTrip(null);
    setRating(0);
    setHoverRating(0);
    setReviewText('');
    setSubmitSuccess(false);
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleReviewTextChange = (e) => {
    if (e.target.value.length <= 250) {
      setReviewText(e.target.value);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return;
    
    // Validate that the trip is completed before submitting review
    if (selectedTrip.status !== 'completed') {
      alert('Reviews can only be submitted for completed trips.');
      setSubmitting(false);
      return;
    }
    
    setSubmitting(true);
    try {
      // Make sure we're sending all required fields in the correct format
      const reviewData = {
        trip: parseInt(selectedTrip.id), // Ensure trip ID is a number
        rating: parseInt(rating), // Ensure rating is a number
        comment: reviewText || '' // Ensure comment is never null
      };
      
      console.log('Sending review data with types:', {
        'trip (type)': typeof reviewData.trip,
        'trip (value)': reviewData.trip,
        'rating (type)': typeof reviewData.rating,
        'rating (value)': reviewData.rating,
        'comment (type)': typeof reviewData.comment,
        'comment (value)': reviewData.comment
      });
      
      console.log('Submitting review data:', reviewData);
      
      // Submit the review directly without testing the endpoint first
      const response = await axiosInstance.post('/trip-reviews/', reviewData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Review submission response:', response.data);
      
      // Update the reviews state with the new review
      setReviews(prev => ({
        ...prev,
        [selectedTrip.id]: response.data
      }));
      
      setSubmitSuccess(true);
      
      // Close modal after a short delay to show success animation
      setTimeout(() => {
        handleCloseReviewModal();
        // Refresh reviews after submission
        fetchReviews();
      }, 1500);
    } catch (err) {
      console.error('Error submitting review:', err);
      
      // Log detailed error information for debugging
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
        console.error('Error response headers:', err.response.headers);
      } else if (err.request) {
        console.error('Error request:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      
      // Extract the specific error message from the response if available
      let errorMessage = 'Failed to submit review. Please try again.';
      if (err.response && err.response.data) {
        console.log('Response data type:', typeof err.response.data);
        console.log('Response data:', JSON.stringify(err.response.data));
        
        if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (typeof err.response.data === 'object') {
          // If it's a validation error with multiple fields
          const fieldErrors = Object.entries(err.response.data)
            .map(([field, errors]) => {
              console.log(`Field ${field}:`, errors);
              return `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`;
            })
            .join(' - ');
          if (fieldErrors) {
            errorMessage = `Validation errors: ${fieldErrors}`;
          }
        }
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewBuddies = (trip) => {
    // Store trip details in session storage for TravelBuddies component
    sessionStorage.setItem('tripDetails', JSON.stringify({
      tripId: trip.id,
      destinationId: trip.destination,
      destinationName: trip.destination_name,
      activities: trip.activities,
      startDate: trip.start_date,
      endDate: trip.end_date
    }));
    navigate(`/travel-buddies/${trip.id}`);
  };

  if (loading) {
    return (
      <div className="my-trips-container">
        <div className="loading">Loading your trips...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-trips-container">
        <div className="error">
          <FaPlane className="error-icon" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-trips-container">
      <h1><MdTravelExplore /> My Trips</h1>
      
      {trips.length > 0 && (
        <div className="trip-filters">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => filterTrips('all')}
          >
            Active Trips
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => filterTrips('upcoming')}
          >
            <span className="filter-badge upcoming">Upcoming</span>
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'ongoing' ? 'active' : ''}`}
            onClick={() => filterTrips('ongoing')}
          >
            <span className="filter-badge ongoing">Ongoing</span>
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => filterTrips('completed')}
          >
            <span className="filter-badge completed">Completed</span>
          </button>
          {/* Cancelled toggle bar removed as requested */}
        </div>
      )}
      
      {trips.length === 0 ? (
        <div className="no-trips">
          <FaPlane style={{ fontSize: '3rem', marginBottom: '1rem', opacity: '0.6' }} />
          <p>You haven't created any trips yet.</p>
          <button onClick={() => navigate('/destinations')} className="create-trip-btn">
            <FaPlus /> Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="trips-table-container">
          {filteredTrips.length === 0 ? (
            <div className="no-filtered-trips">
              <p>No {activeFilter !== 'all' ? activeFilter : ''} trips found.</p>
            </div>
          ) : (
            <table className="trips-table">
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Location</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip) => {
                  // Calculate trip duration for display
                  const startDate = new Date(trip.start_date);
                  const endDate = new Date(trip.end_date);
                  const tripDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={trip.id} className={`trip-row ${trip.status}`}>
                      <td className="destination-cell">{trip.destination_name}</td>
                      <td className="location-cell"><MdLocationOn className="cell-icon" />{trip.destination_location}</td>
                      <td className="date-cell">
                        <span><BsCalendarRange className="cell-icon" />{startDate.toLocaleDateString()}</span>
                      </td>
                      <td className="date-cell">
                        <span><BsCalendarCheck className="cell-icon" />{endDate.toLocaleDateString()}</span>
                      </td>
                      <td className="duration-cell">
                        <span>{tripDuration} {tripDuration === 1 ? 'day' : 'days'}</span>
                      </td>
                      <td className="status-cell">
                        {trip.status === 'cancelled' && trip.cancelled_by_info ? (
                          <div className="cancelled-info">
                            <span className={`status-badge ${trip.status}`}>
                              {trip.cancelled_by_info.is_creator ? 
                                (trip.user === JSON.parse(localStorage.getItem('user')).id ? 'Cancelled by you' : `Cancelled by ${trip.cancelled_by_info.username}`) : 
                                `Cancelled by ${trip.cancelled_by_info.username}`}
                            </span>
                            {trip.cancelled_by_info.cancelled_at && (
                              <span className="cancelled-date">
                                on {new Date(trip.cancelled_by_info.cancelled_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className={`status-badge ${trip.status}`}>
                            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons-vertical">
                          <button 
                            className="view-trip-button"
                            onClick={() => navigate(`/trips/${trip.id}`)}
                            title="View Trip Details"
                          >
                            <FaEye /> View
                          </button>
                          {trip.status === 'completed' && (
                            <button 
                              className="review-trip-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReviewModal(trip);
                              }}
                              title={reviews[trip.id] ? 'Edit Review' : 'Add Review'}
                            >
                              <MdRateReview /> Review
                            </button>
                          )}
                        </div>
                        {reviews[trip.id] && (
                          <div className="trip-review-rating">
                            {[...Array(5)].map((_, index) => (
                              <span key={index}>
                                {index < reviews[trip.id].rating ? <FaStar className="star-filled" /> : <FaRegStar className="star-empty" />}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
      {/* Review Modal */}
      {showReviewModal && selectedTrip && (
        <div className="review-modal-overlay" onClick={handleCloseReviewModal}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h3>Review Your Trip</h3>
              <button className="close-button" onClick={handleCloseReviewModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="review-modal-content">
              <h4>{selectedTrip.destination_name}</h4>
              <p className="trip-dates">
                {new Date(selectedTrip.start_date).toLocaleDateString()} - {new Date(selectedTrip.end_date).toLocaleDateString()}
              </p>
              
              <div className="rating-container">
                <p>Rate your experience:</p>
                <div className="star-rating">
                  {[...Array(5)].map((_, index) => {
                    const starValue = index + 1;
                    return (
                      <span 
                        key={index} 
                        className="star"
                        onClick={() => handleRatingChange(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        {starValue <= (hoverRating || rating) ? 
                          <FaStar className="star-filled" /> : 
                          <FaRegStar className="star-empty" />}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              <div className="review-text-container">
                <textarea 
                  placeholder="Share your experience..."
                  value={reviewText}
                  onChange={handleReviewTextChange}
                  maxLength={250}
                />
                <div className="character-count">
                  {reviewText.length}/250 characters
                </div>
              </div>
            </div>
            
            <div className="review-modal-footer">
              {submitSuccess ? (
                <div className="success-message">
                  <FaCheck /> Review submitted successfully!
                </div>
              ) : (
                <button 
                  className="submit-review-button" 
                  onClick={handleSubmitReview}
                  disabled={rating === 0 || submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTrips;
