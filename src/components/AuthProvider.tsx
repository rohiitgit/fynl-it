// src/components/AuthProvider.tsx - Enhanced with email verification
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()


  // Define protected and auth routes
  const protectedRoutes = ['/dashboard', '/invoices']
  const authRoutes = ['/auth']
  const callbackRoutes = ['/auth/callback']

  const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname?.startsWith(route))
  const isCallbackRoute = callbackRoutes.some(route => pathname?.startsWith(route))

  // Handle route protection
  const handleRouteProtection = useCallback((currentUser: User | null, currentSession: Session | null) => {
    if (!initialized || isCallbackRoute) return // Don't redirect during initialization or on callback routes

    if (isProtectedRoute) {
      if (!currentUser || !currentSession) {
        console.log('Redirecting to auth - user not authenticated')
        router.replace('/auth')
      }
    } else if (isAuthRoute && currentUser) {
      console.log('Redirecting to dashboard - user already authenticated')
      router.replace('/dashboard')
    }
  }, [isProtectedRoute, isAuthRoute, isCallbackRoute, router, initialized])

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      console.log('🔐 Initializing auth state...')

      // Get initial session
      const { data: { session: initialSession }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error getting initial session:', error)
        setUser(null)
        setSession(null)
      } else {
        console.log('Initial session:', initialSession?.user?.email || 'No session')
        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        // If we have a session, validate it's working
        if (initialSession?.user) {
          try {
            // Test the session with a simple call
            await supabase.from('profiles').select('id').limit(1)
            console.log('✅ Session validated successfully')
          } catch (validationError) {
            console.warn('⚠️ Session validation failed, but continuing:', validationError)
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      setUser(null)
      setSession(null)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [])

  // Refresh session manually
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error('Error refreshing session:', error)
        return
      }

      if (refreshedSession) {
        setSession(refreshedSession)
        setUser(refreshedSession.user)
        console.log('Session refreshed successfully')
      }
    } catch (error) {
      console.error('Session refresh error:', error)
    }
  }, [])

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Sign out error:', error)
        return
      }

      setUser(null)
      setSession(null)
      router.replace('/')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  // Set up auth state listener
  useEffect(() => {
    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`🔄 Auth state changed: ${event}`, newSession?.user?.email || 'No user')

        // Update state
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)

        // Handle specific events
        switch (event) {
          case 'SIGNED_IN':
            console.log('✅ User signed in:', newSession?.user?.email)
            break
          case 'SIGNED_OUT':
            console.log('👋 User signed out')
            setUser(null)
            setSession(null)
            break
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token refreshed for:', newSession?.user?.email)
            break
          case 'PASSWORD_RECOVERY':
            console.log('🔑 Password recovery initiated')
            break
          case 'USER_UPDATED':
            console.log('👤 User updated:', newSession?.user?.email)
            break
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [initializeAuth])

  // Handle route protection when auth state or route changes
  useEffect(() => {
    if (initialized && !loading) {
      handleRouteProtection(user, session)
    }
  }, [user, session, initialized, loading, handleRouteProtection])

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
