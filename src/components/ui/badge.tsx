import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertCircle, XCircle, Info, Crown } from "lucide-react"

const badgeVariants = cva(
  // Comic sticker: square, ink border, mono uppercase, small hard shadow.
  "inline-flex items-center justify-center rounded-none border-2 border-ink px-2.5 py-1 font-mono text-[0.72rem] font-bold uppercase tracking-wide leading-none w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink transition-transform duration-150 overflow-hidden shadow-[2px_2px_0_0_var(--ink)]",
  {
    variants: {
      variant: {
        default:
          "bg-yellow text-ink [a&]:hover:-translate-y-0.5",
        secondary:
          "bg-gray-panel text-ink [a&]:hover:-translate-y-0.5",
        destructive:
          "bg-overdue text-white [a&]:hover:-translate-y-0.5",
        outline:
          "bg-paper-panel text-ink [a&]:hover:-translate-y-0.5",
        // Status stickers
        paid:
          "bg-[#C9F2CF] text-[#0F5A28] [a&]:hover:-translate-y-0.5",
        pending:
          "bg-[#FFE9A8] text-[#7A4E00] [a&]:hover:-translate-y-0.5",
        overdue:
          "bg-overdue text-white [a&]:hover:-translate-y-0.5",
        info:
          "bg-[#CFE4FF] text-[#0A3A7A] [a&]:hover:-translate-y-0.5",
        premium:
          "bg-[#E6D6FF] text-[#3A1A7A] [a&]:hover:-translate-y-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

// Icon mapping for status badges
const statusIcons = {
  paid: CheckCircle2,
  pending: AlertCircle,
  overdue: XCircle,
  info: Info,
  premium: Crown,
} as const

// Enhanced status badge with icons for accessibility
const StatusBadge = ({
  status,
  children,
  showIcon = true,
  ...props
}: {
  status: 'paid' | 'pending' | 'overdue' | 'info' | 'premium'
  showIcon?: boolean
} & React.ComponentProps<typeof Badge>) => {
  const Icon = statusIcons[status]

  return (
    <Badge variant={status} {...props}>
      {showIcon && Icon && <Icon className="size-3" aria-hidden="true" />}
      {children}
    </Badge>
  )
}

export { Badge, badgeVariants, StatusBadge }