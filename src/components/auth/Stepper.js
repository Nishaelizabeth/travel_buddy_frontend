import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const Stepper = ({ currentStep, totalSteps }) => {
  const steps = [
    { label: 'Basic Info', number: 1 },
    { label: 'Security & Personal', number: 2 },
    { label: 'Profile', number: 3 }
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2"
            >
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  currentStep === step.number
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : currentStep > step.number
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                )}
                whileHover={{ scale: 1.1 }}
              >
                {currentStep > step.number ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </motion.div>
              <span
                className={cn(
                  "text-sm hidden sm:inline transition-colors duration-300",
                  currentStep === step.number
                    ? "text-blue-600 font-semibold"
                    : currentStep > step.number
                      ? "text-green-600"
                      : "text-gray-500"
                )}
              >
                {step.label}
              </span>
            </motion.div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 transition-colors duration-300",
                  currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
