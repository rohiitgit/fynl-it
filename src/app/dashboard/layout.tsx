"use client"

import { useAuth } from "@/components/AuthProvider"
import { Sidebar } from "@/components/Sidebar/Sidebar"
import NewInvoiceModal from "@/components/NewInvoiceModal"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const modalTriggerRef = useRef<HTMLButtonElement>(null)

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  // Show loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-paper comic-paper-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-[3px] border-ink bg-yellow animate-spin [animation-duration:1.2s]" />
          <div>
            <h3 className="font-display font-bold text-lg text-ink">Loading...</h3>
            <p className="font-mono text-sm text-muted-foreground">Setting up your dashboard</p>
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

  const handleNewInvoice = () => {
    // Click the hidden modal trigger button
    modalTriggerRef.current?.click()
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={userData} onSignOut={signOut} onNewInvoice={handleNewInvoice} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:ml-64 bg-paper">
        {/* Mobile header spacing - accounts for hamburger menu */}
        <div className="lg:hidden h-16" />
        {children}
      </main>

      {/* New Invoice Modal - Hidden trigger controlled by sidebar button */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
        <NewInvoiceModal
          onSuccess={() => {
            // Invoice list refresh is handled by the dashboard page component
            // via its own effect watching for invoice changes
          }}
        >
          <button
            ref={modalTriggerRef}
            className="pointer-events-auto"
            aria-hidden="true"
          />
        </NewInvoiceModal>
      </div>
    </div>
  )
}
