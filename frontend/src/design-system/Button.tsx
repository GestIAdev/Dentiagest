/**
 * 🎨 BUTTON COMPONENT - DESIGN SYSTEM
 * By PunkClaude & Radwulf - November 9, 2025
 * 
 * VARIANTS: primary, secondary, outline, ghost, danger
 * SIZES: sm, md, lg
 * STATES: default, hover, active, disabled, loading
 */

import * as React from 'react';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'default';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)]
    text-white
    hover:from-[var(--color-primary-500)] hover:to-[var(--color-primary-600)]
    active:from-[var(--color-primary-700)] active:to-[var(--color-primary-800)]
    shadow-md hover:shadow-lg
    disabled:from-gray-400 disabled:to-gray-500
  `,
  default: `
    bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)]
    text-white
    hover:from-[var(--color-primary-500)] hover:to-[var(--color-primary-600)]
    active:from-[var(--color-primary-700)] active:to-[var(--color-primary-800)]
    shadow-md hover:shadow-lg
    disabled:from-gray-400 disabled:to-gray-500
  `,
  secondary: `
    bg-gradient-to-r from-[var(--color-secondary-600)] to-[var(--color-secondary-700)]
    text-white
    hover:from-[var(--color-secondary-500)] hover:to-[var(--color-secondary-600)]
    active:from-[var(--color-secondary-700)] active:to-[var(--color-secondary-800)]
    shadow-md hover:shadow-lg
    disabled:from-gray-400 disabled:to-gray-500
  `,
  outline: `
    bg-transparent
    border-2 border-[var(--border-main)]
    text-[var(--text-primary)]
    hover:bg-[var(--color-primary-500)]/10
    hover:border-[var(--color-primary-500)]
    active:bg-[var(--color-primary-500)]/20
    disabled:border-gray-500 disabled:text-gray-500
  `,
  ghost: `
    bg-transparent
    text-[var(--text-primary)]
    hover:bg-[var(--color-primary-500)]/10
    active:bg-[var(--color-primary-500)]/20
    disabled:text-gray-500
  `,
  danger: `
    bg-gradient-to-r from-red-600 to-red-700
    text-white
    hover:from-red-500 hover:to-red-600
    active:from-red-700 active:to-red-800
    shadow-md hover:shadow-lg
    disabled:from-gray-400 disabled:to-gray-500
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2',
        'font-medium rounded-lg',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        
        // Variant styles
        variantStyles[variant],
        
        // Size styles
        sizeStyles[size],
        
        // Custom className
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!isLoading && leftIcon && <span>{leftIcon}</span>}
      
      <span>{children}</span>
      
      {!isLoading && rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};
