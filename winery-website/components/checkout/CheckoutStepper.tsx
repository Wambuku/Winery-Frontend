// Multi-step checkout stepper component

import React from 'react';
import { CheckoutStep } from '../../types/checkout';

interface CheckoutStepperProps {
  steps: CheckoutStep[];
  currentStep: number;
}

export default function CheckoutStepper({ steps, currentStep }: CheckoutStepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${
                    step.completed
                      ? 'bg-wine-red border-wine-red text-white'
                      : step.active
                      ? 'border-wine-red text-wine-red bg-white'
                      : 'border-gray-300 text-gray-400 bg-white'
                  }
                `}
              >
                {step.completed ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="ml-3">
                <p
                  className={`
                    text-sm font-medium transition-colors duration-300
                    ${
                      step.completed || step.active
                        ? 'text-wine-red'
                        : 'text-gray-400'
                    }
                  `}
                >
                  {step.title}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-4 transition-colors duration-300
                  ${
                    steps[index + 1].completed || (step.completed && steps[index + 1].active)
                      ? 'bg-wine-red'
                      : 'bg-gray-300'
                  }
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}