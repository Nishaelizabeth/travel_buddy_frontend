import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiTrash2, FiStar, FiEye, FiUser, FiCalendar, FiMapPin, FiX } from 'react-icons/fi';
import './TripReviews.scss';

const TripReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/admin/reviews/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Process the reviews to ensure all required fields are present
      const processedReviews = response.data.map(review => ({
        ...review,
        user_name: review.user_name || (review.user && review.user.username) || 'Unknown User',
        trip_name: review.trip_name || (review.trip && review.trip.destination && review.trip.destination.name) || 'Unknown Trip',
        formatted_date: review.formatted_date || formatDate(review.created_at)
      }));
      
      setReviews(processedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load trip reviews');
    } finally {
      setLoading(false);
    }
  };
  


  const handleViewReview = async (review) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Fetch detailed review data
      const reviewResponse = await axios.get(`https://travel-buddy-backend-0jf1.onrender.com/api/admin/reviews/${review.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let reviewData = reviewResponse.data;
      
      // If the review contains a trip ID, fetch detailed trip information
      if (reviewData.trip && typeof reviewData.trip === 'object' && reviewData.trip.id) {
        try {
          const tripResponse = await axios.get(`https://travel-buddy-backend-0jf1.onrender.com/api/admin/trips/${reviewData.trip.id}/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          reviewData.trip_details = tripResponse.data;
        } catch (tripError) {
          console.error('Error fetching trip details:', tripError);
        }
      }
      
      // If the review contains a user ID, fetch detailed user information
      if (reviewData.user && typeof reviewData.user === 'object' && reviewData.user.id) {
        try {
          const userResponse = await axios.get(`https://travel-buddy-backend-0jf1.onrender.com/api/admin/users/${reviewData.user.id}/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          reviewData.user_details = userResponse.data;
        } catch (userError) {
          console.error('Error fetching user details:', userError);
        }
      }
      
      // Ensure all required fields are present
      reviewData = {
        ...reviewData,
        user_name: reviewData.user_name || (reviewData.user && reviewData.user.username) || 'Unknown User',
        user_full_name: (reviewData.user_details && reviewData.user_details.full_name) || '',
        trip_name: reviewData.trip_name || (reviewData.trip && reviewData.trip.destination && reviewData.trip.destination.name) || 'Unknown Trip',
        formatted_date: reviewData.formatted_date || formatDate(reviewData.created_at)
      };
      
      setSelectedReview(reviewData);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching review details:', error);
      toast.error('Failed to load review details');
      // Fallback to using the list data if the detailed fetch fails
      setSelectedReview(review);
      setShowModal(true);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`https://travel-buddy-backend-0jf1.onrender.com/api/admin/reviews/${reviewId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('Review deleted successfully');
        fetchReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error('Failed to delete review');
      }
    }
  };
  


  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar 
          key={i} 
          className={i <= rating ? 'star filled' : 'star'} 
          style={{ color: i <= rating ? '#FFD700' : '#ccc', marginRight: '2px' }}
        />
      );
    }
    return <div className="star-rating">{stars}</div>;
  };

  return (
    <div className="admin-section">
      <h2>Trip Reviews Management</h2>
      
      <div className="action-bar">
        <h3>View and manage trip reviews</h3>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading reviews...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Trip</th>
                <th>Rating</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <tr key={review.id}>
                    <td>{review.user_name}</td>
                    <td>{review.trip_name}</td>
                    <td>{renderStars(review.rating)}</td>
                    <td>{review.formatted_date}</td>
                    <td className="actions">
                      <button className="btn btn-rectangle btn-view" onClick={() => handleViewReview(review)}>
                        <FiEye /> View
                      </button>
                      <button className="btn btn-rectangle btn-danger" onClick={() => handleDelete(review.id)}>
                        <FiTrash2 /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">No reviews found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedReview && (
        <div className="modal-overlay">
          <div className="modal review-modal">
            <div className="modal-header">
              <h3><FiStar /> Trip Review Details</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="review-card">
                <div className="review-section user-section">
                  <h4><FiUser /> User Information</h4>
                  <div className="info-grid">
                    <div className="info-row">
                      <div className="info-value">Username: {selectedReview.user_name}</div>
                    </div>
                    {selectedReview.user_full_name && (
                      <div className="info-row">
                        <div className="info-value">Full Name: {selectedReview.user_full_name}</div>
                      </div>
                    )}
                    {selectedReview.user_details && selectedReview.user_details.email && (
                      <div className="info-row">
                        <div className="info-value">Email: {selectedReview.user_details.email}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="review-section trip-section">
                  <h4><FiMapPin /> Trip Details</h4>
                  <div className="info-grid">
                    <div className="info-row">
                      <div className="info-value">Destination: {selectedReview.trip_name}</div>
                    </div>
                    {selectedReview.trip_details && (
                      <>
                        {selectedReview.trip_details.destination && selectedReview.trip_details.destination.location && (
                          <div className="info-row">
                            <div className="info-value">Location: {selectedReview.trip_details.destination.location}</div>
                          </div>
                        )}
                        <div className="info-row">
                          <div className="info-value">
                            Trip Period: {formatDate(selectedReview.trip_details.start_date)} - {formatDate(selectedReview.trip_details.end_date)}
                          </div>
                        </div>
                        {/* Created By and Status fields removed as requested */}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="review-section rating-section">
                  <h4><FiStar /> Rating & Review</h4>
                  <div className="info-grid">
                    <div className="info-row">
                      <div className="info-value rating-display">
                        Rating: {renderStars(selectedReview.rating)}
                        <span className="rating-text">{selectedReview.rating}/5</span>
                      </div>
                    </div>
                    <div className="info-row">
                      <div className="info-value">
                        Review Date: <FiCalendar className="icon-inline" /> {selectedReview.formatted_date}
                      </div>
                    </div>
                    <div className="info-row full-width">
                      <div className="info-value comment-box">
                        Comment: {selectedReview.comment || 'No comment provided'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Close</button>
              <button className="btn btn-danger" onClick={() => {
                handleDelete(selectedReview.id);
                setShowModal(false);
              }}>
                <FiTrash2 /> Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default TripReviews;
