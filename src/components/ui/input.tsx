import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-yellow selection:text-ink flex h-11 w-full min-w-0 rounded-none border-2 border-ink bg-paper-panel px-3 py-1 text-base outline-none transition-[box-shadow,transform] duration-150 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:shadow-[3px_3px_0_0_var(--ink)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 motion-reduce:focus-visible:translate-x-0 motion-reduce:focus-visible:translate-y-0",
        "aria-invalid:border-overdue aria-invalid:focus-visible:shadow-[3px_3px_0_0_var(--overdue)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
