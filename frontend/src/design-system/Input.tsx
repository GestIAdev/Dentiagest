/**
 * 🎨 INPUT COMPONENT - DESIGN SYSTEM
 * By PunkClaude & Radwulf - November 9, 2025
 * 
 * TYPES: text, email, password, number, date, search
 * STATES: default, error, success, disabled
 */

import React, { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

type InputState = 'default' | 'error' | 'success';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  state?: InputState;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const stateStyles: Record<InputState, string> = {
  default: `
    border-[var(--border-main)]
    focus:border-[var(--color-primary-500)]
    focus:ring-[var(--color-primary-500)]
  `,
  error: `
    border-red-500
    focus:border-red-500
    focus:ring-red-500
  `,
  success: `
    border-green-500
    focus:border-green-500
    focus:ring-green-500
  `,
};

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  state = 'default',
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
            {leftIcon}
          </div>
        )}
        
        <input
          disabled={disabled}
          className={cn(
            // Base styles
            'w-full px-4 py-2.5 rounded-lg',
            'bg-[var(--bg-secondary)]',
            'text-[var(--text-primary)]',
            'placeholder-[var(--text-hint)]',
            'border',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            
            // Icon padding
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            
            // State styles
            stateStyles[state],
            
            // Custom className
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
            {rightIcon}
          </div>
        )}
      </div>
      
      {helperText && (
        <p
          className={cn(
            'text-sm',
            state === 'error' && 'text-red-500',
            state === 'success' && 'text-green-500',
            state === 'default' && 'text-[var(--text-secondary)]'
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
