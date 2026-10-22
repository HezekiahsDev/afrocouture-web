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
    primary: 'bg-[#00A3FF]/15 text-[#38bdf8] border border-[#00A3FF]/30',
    cyan: 'bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30',
    success: 'bg-[#10B981]/15 text-[#34d399] border border-[#10B981]/30',
    warning: 'bg-[#FBBF24]/15 text-[#fbbf24] border border-[#FBBF24]/30',
    purple: 'bg-[#8B5CF6]/15 text-[#c084fc] border border-[#8B5CF6]/30',
    neutral: 'bg-white/5 text-slate-300 border border-white/10',
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

