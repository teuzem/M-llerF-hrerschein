import React from 'react';
import { motion } from 'framer-motion';
import { User, FileText, CheckCircle } from 'lucide-react';

interface ApplicationFormStepsProps {
  currentStep: number;
}

const steps = [
  { name: 'application.form.step1', icon: User },
  { name: 'application.form.step2', icon: FileText },
  { name: 'application.form.step3', icon: CheckCircle },
];

const ApplicationFormSteps: React.FC<ApplicationFormStepsProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center space-x-4 md:space-x-8 mb-8">
      {steps.map((step, index) => {
        const stepIndex = index + 1;
        const isCompleted = currentStep > stepIndex;
        const isCurrent = currentStep === stepIndex;

        return (
          <React.Fragment key={step.name}>
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={isCurrent ? { scale: 1.1 } : { scale: 1 }}
                className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                  ${isCompleted ? 'bg-green-500 border-green-600 text-white' : ''}
                  ${isCurrent ? 'bg-german-red border-blue-700 text-white' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-gray-200 border-gray-300 text-gray-500' : ''}
                `}
              >
                <step.icon className="w-6 h-6 md:w-8 md:h-8" />
              </motion.div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 rounded-full
                ${currentStep > stepIndex ? 'bg-german-red' : 'bg-gray-200'}
              `}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ApplicationFormSteps;
