import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileText, Inbox, Search, AlertCircle, FileX } from "lucide-react"

/**
 * Icon mapping for different empty state types
 */
const emptyStateIcons = {
  default: Inbox,
  invoices: FileText,
  search: Search,
  error: AlertCircle,
  noResults: FileX,
} as const

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The type of empty state to display (affects icon)
   */
  type?: keyof typeof emptyStateIcons
  /**
   * Custom icon component to override the default
   */
  icon?: React.ComponentType<{ className?: string }>
  /**
   * Title of the empty state
   */
  title: string
  /**
   * Description text (optional)
   */
  description?: string
  /**
   * Primary action button configuration
   */
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  /**
   * Secondary action button configuration (optional)
   */
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg"
}

/**
 * Empty State Component
 *
 * Displays when there's no content to show, with an optional CTA.
 * Follows fintech best practices with clear messaging and single primary action.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   type="invoices"
 *   title="No invoices yet"
 *   description="Create your first invoice to start getting paid faster."
 *   action={{
 *     label: "Create Invoice",
 *     onClick: () => setModalOpen(true),
 *     icon: <Plus className="h-4 w-4" />
 *   }}
 * />
 * ```
 */
export function EmptyState({
  type = "default",
  icon: CustomIcon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  className,
  ...props
}: EmptyStateProps) {
  const Icon = CustomIcon || emptyStateIcons[type]

  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "h-12 w-12",
      title: "text-base",
      description: "text-sm",
    },
    md: {
      container: "py-12",
      icon: "h-16 w-16",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16",
      icon: "h-20 w-20",
      title: "text-xl",
      description: "text-base",
    },
  }

  const sizes = sizeClasses[size]

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center animate-fade-in",
        sizes.container,
        className
      )}
      {...props}
    >
      {/* Icon */}
      <div className="mb-4 rounded-full bg-muted p-4">
        <Icon
          className={cn(
            sizes.icon,
            "text-muted-foreground"
          )}
          aria-hidden="true"
        />
      </div>

      {/* Title */}
      <h3 className={cn("font-semibold text-foreground mb-2", sizes.title)}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn("text-muted-foreground max-w-sm mb-6", sizes.description)}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button onClick={action.onClick} className="gap-2">
              {action.icon}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Pre-configured empty state for invoice lists
 */
export function InvoiceEmptyState({
  onCreateInvoice,
}: {
  onCreateInvoice: () => void
}) {
  return (
    <EmptyState
      type="invoices"
      title="No invoices yet"
      description="You haven't created any invoices. Create your first invoice to start getting paid faster."
      action={{
        label: "Create Invoice",
        onClick: onCreateInvoice,
      }}
    />
  )
}

/**
 * Pre-configured empty state for search results
 */
export function SearchEmptyState({
  searchQuery,
  onClearSearch,
}: {
  searchQuery: string
  onClearSearch: () => void
}) {
  return (
    <EmptyState
      type="search"
      title="No results found"
      description={`We couldn't find any invoices matching "${searchQuery}". Try adjusting your search.`}
      action={{
        label: "Clear Search",
        onClick: onClearSearch,
      }}
      size="sm"
    />
  )
}

/**
 * Pre-configured empty state for filtered results
 */
export function FilteredEmptyState({
  filterType,
  onClearFilter,
}: {
  filterType: string
  onClearFilter: () => void
}) {
  return (
    <EmptyState
      type="noResults"
      title={`No ${filterType} invoices`}
      description={`You don't have any ${filterType} invoices at the moment.`}
      action={{
        label: "Clear Filter",
        onClick: onClearFilter,
      }}
      size="sm"
    />
  )
}

/**
 * Pre-configured empty state for errors
 */
export function ErrorEmptyState({
  onRetry,
}: {
  onRetry: () => void
}) {
  return (
    <EmptyState
      type="error"
      title="Something went wrong"
      description="We couldn't load your invoices. Please try again."
      action={{
        label: "Retry",
        onClick: onRetry,
      }}
      size="md"
    />
  )
}
