import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaPlane } from 'react-icons/fa';
import './Navbar.scss';
import './NotificationStyles.scss';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout: authLogout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const token = localStorage.getItem('accessToken');
            
            if (!refreshToken) {
                console.warn('No refresh token found');
                authLogout();
                setDropdownOpen(false);
                navigate('/');
                return;
            }
            
            // Call logout endpoint

            await fetch('https://travel-buddy-backend-0jf1.onrender.com/api/logout/', {

                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh_token: refreshToken })
            });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            // Use the logout function from AuthContext
            authLogout();
            setDropdownOpen(false);
            // Redirect to home page
            navigate('/');
        }
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('.user-menu')) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [dropdownOpen]);

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="logo-link">
                    <FaPlane className="logo-icon" />
                    <span className="logo-text">TravelBuddy</span>
                </Link>
                <button className="mobile-menu-btn" onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
            <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    {user && <Link to="/destinations">Destinations</Link>}
                    {user && <Link to="/my-trips">My Trips</Link>}
                    {user && <Link to="/dashboard">Dashboard</Link>}
                </div>
                {user ? (
                    <>
                        <div className="user-menu">
                            <button className="user-button" onClick={toggleDropdown}>
                                {user.username}
                                <i className={`arrow ${dropdownOpen ? 'up' : 'down'}`}></i>
                            </button>
                            {dropdownOpen && (
                                <div className="dropdown-menu">
                                    <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                                        Profile
                                    </Link>
                                    <button onClick={handleLogout}>Logout</button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="login-button">Login</Link>
                        <Link to="/register" className="signup-button">Sign Up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
