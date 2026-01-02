import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { debounce } from 'lodash';
import { validateUsername, validateEmail, validateFullName, validatePhoneNumber } from './ValidationUtils';
import { AuthInput, NavArrow } from '../ui/auth-switch';
import { User, Mail, Phone } from 'lucide-react';

const RegisterStep1 = ({ formData, setFormData, errors, setErrors, onNext, backendErrors }) => {
  // Validation state - PRESERVED
  const [validating, setValidating] = useState({
    username: false,
    email: false,
    phone_number: false
  });

  // Client-side validation - PRESERVED
  const validateClientSide = (fieldName, value) => {
    let error = null;

    switch (fieldName) {
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

  // Backend validation - PRESERVED
  const validateField = async (fieldName, value) => {
    if (!value || value.trim() === '') return;

    if (!validateClientSide(fieldName, value)) return;

    setValidating(prev => ({ ...prev, [fieldName]: true }));

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/validate-field/`, {
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

  // Debounced validation - PRESERVED
  const debouncedValidateUsername = debounce((value) => validateField('username', value), 500);
  const debouncedValidateEmail = debounce((value) => validateField('email', value), 500);
  const debouncedValidatePhone = debounce((value) => validateField('phone_number', value), 500);

  // Handle field changes - PRESERVED
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    validateClientSide(name, value);

    if (name === 'username' && value.trim().length >= 3) {
      debouncedValidateUsername(value);
    } else if (name === 'email' && value.includes('@')) {
      debouncedValidateEmail(value);
    } else if (name === 'phone_number' && value.trim().length >= 10) {
      debouncedValidatePhone(value);
    }
  };

  // Handle next step - PRESERVED
  const handleNext = () => {
    const newErrors = {};

    const fullNameError = validateFullName(formData.full_name || '');
    if (fullNameError) newErrors.full_name = fullNameError;

    const usernameError = validateUsername(formData.username || '');
    if (usernameError) newErrors.username = usernameError;

    const emailError = validateEmail(formData.email || '');
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhoneNumber(formData.phone_number || '');
    if (phoneError) newErrors.phone_number = phoneError;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-blue-600">Personal Information</h2>
        <p className="text-gray-500 text-sm">Tell us a bit about yourself</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AuthInput
          label="Full Name"
          type="text"
          name="full_name"
          value={formData.full_name || ''}
          onChange={handleFieldChange}
          error={errors.full_name}
          placeholder="Enter your full name"
          icon={User}
        />

        <AuthInput
          label="Username"
          type="text"
          name="username"
          value={formData.username || ''}
          onChange={handleFieldChange}
          error={errors.username || backendErrors?.username}
          placeholder="Choose a unique username"
          icon={User}
          isValidating={validating.username}
        />
      </div>

      <AuthInput
        label="Email Address"
        type="email"
        name="email"
        value={formData.email || ''}
        onChange={handleFieldChange}
        error={errors.email || backendErrors?.email}
        placeholder="example@email.com"
        icon={Mail}
        isValidating={validating.email}
      />

      <AuthInput
        label="Phone Number"
        type="tel"
        name="phone_number"
        value={formData.phone_number || ''}
        onChange={handleFieldChange}
        error={errors.phone_number}
        placeholder="Enter your phone number"
        icon={Phone}
        isValidating={validating.phone_number}
      />

      {/* Navigation Arrow - Forward only on Step 1 */}
      <NavArrow
        direction="forward"
        onClick={handleNext}
        disabled={Object.keys(errors).length > 0}
      />
    </motion.div>
  );
};

export default RegisterStep1;
