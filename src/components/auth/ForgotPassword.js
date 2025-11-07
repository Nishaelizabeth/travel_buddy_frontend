import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import { AuthLayout, AuthCard, Title, Subtitle } from './AuthLayout';
import { FormInput } from './FormInput';
import { Button } from './Button';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' or 'success'
  const [formData, setFormData] = useState({
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Please enter your email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setLoading(false);
      return;
    }

    try {

      const response = await axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/forgot-password/', {

        email: formData.email,
      });

      toast.success('Password reset code has been sent to your email');
      setStep('success');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to process your request. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderEmailForm = () => (
    <>
      <Title>Forgot Password</Title>
      <Subtitle>Enter your email to reset your password</Subtitle>

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Enter your email address"
          icon={<FiMail />}
        />

        <Button type="submit" loading={loading}>
          {loading ? 'Sending...' : 'Reset Password'}
        </Button>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <span style={{ color: '#666666' }}>Remember your password? </span>
          <a href="/login" style={{ color: '#2F80ED', textDecoration: 'none' }}>
            Sign In
          </a>
        </div>
      </form>
    </>
  );

  const renderSuccessMessage = () => (
    <>
      <Title>Check Your Email</Title>
      <Subtitle>We've sent a 6-digit code to your email</Subtitle>

      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <p>
          We've sent a 6-digit code to <strong>{formData.email}</strong>. 
          Please check your email and use this code as your new password to sign in.
        </p>
      </div>

      <Button onClick={() => navigate('/login')}>
        Back to Sign In
      </Button>
    </>
  );

  return (
    <AuthLayout>
      <AuthCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {step === 'email' ? renderEmailForm() : renderSuccessMessage()}
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPassword;
