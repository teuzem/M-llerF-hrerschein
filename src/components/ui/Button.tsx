import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';

// Define a generic type for the 'as' prop to create a polymorphic component
type AsProp<C extends React.ElementType> = {
  as?: C;
};

// Combine the 'as' prop with the props of the component it will render
type PolymorphicComponentProps<C extends React.ElementType, Props = {}> = 
  AsProp<C> & Props & Omit<React.ComponentPropsWithoutRef<C>, keyof (AsProp<C> & Props)>;

// Define the specific props for our Button component
type ButtonOwnProps = {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

// Define the final ButtonProps type
type ButtonProps<C extends React.ElementType> = PolymorphicComponentProps<C, ButtonOwnProps>;

// Default element type if 'as' prop is not provided
const DEFAULT_ELEMENT = 'button';

const Button = <C extends React.ElementType = typeof DEFAULT_ELEMENT>({
  as,
  isLoading = false,
  variant = 'primary',
  children,
  className = '',
  ...restProps
}: ButtonProps<C>) => {
  const { t } = useTranslation();
  const Component = as || DEFAULT_ELEMENT;

  const baseClasses = 'inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-german-black via-german-red to-german-gold text-white hover:from-blue-700 hover:to-red-700 focus:ring-blue-500',
    secondary: 'bg-white text-german-red border-german-red hover:bg-blue-50 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const MotionComponent = motion(Component as React.ElementType);

  return (
    <MotionComponent
      whileTap={{ scale: 0.95 }}
      disabled={isLoading || (restProps as any).disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${isLoading ? 'cursor-not-allowed opacity-75' : ''} ${className}`}
      {...restProps}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          <span>{t('common.loading_button')}</span>
        </>
      ) : (
        children
      )}
    </MotionComponent>
  );
};

export default Button;
