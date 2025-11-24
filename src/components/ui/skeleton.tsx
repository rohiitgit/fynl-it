import { cn } from "@/lib/utils"

/**
 * Skeleton component for loading states
 * Uses shimmer animation for better perceived performance
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-gradient-to-r from-gray-10 via-gray-20 to-gray-10 bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Invoice card skeleton loader
 * Matches the structure of the actual invoice card
 */
function InvoiceCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border border-border rounded-xl bg-card space-y-4 sm:space-y-0 sm:space-x-4">
      {/* Left section */}
      <div className="flex-1 space-y-3 w-full">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-32" /> {/* Client name */}
          <Skeleton className="h-5 w-20 rounded-full" /> {/* Status badge */}
        </div>
        <Skeleton className="h-4 w-48" /> {/* Invoice number */}
        <Skeleton className="h-4 w-36" /> {/* Due date */}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="flex-1 sm:flex-none">
          <Skeleton className="h-7 w-24" /> {/* Amount */}
        </div>
        <Skeleton className="h-9 w-24" /> {/* Action button */}
      </div>
    </div>
  )
}

/**
 * Invoice list skeleton - shows 3-5 skeleton cards
 */
function InvoiceListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <InvoiceCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Table row skeleton for data tables
 */
function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  )
}

/**
 * Table skeleton with header and rows
 */
function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-muted border-b border-border">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  )
}

/**
 * Card skeleton for dashboard cards
 */
function CardSkeleton() {
  return (
    <div className="p-6 border border-border rounded-xl bg-card space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" /> {/* Title */}
        <Skeleton className="h-8 w-8 rounded-full" /> {/* Icon */}
      </div>
      <Skeleton className="h-8 w-24" /> {/* Value */}
      <Skeleton className="h-3 w-full" /> {/* Description */}
    </div>
  )
}

/**
 * Avatar skeleton
 */
function AvatarSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  return <Skeleton className={cn("rounded-full", sizeClasses[size])} />
}

/**
 * Text skeleton with configurable width
 */
function TextSkeleton({ width = "full", lines = 1 }: { width?: "full" | "3/4" | "1/2" | "1/4"; lines?: number }) {
  const widthClasses = {
    full: "w-full",
    "3/4": "w-3/4",
    "1/2": "w-1/2",
    "1/4": "w-1/4",
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? widthClasses["3/4"] : widthClasses[width]
          )}
        />
      ))}
    </div>
  )
}

export {
  Skeleton,
  InvoiceCardSkeleton,
  InvoiceListSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  CardSkeleton,
  AvatarSkeleton,
  TextSkeleton,
}
