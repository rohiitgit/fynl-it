import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Comic base: square corners, ink border, mono label, hard offset shadow,
  // presses toward its shadow on click. Border colors set per-variant.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border-[2.5px] border-ink font-mono font-bold uppercase tracking-wide text-sm transition-[transform,box-shadow] duration-150 [transition-timing-function:cubic-bezier(0.34,1.3,0.64,1)] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0 motion-reduce:active:translate-x-0 motion-reduce:active:translate-y-0",
  {
    variants: {
      variant: {
        default:
          "bg-yellow text-ink comic-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:comic-shadow active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_var(--ink)]",
        destructive:
          "bg-overdue text-white comic-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:comic-shadow active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_var(--ink)]",
        outline:
          "bg-paper-panel text-ink comic-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:comic-shadow active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_var(--ink)]",
        secondary:
          "bg-gray-panel text-ink comic-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:comic-shadow active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_var(--ink)]",
        ghost:
          "border-transparent shadow-none hover:bg-yellow hover:border-ink",
        link: "border-transparent shadow-none text-ink underline underline-offset-4 decoration-2 hover:decoration-yellow-deep",
        // Kept for API compatibility; now the signature solid yellow button.
        gradient:
          "bg-yellow text-ink comic-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 hover:comic-shadow-lg active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_0_var(--ink)]",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 px-7 text-base has-[>svg]:px-5",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }