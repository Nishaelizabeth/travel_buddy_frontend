import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheck, FiLoader } from 'react-icons/fi';

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333333;
  font-size: 0.9rem;
`;

const StyledInput = styled(motion.input)`
  width: 100%;
  padding: 0.75rem ${props => props.hasIcon ? '2.5rem' : '1rem'} 0.75rem 1rem;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #2F80ED;
    box-shadow: 0 0 0 2px rgba(47, 128, 237, 0.1);
  }

  ${props => props.error && `
    border-color: #ff4d4d;
    box-shadow: 0 0 0 2px rgba(255, 77, 77, 0.1);
  `}
`;

const ErrorMessage = styled.div`
  color: #ff4d4d;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const ValidationIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    font-size: 1.2rem;
  }
  
  &.validating {
    color: #2F80ED;
    animation: spin 1s linear infinite;
  }
  
  &.valid {
    color: #4CAF50;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const FormInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  isValidating,
  ...props
}) => {
  // Determine if we should show validation icons
  const showValidationIcon = isValidating !== undefined;
  const isValid = !error && value && !isValidating;
  
  return (
    <InputWrapper>
      <Label>{label}</Label>
      <div style={{ position: 'relative' }}>
        <StyledInput
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          error={error}
          hasIcon={showValidationIcon}
          {...props}
        />
        {showValidationIcon && isValidating && (
          <ValidationIcon className="validating">
            <FiLoader />
          </ValidationIcon>
        )}
        {showValidationIcon && isValid && (
          <ValidationIcon className="valid">
            <FiCheck />
          </ValidationIcon>
        )}
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};

export { FormInput };
