"use client"

import { useState } from "react"
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
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            Fynl-It
          </span>
        </div>
      </div>

      {/* New Invoice Button */}
      {onNewInvoice && (
        <div className="p-4">
          <Button
            variant="gradient"
            className="w-full gap-2"
            onClick={onNewInvoice}
          >
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-4 py-4">
          <div>
            <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Main
            </h4>
            <SidebarNav items={mainNavItems} onItemClick={onItemClick} />
          </div>

          <Separator className="my-4 mx-4" />

          <div>
            <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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

  if (isMobile) {
    return (
      <>
        {/* Mobile: Hamburger Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-40 lg:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
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
      </>
    )
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border/50 bg-card shadow-sm z-40">
      <SidebarContent
        user={user}
        onSignOut={onSignOut}
        onNewInvoice={onNewInvoice}
      />
    </aside>
  )
}
