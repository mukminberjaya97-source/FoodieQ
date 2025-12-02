import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-dark-surface dark:text-white transition-all duration-300 focus:outline-none focus:ring-0
          ${error 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-slate-200 dark:border-slate-700 focus:border-[#ff6b35] dark:focus:border-[#ff6b35] focus:-translate-y-0.5 focus:shadow-lg shadow-orange-500/10'
          } ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
