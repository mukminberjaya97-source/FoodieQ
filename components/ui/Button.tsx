
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon,
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none select-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#FF5430] to-[#FF3D15] text-white hover:shadow-lg hover:shadow-orange-500/40 hover:-translate-y-0.5 border border-transparent",
    secondary: "bg-orange-100 text-orange-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-orange-200 dark:hover:bg-slate-700 border border-orange-200 dark:border-slate-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50",
    ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {icon && <span className="mr-2.5">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
