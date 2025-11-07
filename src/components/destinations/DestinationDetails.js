import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt, FaArrowRight, FaClock, FaSuitcase, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import axiosInstance from '../../utils/axiosConfig';
import "react-datepicker/dist/react-datepicker.css";
import './DestinationDetails.scss';
import CompatibleTrips from '../../pages/CompatibleTripsPage';
import { Tooltip } from 'react-tooltip';

const DestinationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateError, setDateError] = useState(null);
  const [countdownDays, setCountdownDays] = useState(null);
  const [activities, setActivities] = useState([]);
  const [showDateSelection, setShowDateSelection] = useState(false);
  const [tripDetails, setTripDetails] = useState(null);
  const [showOverlapModal, setShowOverlapModal] = useState(false);
  const [conflictDetails, setConflictDetails] = useState(null);
  const [minAllowedDate, setMinAllowedDate] = useState(null);

  useEffect(() => {
    // Calculate minimum allowed date (5 days from today)
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 5);
    setMinAllowedDate(minDate);
    
    // Check if user is authenticated
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login', { 
        state: { 
          redirectTo: `/destinations/${id}`,
          message: 'Please log in to plan a trip' 
        }
      });
      return;
    }

    const fetchDestinationDetails = async () => {
      try {
        const response = await axiosInstance.get(`/destinations/${id}/`);
        setDestination(response.data);
        // Get the activities that are specifically linked to this destination
        const activitiesResponse = await axiosInstance.get(`/destinations/${id}/`);
        setActivities(activitiesResponse.data.travel_interests);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load destination details');
        setLoading(false);
      }
    };

    fetchDestinationDetails();
  }, [id, navigate]);

  useEffect(() => {
    if (startDate) {
      const today = new Date();
      const timeDiff = startDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setCountdownDays(daysDiff);
    }
  }, [startDate]);

  const handleActivityToggle = (activityId) => {
    setSelectedActivities(prev => {
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
      } else {
        return [...prev, activityId];
      }
    });
  };

  const handleDateChange = async (dates) => {
    const [start, end] = dates;
    
    // Validate that start date is at least 5 days from today
    if (start && start < minAllowedDate) {
      setDateError('Trip must start at least 5 days from today');
      return;
    }
    
    setStartDate(start);
    setEndDate(end);
    
    // Clear previous error
    setDateError(null);
    
    // Only check for overlaps if both start and end dates are selected
    if (start && end) {
      try {
        console.log('Checking date overlap for:', {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          destinationId: destination?.id || 0
        });
        
        // Force a small delay to ensure state updates have completed
        setTimeout(async () => {
          try {
            // Make sure we're using the exact URL pattern that matches the backend
            const response = await axiosInstance.post('check-trip-dates/', {
              startDate: start.toISOString(),
              endDate: end.toISOString(),
              destinationId: destination?.id || 0
            });
            
            console.log('Date check response:', response.data);
            
            if (response.data.hasConflict) {
              console.log('Setting date error due to conflict');
              setDateError('You already have a trip planned during this date range.');
              
              // Show modal with conflict details
              setConflictDetails({
                startDate: start,
                endDate: end
              });
              setShowOverlapModal(true);
            }
          } catch (innerErr) {
            console.error('Error in timeout callback:', innerErr);
            setDateError('Unable to verify date availability. Please try again.');
          }
        }, 100);
      } catch (err) {
        console.error('Error checking trip dates:', err);
        // Show error even if API call fails
        setDateError('Unable to verify date availability. Please try again.');
      }
    }
  };
  
  const handleCloseModal = () => {
    setShowOverlapModal(false);
  };
  
  const handleChooseNewDates = () => {
    // Reset the date selection
    setStartDate(null);
    setEndDate(null);
    setDateError(null);
    setShowOverlapModal(false);
  };

  const handleNextClick = () => {
    if (selectedActivities.length === 0) {
      setError('Please select at least one activity');
      return;
    }
    setShowDateSelection(true);
  };

  const handleFindCompatibleTrips = async () => {
    try {
      if (!startDate || !endDate) {
        setError('Please select both start and end dates');
        return;
      }

      // Prepare trip details for search
      const tripDetails = {
        destinationId: destination.id,
        destinationName: destination.name,
        activities: selectedActivities, // Send as array of IDs
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      };

      // Navigate to compatible trips page with trip details
      navigate('/compatible-trips', { 
        state: { 
          tripDetails,
          fromDestinationPage: true 
        } 
      });
    } catch (error) {
      console.error('Error finding compatible trips:', error);
      setError('Failed to find compatible trips. Please try again.');
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!destination) return <div className="error">Destination not found</div>;

  return (
    <div className="destination-details">
      {/* Date Overlap Warning Modal */}
      {showOverlapModal && (
        <div className="modal-overlay">
          <div className="warning-modal">
            <div className="modal-header">
              <FaExclamationTriangle className="warning-icon" />
              <h3>Date Overlap Detected</h3>
              <button className="close-button" onClick={handleCloseModal}>
                <MdClose />
              </button>
            </div>
            <div className="modal-body">
              <p>You already have a trip planned during this date range:</p>
              <p className="date-range">
                {conflictDetails?.startDate?.toLocaleDateString()} - {conflictDetails?.endDate?.toLocaleDateString()}
              </p>
              <p>Please select different dates for your trip.</p>
            </div>
            <div className="modal-footer">
              <button className="primary-button" onClick={handleChooseNewDates}>
                Choose Different Dates
              </button>
              <button className="secondary-button" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="destination-header">
        <img 
          src={destination.image} 
          alt={destination.name} 
          className="destination-image" 
          onError={(e) => {
            e.target.src = '/default-destination.jpg';
            console.log('Error loading image:', destination.image);
          }}
        />
        <h1>{destination.name}</h1>
      </div>

      {!showDateSelection ? (
        <>
          <div className="info-section">
            <div className="info-card">
              <h2>About</h2>
              <p>{destination.description}</p>
            </div>

            <div className="info-card">
              <h2>Highlights</h2>
              <p>{destination.highlights}</p>
            </div>

            <div className="info-card">
              <h2>Best Time to Visit</h2>
              <p>{destination.best_time_to_visit}</p>
            </div>
          </div>

          <div className="activities-section">
            <div className="section-header">
              <button 
                className="back-button"
                onClick={() => navigate('/destinations')}
              >
                ← Back to Destinations
              </button>
              <h2>Choose Your Activities</h2>
            </div>
            <div className="activities-grid">
              {activities.map(activity => (
                <div
                  key={activity.id}
                  className={`activity-card ${selectedActivities.includes(activity.id) ? 'selected' : ''}`}
                  onClick={() => handleActivityToggle(activity.id)}
                >
                  <div className="activity-content">

                    <img src={`https://travel-buddy-backend-0jf1.onrender.com${activity.image}`} alt={activity.name} />

                    <span>{activity.name}</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="next-button"
              onClick={handleNextClick}
              disabled={selectedActivities.length === 0}
            >
              <span>Choose Dates</span>
              <FaArrowRight />
            </button>
          </div>
        </>
      ) : (
        <div className="date-selection-section">
          <div className="section-header">
            <button 
              className="back-button"
              onClick={() => setShowDateSelection(false)}
            >
              ← Back to Activities
            </button>
            <h2>Select Your Travel Dates</h2>
          </div>
          <div className="calendar-container">
            <div className="calendar-wrapper">
              <div className="date-picker-container">
                <div className="date-picker-info" data-tooltip-id="date-restriction-tooltip">
                  <FaInfoCircle className="info-icon" />
                  <span>Trips must be planned at least 5 days in advance</span>
                </div>
                <DatePicker
                  selected={startDate}
                  onChange={handleDateChange}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  inline
                  minDate={minAllowedDate}
                  monthsShown={2}
                  calendarClassName="custom-calendar"
                  dayClassName={date => {
                    // Gray out dates that are less than 5 days from today
                    return date < minAllowedDate && date >= new Date() ? 'disabled-date' : undefined;
                  }}
                />
                <Tooltip id="date-restriction-tooltip" place="top" effect="solid">
                  You can only select dates that are at least 5 days from today
                </Tooltip>
              </div>
              {dateError && (
                <div className="date-error-message">
                  <strong>Warning:</strong> {dateError}
                </div>
              )}
            </div>

            <div className="date-info">
              <div className="selected-dates">
                <div className="date-group">
                  <FaCalendarAlt />
                  <div>
                    <label>Start Date</label>
                    <span>{startDate ? startDate.toLocaleDateString() : 'Select start date'}</span>
                  </div>
                </div>
                <div className="date-group">
                  <FaCalendarAlt />
                  <div>
                    <label>End Date</label>
                    <span>{endDate ? endDate.toLocaleDateString() : 'Select end date'}</span>
                  </div>
                </div>
              </div>

              <div className="countdown">
                {startDate && (
                  <p>
                    <FaClock /> {countdownDays} days until your trip
                  </p>
                )}
              </div>

              <div className="trip-duration">
                <p>
                  <FaSuitcase /> Trip duration: {startDate && endDate ? 
                    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1 : 
                    'Select dates to see duration'} days
                </p>
              </div>

              <button 
                className="find-trips-button"
                onClick={handleFindCompatibleTrips}
                disabled={!startDate || !endDate}
              >
                Find Compatible Trips
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationDetails;
