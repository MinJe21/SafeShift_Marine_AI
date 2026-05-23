import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
        {
          "border-transparent bg-blue-600 text-white shadow-sm": variant === 'default',
          "border-transparent bg-slate-100 text-slate-900": variant === 'secondary',
          "border-transparent bg-red-500 text-white shadow-sm": variant === 'destructive',
          "border-transparent bg-teal-500 text-white shadow-sm": variant === 'success',
          "border-transparent bg-amber-500 text-white shadow-sm": variant === 'warning',
          "text-slate-950": variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
