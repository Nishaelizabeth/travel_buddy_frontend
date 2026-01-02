import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { validatePassword, validateConfirmPassword, validateGender, validateDob } from './ValidationUtils';
import { AuthInput, AuthSelect, NavArrow } from '../ui/auth-switch';
import { Lock, Calendar } from 'lucide-react';

const RegisterStep2 = ({ formData, setFormData, errors, setErrors, onBack, onNext }) => {
  // Initialize date parts from existing dob - PRESERVED
  const [availableDays, setAvailableDays] = useState([]);

  useEffect(() => {
    if (formData.dob && (!formData.dobDay || !formData.dobMonth || !formData.dobYear)) {
      const [year, month, day] = formData.dob.split('-');
      setFormData(prev => ({
        ...prev,
        dobDay: parseInt(day, 10).toString(),
        dobMonth: month,
        dobYear: year
      }));
      updateAvailableDays(month, year);
    }
  }, [formData.dob, formData.dobDay, formData.dobMonth, formData.dobYear, setFormData]);

  useEffect(() => {
    updateAvailableDays(formData.dobMonth, formData.dobYear);
  }, [formData.dobMonth, formData.dobYear]);

  // Generate months and years - PRESERVED
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 83 }, (_, i) => ({
    value: (currentYear - 18 - i).toString(),
    label: (currentYear - 18 - i).toString()
  }));

  // Update available days - PRESERVED
  const updateAvailableDays = (month, year) => {
    if (!month || !year) {
      setAvailableDays(Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() })));
      return;
    }

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

    setAvailableDays(Array.from({ length: daysInMonth }, (_, i) => ({
      value: (i + 1).toString(),
      label: (i + 1).toString()
    })));
  };

  // Date change handlers - PRESERVED  
  const handleDayChange = (e) => {
    const day = e.target.value;
    setFormData(prev => {
      const newData = { ...prev, dobDay: day };
      if (day && prev.dobMonth && prev.dobYear) {
        const paddedDay = day.toString().padStart(2, '0');
        newData.dob = `${prev.dobYear}-${prev.dobMonth}-${paddedDay}`;
      }
      return newData;
    });
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setFormData(prev => {
      const newData = { ...prev, dobMonth: month };
      updateAvailableDays(month, prev.dobYear);

      if (prev.dobDay && month && prev.dobYear) {
        const daysInNewMonth = new Date(parseInt(prev.dobYear, 10), parseInt(month, 10), 0).getDate();
        let validDay = prev.dobDay;

        if (parseInt(prev.dobDay, 10) > daysInNewMonth) {
          validDay = daysInNewMonth.toString();
          newData.dobDay = validDay;
        }

        const paddedDay = validDay.toString().padStart(2, '0');
        newData.dob = `${prev.dobYear}-${month}-${paddedDay}`;
      }
      return newData;
    });
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setFormData(prev => {
      const newData = { ...prev, dobYear: year };
      updateAvailableDays(prev.dobMonth, year);

      if (prev.dobDay && prev.dobMonth && year) {
        const daysInMonth = new Date(parseInt(year, 10), parseInt(prev.dobMonth, 10), 0).getDate();
        let validDay = prev.dobDay;

        if (parseInt(prev.dobDay, 10) > daysInMonth) {
          validDay = daysInMonth.toString();
          newData.dobDay = validDay;
        }

        const paddedDay = validDay.toString().padStart(2, '0');
        newData.dob = `${year}-${prev.dobMonth}-${paddedDay}`;
      }
      return newData;
    });
  };

  // Field change handler - PRESERVED
  const handleFieldChange = (e) => {
    const { name, value } = e.target;

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

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Validation - PRESERVED
    if (name === 'password') {
      const passwordError = validatePassword(value);
      if (passwordError) {
        setErrors(prev => ({ ...prev, password: passwordError }));
      }

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

  // Handle next - PRESERVED
  const handleNext = () => {
    const newErrors = {};

    const passwordError = validatePassword(formData.password || '');
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(formData.password || '', formData.confirm_password || '');
    if (confirmPasswordError) newErrors.confirm_password = confirmPasswordError;

    const genderError = validateGender(formData.gender);
    if (genderError) newErrors.gender = genderError;

    const dobError = validateDob(formData.dob);
    if (dobError) newErrors.dob = dobError;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const genderOptions = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-blue-600">Security & Personal Details</h2>
        <p className="text-gray-500 text-sm">Let's secure your account</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AuthInput
          label="Password"
          type="password"
          name="password"
          value={formData.password || ''}
          onChange={handleFieldChange}
          error={errors.password}
          placeholder="Create a strong password"
          icon={Lock}
        />

        <AuthInput
          label="Confirm Password"
          type="password"
          name="confirm_password"
          value={formData.confirm_password || ''}
          onChange={handleFieldChange}
          error={errors.confirm_password}
          placeholder="Re-enter your password"
          icon={Lock}
        />
      </div>

      <AuthSelect
        label="Gender"
        name="gender"
        value={formData.gender || ''}
        onChange={handleFieldChange}
        error={errors.gender}
        options={genderOptions}
        placeholder="Select gender"
      />

      {/* Date of Birth */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
        <div className="grid grid-cols-3 gap-2">
          <AuthSelect
            name="dobDay"
            value={formData.dobDay || ''}
            onChange={handleDayChange}
            options={availableDays}
            placeholder="Day"
            className="mb-0"
          />
          <AuthSelect
            name="dobMonth"
            value={formData.dobMonth || ''}
            onChange={handleMonthChange}
            options={months}
            placeholder="Month"
            className="mb-0"
          />
          <AuthSelect
            name="dobYear"
            value={formData.dobYear || ''}
            onChange={handleYearChange}
            options={years}
            placeholder="Year"
            className="mb-0"
          />
        </div>
        {errors.dob && <p className="mt-1 text-sm text-red-500">{errors.dob}</p>}
      </div>

      {/* Navigation Arrows */}
      <NavArrow direction="back" onClick={onBack} />
      <NavArrow
        direction="forward"
        onClick={handleNext}
        disabled={Object.keys(errors).length > 0}
      />
    </motion.div>
  );
};

export default RegisterStep2;
