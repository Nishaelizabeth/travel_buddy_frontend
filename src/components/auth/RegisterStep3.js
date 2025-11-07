import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { validateProfilePicture, validateBio, validateTravelPreferences } from './ValidationUtils';
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
  justify-content: space-between;
  margin-top: 2rem;
`;

const ProfilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ProfileImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #666666;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileField = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const ProfileLabel = styled.span`
  color: #666666;
  font-weight: 500;
`;

const ProfileValue = styled.span`
  color: #333333;
  font-weight: 600;
`;

const FormInput = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
`;

const RegisterStep3 = ({ formData, setFormData, errors, setErrors, onBack, onSubmit }) => {
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
    profile_picture: false,
    bio: false,
    travel_preferences: false
  });
  
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
    
    // Validate fields as user types
    if (name === 'bio') {
      const bioError = validateBio(value);
      if (bioError) {
        setErrors(prev => ({ ...prev, bio: bioError }));
      }
    } else if (name === 'travel_preferences') {
      const preferencesError = validateTravelPreferences(value);
      if (preferencesError) {
        setErrors(prev => ({ ...prev, travel_preferences: preferencesError }));
      }
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file before setting
      const fileError = validateProfilePicture(file);
      if (fileError) {
        setErrors(prev => ({ ...prev, profile_picture: fileError }));
        return;
      }
      
      // Clear any existing errors for profile picture
      if (errors.profile_picture) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.profile_picture;
          return newErrors;
        });
      }
      
      setFormData({ ...formData, profile_picture: file });
      console.log('Profile picture selected:', file.name);
    }
  };

  const handleSubmit = () => {
    const newErrors = {};
    
    // Validate profile picture if provided
    if (formData.profile_picture) {
      const profilePictureError = validateProfilePicture(formData.profile_picture);
      if (profilePictureError) newErrors.profile_picture = profilePictureError;
    }
    
    // Validate bio if provided
    if (formData.bio) {
      const bioError = validateBio(formData.bio);
      if (bioError) newErrors.bio = bioError;
    }
    
    // Validate travel preferences if provided
    if (formData.travel_preferences) {
      const preferencesError = validateTravelPreferences(formData.travel_preferences);
      if (preferencesError) newErrors.travel_preferences = preferencesError;
    }
    
    setErrors(newErrors);
    
    // Only proceed if no errors
    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    }
  };

  return (
    <StepContent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StepTitle>Profile & Review</StepTitle>
      <StepDescription>Add your profile picture and review your details before completing registration</StepDescription>

      <ProfilePreview>
        <ProfileImage>
          {formData.profile_picture ? (
            <img
              src={URL.createObjectURL(formData.profile_picture)}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            formData.full_name?.[0]?.toUpperCase() || 'U'
          )}
        </ProfileImage>

        <ProfileInfo>
          <ProfileField>
            <ProfileLabel>Full Name</ProfileLabel>
            <ProfileValue>{formData.full_name}</ProfileValue>
          </ProfileField>
          <ProfileField>
            <ProfileLabel>Username</ProfileLabel>
            <ProfileValue>{formData.username}</ProfileValue>
          </ProfileField>
          <ProfileField>
            <ProfileLabel>Email</ProfileLabel>
            <ProfileValue>{formData.email}</ProfileValue>
          </ProfileField>
          <ProfileField>
            <ProfileLabel>Gender</ProfileLabel>
            <ProfileValue>{formData.gender}</ProfileValue>
          </ProfileField>
          <ProfileField>
            <ProfileLabel>Date of Birth</ProfileLabel>
            <ProfileValue>{formData.dob}</ProfileValue>
          </ProfileField>
        </ProfileInfo>
      </ProfilePreview>

      <FormRow>
        <FormColumn>
          <FormInput
            type="tel"
            name="phone_number"
            value={formData.phone_number || ''}
            onChange={handleFieldChange}
            error={errors.phone_number}
            placeholder="(123) 456-7890"
          />
        </FormColumn>
        <FormColumn>
          <FormInput
            type="text"
            name="location"
            value={formData.location || ''}
            onChange={handleFieldChange}
            error={errors.location}
            placeholder="City, State or Country"
          />
        </FormColumn>
      </FormRow>

      <FormRow>
        <FormColumn>
          <label htmlFor="profilePicture">Profile Picture</label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            accept="image/*"
            onChange={handleFileChange}
            className="form-control"
            placeholder="Choose a profile picture"
          />
        </FormColumn>
      </FormRow>

      <ButtonContainer>
        <button
          type="button"
          onClick={onBack}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#E0E0E0',
            color: '#333333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2F80ED',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          Complete Registration
        </button>
      </ButtonContainer>
    </StepContent>
  );
};

export default RegisterStep3;
