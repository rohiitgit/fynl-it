import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-yellow selection:text-ink flex field-sizing-content min-h-16 w-full rounded-none border-2 border-ink bg-paper-panel px-3 py-2 text-base outline-none transition-[box-shadow,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:shadow-[3px_3px_0_0_var(--ink)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 motion-reduce:focus-visible:translate-x-0 motion-reduce:focus-visible:translate-y-0",
        "aria-invalid:border-overdue aria-invalid:focus-visible:shadow-[3px_3px_0_0_var(--overdue)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
