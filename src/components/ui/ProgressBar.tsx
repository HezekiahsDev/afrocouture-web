import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  variant?: "primary" | "cyan" | "success" | "gradient";
  showPercentage?: boolean;
}

export function ProgressBar({
  className,
  value,
  max = 100,
  label,
  variant = "primary",
  showPercentage = false,
  ...props
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const variants = {
    primary: "bg-[#00A3FF]",
    cyan: "bg-[#22D3EE]",
    success: "bg-[#10B981]",
    gradient: "bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] to-[#EC4899]",
  };

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)} {...props}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
          {label && <span>{label}</span>}
          {showPercentage && (
            <span className="font-mono">{Math.round(percent)}%</span>
          )}
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300 rounded-full",
            variants[variant],
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
