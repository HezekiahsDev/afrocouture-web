import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2;
  interactive?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, level = 1, interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-300 backdrop-blur-xl',
          level === 1
            ? 'bg-[#0F172A]/85 border border-white/[0.08] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)]'
            : 'bg-[#1E293B]/90 border border-white/[0.12] shadow-[0_16px_40px_-4px_rgba(0,0,0,0.7)]',
          interactive && 'hover:border-[#00A3FF]/40 hover:shadow-[0_0_24px_rgba(0,163,255,0.15)] hover:-translate-y-0.5 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
export default GlassCard;

