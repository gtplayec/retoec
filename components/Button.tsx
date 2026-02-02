import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 border text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200";
  
  const variants = {
    primary: "border-transparent text-white bg-reto-navy hover:bg-blue-900 focus:ring-reto-navy",
    secondary: "border-transparent text-white bg-reto-pink hover:bg-pink-700 focus:ring-reto-pink",
    outline: "border-reto-navy text-reto-navy bg-transparent hover:bg-gray-50 focus:ring-reto-navy",
    ghost: "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};