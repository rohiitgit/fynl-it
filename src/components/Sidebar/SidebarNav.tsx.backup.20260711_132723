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
              "flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-lg transition-all duration-200 group min-h-[44px] sm:min-h-[48px]",
              isActive
                ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 font-semibold border-l-4 border-l-green-600 dark:border-l-green-400 shadow-sm"
                : "text-muted-foreground hover:bg-green-50/50 dark:hover:bg-green-950/10 hover:text-foreground active:bg-green-50 dark:active:bg-green-950/20"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 sm:h-5 sm:w-5 transition-colors flex-shrink-0",
                isActive
                  ? "text-green-600 dark:text-green-400"
                  : "group-hover:text-green-600 dark:group-hover:text-green-400"
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
