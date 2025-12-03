"use client";

import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

type FormSelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  label: string;
  options: readonly SelectOption[] | SelectOption[];
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>((props, ref) => {
  const { label, options, placeholder, className, ...rest } = props;

  return (
    <div className="w-full">
      <label 
        htmlFor={props.id || props.name} 
        className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide"
      >
        {label}
      </label>
      
      <div className="relative w-full">
        <select
          {...rest}
          ref={ref}
          id={props.id || props.name}
          className={`w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 
            focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            appearance-none cursor-pointer pr-10
            ${props.disabled ? 'bg-gray-50' : ''}
            ${!props.value || props.value === '' ? 'text-gray-400' : 'text-gray-900'}
            ${className || ''}
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="text-gray-900"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown size={18} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;
