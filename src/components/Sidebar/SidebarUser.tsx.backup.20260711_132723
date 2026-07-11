"use client"

import { User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarUserProps {
  user: {
    name: string
    email: string
    initial: string
  }
  onSignOut: () => void
}

export function SidebarUser({ user, onSignOut }: SidebarUserProps) {
  return (
    <div className="mt-auto p-4 sm:p-5 border-t border-border/50 bg-card">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex items-center gap-3 p-3 sm:p-3.5 hover:bg-accent rounded-lg transition-colors cursor-pointer min-h-[56px] sm:min-h-[60px] active:bg-accent/80">
            <Avatar className="h-10 w-10 sm:h-11 sm:w-11 ring-2 ring-green-500/20 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 text-green-700 dark:text-green-300 font-semibold text-base sm:text-lg">
                {user.initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm sm:text-base font-medium truncate">{user.name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 sm:w-64">
          <DropdownMenuLabel className="text-sm sm:text-base">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="py-2 sm:py-2.5 cursor-pointer">
            <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
            <span className="text-sm sm:text-base">Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut} className="text-red-600 py-2 sm:py-2.5 cursor-pointer">
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
            <span className="text-sm sm:text-base">Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
