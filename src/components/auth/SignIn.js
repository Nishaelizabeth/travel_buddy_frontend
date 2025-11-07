import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { validateUsernameOrEmail, validateLoginPassword } from './ValidationUtils';

import { AuthLayout, AuthCard, Title, Subtitle } from './AuthLayout';
import { FormInput } from './FormInput';
import { Button } from './Button';

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');  // Add state for login error message

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear any existing errors for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Real-time validation as user types
    if (name === 'usernameOrEmail' && value.trim() !== '') {
      const usernameOrEmailError = validateUsernameOrEmail(value);
      if (usernameOrEmailError) {
        setErrors(prev => ({ ...prev, usernameOrEmail: usernameOrEmailError }));
      }
    } else if (name === 'password' && value.trim() !== '') {
      const passwordError = validateLoginPassword(value);
      if (passwordError) {
        setErrors(prev => ({ ...prev, password: passwordError }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Use validation utilities
    const usernameOrEmailError = validateUsernameOrEmail(formData.usernameOrEmail);
    if (usernameOrEmailError) newErrors.usernameOrEmail = usernameOrEmailError;
    
    const passwordError = validateLoginPassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setLoginError('');  // Clear previous login errors

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setLoading(false);
      return;
    }

    try {

      const response = await axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/login/', {

        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
      });

      // Store tokens with consistent names
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);

      // Log the user data from response for debugging
      console.log('User data from login response:', response.data.user);

      // Update auth context with user data and tokens
      login({
        user: response.data.user,
        tokens: {
          access: response.data.access,
          refresh: response.data.refresh
        }
      });

      toast.success('Login successful!');
      
      // Redirect to admin dashboard if user is admin, otherwise to regular dashboard
      if (response.data.user && (response.data.user.is_staff === true || response.data.user.is_superuser === true)) {
        console.log('Admin user detected, redirecting to admin dashboard');
        navigate('/admin-dashboard');
      } else {
        console.log('Regular user detected, redirecting to user dashboard');
        navigate('/dashboard');
      }
    } catch (error) {
      // Display specific error message from backend if available
      if (error.response && error.response.data && error.response.data.error) {
        setLoginError(error.response.data.error);
        toast.error(error.response.data.error);
      } else {
        setLoginError('Login failed. Please check your credentials.');
        toast.error('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>Welcome Back!</Title>
        <Subtitle>Sign in to continue</Subtitle>

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Username or Email"
            type="text"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            error={errors.usernameOrEmail}
            placeholder="Enter your username or email"
          />

          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
          />

          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <a href="/forgot-password" style={{ color: '#2F80ED', textDecoration: 'none' }}>
              Forgot Password?
            </a>
          </div>

          {loginError && (
            <div style={{ 
              color: '#e74c3c', 
              backgroundColor: '#fdecea', 
              padding: '10px', 
              borderRadius: '4px', 
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              {loginError}
            </div>
          )}

          <Button type="submit" loading={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <span style={{ color: '#666666' }}>Don't have an account? </span>
            <a href="/register" style={{ color: '#2F80ED', textDecoration: 'none' }}>
              Sign Up
            </a>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default SignIn;
