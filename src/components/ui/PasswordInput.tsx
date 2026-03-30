import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  registration: {
    name: string;
    onChange: (...args: any[]) => any;
    onBlur: (...args: any[]) => any;
    ref: React.Ref<any>;
    value?: any;
  };
  error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ label, registration, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          {...props}
          {...registration}
          type={showPassword ? 'text' : 'password'}
          className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-10 pr-10 ${error ? 'border-red-500' : ''}`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {error ? (
            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          ) : (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default PasswordInput;
