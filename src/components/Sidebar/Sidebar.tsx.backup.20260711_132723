"use client"

import { useState, useEffect } from "react"
import { DollarSign, Plus, Menu } from "lucide-react"
import { useMobile } from "@/lib/hooks/use-mobile"
import { mainNavItems, settingsNavItems } from "@/lib/navigation"
import { SidebarNav } from "./SidebarNav"
import { SidebarUser } from "./SidebarUser"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface SidebarProps {
  user: {
    name: string
    email: string
    initial: string
  }
  onSignOut: () => void
  onNewInvoice?: () => void
}

function SidebarContent({
  user,
  onSignOut,
  onNewInvoice,
  onItemClick,
}: SidebarProps & { onItemClick?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-card">
      {/* Logo Section */}
      <div className="p-4 sm:p-5 border-b border-border/50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            Fynl-It
          </span>
        </div>
      </div>

      {/* New Invoice Button */}
      <div className="p-4 sm:p-5">
        <Button
          variant="gradient"
          className="w-full gap-2 h-10 sm:h-11 text-sm sm:text-base"
          onClick={onNewInvoice}
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          New Invoice
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-4 py-4 sm:py-5">
          <div>
            <h4 className="px-4 text-xs sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
              Main
            </h4>
            <SidebarNav items={mainNavItems} onItemClick={onItemClick} />
          </div>

          <Separator className="my-4 mx-4" />

          <div>
            <h4 className="px-4 text-xs sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
              Settings
            </h4>
            <SidebarNav items={settingsNavItems} onItemClick={onItemClick} />
          </div>
        </div>
      </ScrollArea>

      {/* User Section */}
      <SidebarUser user={user} onSignOut={onSignOut} />
    </div>
  )
}

export function Sidebar({ user, onSignOut, onNewInvoice }: SidebarProps) {
  const isMobile = useMobile()
  const [open, setOpen] = useState(false)

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile && open) {
      setOpen(false)
    }
  }, [isMobile, open])

  return (
    <>
      {/* Mobile/Tablet: Hamburger Menu - Only visible on mobile */}
      {isMobile && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 bg-card/80 backdrop-blur-sm hover:bg-card shadow-md"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[280px] sm:w-[320px] p-0 border-r border-border/50"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent
              user={user}
              onSignOut={onSignOut}
              onNewInvoice={onNewInvoice}
              onItemClick={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop: Fixed Sidebar - Only visible on desktop */}
      {!isMobile && (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border/50 bg-card shadow-sm z-40">
          <SidebarContent
            user={user}
            onSignOut={onSignOut}
            onNewInvoice={onNewInvoice}
          />
        </aside>
      )}
    </>
  )
}
