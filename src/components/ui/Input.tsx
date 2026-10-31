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
            className="text-xs font-semibold uppercase tracking-wider text-[#4B453E]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#171717]/12 text-[#171717] placeholder-[#6B655C] text-sm transition-all duration-150",
            "focus:outline-none focus:border-[#B8734E] focus:ring-1 focus:ring-[#B8734E] focus:bg-[#FFFFFF]",
            error &&
              "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-[#9B2C24]">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-[#6B655C]">{helperText}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
