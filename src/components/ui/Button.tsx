'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-semibold',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variants = {
      primary: 'bg-[#9E5B37] text-[#FFFDF8] font-semibold hover:bg-[#8F5637] shadow-[0_0_20px_rgba(184,115,78,0.35)] focus:ring-[#B8734E]',
      secondary: 'bg-[#FFFFFF] text-[#171717] hover:bg-[#EFE7DA] border border-[#171717]/12 focus:ring-slate-400',
      outline: 'bg-transparent text-[#171717] border border-[#171717]/15 hover:bg-[#171717]/5 hover:border-[#B8734E]/50 focus:ring-[#B8734E]/30',
      ghost: 'bg-transparent text-[#4B453E] hover:bg-[#171717]/5 hover:text-[#171717]',
      gradient: 'bg-gradient-to-r from-[#B8734E] via-[#1F2A42] to-[#B8734E] text-[#FFFDF8] font-semibold hover:opacity-95 shadow-[0_0_24px_rgba(184,115,78,0.3)]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizes[size], variants[variant], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

