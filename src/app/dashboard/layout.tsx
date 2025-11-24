"use client"

import { useAuth } from "@/components/AuthProvider"
import { Sidebar } from "@/components/Sidebar/Sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  // Show loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500/20 border-t-green-500"></div>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-green-600">Loading...</h3>
            <p className="text-muted-foreground">Setting up your dashboard</p>
          </div>
        </div>
      </div>
    )
  }

  // Get user display name and initial
  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    return "User"
  }

  const getUserInitial = () => {
    const name = getUserDisplayName()
    return name.charAt(0).toUpperCase()
  }

  const userData = {
    name: getUserDisplayName(),
    email: user.email || "",
    initial: getUserInitial(),
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={userData} onSignOut={signOut} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:ml-64 bg-gradient-to-br from-background to-secondary">
        {/* Mobile header spacing - accounts for hamburger menu */}
        <div className="lg:hidden h-16" />
        {children}
      </main>
    </div>
  )
}
