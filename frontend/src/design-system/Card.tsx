/**
 * 🎨 CARD COMPONENT - DESIGN SYSTEM
 * By PunkClaude & Radwulf - November 9, 2025
 * 
 * VARIANTS: default, elevated, outlined, glass
 * FEATURES: Hover effects, padding variants, shadow levels
 */

import * as React from 'react';
import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  children: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: `
    bg-[var(--bg-secondary)]
    border border-[var(--border-light)]
  `,
  elevated: `
    bg-[var(--bg-secondary)]
    shadow-lg
  `,
  outlined: `
    bg-transparent
    border-2 border-[var(--border-main)]
  `,
  glass: `
    bg-[var(--bg-paper)]
    backdrop-blur-sm
    border border-[var(--border-light)]
  `,
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        // Base styles
        'rounded-lg transition-all duration-300',
        
        // Variant styles
        variantStyles[variant],
        
        // Padding styles
        paddingStyles[padding],
        
        // Hover effect
        hover && 'hover:shadow-xl hover:scale-[1.02] cursor-pointer',
        
        // Custom className
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header component
export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('pb-4 border-b border-[var(--border-light)]', className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Body component
export const CardBody: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('py-4', className)} {...props}>
      {children}
    </div>
  );
};

// Card Footer component
export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('pt-4 border-t border-[var(--border-light)]', className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Title component
export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h2
      className={cn('text-lg font-semibold text-[var(--text-primary)]', className)}
      {...props}
    >
      {children}
    </h2>
  );
};

// Card Description component
export const CardDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p
      className={cn('text-sm text-[var(--text-secondary)]', className)}
      {...props}
    >
      {children}
    </p>
  );
};

// Card Content component (alias for CardBody)
export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('py-4', className)} {...props}>
      {children}
    </div>
  );
};
