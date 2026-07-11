"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { type NavItem } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface SidebarNavProps {
  items: NavItem[]
  onItemClick?: () => void
}

export function SidebarNav({ items, onItemClick }: SidebarNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <nav className="space-y-1 px-2">
      {items.map((item) => {
        // Check if the current path and query params match the nav item
        const itemUrl = new URL(item.href, 'http://localhost')
        const itemPath = itemUrl.pathname
        const itemTab = itemUrl.searchParams.get('tab')
        const currentTab = searchParams.get('tab')

        // Active if paths match and either:
        // - Both have no tab param (Dashboard overview)
        // - Tab params match
        const isActive = pathname === itemPath && (
          (!itemTab && !currentTab) || (itemTab === currentTab)
        )
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-none border-2 transition-all duration-150 group min-h-[44px] sm:min-h-[48px]",
              isActive
                ? "bg-yellow text-ink font-bold border-ink comic-shadow-sm"
                : "border-transparent text-muted-foreground hover:bg-gray-panel hover:text-ink hover:border-ink active:bg-yellow"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 sm:h-5 sm:w-5 transition-colors flex-shrink-0",
                isActive ? "text-ink" : "group-hover:text-ink"
              )}
            />
            <span className="text-sm sm:text-base flex-1">{item.title}</span>
            {item.badge && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-muted/50 flex-shrink-0"
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
