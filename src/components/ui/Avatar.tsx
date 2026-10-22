import React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy";
}

export function Avatar({
  className,
  src,
  alt = "",
  name,
  size = "md",
  status,
  ...props
}: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const statusColors = {
    online: "bg-emerald-500 ring-emerald-950",
    offline: "bg-slate-500 ring-slate-950",
    busy: "bg-amber-500 ring-amber-950",
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AC";

  return (
    <div
      className={cn("relative inline-flex flex-shrink-0", className)}
      {...props}
    >
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center font-bold bg-[#1E293B] border border-white/10 text-slate-200 select-none",
          sizes[size],
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2",
            statusColors[status],
          )}
        />
      )}
    </div>
  );
}

export default Avatar;
