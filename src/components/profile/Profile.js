import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';
import { FaUser, FaLock, FaEdit, FaSave, FaTimes, FaPlane, FaMoneyBillWave, FaCog, FaExclamationTriangle, FaCheck, FaSpinner } from 'react-icons/fa';
import { MdTravelExplore, MdLocationOn, MdEmail, MdPhone } from 'react-icons/md';

// Modal component
const Modal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onClose();
        onConfirm();
        window.location.href = '/destinations';
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <FaCheck style={{ fontSize: '3rem', color: 'var(--success-color)', marginBottom: '1rem' }} />
                <p>Your preferences have been saved successfully!</p>
                <button onClick={handleConfirm} className="modal-button">
                    <span>Continue</span> <MdTravelExplore />
                </button>
            </div>
        </div>
    );
};

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [preferences, setPreferences] = useState({
        travel_frequency: '',
        travel_budget: ''
    });
    const [preferencesSet, setPreferencesSet] = useState(false);
    const [isSaveEnabled, setIsSaveEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        username: '',
        email: '',
        gender: '',
        dob: '',
        phone_number: ''
    });
    const [isPasswordEditing, setIsPasswordEditing] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return;
        }

        // Get user profile - log response for debugging
        console.log('Fetching profile data...');
        axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/profile/', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            const userData = response.data;
            console.log('Profile data received:', userData);
            // Explicitly handle phone number
            if (userData.phone_number) {
                console.log('Phone number found:', userData.phone_number);
            } else {
                console.log('No phone number found in response');
                // Make an additional request to ensure we get the phone number
                return axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/profile/?include_phone=true', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }).then(phoneResponse => {
                    const updatedUserData = {...userData, ...phoneResponse.data};
                    console.log('Updated profile data with phone:', updatedUserData);
                    return updatedUserData;
                }).catch(error => {
                    console.error('Error fetching phone number:', error);
                    return userData;
                });
            }
            return userData;
        })
        .then(userData => {
            setProfile(userData);
            setPreferences(userData.preferences || {});
            setPreferencesSet(!!userData.preferences?.travel_frequency && !!userData.preferences?.travel_budget);
            setIsSaveEnabled(!!userData.preferences?.travel_frequency && !!userData.preferences?.travel_budget);
            setIsLoading(false);
            setEditData({
                username: userData.username || '',
                email: userData.email || '',
                gender: userData.gender || '',
                dob: userData.dob || '',
                phone_number: userData.phone_number || ''
            });
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
            setIsLoading(false);
            if (error.response?.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                navigate('/login');
            } else {
                alert('Error fetching profile. Please try again.');
            }
        });
    }, [navigate]);

    const handlePreferencesChange = (e) => {
        const { name, value } = e.target;
        const updatedPreferences = {
            ...preferences,
            [name]: value
        };
        setPreferences(updatedPreferences);

        // Check if both preferences are selected
        setIsSaveEnabled(updatedPreferences.travel_frequency && updatedPreferences.travel_budget);
    };

    const savePreferences = () => {
        if (!isSaveEnabled) {
            alert('Please select both travel frequency and budget before saving.');
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return;
        }

        axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/update-preferences/', preferences, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            setPreferencesSet(true);
            setPreferences(response.data.preferences);
            setIsSaveEnabled(true);
            // Show modal and ensure it's visible
            setTimeout(() => {
                setShowModal(true);
            }, 100);
            // Note: Navigation will happen when user clicks OK in modal
        })
        .catch(error => {
            console.error('Error saving preferences:', error);
            alert('Error saving preferences. Please try again.');
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return;
        }

        // Log the data being sent to the backend
        console.log('Sending profile data to backend:', editData);

        axios.put('https://travel-buddy-backend-0jf1.onrender.com/api/update-profile/', editData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            // Get fresh profile data from the server
            return axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/profile/', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        })
        .then(response => {
            const userData = response.data;
            console.log('Profile data received:', userData);
            // Explicitly handle phone number
            if (userData.phone_number) {
                console.log('Phone number found:', userData.phone_number);
            } else {
                console.log('No phone number found in response');
            }
            setProfile(userData);
            setPreferences(userData.preferences || {});
            setPreferencesSet(!!userData.preferences?.travel_frequency && !!userData.preferences?.travel_budget);
            setIsSaveEnabled(!!userData.preferences?.travel_frequency && !!userData.preferences?.travel_budget);
            setEditData({
                username: userData.username || '',
                email: userData.email || '',
                gender: userData.gender || '',
                dob: userData.dob || '',
                phone_number: userData.phone_number || ''
            });
            setIsEditing(false);
            alert('Profile updated successfully!');
        })
        .catch(error => {
            console.error('Error updating profile:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                navigate('/login');
            } else {
                alert(error.response?.data?.detail || 'Error updating profile. Please try again.');
            }
        });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return;
        }

        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordData.new_password.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return;
        }

        axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/change-password/', passwordData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            setIsPasswordEditing(false);
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            setPasswordError('');
            alert('Password changed successfully!');
        })
        .catch(error => {
            console.error('Error changing password:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                navigate('/login');
            } else {
                setPasswordError(error.response?.data?.detail || 'Error changing password. Please try again.');
            }
        });
    };

    const handlePasswordCancel = () => {
        setIsPasswordEditing(false);
        setPasswordData({
            current_password: '',
            new_password: '',
            confirm_password: ''
        });
        setPasswordError('');
    };

    if (isLoading) {
        return (
            <div className="loading">
                <FaSpinner className="spinner" />
                <p>Loading your profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="error">
                <FaExclamationTriangle />
                <p>Error loading profile. Please try again.</p>
            </div>
        );
    }

    const handleModalClose = () => {
        setShowModal(false);
        navigate('/destinations', { replace: true });
    };

    return (
        <div className="profile-container">
            <Modal isOpen={showModal} onClose={handleModalClose} />
            <div className="profile-banner"></div>
            <div className="profile-header">
                <div className="profile-image">
                    {profile.profile_picture ? (
                        <img 
                            src={profile.profile_picture} 
                            alt="Profile"
                            onError={(e) => {
                                e.target.src = '/default-profile.png';
                            }}
                        />
                    ) : (
                        <div className="default-profile-image">
                            <FaUser />
                        </div>
                    )}
                </div>
                <div className="profile-info">
                    <div className="profile-info-header">
                        <h1>{profile.username || 'User'}</h1>
                        <div className="profile-actions">
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`action-button ${isEditing ? 'active' : ''}`}
                            >
                                {isEditing ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit Profile</>}
                            </button>
                            <button 
                                onClick={() => setIsPasswordEditing(!isPasswordEditing)}
                                className={`action-button ${isPasswordEditing ? 'active' : ''}`}
                            >
                                {isPasswordEditing ? <><FaTimes /> Cancel</> : <><FaLock /> Change Password</>}
                            </button>
                        </div>
                    </div>
                    <div className="profile-stats">
                        {/* Removed mock data */}
                    </div>
                    <div className="profile-contact">
                        <p><MdEmail /> {profile.email || 'No email provided'}</p>
                        <p><MdPhone /> {profile && profile.phone_number ? profile.phone_number : 'No phone number provided'}</p>
                    </div>
                    <div className="profile-details">
                        <p><strong>Gender:</strong> {profile.gender === 'M' ? 'Male' : profile.gender === 'F' ? 'Female' : profile.gender === 'O' ? 'Other' : 'Not specified'}</p>
                        <p><strong>Date of Birth:</strong> {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not specified'}</p>
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="edit-form">
                    <form onSubmit={handleEditSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username:</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={editData.username}
                                onChange={handleEditChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={editData.email}
                                onChange={handleEditChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="gender">Gender:</label>
                            <select
                                id="gender"
                                name="gender"
                                value={editData.gender}
                                onChange={handleEditChange}
                                required
                            >
                                <option value="">Select gender</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="dob">Date of Birth:</label>
                            <input
                                type="date"
                                id="dob"
                                name="dob"
                                value={editData.dob}
                                onChange={handleEditChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone_number">Phone Number:</label>
                            <input
                                type="tel"
                                id="phone_number"
                                name="phone_number"
                                value={editData.phone_number || ''}
                                onChange={handleEditChange}
                                placeholder="Enter phone number (e.g., 9123456789)"
                                pattern="[0-9]{10}"
                                title="Phone number must be exactly 10 digits without spaces or special characters"
                            />
                        </div>

                        <div className="form-buttons">
                            <button type="submit" className="save-button">
                                <FaSave /> Save Changes
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setIsEditing(false)}
                                className="cancel-button"
                            >
                                <FaTimes /> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isPasswordEditing && (
                <div className="edit-form">
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label htmlFor="current_password">Current Password:</label>
                            <input
                                type="password"
                                id="current_password"
                                name="current_password"
                                value={passwordData.current_password}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="new_password">New Password:</label>
                            <input
                                type="password"
                                id="new_password"
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm_password">Confirm New Password:</label>
                            <input
                                type="password"
                                id="confirm_password"
                                name="confirm_password"
                                value={passwordData.confirm_password}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        {passwordError && (
                            <div className="error" style={{ marginBottom: '1rem' }}>
                                {passwordError}
                            </div>
                        )}

                        <div className="form-buttons">
                            <button type="submit" className="save-button">
                                <FaSave /> Save Changes
                            </button>
                            <button 
                                type="button" 
                                onClick={handlePasswordCancel}
                                className="cancel-button"
                            >
                                <FaTimes /> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="preferences-section">
                <h2><FaCog /> Travel Preferences</h2>
                {!preferencesSet && (
                    <div className="preferences-warning">
                        <FaExclamationTriangle />
                        <div>
                            <p>Please set your travel preferences to continue using the app.</p>
                            <p>Your preferences help us find the best travel buddies for you!</p>
                        </div>
                    </div>
                )}
                <div className="preferences-form">
                    <div className="form-group">
                        <label htmlFor="travel_frequency">
                            <FaPlane /> Travel Frequency:
                        </label>
                        <select
                            id="travel_frequency"
                            name="travel_frequency"
                            value={preferences.travel_frequency || ''}
                            onChange={handlePreferencesChange}
                            required
                        >
                            <option value="">Select frequency</option>
                            <option value="Rarely">Rarely</option>
                            <option value="Occasionally">Occasionally</option>
                            <option value="Frequently">Frequently</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="travel_budget">
                            <FaMoneyBillWave /> Travel Budget:
                        </label>
                        <select
                            id="travel_budget"
                            name="travel_budget"
                            value={preferences.travel_budget || ''}
                            onChange={handlePreferencesChange}
                            required
                        >
                            <option value="">Select budget range</option>
                            <option value="low">Budget-Friendly</option>
                            <option value="medium">Moderate</option>
                            <option value="high">Luxury</option>
                        </select>
                    </div>

                    <button 
                        onClick={savePreferences} 
                        className="save-button"
                        disabled={!isSaveEnabled}
                    >
                        <MdTravelExplore /> Set Preferences
                    </button>
                </div>
            </div>
            <Modal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)}
                onConfirm={() => navigate('/destinations')}
            />
        </div>
    );
};

export default Profile;
