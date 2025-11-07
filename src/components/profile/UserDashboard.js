import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '../../context/AuthContext';
import './UserDashboard.scss';

// Icons
import { FaCalendarAlt, FaMapMarkerAlt, FaUserFriends, FaPlus, FaChevronRight, FaChevronLeft, FaCompass, FaStar, FaRegStar, FaCheck, FaTimes, FaSignOutAlt, FaEdit, FaPlane, FaCrown } from 'react-icons/fa';
import { BiTrip } from 'react-icons/bi';
import { IoMdNotifications } from 'react-icons/io';
import { MdTravelExplore, MdMessage, MdRateReview, MdClose } from 'react-icons/md';
import { BsCalendar2Check } from 'react-icons/bs';
import { IoCreateOutline, IoPersonOutline } from 'react-icons/io5';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [username, setUsername] = useState('');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumPlan, setPremiumPlan] = useState(null);
  
  // Refs for scrolling to sections
  const createdTripsRef = useRef(null);
  const joinedTripsRef = useRef(null);
  
  // Refs for horizontal scrolling
  const createdTripsScrollRef = useRef(null);
  const joinedTripsScrollRef = useRef(null);
  const [calendarValue, setCalendarValue] = useState(new Date());
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [reviews, setReviews] = useState({});
  
  // Buddies modal state
  const [showBuddiesModal, setShowBuddiesModal] = useState(false);
  const [connectedBuddies, setConnectedBuddies] = useState([]);
  
  // State for notifications
  const [tripNotifications, setTripNotifications] = useState([]);
  const [chatNotifications, setChatNotifications] = useState([]);
  const [showTripNotificationsModal, setShowTripNotificationsModal] = useState(false);
  const [showChatNotificationsModal, setShowChatNotificationsModal] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadChatNotificationCount, setUnreadChatNotificationCount] = useState(0);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [markingChatAsRead, setMarkingChatAsRead] = useState(false);
  
  // Stats for the dashboard
  const [stats, setStats] = useState({
    tripsCreated: 0,
    tripsJoined: 0,
    buddiesConnected: 0
  });
  
  // Trips data separated by created and joined
  const [createdTrips, setCreatedTrips] = useState([]);
  const [joinedTrips, setJoinedTrips] = useState([]);
  
  // Next upcoming trip
  const [nextTrip, setNextTrip] = useState(null);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // We've removed the suggestedDestinations state as it's no longer needed
  
  // Activity feed has been removed

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('profile/');
        setProfile(response.data);
        setUsername(response.data.username);
        
        console.log('Profile data loaded:', response.data);
        
        // Now that we have the profile data, fetch the trips
        await fetchTrips(response.data);
        
        // Fetch stats separately
        await fetchUserStats(response.data.id);
        
        // Fetch reviews
        await fetchReviews();
        
        // Check premium subscription status
        await checkPremiumStatus();
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Fetch user trips, stats, and other dashboard data
      // This function aggregates all the dashboard data needed
      await fetchTrips(profile);
      if (profile && profile.id) {
        await fetchUserStats(profile.id);
      }
      await fetchReviews();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Function to check premium subscription status
  const checkPremiumStatus = async () => {
    try {
      const response = await axiosInstance.get('check-subscription/');
      console.log('Subscription status:', response.data);
      setIsPremium(response.data.has_subscription);
      if (response.data.has_subscription) {
        setPremiumPlan(response.data.plan);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
      fetchNotifications();
    }
  }, [profile]);

  // Function to fetch notifications
  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications...');
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.error('No access token found');
        return;
      }
      
      // Fetch trip notifications from the backend
      console.log('Making API call to fetch trip notifications...');
      const tripNotificationsResponse = await axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/notifications/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Trip notifications API response:', tripNotificationsResponse.data);
      
      // Check if we have any trip notifications
      if (!tripNotificationsResponse.data || tripNotificationsResponse.data.length === 0) {
        console.log('No trip notifications returned from API');
      }
      
      // Process the trip notifications data
      const fetchedTripNotifications = tripNotificationsResponse.data.map(notification => ({
        id: notification.id,
        type: notification.notification_type,
        tripId: notification.trip,
        tripName: notification.trip_name,
        relatedUserName: notification.related_user_name,
        relatedUserPicture: notification.related_user_picture,
        timestamp: new Date(notification.created_at),
        formattedDate: notification.formatted_date,
        read: notification.is_read,
        message: notification.message
      }));
      
      console.log('Processed trip notifications:', fetchedTripNotifications);
      setTripNotifications(fetchedTripNotifications);
      
      // Fetch unread trip notification count
      const unreadTripCountResponse = await axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/notifications/unread-count/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Unread trip count:', unreadTripCountResponse.data.unread_count);
      setUnreadNotificationCount(unreadTripCountResponse.data.unread_count);
      
      // Fetch chat notifications from the backend
      console.log('Making API call to fetch chat notifications...');
      const chatNotificationsResponse = await axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/chat-notifications/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Chat notifications API response:', chatNotificationsResponse.data);
      
      // Check if we have any chat notifications
      if (!chatNotificationsResponse.data || chatNotificationsResponse.data.length === 0) {
        console.log('No chat notifications returned from API');
      }
      
      // Process the chat notifications data
      const fetchedChatNotifications = chatNotificationsResponse.data.map(notification => ({
        id: notification.id,
        tripId: notification.trip,
        tripName: notification.trip_name,
        chatMessageId: notification.chat_message,
        senderId: notification.sender,
        senderName: notification.sender_name,
        senderPicture: notification.sender_picture,
        messagePreview: notification.message_preview,
        timestamp: new Date(notification.created_at),
        formattedDate: notification.formatted_date,
        read: notification.is_read
      }));
      
      console.log('Processed chat notifications:', fetchedChatNotifications);
      setChatNotifications(fetchedChatNotifications);
      
      // Fetch unread chat notification count
      const unreadChatCountResponse = await axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/chat-notifications/unread-count/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Unread chat count:', unreadChatCountResponse.data.unread_count);
      setUnreadChatNotificationCount(unreadChatCountResponse.data.unread_count);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Function to mark notifications as read
  const markNotificationsAsRead = async (notificationIds) => {
    try {
      setMarkingAsRead(true);
      const token = localStorage.getItem('accessToken');
      
      // Send request to mark notifications as read
      await axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/notifications/', 
        { notification_ids: notificationIds },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local state
      setTripNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notificationIds.includes(notification.id) 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      const unreadCount = tripNotifications.filter(n => !n.read && !notificationIds.includes(n.id)).length;
      setUnreadNotificationCount(unreadCount);
      
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    } finally {
      setMarkingAsRead(false);
    }
  };
  
  // Function to mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAsRead(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.error('No access token found');
        return;
      }
      
      // Get IDs of all unread notifications
      const unreadNotificationIds = tripNotifications
        .filter(notification => !notification.read)
        .map(notification => notification.id);
      
      if (unreadNotificationIds.length === 0) {
        setMarkingAsRead(false);
        return;
      }
      
      // Send request to mark notifications as read
      await axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/notifications/', 
        { notification_ids: unreadNotificationIds },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local state
      setTripNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          unreadNotificationIds.includes(notification.id) 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadNotificationCount(prevCount => prevCount - unreadNotificationIds.length);
      
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    } finally {
      setMarkingAsRead(false);
    }
  };
  
  // Function to clear all trip notifications
  const handleClearAllNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.error('No access token found');
        return;
      }
      
      // Send request to clear all notifications
      await axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/notifications/', 
        { clear_all: true },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local state
      setTripNotifications([]);
      setUnreadNotificationCount(0);
      
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };
  
  // Function to mark all chat notifications as read
  const handleMarkAllChatAsRead = async () => {
    try {
      setMarkingChatAsRead(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.error('No access token found');
        return;
      }
      
      // Get IDs of all unread chat notifications
      const unreadChatNotificationIds = chatNotifications
        .filter(notification => !notification.read)
        .map(notification => notification.id);
      
      if (unreadChatNotificationIds.length === 0) {
        setMarkingChatAsRead(false);
        return;
      }
      
      // Send request to mark chat notifications as read
      await axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/chat-notifications/', 
        { notification_ids: unreadChatNotificationIds },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local state
      setChatNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          unreadChatNotificationIds.includes(notification.id) 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadChatNotificationCount(prevCount => prevCount - unreadChatNotificationIds.length);
      
    } catch (error) {
      console.error('Error marking chat notifications as read:', error);
    } finally {
      setMarkingChatAsRead(false);
    }
  };
  
  // Function to clear all chat notifications
  const handleClearAllChatNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.error('No access token found');
        return;
      }
      
      // Send request to clear all chat notifications
      await axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/chat-notifications/', 
        { clear_all: true },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local state
      setChatNotifications([]);
      setUnreadChatNotificationCount(0);
      
    } catch (error) {
      console.error('Error clearing chat notifications:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axiosInstance.get('/trip-reviews/');
      const reviewsData = {};
      response.data.forEach(review => {
        reviewsData[review.trip_id] = review;
      });
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };
  
  const handleOpenReviewModal = (trip, e) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedTrip(trip);
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
    
    setSubmitting(true);
    try {
      const reviewData = {
        trip_id: selectedTrip.id,
        rating: rating,
        comment: reviewText
      };
      
      const response = await axiosInstance.post('/trip-reviews/', reviewData);
      
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
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTrips = async (userData) => {
    try {
      // Get the current user's ID from the profile data
      const userId = userData?.id;
      
      if (!userId) {
        console.warn('User ID not available, cannot fetch user-specific trips');
        return;
      }
      
      console.log('Fetching dashboard data for user:', userId);
      
      // Use the dedicated user-dashboard endpoint
      const dashboardResponse = await axiosInstance.get('user-dashboard/');
      
      // Log the full response for debugging
      console.log('Dashboard API response:', dashboardResponse.data);
      
      if (dashboardResponse.data) {
        // Extract the data from the response
        const { created_trips, joined_trips, stats } = dashboardResponse.data;
        
        console.log('Created trips from API:', created_trips);
        console.log('Joined trips from API:', joined_trips);
        console.log('Stats from API:', stats);
        
        // Format created trips
        const formattedCreatedTrips = created_trips.map(trip => ({
          id: trip.id,
          name: trip.trip_name,
          destination: {
            name: trip.destination,
            country: trip.location || '',
            image: trip.image_url // Use the actual image URL from the backend
          },
          start_date: new Date(trip.start_date),
          end_date: new Date(trip.end_date),
          status: trip.status,
          isCreator: true,
          members_count: trip.members_count,
          max_members: trip.max_members
        }));
        
        // Format joined trips
        const formattedJoinedTrips = joined_trips.map(trip => ({
          id: trip.id,
          name: trip.trip_name,
          destination: {
            name: trip.destination,
            country: trip.location || '',
            image: trip.image_url // Use the actual image URL from the backend
          },
          start_date: new Date(trip.start_date),
          end_date: new Date(trip.end_date),
          status: trip.status,
          isCreator: false,
          creator: trip.creator,
          members_count: trip.members_count,
          max_members: trip.max_members
        }));
        
        // Combine all trips for the calendar and other shared features
        const allTripsFormatted = [...formattedCreatedTrips, ...formattedJoinedTrips];
        
        // Set state with the formatted data
        setTrips(allTripsFormatted);
        setCreatedTrips(formattedCreatedTrips);
        setJoinedTrips(formattedJoinedTrips);
        
        // Set stats from the API response
        if (stats) {
          setStats({
            tripsCreated: stats.trips_created,
            tripsJoined: stats.trips_joined,
            buddiesConnected: stats.buddies_connected
          });
        } else {
          // Fallback to calculated stats if API doesn't provide them
          setStats({
            tripsCreated: formattedCreatedTrips.length,
            tripsJoined: formattedJoinedTrips.length,
            buddiesConnected: calculateUniqueBuddies(allTripsFormatted)
          });
        }
        
        // Find next upcoming trip
        const upcomingTrips = allTripsFormatted.filter(trip => 
          trip.status === 'Upcoming' || trip.start_date > new Date()
        );
        
        if (upcomingTrips.length > 0) {
          // Sort by start date (ascending)
          upcomingTrips.sort((a, b) => a.start_date - b.start_date);
          setNextTrip(upcomingTrips[0]);
        } else {
          setNextTrip(null);
        }
        
        console.log('Dashboard data loaded:', {
          created: formattedCreatedTrips.length,
          joined: formattedJoinedTrips.length,
          nextTrip: upcomingTrips.length > 0 ? upcomingTrips[0].name : 'None'
        });
      } else {
        // Handle empty response
        setTrips([]);
        setCreatedTrips([]);
        setJoinedTrips([]);
        setNextTrip(null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Show a more user-friendly message in the UI instead of an alert
      setTrips([]);
      setCreatedTrips([]);
      setJoinedTrips([]);
      setNextTrip(null);
    }
  };
  
  // Helper function for formatting notification time
  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    
    // Less than a minute
    if (diff < 60000) {
      return 'Just now';
    }
    // Less than an hour
    else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    // Less than a day
    else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    // Less than a week
    else if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    // Otherwise, return the date
    else {
      return timestamp.toLocaleDateString();
    }
  };
  
  // Function to mark a notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        return;
      }
      
      // Send request to mark notification as read
      await axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/notifications/', 
        { notification_ids: [notificationId] },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local state
      setTripNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadNotificationCount(prevCount => Math.max(0, prevCount - 1));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Function to mark a chat notification as read
  const markChatNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        return;
      }
      
      // Send request to mark chat notification as read
      await axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/chat-notifications/', 
        { notification_ids: [notificationId] },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local state
      setChatNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadChatNotificationCount(prevCount => Math.max(0, prevCount - 1));
      
    } catch (error) {
      console.error('Error marking chat notification as read:', error);
    }
  };

  // Function to handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      // Mark the notification as read if it's not already
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
      }
      
      // Navigate to the trip dashboard if it's a trip notification
      if (notification.tripId) {
        navigate(`/trip/${notification.tripId}`);
        setShowTripNotificationsModal(false);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };
  
  // Function to handle chat notification click
  const handleChatNotificationClick = async (notification) => {
    try {
      // Mark the chat notification as read if it's not already
      if (!notification.read) {
        await markChatNotificationAsRead(notification.id);
      }
      
      // Navigate to the trip dashboard with the chat tab open
      if (notification.tripId) {
        navigate(`/trip/${notification.tripId}?tab=chat`);
        setShowChatNotificationsModal(false);
      }
    } catch (error) {
      console.error('Error handling chat notification click:', error);
    }
  };
  

  
  // Helper function to determine trip status based on dates
  const determineStatus = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > today) {
      return 'Upcoming';
    } else if (start <= today && today <= end) {
      return 'Ongoing';
    } else {
      return 'Completed';
    }
  };
  
  // Helper function to calculate unique buddies
  const calculateUniqueBuddies = (trips) => {
    const uniqueBuddyIds = new Set();
    
    trips.forEach(trip => {
      if (trip.members && trip.members.length > 0) {
        trip.members.forEach(member => {
          if (member.id !== profile?.id) {
            uniqueBuddyIds.add(member.id);
          }
        });
      }
    });
    
    return uniqueBuddyIds.size;
  };

  // Fetch user stats from the backend
  const fetchUserStats = async (userId) => {
    if (!userId) return;
    
    try {
      // Use the new dedicated user-stats endpoint
      const statsResponse = await axiosInstance.get('/user-stats/');
      
      if (statsResponse.data) {
        // Update stats with data from the dedicated endpoint
        setStats({
          tripsCreated: statsResponse.data.trips_created || 0,
          tripsJoined: statsResponse.data.trips_joined || 0,
          buddiesConnected: statsResponse.data.buddies_connected || 0
        });
        
        console.log('Stats updated from backend:', {
          tripsCreated: statsResponse.data.trips_created || 0,
          tripsJoined: statsResponse.data.trips_joined || 0,
          buddiesConnected: statsResponse.data.buddies_connected || 0
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      console.log('Falling back to calculated stats from trips data');
      
      // If there's an error with the dedicated endpoint, fall back to calculating from trips
      try {
        // Get all trips for the user (both created and joined)
        const tripsResponse = await axiosInstance.get('/my-trips/');
        
        if (tripsResponse.data) {
          // Filter trips created by the user
          const created = tripsResponse.data.filter(trip => trip.user.id === userId);
          
          // Filter trips joined by the user (but not created)
          const joined = tripsResponse.data.filter(trip => trip.user.id !== userId);
          
          // Get buddies connected count from the trips
          const uniqueBuddyIds = new Set();
          tripsResponse.data.forEach(trip => {
            if (trip.members && trip.members.length > 0) {
              trip.members.forEach(member => {
                if (member.id !== userId) {
                  uniqueBuddyIds.add(member.id);
                }
              });
            }
          });
          
          // Update stats with calculated data
          setStats({
            tripsCreated: created.length,
            tripsJoined: joined.length,
            buddiesConnected: uniqueBuddyIds.size
          });
        }
      } catch (fallbackError) {
        console.error('Error in fallback stats calculation:', fallbackError);
      }
    }
  };
  
  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('/profile/', {
        params: {
          include_unread_count: true
        }
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/48';
  };

  // Helper function to ensure profile picture URLs are complete
  const getFullProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;
    
    // If profile_picture is already a complete URL, return it as is
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    
    // If it's a relative URL, make it absolute
    const baseUrl = axiosInstance.defaults.baseURL || '';
    return `${baseUrl}${profilePicture.startsWith('/') ? '' : '/'}${profilePicture}`;
  };

  const handleNewTrip = () => {
    navigate('/destinations');
  };

  const handleViewMyTrips = () => {
    navigate('/my-trips');
  };

  const handleExplore = () => {
    navigate('/destinations');
  };

  const handleEditProfile = () => {
    navigate('/profile');
  };

  const handleMessages = () => {
    navigate('/messages');
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Function to handle opening the buddies modal
  const handleOpenBuddiesModal = async () => {
    try {
      // Show loading state
      setLoading(true);
      
      // Fetch connected buddies directly from the database
      const response = await axiosInstance.get('/connected-buddies/');
      console.log('Connected buddies response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Process the buddy data to ensure profile pictures are correctly formatted
        const formattedBuddies = response.data.map(buddy => {
          // The backend provides profile_picture as a complete URL or null
          let profilePicture = null;
          
          if (buddy.profile_picture) {
            // If it's already a full URL, use it directly
            if (buddy.profile_picture.startsWith('http')) {
              profilePicture = buddy.profile_picture;
            } else {
              // For relative URLs, construct the full URL
              profilePicture = `https://travel-buddy-backend-0jf1.onrender.com${buddy.profile_picture}`;
            }
            console.log(`Profile picture for ${buddy.username}:`, profilePicture);
          }
          
          return {
            id: buddy.id,
            first_name: buddy.first_name || buddy.username.split(' ')[0],
            last_name: buddy.last_name || '',
            username: buddy.username,
            profile_picture: profilePicture,
            trips_together: buddy.trips_together || 1
          };
        });
        
        console.log('Formatted buddies with profile pictures:', formattedBuddies);
        setConnectedBuddies(formattedBuddies);
      } else {
        // Fallback to extracting buddies from trips data if API fails
        const uniqueBuddies = new Map();
        
        // Process created trips
        createdTrips.forEach(trip => {
          if (trip.members) {
            trip.members.forEach(member => {
              if (member.id !== profile?.id) {
                const existingBuddy = uniqueBuddies.get(member.id);
                let profilePicture = null;
                
                if (member.profile_picture) {
                  if (member.profile_picture.startsWith('http')) {
                    profilePicture = member.profile_picture;
                  } else {
                    profilePicture = `https://travel-buddy-backend-0jf1.onrender.com${member.profile_picture}`;
                  }
                }
                
                uniqueBuddies.set(member.id, {
                  id: member.id,
                  first_name: member.first_name || member.username.split(' ')[0],
                  last_name: member.last_name || '',
                  username: member.username || member.name,
                  profile_picture: profilePicture,
                  trips_together: existingBuddy ? existingBuddy.trips_together + 1 : 1
                });
              }
            });
          }
        });
        
        // Process joined trips
        joinedTrips.forEach(trip => {
          // Add the trip creator if it's not the current user
          if (trip.creator && trip.creator.id !== profile?.id) {
            const existingBuddy = uniqueBuddies.get(trip.creator.id);
            let profilePicture = null;
            
            if (trip.creator.profile_picture) {
              if (trip.creator.profile_picture.startsWith('http')) {
                profilePicture = trip.creator.profile_picture;
              } else {
                profilePicture = `https://travel-buddy-backend-0jf1.onrender.com${trip.creator.profile_picture}`;
              }
            }
            
            uniqueBuddies.set(trip.creator.id, {
              id: trip.creator.id,
              first_name: trip.creator.first_name || trip.creator.username.split(' ')[0],
              last_name: trip.creator.last_name || '',
              username: trip.creator.username || trip.creator.name,
              profile_picture: profilePicture,
              trips_together: existingBuddy ? existingBuddy.trips_together + 1 : 1
            });
          }
          
          // Add other members
          if (trip.members) {
            trip.members.forEach(member => {
              if (member.id !== profile?.id) {
                const existingBuddy = uniqueBuddies.get(member.id);
                let profilePicture = null;
                
                if (member.profile_picture) {
                  if (member.profile_picture.startsWith('http')) {
                    profilePicture = member.profile_picture;
                  } else {
                    profilePicture = `https://travel-buddy-backend-0jf1.onrender.com${member.profile_picture}`;
                  }
                }
                
                uniqueBuddies.set(member.id, {
                  id: member.id,
                  first_name: member.first_name || member.username.split(' ')[0],
                  last_name: member.last_name || '',
                  username: member.username || member.name,
                  profile_picture: profilePicture,
                  trips_together: existingBuddy ? existingBuddy.trips_together + 1 : 1
                });
              }
            });
          }
        });
        
        // Convert Map to Array
        setConnectedBuddies(Array.from(uniqueBuddies.values()));
      }
    } catch (error) {
      console.error('Error fetching connected buddies:', error);
      // Show error message to user
      // You could add a toast notification here
    } finally {
      setLoading(false);
      setShowBuddiesModal(true);
    }
  };
  
  // Function to close the buddies modal
  const handleCloseBuddiesModal = () => {
    setShowBuddiesModal(false);
  };

  // Calendar functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Function to check if a date has a trip
  const hasTrip = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return trips.some(trip => {
      const start = trip.start_date.toISOString().split('T')[0];
      const end = trip.end_date.toISOString().split('T')[0];
      return dateStr >= start && dateStr <= end;
    });
  };
  
  // Function for Calendar tileContent
  const tileContent = ({ date, view }) => {
    // Only add content to month view
    if (view !== 'month') return null;
    
    const dateStr = date.toISOString().split('T')[0];
    const nextTripDate = nextTrip ? nextTrip.start_date.toISOString().split('T')[0] : null;
    const hasTripEvent = hasTrip(date);
    
    if (hasTripEvent || dateStr === nextTripDate) {
      return (
        <div className="calendar-trip-dot">
          <span className="trip-dot">•</span>
        </div>
      );
    }
    
    return null;
  };
  
  // Function to get the next upcoming trip date
  const getNextTripDate = () => {
    if (!nextTrip) return null;
    return nextTrip.start_date.toISOString().split('T')[0];
  };
  
  // Function to render the custom calendar
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    const nextTripDate = getNextTripDate();
    
    // Array of month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Calculate days from previous month to display
    const prevMonthDays = [];
    if (firstDayOfMonth > 0) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevMonthYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
      
      for (let i = 0; i < firstDayOfMonth; i++) {
        const day = daysInPrevMonth - firstDayOfMonth + i + 1;
        prevMonthDays.push({
          date: new Date(prevMonthYear, prevMonth, day),
          isCurrentMonth: false
        });
      }
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = day === todayDate && month === todayMonth && year === todayYear;
      const isNextTripDay = dateStr === nextTripDate;
      const hasTripEvent = hasTrip(date);
      
      currentMonthDays.push({
        date,
        day,
        isCurrentMonth: true,
        isToday,
        isNextTripDay,
        hasTripEvent
      });
    }
    
    // Calculate days from next month to display
    const nextMonthDays = [];
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length;
    const remainingCells = 42 - totalDaysDisplayed; // 6 rows * 7 columns = 42 cells
    
    if (remainingCells > 0) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextMonthYear = month === 11 ? year + 1 : year;
      
      for (let day = 1; day <= remainingCells; day++) {
        nextMonthDays.push({
          date: new Date(nextMonthYear, nextMonth, day),
          day,
          isCurrentMonth: false
        });
      }
    }
    
    // Combine all days
    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    
    return (
      <div className="custom-calendar">
        <div className="calendar-header">
          <button 
            className="calendar-nav-button"
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          >
            &lt;
          </button>
          <h3>{monthNames[month]} {year}</h3>
          <button 
            className="calendar-nav-button"
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          >
            &gt;
          </button>
        </div>
        
        <div className="calendar-weekdays">
          {dayNames.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {allDays.map((dayObj, index) => (
            <div 
              key={index} 
              className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${dayObj.hasTripEvent ? 'has-trip' : ''}`}
            >
              <span className="day-number">{dayObj.day}</span>
              {dayObj.hasTripEvent && <div className="trip-indicator"></div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Function to scroll to a section
  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Component for stat cards
  const StatsCard = ({ icon, count, label, color, onClick, clickable }) => (
    <div 
      className={`stats-card ${clickable ? 'clickable' : ''}`} 
      style={{ backgroundColor: color }}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter') {
          onClick();
        }
      } : undefined}
    >
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <div className="stats-count">{count}</div>
        <div className="stats-label">{label}</div>
      </div>
    </div>
  );

  // Component for trip cards
  const TripCard = ({ trip, type }) => {
    // Format dates nicely
    const formatDateRange = (start, end) => {
      const options = { month: 'short', day: 'numeric' };
      const startStr = start.toLocaleDateString('en-US', options);
      const endStr = end.toLocaleDateString('en-US', options);
      return `${startStr} - ${endStr}`;
    };
    
    // Get status color based on trip status
    const getStatusColor = (status) => {
      switch(status) {
        case 'Upcoming': return '#4caf50'; // Green
        case 'Ongoing': return '#2196f3'; // Blue
        case 'Completed': return '#9e9e9e'; // Gray
        default: return '#ff9800'; // Orange (default)
      }
    };
    
    return (
      <div 
        className="trip-card"
        onClick={() => navigate(`/trip/${trip.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            navigate(`/trip/${trip.id}`);
          }
        }}
      >
        <div className="trip-card-image-container">
          <img 
            src={trip.destination.image}
            alt={trip.destination.name}
            className="trip-card-image"
            onError={(e) => {
              // Fallback to a destination-specific placeholder image
              e.target.src = `https://source.unsplash.com/300x200/?${encodeURIComponent(trip.destination.name)},travel`;
            }}
          />
          <div className={`trip-card-badge ${type}`}>
            {type === 'created' ? 'Created' : 'Joined'}
          </div>
          <div className="trip-card-hover-action">
            <button className="view-trip-btn">View Trip</button>
            {/* Removed the 'Drop a Review' button as requested */}
          </div>
        </div>
        <div className="trip-card-content">
          <h3 className="trip-card-title">{trip.name}</h3>
          <div className="trip-card-destination">
            <FaMapMarkerAlt className="trip-card-icon" />
            <span>{trip.destination.country}</span>
          </div>
          <div className="trip-card-dates">
            <FaCalendarAlt className="trip-card-icon" />
            <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
          </div>
          <div className="trip-card-status" style={{ color: getStatusColor(trip.status) }}>
            <BsCalendar2Check className="trip-card-icon" />
            <span>{trip.status}</span>
          </div>
          <div className="trip-card-members">
            <FaUserFriends className="trip-card-icon" />
            <span>{trip.members_count || 0}/{trip.max_members} travelers</span>
          </div>
          {reviews[trip.id] && (
            <div className="trip-card-review">
              <div className="review-rating">
                {[...Array(5)].map((_, index) => (
                  <span key={index}>
                    {index < reviews[trip.id].rating ? <FaStar className="star-filled" /> : <FaRegStar className="star-empty" />}
                  </span>
                ))}
              </div>
              {reviews[trip.id].comment && (
                <p className="review-comment">"{reviews[trip.id].comment}"</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component for next trip card
  const NextTripCard = ({ trip }) => {
    if (!trip) return null;
    
    // Calculate days until trip
    const today = new Date();
    const daysUntil = Math.ceil((trip.start_date - today) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="next-trip-card">
        <div className="next-trip-header">
          <BiTrip className="next-trip-icon" />
          <h3>Your Next Adventure</h3>
        </div>
        <div className="next-trip-content">
          <h4>{trip.name}</h4>
          <div className="next-trip-info">
            <div className="next-trip-dates">
              <FaCalendarAlt className="trip-card-icon" />
              <span>{trip.start_date.toLocaleDateString()} - {trip.end_date.toLocaleDateString()}</span>
            </div>
            <div className="next-trip-countdown">
              <span className="days-count">{daysUntil}</span> days until your trip!
            </div>
          </div>
          <button 
            className="view-trip-button"
            onClick={() => navigate(`/trip/${trip.id}`)}
          >
            View Trip Details
          </button>
        </div>
      </div>
    );
  };

  // No longer needed - removed scroll button handling
  
  // No longer needed - removed scroll event handling

  // Component for trip sections
  const TripSection = ({ title, trips, type }) => {
    const scrollRef = type === 'created' ? createdTripsScrollRef : joinedTripsScrollRef;
    
    return (
      <div className="trip-section">
        <div className="section-header">
          <h2>{title}</h2>
          {/* Only show View All link for Joined Trips section */}
          {trips.length > 3 && type === 'joined' && (
            <span className="view-all" onClick={() => navigate('/my-trips')}>
              View All ({trips.length})
            </span>
          )}
        </div>
        {trips.length > 0 ? (
          <div className="trip-scroll-container">
            <div 
              className="trip-scroll-wrapper"
              ref={scrollRef}
            >
              {trips.map(trip => (
                <TripCard key={trip.id} trip={trip} type={type} />
              ))}
            </div>
          </div>
        ) : (
          <div className="no-trips-message">
            <p>You haven't {type === 'created' ? 'created' : 'joined'} any trips yet.</p>
            <button 
              className="create-trip-button"
              onClick={handleNewTrip}
            >
              {type === 'created' ? 'Create a Trip' : 'Explore Trips'}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Suggestions component has been removed

  // ActivityFeed component has been removed

  return (
    <div className="dashboard-container">
      {/* Main content area */}
      <div className="dashboard-main">
        {/* Welcome header */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {username}</h1>
            {isPremium && (
              <div className="premium-badge">
                <FaCrown className="premium-icon" />
                <span className="premium-text">{premiumPlan === 'gold' ? 'Gold' : 'Silver'} Member</span>
              </div>
            )}
          </div>
          <button className="new-trip-button" onClick={handleNewTrip}>
            <FaPlus className="button-icon" />
            New Trip
          </button>
        </div>
        
        {/* Stats cards */}
        <div className="stats-container">
          <StatsCard 
            icon={<IoCreateOutline />} 
            count={stats.tripsCreated} 
            label="Trips Created" 
            color="#e3f2fd"
            onClick={() => scrollToSection(createdTripsRef)}
            clickable={true}
          />
          <StatsCard 
            icon={<BiTrip />} 
            count={stats.tripsJoined} 
            label="Trips Joined" 
            color="#e8f5e9"
            onClick={() => scrollToSection(joinedTripsRef)}
            clickable={true}
          />
          <StatsCard 
            icon={<FaUserFriends />} 
            count={stats.buddiesConnected} 
            label="Buddies Connected" 
            color="#fff8e1"
            onClick={handleOpenBuddiesModal}
            clickable={true}
          />
        </div>
        
        {/* Next trip card */}
        {nextTrip && <NextTripCard trip={nextTrip} />}
        
        {/* Trip sections */}
        <div className="dashboard-content">
          <div className="trips-container">
            <div ref={createdTripsRef}>
              <TripSection title="Trips You Created" trips={createdTrips} type="created" />
            </div>
            <div ref={joinedTripsRef}>
              <TripSection title="Trips You Joined" trips={joinedTrips} type="joined" />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="dashboard-sidebar">
            <div className="calendar-container">
              <h3>Trip Calendar</h3>
              <div className="calendar-section">
                <div className="calendar-controls">
                  <button 
                    className="calendar-nav-btn"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  >
                    <FaChevronRight style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  <h3>{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentMonth)}</h3>
                  <button 
                    className="calendar-nav-btn"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  >
                    <FaChevronRight />
                  </button>
                </div>
                
                <div className="calendar-grid">
                  {/* Weekday headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-day-header">{day}</div>
                  ))}
                  
                  {/* Calendar days */}
                  {(() => {
                    const year = currentMonth.getFullYear();
                    const month = currentMonth.getMonth();
                    const today = new Date();
                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);
                    const daysInMonth = lastDay.getDate();
                    const startingDayOfWeek = firstDay.getDay();
                    const nextTripDate = nextTrip ? nextTrip.start_date : null;
                    
                    // Create array for all days to display
                    const days = [];
                    
                    // Previous month days
                    const prevMonthLastDay = new Date(year, month, 0).getDate();
                    for (let i = 0; i < startingDayOfWeek; i++) {
                      const day = prevMonthLastDay - startingDayOfWeek + i + 1;
                      const date = new Date(year, month - 1, day);
                      days.push({ date, day, outsideMonth: true });
                    }
                    
                    // Current month days
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day);
                      const isToday = date.getDate() === today.getDate() && 
                                     date.getMonth() === today.getMonth() && 
                                     date.getFullYear() === today.getFullYear();
                      
                      const isTripDay = hasTrip(date);
                      
                      const isUpcomingTrip = nextTripDate && 
                                           date.getDate() === nextTripDate.getDate() && 
                                           date.getMonth() === nextTripDate.getMonth() && 
                                           date.getFullYear() === nextTripDate.getFullYear();
                      
                      days.push({ date, day, isToday, isTripDay, isUpcomingTrip });
                    }
                    
                    // Next month days to fill the grid (6 rows x 7 days = 42 cells)
                    const totalDaysDisplayed = days.length;
                    const remainingCells = 42 - totalDaysDisplayed;
                    
                    for (let day = 1; day <= remainingCells; day++) {
                      const date = new Date(year, month + 1, day);
                      days.push({ date, day, outsideMonth: true });
                    }
                    
                    return days.map((dayInfo, index) => (
                      <div 
                        key={index} 
                        className={`calendar-day ${dayInfo.outsideMonth ? 'outside-month' : ''} ${dayInfo.isToday ? 'today' : ''} ${dayInfo.isTripDay ? 'trip-day' : ''} ${dayInfo.isUpcomingTrip ? 'upcoming-trip' : ''}`}
                      >
                        {dayInfo.day}
                      </div>
                    ));
                  })()}
                </div>
                
                <div className="calendar-legend">



                </div>
              </div>
            </div>
            
            {/* Trip Notifications */}
            <div className="notifications-container">
              <div className="notification-section trip-notifications" onClick={() => setShowTripNotificationsModal(true)}>
                <div className="notification-icon">
                  <IoMdNotifications />
                  {unreadNotificationCount > 0 && <span className="notification-badge">{unreadNotificationCount}</span>}
                </div>
                <div className="notification-text">
                  <h4>Trip Notifications</h4>
                  <p>{unreadNotificationCount > 0 ? `You have ${unreadNotificationCount} unread notification${unreadNotificationCount === 1 ? '' : 's'}` : 'No unread notifications'}</p>
                </div>
              </div>
              
              {/* Chat Notifications */}
              <div className="notification-section chat-notifications" onClick={() => setShowChatNotificationsModal(true)}>
                <div className="notification-icon">
                  <MdMessage />
                  {unreadChatNotificationCount > 0 && <span className="notification-badge">{unreadChatNotificationCount}</span>}
                </div>
                <div className="notification-text">
                  <h4>Chat Notifications</h4>
                  <p>{unreadChatNotificationCount > 0 ? `You have ${unreadChatNotificationCount} unread message${unreadChatNotificationCount === 1 ? '' : 's'}` : 'No unread messages'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
              <h4>{selectedTrip.name}</h4>
              <p className="trip-dates">
                {selectedTrip.start_date.toLocaleDateString()} - {selectedTrip.end_date.toLocaleDateString()}
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

      {/* Buddies Modal */}
      {showBuddiesModal && (
        <div className="modal-overlay" onClick={handleCloseBuddiesModal}>
          <div className="buddies-modal" onClick={(e) => e.stopPropagation()}>
            <div className="buddies-modal-header">
              <h3>Your Travel Buddies</h3>
              <button className="close-button" onClick={handleCloseBuddiesModal}>
                <MdClose />
              </button>
            </div>
            
            <div className="buddies-modal-content">
              {connectedBuddies.length > 0 ? (
                <div className="buddies-list">
                  {connectedBuddies.map(buddy => (
                    <div key={buddy.id} className="buddy-item">
                      <div className="buddy-avatar">
                        <img 
                          src={buddy.profile_picture || 'https://via.placeholder.com/50'}
                          alt={buddy.username}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/50' }}
                        />
                      </div>
                      <div className="buddy-info">
                        <h4>@{buddy.username}</h4>
                        <p>
                          <span className="trips-count">{buddy.trips_together}</span> 
                          {buddy.trips_together === 1 ? 'trip' : 'trips'} together
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-buddies-message">
                  <p>You haven't connected with any travel buddies yet.</p>
                  <p>Join trips to meet new travel companions!</p>
                  <button className="explore-trips-btn" onClick={() => navigate('/explore')}>
                    <FaCompass /> Explore Trips
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Trip Notifications Modal */}
      {showTripNotificationsModal && (
        <div className="modal-overlay" onClick={() => setShowTripNotificationsModal(false)}>
          <div className="notifications-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notifications-modal-header">
              <h3>Trip Notifications</h3>
              <div className="notifications-actions">
                {tripNotifications.length > 0 && (
                  <button 
                    className="clear-all-button" 
                    onClick={handleClearAllNotifications}
                  >
                    Clear all
                  </button>
                )}
                {tripNotifications.filter(n => !n.read).length > 0 && (
                  <button 
                    className="mark-all-read-button" 
                    onClick={handleMarkAllAsRead}
                    disabled={markingAsRead}
                  >
                    {markingAsRead ? 'Marking...' : 'Mark all as read'}
                  </button>
                )}
                <button className="close-button" onClick={() => setShowTripNotificationsModal(false)}>
                  <MdClose />
                </button>
              </div>
            </div>
            
            <div className="notifications-modal-content">
              {console.log('Rendering notification modal with notifications:', tripNotifications)}
              {tripNotifications.length > 0 ? (
                <div className="notifications-list">
                  {tripNotifications.map(notification => {
                    console.log('Rendering notification:', notification);
                    return (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-icon">
                          {notification.type === 'new_member' && <FaUserFriends className="icon new-member" />}
                          {notification.type === 'trip_cancelled' && <FaTimes className="icon cancelled" />}
                          {notification.type === 'trip_joined' && <FaCheck className="icon joined" />}
                          {notification.type === 'trip_left' && <FaSignOutAlt className="icon left" />}
                          {notification.type === 'trip_updated' && <FaEdit className="icon updated" />}
                          {notification.type === 'review_reminder' && <FaStar className="icon review" />}
                        </div>
                        <div className="notification-content">
                          <p className="notification-message">{notification.message}</p>
                          <p className="notification-time">
                            {notification.formattedDate || formatNotificationTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-notifications-message">
                  <p>You don't have any trip notifications.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Notifications Modal */}
      {showChatNotificationsModal && (
        <div className="modal-overlay" onClick={() => setShowChatNotificationsModal(false)}>
          <div className="notifications-modal chat-notifications-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notifications-modal-header">
              <h3>Chat Notifications</h3>
              <div className="notifications-actions">
                {chatNotifications.length > 0 && (
                  <button 
                    className="clear-all-button" 
                    onClick={handleClearAllChatNotifications}
                  >
                    Clear all
                  </button>
                )}
                {chatNotifications.filter(n => !n.read).length > 0 && (
                  <button 
                    className="mark-all-read-button" 
                    onClick={handleMarkAllChatAsRead}
                    disabled={markingChatAsRead}
                  >
                    {markingChatAsRead ? 'Marking...' : 'Mark all as read'}
                  </button>
                )}
                <button className="close-button" onClick={() => setShowChatNotificationsModal(false)}>
                  <MdClose />
                </button>
              </div>
            </div>
            
            <div className="notifications-modal-content">
              {console.log('Rendering chat notification modal with notifications:', chatNotifications)}
              {chatNotifications.length > 0 ? (
                <div className="notifications-list">
                  {chatNotifications.map(notification => {
                    console.log('Rendering chat notification:', notification);
                    return (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                        onClick={() => handleChatNotificationClick(notification)}
                      >
                        <div className="notification-icon">
                          <MdMessage className="icon chat" />
                        </div>
                        <div className="notification-content">
                          <div className="notification-header">
                            <span className="notification-trip-name">{notification.tripName}</span>
                            <span className="notification-sender">@{notification.senderName}</span>
                          </div>
                          <p className="notification-message">{notification.messagePreview}</p>
                          <p className="notification-time">
                            {notification.formattedDate || formatNotificationTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-notifications-message">
                  <p>You don't have any chat notifications.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
