import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface PasswordStrengthIndicatorProps {
  strength: number; // 0: too weak, 1: weak, 2: medium, 3: strong, 4: very strong
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ strength }) => {
  const { t } = useTranslation();

  // zxcvbn score is 0-4. We map this to labels and colors.
  const strengthConfig = [
    { label: 'Schwach', color: 'bg-red-500' },    // 0
    { label: 'Schwach', color: 'bg-red-500' },    // 1
    { label: 'Mittel', color: 'bg-yellow-500' },// 2
    { label: 'Stark', color: 'bg-green-500' }, // 3
    { label: 'Stark', color: 'bg-green-500' }, // 4
  ];

  const currentLevel = strengthConfig[strength];

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">Passwort-Stärke</p>
      <div className="flex space-x-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 flex-1 rounded-full ${strength > index ? currentLevel.color : 'bg-gray-200'}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            style={{ transformOrigin: 'left' }}
          />
        ))}
      </div>
      <p className={`text-sm mt-1 font-medium ${strength > 1 ? (strength > 2 ? 'text-green-600' : 'text-yellow-600') : 'text-red-600'}`}>
        {currentLevel.label}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
