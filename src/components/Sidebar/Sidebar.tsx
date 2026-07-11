"use client"

import { useState, useEffect } from "react"
import { IndianRupee, Plus, Menu } from "lucide-react"
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
      <div className="p-4 sm:p-5 border-b-[2.5px] border-ink">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow border-[2.5px] border-ink comic-shadow-sm flex items-center justify-center">
            <IndianRupee className="h-6 w-6 sm:h-7 sm:w-7 text-ink" strokeWidth={2.75} />
          </div>
          <span className="font-display text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
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
            <h4 className="px-4 font-mono text-xs sm:text-[11px] font-bold text-muted-foreground uppercase tracking-[0.14em] mb-2 sm:mb-3">
              Main
            </h4>
            <SidebarNav items={mainNavItems} onItemClick={onItemClick} />
          </div>

          <Separator className="my-4 mx-4" />

          <div>
            <h4 className="px-4 font-mono text-xs sm:text-[11px] font-bold text-muted-foreground uppercase tracking-[0.14em] mb-2 sm:mb-3">
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
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[280px] sm:w-[320px] p-0 border-r-[2.5px] border-ink"
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
        <aside className="fixed left-0 top-0 h-screen w-64 border-r-[2.5px] border-ink bg-card z-40">
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
