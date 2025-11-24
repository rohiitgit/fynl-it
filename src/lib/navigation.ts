import { LayoutDashboard, FileText, Mail, Settings, HelpCircle, type LucideIcon } from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
  description?: string
}

export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and stats",
  },
  {
    title: "Invoices",
    href: "/dashboard?tab=invoices",
    icon: FileText,
    description: "Manage invoices",
  },
  {
    title: "Email Activity",
    href: "/dashboard?tab=emails",
    icon: Mail,
    description: "Email logs and tracking",
  },
]

export const settingsNavItems: NavItem[] = [
  {
    title: "Settings",
    href: "/dashboard?tab=settings",
    icon: Settings,
    description: "Profile and preferences",
  },
  {
    title: "Help",
    href: "/dashboard/help",
    icon: HelpCircle,
    description: "Documentation and support",
    badge: "Soon",
  },
]
