import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
}

export function ProgressBar({ value, className, ...props }: ProgressBarProps) {
  return (
    <div className={cn("h-4 w-full overflow-hidden rounded-full bg-slate-100", className)} {...props}>
      <div
        className="h-full bg-teal-500 transition-all duration-500 ease-in-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}
