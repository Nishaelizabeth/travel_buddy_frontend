import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { validateProfilePicture, validateBio, validateTravelPreferences } from './ValidationUtils';
import { AuthInput, AuthButton, NavArrow, ProfilePreview } from '../ui/auth-switch';
import { Upload, MapPin } from 'lucide-react';

const RegisterStep3 = ({ formData, setFormData, errors, setErrors, onBack, onSubmit, loading }) => {
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

    // Validation - PRESERVED
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

  // Handle file change - PRESERVED
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileError = validateProfilePicture(file);
      if (fileError) {
        setErrors(prev => ({ ...prev, profile_picture: fileError }));
        return;
      }

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

  // Handle submit - PRESERVED
  const handleSubmit = () => {
    const newErrors = {};

    if (formData.profile_picture) {
      const profilePictureError = validateProfilePicture(formData.profile_picture);
      if (profilePictureError) newErrors.profile_picture = profilePictureError;
    }

    if (formData.bio) {
      const bioError = validateBio(formData.bio);
      if (bioError) newErrors.bio = bioError;
    }

    if (formData.travel_preferences) {
      const preferencesError = validateTravelPreferences(formData.travel_preferences);
      if (preferencesError) newErrors.travel_preferences = preferencesError;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
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
        <h2 className="text-xl font-semibold text-blue-600">Profile & Review</h2>
        <p className="text-gray-500 text-sm">Almost done! Review your details</p>
      </div>

      {/* Profile Preview */}
      <ProfilePreview formData={formData} />

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AuthInput
          label="Location"
          type="text"
          name="location"
          value={formData.location || ''}
          onChange={handleFieldChange}
          error={errors.location}
          placeholder="City, State or Country"
          icon={MapPin}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
          <div className="relative">
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white
                       file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600
                       hover:file:bg-blue-100 transition-all cursor-pointer"
            />
          </div>
          {errors.profile_picture && (
            <p className="mt-1 text-sm text-red-500">{errors.profile_picture}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <AuthButton
          type="button"
          onClick={handleSubmit}
          loading={loading}
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </AuthButton>
      </div>

      {/* Back Arrow */}
      <NavArrow direction="back" onClick={onBack} />
    </motion.div>
  );
};

export default RegisterStep3;
