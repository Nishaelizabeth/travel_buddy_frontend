import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StepperContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const StepWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StepDot = styled(motion.div)`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.active ? '#2F80ED' : '#E0E0E0'};
  border: 2px solid ${props => props.active ? '#2F80ED' : '#E0E0E0'};
  transition: all 0.3s ease;
`;

const StepLabel = styled.span`
  color: ${props => props.active ? '#2F80ED' : '#666666'};
  font-size: 0.9rem;
  font-weight: ${props => props.active ? '600' : '400'};
`;

const Stepper = ({ currentStep, totalSteps }) => {
  const steps = [
    { label: 'Basic Info', number: 1 },
    { label: 'Security & Personal', number: 2 },
    { label: 'Profile', number: 3 }
  ];

  return (
    <StepperContainer>
      <StepWrapper>
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StepDot
              active={currentStep === index + 1}
              whileHover={{ scale: 1.2 }}
            />
            <StepLabel active={currentStep === index + 1}>
              {step.label}
            </StepLabel>
          </motion.div>
        ))}
      </StepWrapper>
    </StepperContainer>
  );
};

export default Stepper;
