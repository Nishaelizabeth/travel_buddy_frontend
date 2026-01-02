import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { validateUsernameOrEmail, validateLoginPassword } from './ValidationUtils';
import {
  AuthInput,
  AuthButton,
  AuthCard,
  AuthContainer,
  ErrorAlert
} from '../ui/auth-switch';
import { Mail, Lock } from 'lucide-react';


const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state - PRESERVED
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Handle input change with real-time validation - PRESERVED
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

  // Form validation - PRESERVED
  const validateForm = () => {
    const newErrors = {};

    const usernameOrEmailError = validateUsernameOrEmail(formData.usernameOrEmail);
    if (usernameOrEmailError) newErrors.usernameOrEmail = usernameOrEmailError;

    const passwordError = validateLoginPassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    return newErrors;
  };

  // Form submission with API call - PRESERVED
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setLoginError('');

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/login/`, {
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
      });

      // Store tokens - PRESERVED
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);

      console.log('User data from login response:', response.data.user);

      // Update auth context - PRESERVED
      login({
        user: response.data.user,
        tokens: {
          access: response.data.access,
          refresh: response.data.refresh
        }
      });

      toast.success('Login successful!');

      // Redirect logic - PRESERVED
      if (response.data.user && (response.data.user.is_staff === true || response.data.user.is_superuser === true)) {
        console.log('Admin user detected, redirecting to admin dashboard');
        navigate('/admin-dashboard');
      } else {
        console.log('Regular user detected, redirecting to user dashboard');
        navigate('/dashboard');
      }
    } catch (error) {
      // Error handling - PRESERVED
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
    <AuthContainer>
      <AuthCard>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-500">Sign in to continue your journey</p>
        </div>

        {/* Error Alert */}
        <ErrorAlert message={loginError} />

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Username or Email"
            type="text"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            error={errors.usernameOrEmail}
            placeholder="Enter your username or email"
            icon={Mail}
          />

          <AuthInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
            icon={Lock}
          />

          {/* Forgot Password Link */}
          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
            >
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <AuthButton type="submit" loading={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </AuthButton>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <span className="text-gray-500">Don't have an account? </span>
          <a
            href="/register"
            className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            Sign Up
          </a>
        </div>
      </AuthCard>
    </AuthContainer>
  );
};

export default SignIn;
