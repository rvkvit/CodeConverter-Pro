import React from 'react';
import { Check, Clock } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            const isUpcoming = stepNumber > currentStep;

            return (
              <div key={stepNumber} className="flex items-center relative">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-success-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary'
                        : isCompleted
                        ? 'text-success-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step}
                  </span>
                </div>
                
                {stepNumber < steps.length && (
                  <div
                    className={`absolute top-5 left-full w-16 h-0.5 transition-colors ${
                      isCompleted ? 'bg-success-600' : 'bg-gray-300'
                    }`}
                    style={{ transform: 'translateY(-50%)' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
