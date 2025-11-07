import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import styled from 'styled-components';

import { AuthLayout, AuthCard, Title, Subtitle } from './AuthLayout';
import RegisterWrapper from './RegisterWrapper';
import signupBgVideo from '../../Assets/signup bg.mp4';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dob: '',
    profilePicture: null,
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

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.full_name || formData.full_name.trim().length === 0) {
      newErrors.full_name = 'Please enter your full name';
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    if (!formData.dob) {
      newErrors.dob = 'Please enter your date of birth';
    } else {
      const selectedDate = new Date(formData.dob);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.dob = 'Date of birth cannot be in the future';
      }
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
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'profilePicture' && formData[key]) {
          formDataToSend.append('profile_picture', formData[key]);
        } else if (key !== 'confirmPassword' && formData[key]) {
          if (key === 'dob') {
            formDataToSend.append(key, new Date(formData[key]).toISOString().split('T')[0]);
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });


      await axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/register/', formDataToSend, {

        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Registration successful! Please verify your email.');
      navigate('/login');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout backgroundVideo={signupBgVideo}>
      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Travel illustration or animation - hidden when using background video */}
          {/* <div style={{ width: '100%', maxWidth: '400px', height: '100%', background: '#f8f9fa', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Placeholder for illustration
          </div> */}
        </div>

        <AuthCard
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Title>Join Travel Buddy!</Title>
          <Subtitle>Create your account to explore and connect</Subtitle>
          <RegisterWrapper
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            loading={loading}
            setLoading={setLoading}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
            handleSubmit={handleSubmit}
          />
        </AuthCard>
      </div>
    </AuthLayout>
  );
};

export default Register;
