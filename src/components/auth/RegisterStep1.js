import React, { useState, useEffect } from 'react';
import { FormInput } from './FormInput';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';
import { debounce } from 'lodash';
import { validateUsername, validateEmail, validateFullName, validatePhoneNumber } from './ValidationUtils';
import signupBgVideo from '../../Assets/signup bg.mp4';

const VideoBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const StepContent = styled(motion.div)`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(5px);
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const StepTitle = styled.h3`
  color: #2F80ED;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
`;

const StepDescription = styled.p`
  color: #666666;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  text-align: center;
`;

const FormRow = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormColumn = styled.div`
  flex: 1;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const RegisterStep1 = ({ formData, setFormData, errors, setErrors, onNext, backendErrors }) => {
  // Add background video
  useEffect(() => {
    // Create and append video background if it doesn't exist
    if (!document.getElementById('signup-bg-video')) {
      const videoBackground = document.createElement('div');
      videoBackground.id = 'video-background-container';
      videoBackground.style.position = 'fixed';
      videoBackground.style.top = '0';
      videoBackground.style.left = '0';
      videoBackground.style.width = '100%';
      videoBackground.style.height = '100%';
      videoBackground.style.overflow = 'hidden';
      videoBackground.style.zIndex = '-1';

      const video = document.createElement('video');
      video.id = 'signup-bg-video';
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';

      const source = document.createElement('source');
      source.src = signupBgVideo;
      source.type = 'video/mp4';

      video.appendChild(source);
      videoBackground.appendChild(video);
      document.body.appendChild(videoBackground);
    }

    // Clean up function
    return () => {
      const videoBackground = document.getElementById('video-background-container');
      if (videoBackground) {
        videoBackground.remove();
      }
    };
  }, []);
  const [validating, setValidating] = useState({
    username: false,
    email: false,
    phone_number: false
  });
  
  // Client-side validation before backend check
  const validateClientSide = (fieldName, value) => {
    let error = null;
    
    switch(fieldName) {
      case 'username':
        error = validateUsername(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'full_name':
        error = validateFullName(value);
        break;
      case 'phone_number':
        error = validatePhoneNumber(value);
        break;
      default:
        break;
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
      return false;
    }
    
    return true;
  };
  
  // Backend validation function
  const validateField = async (fieldName, value) => {
    if (!value || value.trim() === '') return;
    
    // First perform client-side validation
    if (!validateClientSide(fieldName, value)) return;
    
    setValidating(prev => ({ ...prev, [fieldName]: true }));
    
    try {

      const response = await axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/validate-field/', {

        field_name: fieldName,
        field_value: value
      });
      
      if (!response.data.valid) {
        setErrors(prev => ({ ...prev, [fieldName]: response.data.message }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    } catch (error) {
      console.error(`Error validating ${fieldName}:`, error);
    } finally {
      setValidating(prev => ({ ...prev, [fieldName]: false }));
    }
  };
  
  // Create debounced versions of the validation functions
  const debouncedValidateUsername = debounce((value) => validateField('username', value), 500);
  const debouncedValidateEmail = debounce((value) => validateField('email', value), 500);
  const debouncedValidatePhone = debounce((value) => validateField('phone_number', value), 500);
  
  // Handle field changes with validation
  const handleFieldChange = (e) => {
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
    
    // Perform client-side validation immediately
    validateClientSide(name, value);
    
    // For fields that need backend validation, use debounced functions
    if (name === 'username' && value.trim().length >= 3) {
      debouncedValidateUsername(value);
    } else if (name === 'email' && value.includes('@')) {
      debouncedValidateEmail(value);
    } else if (name === 'phone_number' && value.trim().length >= 10) {
      debouncedValidatePhone(value);
    }
  };
  
  const handleNext = () => {
    const newErrors = {};
    
    // Validate all fields
    const fullNameError = validateFullName(formData.full_name || '');
    if (fullNameError) newErrors.full_name = fullNameError;
    
    const usernameError = validateUsername(formData.username || '');
    if (usernameError) newErrors.username = usernameError;
    
    const emailError = validateEmail(formData.email || '');
    if (emailError) newErrors.email = emailError;
    
    const phoneError = validatePhoneNumber(formData.phone_number || '');
    if (phoneError) newErrors.phone_number = phoneError;

    setErrors(newErrors);
    
    // Only proceed if no errors
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  return (
    <StepContent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StepTitle>Personal Information</StepTitle>
      <StepDescription>Tell us a bit about yourself</StepDescription>

      <FormRow>
        <FormColumn>
          <FormInput
            label="Full Name"
            type="text"
            name="full_name"
            value={formData.full_name || ''}
            onChange={handleFieldChange}
            error={errors.full_name}
            placeholder="Enter your full name"
          />
        </FormColumn>
        <FormColumn>
          <FormInput
            label="Username"
            type="text"
            name="username"
            value={formData.username || ''}
            onChange={handleFieldChange}
            error={errors.username || backendErrors?.username}
            placeholder="Choose a unique username"
            isValidating={validating.username}
          />
        </FormColumn>
      </FormRow>

      <FormRow>
        <FormColumn>
          <FormInput
            label="Phone Number"
            type="tel"
            name="phone_number"
            value={formData.phone_number || ''}
            onChange={handleFieldChange}
            error={errors.phone_number}
            placeholder="Enter your phone number"
            isValidating={validating.phone_number}
          />
        </FormColumn>
      </FormRow>

      <FormRow>
        <FormColumn>
          <FormInput
            label="Email Address"
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleFieldChange}
            error={errors.email || backendErrors?.email}
            placeholder="example@email.com"
            isValidating={validating.email}
          />
        </FormColumn>
      </FormRow>

      <ButtonContainer>
        <button
          onClick={handleNext}
          disabled={Object.keys(errors).length > 0}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2F80ED',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Next
        </button>
      </ButtonContainer>
    </StepContent>
  );
};

export default RegisterStep1;
