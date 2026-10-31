import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'cyan' | 'success' | 'warning' | 'purple' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] tracking-wider uppercase font-semibold',
    md: 'px-2.5 py-1 text-xs tracking-wider uppercase font-semibold',
  };

  const variants = {
    primary: 'bg-[#B8734E]/15 text-[#7A4429] border border-[#B8734E]/30',
    cyan: 'bg-[#1F2A42]/15 text-[#1F2A42] border border-[#1F2A42]/30',
    success: 'bg-[#2F6B4F]/15 text-[#2F6B4F] border border-[#2F6B4F]/30',
    warning: 'bg-[#B8734E]/15 text-[#7A4429] border border-[#B8734E]/30',
    purple: 'bg-[#1F2A42]/15 text-[#1F2A42] border border-[#1F2A42]/30',
    neutral: 'bg-[#171717]/5 text-[#4B453E] border border-[#171717]/12',
  };

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full font-medium', sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;

