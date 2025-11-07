import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StyledButton = styled(motion.button)`
  width: 100%;
  padding: 0.75rem;
  background: #2F80ED;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  ${props => props.disabled && `
    background: #E0E0E0;
    cursor: not-allowed;
  `}

  ${props => props.loading && `
    cursor: wait;
  `}
`;

const Button = ({ children, disabled, loading, ...props }) => {
  return (
    <StyledButton disabled={disabled || loading} {...props}>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            border: '2px solid white',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </StyledButton>
  );
};

export { Button };
