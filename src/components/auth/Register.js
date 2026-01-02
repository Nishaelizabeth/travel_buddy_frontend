import React from 'react';
import RegisterWrapper from './RegisterWrapper';

// Register component now simply renders the RegisterWrapper
// All registration logic is handled within RegisterWrapper and its step components
const Register = () => {
  return <RegisterWrapper />;
};

export default Register;
