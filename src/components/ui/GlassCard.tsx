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
            ? 'bg-[#FFFFFF]/85 border border-[#171717]/10 shadow-[0_12px_32px_-4px_rgba(23,23,23,0.14)]'
            : 'bg-[#FFFFFF]/90 border border-[#171717]/15 shadow-[0_16px_40px_-4px_rgba(23,23,23,0.16)]',
          interactive && 'hover:border-[#B8734E]/40 hover:shadow-[0_0_24px_rgba(184,115,78,0.15)] hover:-translate-y-0.5 cursor-pointer',
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

