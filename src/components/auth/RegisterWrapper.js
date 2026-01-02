import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import RegisterStep1 from './RegisterStep1';
import RegisterStep2 from './RegisterStep2';
import RegisterStep3 from './RegisterStep3';
import { AuthContainer, AuthCard, StepIndicator } from '../ui/auth-switch';


const RegisterWrapper = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Form state - PRESERVED
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    gender: '',
    dob: '',
    phone_number: '',
    profile_picture: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});

  // Auto-save form data to localStorage - PRESERVED
  useEffect(() => {
    localStorage.setItem('registrationData', JSON.stringify(formData));
  }, [formData]);

  // Load saved form data on mount - PRESERVED
  useEffect(() => {
    const savedData = localStorage.getItem('registrationData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Don't load profile_picture as it can't be serialized
        const { profile_picture, ...rest } = parsed;
        setFormData(prev => ({ ...prev, ...rest }));
      } catch (e) {
        console.log('Error loading saved data');
      }
    }
  }, []);

  // Step navigation handlers - PRESERVED
  const handleNext = () => {
    setBackendErrors({});
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Form submission with API call - PRESERVED
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();

      console.log('Form data before sending:', formData);

      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          if (key === 'dob') {
            const formattedDate = new Date(formData[key]).toISOString().split('T')[0];
            formDataToSend.append(key, formattedDate);
            console.log(`Adding ${key}: ${formattedDate}`);
          } else if (key === 'profile_picture' && formData[key]) {
            formDataToSend.append('profile_picture', formData[key]);
            console.log(`Adding profile_picture: ${formData[key].name}`);
          } else if (key !== 'confirm_password') {
            formDataToSend.append(key, formData[key]);
            console.log(`Adding ${key}: ${formData[key]}`);
          }
        }
      });

      console.log('Sending registration data with profile picture');

      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/register/`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Registration response:', response.data);

      localStorage.removeItem('registrationData');

      toast.success('Registration successful! Please verify your email.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response && error.response.data) {
        console.error('Error response:', error.response.data);

        // Handle specific field errors - PRESERVED
        if (error.response.data.username) {
          setBackendErrors({
            ...backendErrors,
            username: error.response.data.username[0]
          });
          setCurrentStep(1);
          toast.error(error.response.data.username[0]);
        } else if (error.response.data.email) {
          setBackendErrors({
            ...backendErrors,
            email: error.response.data.email[0]
          });
          setCurrentStep(1);
          toast.error(error.response.data.email[0]);
        } else if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else if (typeof error.response.data === 'string') {
          toast.error(error.response.data);
        } else {
          toast.error('Registration failed. Please check your information and try again.');
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Basic Info', 'Security', 'Profile'];

  const renderStep = () => {
    const commonProps = {
      formData,
      setFormData,
      errors,
      setErrors,
    };

    switch (currentStep) {
      case 1:
        return (
          <RegisterStep1
            {...commonProps}
            backendErrors={backendErrors}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <RegisterStep2
            {...commonProps}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <RegisterStep3
            {...commonProps}
            onBack={handleBack}
            onSubmit={handleSubmit}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AuthContainer>
      <AuthCard className="max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Travel Buddy!</h1>
          <p className="text-gray-500">Create your account to explore and connect</p>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={3}
          labels={stepLabels}
        />

        {/* Step Content */}
        <div className="relative min-h-[400px]">
          {renderStep()}
        </div>
      </AuthCard>
    </AuthContainer>
  );
};

export default RegisterWrapper;
