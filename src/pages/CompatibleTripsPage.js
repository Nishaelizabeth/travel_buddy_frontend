import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import './CompatibleTripsPage.scss';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const CompatibleTripsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [compatibleTrips, setCompatibleTrips] = useState([]);
  const [displayedTrips, setDisplayedTrips] = useState([]);
  const [showAllTrips, setShowAllTrips] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    maxMembers: '',
    description: ''
  });
  const [activities, setActivities] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [showCompatibilityInfo, setShowCompatibilityInfo] = useState(false);
  const tripDetails = location.state?.tripDetails;
  
  // Create a ref for the form section
  const createFormRef = useRef(null);

  useEffect(() => {
    if (!tripDetails) {
      setError('No trip details provided');
      setLoading(false);
      return;
    }

    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get('profile/');
        setUserProfile(response.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    
    // Fetch activities data
    const fetchActivities = async () => {
      try {
        const response = await axiosInstance.get('travel-interests/');
        setActivities(response.data);
      } catch (err) {
        console.error('Error fetching activities:', err);
      }
    };

    fetchUserProfile();
    fetchActivities();

    // Fetch compatible trips
    const fetchCompatibleTrips = async () => {
      try {
        // First check subscription status
        let subscriptionResponse;
        try {
          subscriptionResponse = await axiosInstance.get('check-subscription/');
          console.log('Subscription response:', subscriptionResponse.data);
          
          if (subscriptionResponse.data.has_subscription) {
            // Set subscription details first
            setSubscriptionDetails({
              plan: subscriptionResponse.data.plan,
              end_date: subscriptionResponse.data.end_date,
              days_remaining: subscriptionResponse.data.days_remaining
            });
            setHasSubscription(true);
            setShowAllTrips(true);
          } else {
            setHasSubscription(false);
            setSubscriptionDetails(null);
          }
        } catch (subErr) {
          console.error('Error checking subscription status:', subErr);
        }
        
        // Then fetch compatible trips
        const response = await axiosInstance.post('compatible-trips/', {
          destinationId: parseInt(tripDetails.destinationId),
          activities: tripDetails.activities.map(id => parseInt(id)),
          startDate: tripDetails.startDate,
          endDate: tripDetails.endDate
        });
        
        // Sort trips by compatibility score (ascending order)
        const sortedTrips = [...response.data].sort((a, b) => a.compatibility_score - b.compatibility_score);
        setCompatibleTrips(sortedTrips);
        
        // Show all trips for premium users, otherwise just show first 3
        if (subscriptionResponse?.data?.has_subscription) {
          setDisplayedTrips(sortedTrips); // Show all trips for premium users
        } else {
          setDisplayedTrips(sortedTrips.slice(0, 3)); // Show only first 3 for non-premium users
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to fetch compatible trips');
        setLoading(false);
      }
    };

    fetchCompatibleTrips();
  }, [tripDetails]);

  const handleJoinTrip = async (tripId) => {
    try {
      const response = await axiosInstance.post(`join-trip/${tripId}/`);
      
      if (response.status === 200) {
        alert('Successfully joined trip!');
        navigate(`/trip/${tripId}`);
      }
    } catch (err) {
      console.error('Error joining trip:', err);
      setError(err.response?.data?.detail || 'Failed to join trip. Please try again.');
    }
  };

  const handleGetPremium = () => {
    setShowPremiumModal(true);
    setSelectedPlan(null); // Reset selected plan when opening modal
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    if (selectedPlan) {
      try {
        // Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert('Razorpay SDK failed to load. Please check your internet connection.');
          return;
        }
        
        // Create an order on the backend
        const orderResponse = await axiosInstance.post('create-razorpay-order/', {
          plan: selectedPlan
        }).catch(error => {
          console.error('Error creating Razorpay order:', error);
          if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
          }
          throw new Error('Failed to create payment order. Please try again.');
        });
        
        // Use the provided Razorpay credentials
        const RAZORPAY_KEY_ID = "rzp_test_fCOl3SiLoZo5zJ";
        
        const { order_id, amount, currency } = orderResponse.data;
        const planName = selectedPlan === 'gold' ? 'Gold Plan (Annual)' : 'Silver Plan (Monthly)';
        
        // Configure Razorpay options
        const options = {
          key: RAZORPAY_KEY_ID,
          amount: amount.toString(),
          currency: currency,
          name: 'Travel Buddy',
          description: `Subscription to ${planName}`,
          order_id: order_id,
          image: 'https://example.com/your_logo',
          handler: async function(response) {
            // This function is called when payment is successful
            try {
              // Verify payment on the backend
              const verifyResponse = await axiosInstance.post('verify-razorpay-payment/', {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              });
              
              if (verifyResponse.data.success) {
                // Payment verified successfully
                alert(verifyResponse.data.message);
                setShowAllTrips(true);
                setDisplayedTrips(compatibleTrips);
                setShowPremiumModal(false);
              } else {
                alert('Payment verification failed. Please contact support.');
              }
            } catch (error) {
              console.error('Error verifying payment:', error);
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: userProfile?.full_name || userProfile?.username || '',
            email: userProfile?.email || '',
            contact: userProfile?.phone_number || ''
          },
          notes: {
            plan: selectedPlan
          },
          theme: {
            color: '#3498db'
          }
        };
        
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        console.error('Error during payment:', error);
        alert('Something went wrong with the payment. Please try again.');
      }
    } else {
      // Alert user to select a plan first
      alert('Please select a plan to continue');
    }
  };

  const handleShowAllTrips = () => {
    setShowAllTrips(true);
    setDisplayedTrips(compatibleTrips);
    setShowPremiumModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const tripData = {
        destinationId: tripDetails.destinationId,
        activities: tripDetails.activities.map(id => parseInt(id)),
        startDate: tripDetails.startDate,
        endDate: tripDetails.endDate,
        maxMembers: parseInt(formData.maxMembers),
        description: formData.description
      };

      const response = await axiosInstance.post('save-trip/', tripData);
      
      if (response.status === 201) {
        alert('Trip created successfully!');
        navigate(`/trip/${response.data.trip_id}`);
      } else {
        throw new Error('Failed to create trip');
      }
    } catch (err) {
      console.error('Error creating trip:', err);
      setError(err.response?.data?.detail || 'Failed to create trip. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="loading">Loading compatible trips...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="compatible-trips-page">
      <div className="page-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h1>Compatible Trips</h1>
        </div>
        <div className="header-actions">
          <button 
            className="compatibility-info-toggle" 
            onClick={() => setShowCompatibilityInfo(!showCompatibilityInfo)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            {showCompatibilityInfo ? 'Hide' : 'Show'} Compatibility Info
          </button>
          <button 
            className="create-trip-button primary-button" 
            onClick={() => {
              setShowCreateForm(true);
              // Use setTimeout to ensure the form is rendered before scrolling
              setTimeout(() => {
                createFormRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Create Your Own Trip
          </button>
        </div>
      </div>
      
      {/* Collapsible Compatibility Info Section */}
      {showCompatibilityInfo && (
        <div className="compatibility-info-section">
          <div className="compatibility-info">
            <h3>How Trip Compatibility Works</h3>
            <p>Our compatibility algorithm matches you with trips based on several factors:</p>
            <ul>
              <li><strong>Destination Match:</strong> Trips to your preferred destination receive higher scores.</li>
              <li><strong>Activity Alignment:</strong> Trips with activities you've selected are prioritized.</li>
              <li><strong>Date Overlap:</strong> Trips with dates that match or closely align with your preferred travel dates score higher.</li>
              <li><strong>Travel Style:</strong> We consider your travel preferences from your profile to find like-minded travelers.</li>
            </ul>
            <p>A higher compatibility percentage indicates a better match for your preferences.</p>
          </div>
        </div>
      )}
      
      {/* Premium Badge for premium users */}
      {hasSubscription && subscriptionDetails && (
        <div className="premium-active-section">
          <div className="premium-active-banner">
            <div className="premium-badge">
              <span className="badge-icon">★</span>
              <span className="badge-text">{subscriptionDetails.plan.toUpperCase()}</span>
            </div>
            <div className="premium-content">
              <h3>Premium {subscriptionDetails.plan.charAt(0).toUpperCase() + subscriptionDetails.plan.slice(1)} Member</h3>
              <p>Enjoy unlimited access to compatible trips</p>
              <div className="renewal-box">
                <span>Renewal: {new Date(subscriptionDetails.end_date).toLocaleDateString()}</span>
                <span className="days-remaining">{subscriptionDetails.days_remaining} days remaining</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {displayedTrips.length > 0 ? (
        <div className="trips-grid">
          {displayedTrips.map(trip => (
            <div key={trip.id} className="trip-card">
              <div className="trip-card-header">
                <div className="destination-info">
                  <h2>{trip.destination?.name || 'Unknown Destination'}</h2>
                  <span className="trip-creator">by {trip.creator?.username || 'Unknown User'}</span>
                </div>
                
                <div 
                  className={`compatibility-badge ${
                    (trip.compatibility_score || 0) >= 70 ? 'high-match' : 
                    (trip.compatibility_score || 0) >= 40 ? 'medium-match' : 'low-match'
                  }`}
                >
                  <div className="match-circle">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg" d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle" 
                        strokeDasharray={`${trip.compatibility_score || 0}, 100`}
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <text x="18" y="20.35" className="percentage">{trip.compatibility_score || 0}%</text>
                    </svg>
                  </div>
                  <span className="match-label">Match</span>
                </div>
              </div>
              
              <div className="trip-card-content">
                {/* Left Section - Trip Overview */}
                <div className="trip-overview">
                  <div className="detail-item date-item">
                    <span className="detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </span>
                    <span className="detail-text">
                      <strong>Travel Dates:</strong> {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'Not specified'} - {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'Not specified'}
                    </span>
                  </div>
                  
                  <div className="detail-item members-item">
                    <span className="detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </span>
                    <span className="detail-text">
                      <strong>Members Joined:</strong> {trip.current_members || 0}/{trip.max_members || '?'}
                    </span>
                  </div>
                  
                  <div className="detail-item activities-item">
                    <span className="detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </span>
                    <span className="detail-text">
                      <strong>Activities:</strong>
                    </span>
                  </div>
                  
                  <div className="activities-list">
                    <ul>
                      {trip.activities?.length > 0 ? (
                        trip.activities.map(activity => (
                          <li key={activity.id}>{activity.name}</li>
                        ))
                      ) : (
                        <li className="empty">No activities specified</li>
                      )}
                    </ul>
                  </div>
                </div>
                
                {/* Right Section - Action & Details */}
                <div className="trip-action-details">
                  <div className="creator-details">
                    <div className="detail-item gender-item">
                      <span className="detail-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle></svg>
                      </span>
                      <span className="detail-text">
                        <strong>Gender:</strong> {trip.creator?.gender || 'Not specified'}
                      </span>
                    </div>
                    
                    <div className="detail-item age-item">
                      <span className="detail-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      </span>
                      <span className="detail-text">
                        <strong>Age:</strong> {trip.creator?.date_of_birth ? 
                          Math.floor((new Date() - new Date(trip.creator.date_of_birth)) / 31557600000) : 'Not specified'}
                      </span>
                    </div>
                    
                    <div className="detail-item preferences-item">
                      <span className="detail-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      </span>
                      <span className="detail-text">
                        <strong>Travel Preferences:</strong> {trip.creator?.travel_preferences || 'Not specified'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="trip-actions">
                    <button 
                      className={`join-trip-button ${!trip.can_join ? 'disabled' : ''}`}
                      onClick={() => handleJoinTrip(trip.id)}
                      disabled={!trip.can_join}
                    >
                      {trip.can_join ? 'Join Trip Now' : 'Already Joined'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-trips">
          <div className="no-trips-content">
            <div className="no-trips-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <h2>No compatible trips found</h2>
            <p>There are currently no trips that match your criteria. You can create your own trip and others may join you!</p>
            <button 
              className="create-trip-button" 
              onClick={() => {
                setShowCreateForm(true);
                // Use setTimeout to ensure the form is rendered before scrolling
                setTimeout(() => {
                  createFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Create New Trip
            </button>
          </div>
        </div>
      )}
      
      {/* Premium Button Section */}
      {compatibleTrips.length > 3 && !showAllTrips && !hasSubscription && (
        <div className="premium-section">
          <div className="premium-banner">
            <div className="premium-content">
              <h3>Unlock {compatibleTrips.length - displayedTrips.length} More Compatible Trips!</h3>
              <p className="premium-subtitle">You're viewing {displayedTrips.length} of {compatibleTrips.length} available trips</p>
              <div className="premium-features">
                <div className="premium-feature">
                  <span className="feature-icon">✓</span>
                  <span>Access all {compatibleTrips.length} compatible trips</span>
                </div>
                <div className="premium-feature">
                  <span className="feature-icon">✓</span>
                  <span>Enjoy exclusive travel deals</span>
                </div>
                <div className="premium-feature">
                  <span className="feature-icon">✓</span>
                  <span>Priority matching with other travelers</span>
                </div>
              </div>
              <button 
                className="premium-button join-now-button" 
                onClick={handleGetPremium}
              >
                <span className="premium-icon">★</span>
                Join Premium Now
              </button>
            </div>
            <div className="premium-illustration">
              <div className="lock-container">
                <span className="lock-icon">🔒</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="premium-modal-overlay">
          <div className="premium-modal">
            <h2>Upgrade to Premium</h2>
            <p>Get access to all {compatibleTrips.length} compatible trips and much more!</p>
            <div className="premium-plans">
              <div 
                className={`premium-plan ${selectedPlan === 'silver' ? 'selected' : ''}`}
                onClick={() => handleSelectPlan('silver')}
              >
                <div className="plan-header">
                  <h3>Silver Plan</h3>
                  <div className="plan-price">
                    <span className="price">₹299</span>
                    <span className="period">/month</span>
                  </div>
                </div>
                <div className="plan-features">
                  <ul>
                    <li>View unlimited compatible trips</li>
                    <li>Advanced trip matching</li>
                    <li>Priority customer support</li>
                  </ul>
                </div>
              </div>
              
              <div 
                className={`premium-plan ${selectedPlan === 'gold' ? 'selected' : ''}`}
                onClick={() => handleSelectPlan('gold')}
              >
                <div className="plan-header">
                  <div className="best-value-tag">Best Value</div>
                  <h3>Gold Plan</h3>
                  <div className="plan-price">
                    <span className="price">₹2999</span>
                    <span className="period">/year</span>
                  </div>
                  <div className="savings">Save ₹589</div>
                </div>
                <div className="plan-features">
                  <ul>
                    <li>All Silver features</li>
                    <li>Ad-free experience</li>
                    <li>Early access to new features</li>
                    <li>Exclusive travel deals</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="premium-actions">
              <button 
                className="premium-subscribe-button" 
                onClick={handleSubscribe}
                disabled={!selectedPlan}
              >
                Subscribe Now
              </button>
              <button className="premium-cancel-button" onClick={() => setShowPremiumModal(false)}>
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Compatibility info section removed as requested */}

      {showCreateForm && (
        <div className="create-trip-form" ref={createFormRef}>
          <h2>Create New Trip</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Destination</label>
              <input 
                type="text" 
                value={tripDetails.destinationName}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Activities</label>
              <ul>
                {tripDetails.activities.map(id => (
                  <li key={id}>
                    {activities.find(activity => activity.id === parseInt(id))?.name || 'Unknown Activity'}
                  </li>
                ))}
              </ul>
            </div>

            <div className="form-group">
              <label>Dates</label>
              <div>
                <p>Start: {new Date(tripDetails.startDate).toLocaleDateString()}</p>
                <p>End: {new Date(tripDetails.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="form-group required">
              <label>How many total travelers(including you)?</label>
              <input 
                type="number" 
                name="maxMembers" 
                value={formData.maxMembers}
                onChange={handleChange}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Trip Description (optional)</label>
              <textarea 
                name="description" 
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                Create Trip
              </button>
              <button type="button" className="cancel-button" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CompatibleTripsPage;
