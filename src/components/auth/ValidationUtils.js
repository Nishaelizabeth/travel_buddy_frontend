/**
 * Validation utility functions for form fields
 */

// Username validation
export const validateUsername = (username) => {
  if (!username || username.trim() === '') {
    return 'Username is required';
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (username.length > 30) {
    return 'Username must be less than 30 characters';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
};

// Email validation
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

// Password validation
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
};

// Login password validation (less strict than registration)
export const validateLoginPassword = (password) => {
  if (!password || password.trim() === '') {
    return 'Password is required';
  }
  return null;
};

// Username or email validation for login
export const validateUsernameOrEmail = (usernameOrEmail) => {
  if (!usernameOrEmail || usernameOrEmail.trim() === '') {
    return 'Username or email is required';
  }
  return null;
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

// Full name validation
export const validateFullName = (fullName) => {
  if (!fullName || fullName.trim() === '') {
    return 'Full name is required';
  }
  if (fullName.length < 2) {
    return 'Full name must be at least 2 characters';
  }
  if (fullName.length > 100) {
    return 'Full name must be less than 100 characters';
  }
  return null;
};

// Phone number validation
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return 'Phone number is required';
  }
  // Basic phone validation - allows various formats
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return 'Please enter a valid phone number';
  }
  return null;
};

// Date of birth validation
export const validateDob = (dob) => {
  if (!dob) {
    return 'Date of birth is required';
  }
  
  const dobDate = new Date(dob);
  const today = new Date();
  
  // Check if date is valid
  if (isNaN(dobDate.getTime())) {
    return 'Please enter a valid date';
  }
  
  // Check if user is at least 18 years old
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  if (dobDate > eighteenYearsAgo) {
    return 'You must be at least 18 years old';
  }
  
  // Check if date is not in the future
  if (dobDate > today) {
    return 'Date of birth cannot be in the future';
  }
  
  return null;
};

// Gender validation
export const validateGender = (gender) => {
  if (!gender) {
    return 'Please select your gender';
  }
  return null;
};

// Bio validation
export const validateBio = (bio) => {
  if (bio && bio.length > 500) {
    return 'Bio must be less than 500 characters';
  }
  return null;
};

// Travel preferences validation
export const validateTravelPreferences = (preferences) => {
  if (!preferences || preferences.length === 0) {
    return 'Please select at least one travel preference';
  }
  return null;
};

// Profile picture validation
export const validateProfilePicture = (file) => {
  if (file) {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG)';
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return 'Image size should be less than 5MB';
    }
  }
  return null;
};
