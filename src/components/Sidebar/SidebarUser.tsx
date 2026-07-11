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
    <div className="mt-auto p-4 sm:p-5 border-t-[2.5px] border-ink bg-card">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex items-center gap-3 p-3 sm:p-3.5 border-2 border-transparent hover:border-ink hover:bg-gray-panel rounded-none transition-colors cursor-pointer min-h-[56px] sm:min-h-[60px] active:bg-yellow">
            <Avatar className="h-10 w-10 sm:h-11 sm:w-11 rounded-none border-2 border-ink flex-shrink-0">
              <AvatarFallback className="rounded-none bg-yellow text-ink font-display font-extrabold text-base sm:text-lg">
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
          <DropdownMenuItem onClick={onSignOut} className="text-overdue py-2 sm:py-2.5 cursor-pointer">
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
            <span className="text-sm sm:text-base">Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
