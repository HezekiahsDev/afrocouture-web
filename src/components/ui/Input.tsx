import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-300"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 rounded-xl bg-[#1C1F29] border border-white/10 text-slate-100 placeholder-slate-500 text-sm transition-all duration-150",
            "focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF] focus:bg-[#222634]",
            error &&
              "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-rose-400">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-slate-500">{helperText}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
