/**
 * 🎨 BADGE COMPONENT - DESIGN SYSTEM
 * By PunkClaude & Radwulf - November 9, 2025
 * 
 * VARIANTS: default, success, warning, error, info, veritas
 * SIZES: sm, md, lg
 */

import * as React from 'react';
import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'veritas';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: `
    bg-gray-600/20
    text-gray-300
    border border-gray-600/30
  `,
  success: `
    bg-green-600/20
    text-green-400
    border border-green-600/30
  `,
  warning: `
    bg-yellow-600/20
    text-yellow-400
    border border-yellow-600/30
  `,
  error: `
    bg-red-600/20
    text-red-400
    border border-red-600/30
  `,
  info: `
    bg-blue-600/20
    text-blue-400
    border border-blue-600/30
  `,
  veritas: `
    bg-gradient-to-r from-cyan-600/20 to-purple-600/20
    text-cyan-400
    border border-cyan-500/30
  `,
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center gap-1.5',
        'font-medium rounded-full',
        'transition-all duration-200',
        
        // Variant styles
        variantStyles[variant],
        
        // Size styles
        sizeStyles[size],
        
        // Custom className
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'success' && 'bg-green-400',
            variant === 'warning' && 'bg-yellow-400',
            variant === 'error' && 'bg-red-400',
            variant === 'info' && 'bg-blue-400',
            variant === 'veritas' && 'bg-cyan-400',
            variant === 'default' && 'bg-gray-400'
          )}
        />
      )}
      {children}
    </span>
  );
};
