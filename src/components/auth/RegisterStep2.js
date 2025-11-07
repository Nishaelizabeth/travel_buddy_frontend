import React, { useState, useEffect } from 'react';
import { FormInput } from './FormInput';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { validatePassword, validateConfirmPassword, validateGender, validateDob } from './ValidationUtils';
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
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StepTitle = styled.h3`
  color: #2F80ED;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
  width: 100%;
  max-width: 500px;
`;

const StepDescription = styled.p`
  color: #666666;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  text-align: center;
  width: 100%;
  max-width: 500px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 500px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormColumn = styled.div`
  flex: 1;
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  width: 100%;
  max-width: 500px;
`;

const RegisterStep2 = ({ formData, setFormData, errors, setErrors, onBack, onNext }) => {
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
  // State to track field validation in real-time
  // eslint-disable-next-line no-unused-vars
  const [validating, setValidating] = useState({
    password: false,
    confirm_password: false
  });
  
  // Initialize date parts from existing dob value if it exists
  useEffect(() => {
    // Only initialize if dob exists but the individual parts don't
    if (formData.dob && (!formData.dobDay || !formData.dobMonth || !formData.dobYear)) {
      const [year, month, day] = formData.dob.split('-');
      console.log('Initializing date parts:', year, month, day);
      setFormData(prev => ({
        ...prev,
        dobDay: parseInt(day, 10).toString(), // Remove leading zero
        dobMonth: month,
        dobYear: year
      }));
      
      // Update available days based on the initialized month and year
      updateAvailableDays(month, year);
    }
  }, [formData.dob, formData.dobDay, formData.dobMonth, formData.dobYear, setFormData]);
  
  // Update available days whenever month or year changes
  useEffect(() => {
    updateAvailableDays(formData.dobMonth, formData.dobYear);
  }, [formData.dobMonth, formData.dobYear]);
  
  // State to track available days based on selected month and year
  const [availableDays, setAvailableDays] = useState([]);
  
  // Generate arrays for months and years for DOB selectors
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  
  // Generate years (from current year - 100 to current year - 18)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 83 }, (_, i) => currentYear - 18 - i);
  
  // Function to update available days based on selected month and year
  const updateAvailableDays = (month, year) => {
    if (!month || !year) {
      // Default to 31 days if month or year not selected
      setAvailableDays(Array.from({ length: 31 }, (_, i) => i + 1));
      return;
    }
    
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    // Get the number of days in the selected month and year
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    console.log(`Days in ${monthNum}/${yearNum}: ${daysInMonth}`);
    
    // Update available days
    setAvailableDays(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  };
  
  // Handle date of birth changes directly
  const handleDayChange = (e) => {
    const day = e.target.value;
    console.log('Day selected:', day);
    
    // Update form data with the new day value
    setFormData(prev => {
      const newData = { ...prev, dobDay: day };
      
      // Update full date if all parts are present
      if (day && prev.dobMonth && prev.dobYear) {
        const paddedDay = day.toString().padStart(2, '0');
        newData.dob = `${prev.dobYear}-${prev.dobMonth}-${paddedDay}`;
      }
      
      return newData;
    });
  };
  
  const handleMonthChange = (e) => {
    const month = e.target.value;
    console.log('Month selected:', month);
    
    // Update form data with the new month value
    setFormData(prev => {
      const newData = { ...prev, dobMonth: month };
      
      // Update available days based on selected month and year
      updateAvailableDays(month, prev.dobYear);
      
      // Check if the current day is valid for the new month
      if (prev.dobDay && month && prev.dobYear) {
        const daysInNewMonth = new Date(parseInt(prev.dobYear, 10), parseInt(month, 10), 0).getDate();
        let validDay = prev.dobDay;
        
        // If current day is greater than days in new month, adjust it
        if (parseInt(prev.dobDay, 10) > daysInNewMonth) {
          validDay = daysInNewMonth.toString();
          newData.dobDay = validDay;
        }
        
        // Update full date
        const paddedDay = validDay.toString().padStart(2, '0');
        newData.dob = `${prev.dobYear}-${month}-${paddedDay}`;
      }
      
      return newData;
    });
  };
  
  const handleYearChange = (e) => {
    const year = e.target.value;
    console.log('Year selected:', year);
    
    // Update form data with the new year value
    setFormData(prev => {
      const newData = { ...prev, dobYear: year };
      
      // Update available days based on selected month and year
      updateAvailableDays(prev.dobMonth, year);
      
      // Check if the current day is valid for the new year (for February in leap years)
      if (prev.dobDay && prev.dobMonth && year) {
        const daysInMonth = new Date(parseInt(year, 10), parseInt(prev.dobMonth, 10), 0).getDate();
        let validDay = prev.dobDay;
        
        // If current day is greater than days in month (e.g., Feb 29 in non-leap year), adjust it
        if (parseInt(prev.dobDay, 10) > daysInMonth) {
          validDay = daysInMonth.toString();
          newData.dobDay = validDay;
        }
        
        // Update full date
        const paddedDay = validDay.toString().padStart(2, '0');
        newData.dob = `${year}-${prev.dobMonth}-${paddedDay}`;
      }
      
      return newData;
    });
  };
  
  // Handle field changes with validation
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    
    // Handle date parts separately
    if (name === 'dobDay') {
      handleDayChange(e);
      return;
    } else if (name === 'dobMonth') {
      handleMonthChange(e);
      return;
    } else if (name === 'dobYear') {
      handleYearChange(e);
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear any existing errors for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Validate fields as user types
    if (name === 'password') {
      const passwordError = validatePassword(value);
      if (passwordError) {
        setErrors(prev => ({ ...prev, password: passwordError }));
      }
      
      // If confirm password already has a value, validate it again
      if (formData.confirm_password) {
        const confirmError = validateConfirmPassword(value, formData.confirm_password);
        if (confirmError) {
          setErrors(prev => ({ ...prev, confirm_password: confirmError }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.confirm_password;
            return newErrors;
          });
        }
      }
    } else if (name === 'confirm_password') {
      const confirmError = validateConfirmPassword(formData.password, value);
      if (confirmError) {
        setErrors(prev => ({ ...prev, confirm_password: confirmError }));
      }
    } else if (name === 'gender') {
      const genderError = validateGender(value);
      if (genderError) {
        setErrors(prev => ({ ...prev, gender: genderError }));
      }
    }
  };
  
  const handleNext = () => {
    const newErrors = {};
    
    // Validate all fields
    const passwordError = validatePassword(formData.password || '');
    if (passwordError) newErrors.password = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(formData.password || '', formData.confirm_password || '');
    if (confirmPasswordError) newErrors.confirm_password = confirmPasswordError;
    
    const genderError = validateGender(formData.gender);
    if (genderError) newErrors.gender = genderError;
    
    const dobError = validateDob(formData.dob);
    if (dobError) newErrors.dob = dobError;

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
      <StepTitle>Security & Personal Details</StepTitle>
      <StepDescription>Let's secure your account and add some personal details</StepDescription>

      <FormRow>
        <FormColumn>
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password || ''}
            onChange={handleFieldChange}
            error={errors.password}
            placeholder="Create a strong password"
            isValidating={validating.password}
          />
        </FormColumn>
        <FormColumn>
          <FormInput
            label="Confirm Password"
            type="password"
            name="confirm_password"
            value={formData.confirm_password || ''}
            onChange={handleFieldChange}
            error={errors.confirm_password}
            placeholder="Re-enter your password"
            isValidating={validating.confirm_password}
          />
        </FormColumn>
      </FormRow>

      {/* Gender section */}
      <FormRow>
        <FormColumn>
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ''}
              onChange={handleFieldChange}
              className={`form-control custom-select ${errors.gender ? 'is-invalid' : ''}`}
              style={{ 
                color: '#333', 
                appearance: 'auto',
                backgroundColor: 'white',
                border: '1px solid #ced4da',
                padding: '0.375rem 0.75rem',
                fontSize: '1rem',
                lineHeight: '1.5',
                width: '100%',
                minWidth: '120px'
              }}
            >
              <option value="" style={{color: '#6c757d'}}>Select gender</option>
              <option value="M" style={{color: '#212529'}}>Male</option>
              <option value="F" style={{color: '#212529'}}>Female</option>
              <option value="O" style={{color: '#212529'}}>Other</option>
            </select>
            {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
          </div>
        </FormColumn>
      </FormRow>
      
      {/* Date of Birth section */}
      <FormRow>
        <FormColumn>
          <div className="form-group">
            <label>Date of Birth</label>
            <div className="dob-container" style={{ display: 'flex', gap: '10px' }}>
              {/* Day selector - increased width */}
              <div style={{ flex: '0 0 80px', position: 'relative' }}>
                <select
                  name="dobDay"
                  value={formData.dobDay || ''}
                  onChange={handleDayChange}
                  className={`form-control custom-select ${errors.dob ? 'is-invalid' : ''}`}
                  style={{ 
                    color: '#333', 
                    appearance: 'auto',
                    backgroundColor: 'white',
                    border: '1px solid #ced4da',
                    padding: '0.375rem 0.75rem',
                    fontSize: '1rem',
                    lineHeight: '1.5',
                    width: '100%',
                    minWidth: '70px'
                  }}
                >
                  <option value="" style={{color: '#6c757d'}}>Day</option>
                  {availableDays.map(day => (
                    <option key={`day-${day}`} value={day.toString()} style={{color: '#212529'}}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Month selector - increased width for full month names */}
              <div style={{ flex: '0 0 140px', position: 'relative' }}>
                <select
                  name="dobMonth"
                  value={formData.dobMonth || ''}
                  onChange={handleMonthChange}
                  className={`form-control custom-select ${errors.dob ? 'is-invalid' : ''}`}
                  style={{ 
                    color: '#333', 
                    appearance: 'auto',
                    backgroundColor: 'white',
                    border: '1px solid #ced4da',
                    padding: '0.375rem 0.75rem',
                    fontSize: '1rem',
                    lineHeight: '1.5',
                    width: '100%',
                    minWidth: '130px'
                  }}
                >
                  <option value="" style={{color: '#6c757d'}}>Month</option>
                  {months.map(month => (
                    <option key={`month-${month.value}`} value={month.value} style={{color: '#212529'}}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Year selector - increased width */}
              <div style={{ flex: '0 0 100px', position: 'relative' }}>
                <select
                  name="dobYear"
                  value={formData.dobYear || ''}
                  onChange={handleYearChange}
                  className={`form-control custom-select ${errors.dob ? 'is-invalid' : ''}`}
                  style={{ 
                    color: '#333', 
                    appearance: 'auto',
                    backgroundColor: 'white',
                    border: '1px solid #ced4da',
                    padding: '0.375rem 0.75rem',
                    fontSize: '1rem',
                    lineHeight: '1.5',
                    width: '100%',
                    minWidth: '90px'
                  }}
                >
                  <option value="" style={{color: '#6c757d'}}>Year</option>
                  {years.map(year => (
                    <option key={`year-${year}`} value={year.toString()} style={{color: '#212529'}}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {errors.dob && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.dob}</div>}
          </div>
        </FormColumn>
      </FormRow>

      <ButtonContainer>
        <button
          onClick={onBack}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#E0E0E0',
            color: '#333333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={Object.keys(errors).length > 0}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2F80ED',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
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

export default RegisterStep2;
