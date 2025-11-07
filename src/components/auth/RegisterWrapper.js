import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Stepper from './Stepper';
import RegisterStep1 from './RegisterStep1';
import RegisterStep2 from './RegisterStep2';
import RegisterStep3 from './RegisterStep3';

const RegisterWrapper = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
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

  // Auto-save form data to localStorage
  useEffect(() => {
    localStorage.setItem('registrationData', JSON.stringify(formData));
  }, [formData]);

  // Load saved form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('registrationData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleNext = () => {
    // Clear backend errors when moving to next step
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Log what we're about to send
      console.log('Form data before sending:', formData);
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          if (key === 'dob') {
            const formattedDate = new Date(formData[key]).toISOString().split('T')[0];
            formDataToSend.append(key, formattedDate);
            console.log(`Adding ${key}: ${formattedDate}`);
          } else if (key === 'profile_picture' && formData[key]) {
            // Add profile picture to form data
            formDataToSend.append('profile_picture', formData[key]);
            console.log(`Adding profile_picture: ${formData[key].name}`);
          } else if (key !== 'confirm_password') { // Skip confirm_password as it's not needed by the backend
            formDataToSend.append(key, formData[key]);
            console.log(`Adding ${key}: ${formData[key]}`);
          }
        }
      });

      console.log('Sending registration data with profile picture');
      
      // Use multipart/form-data content type for file uploads

      const response = await axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/register/', formDataToSend, {

        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('Registration response:', response.data);

      // Clear registration data from localStorage after successful registration
      localStorage.removeItem('registrationData');
      
      toast.success('Registration successful! Please verify your email.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response && error.response.data) {
        console.error('Error response:', error.response.data);
        
        // Handle specific field errors (like username already exists)
        if (error.response.data.username) {
          setBackendErrors({
            ...backendErrors,
            username: error.response.data.username[0]
          });
          setCurrentStep(1); // Go back to first step where username is entered
          toast.error(error.response.data.username[0]);
        } else if (error.response.data.email) {
          setBackendErrors({
            ...backendErrors,
            email: error.response.data.email[0]
          });
          setCurrentStep(1); // Go back to first step where email is entered
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <RegisterStep1 formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} backendErrors={backendErrors} onNext={handleNext} />;
      case 2:
        return <RegisterStep2 formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} onBack={handleBack} onNext={handleNext} />;
      case 3:
        return <RegisterStep3 formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} onBack={handleBack} onSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Stepper currentStep={currentStep} totalSteps={3} />
      <div style={{ width: '100%' }}>
        {renderStep()}
      </div>
    </div>
  );
};

export default RegisterWrapper;
