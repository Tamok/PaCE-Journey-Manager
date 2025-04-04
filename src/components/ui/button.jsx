// src/components/ui/button.jsx
import React from 'react';
import clsx from 'clsx';

export const Button = ({ children, variant = 'default', size = 'base', className = '', ...props }) => {
  const variants = {
    default: 'bg-primary text-white hover:bg-[#00294d]', // using our defined bg-primary
    outline: 'border border-primary text-primary bg-white hover:bg-blue-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-gray-200 text-black hover:bg-gray-300'
  };

  const sizes = {
    sm: 'px-2 py-1 text-sm',
    base: 'px-4 py-2'
  };

  return (
    <button
      className={clsx(
        'rounded transition-all min-h-[40px]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
