// src/app/auth/callback/page.tsx - Simplified for Google OAuth only
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Separate component that uses useSearchParams
function AuthCallbackContent() {
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Handle the auth callback from Google OAuth
                const { data, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('❌ Auth callback error:', error)
                    setStatus('error')
                    setMessage(error.message || 'Authentication failed')
                } else if (data.session && data.session.user) {
                    // User is successfully signed in
                    console.log('✅ User signed in:', data.session.user.email)
                    setStatus('success')
                    setMessage('Successfully signed in! Redirecting to your dashboard...')

                    setTimeout(() => {
                        router.push('/dashboard')
                    }, 2000)
                } else {
                    console.log('⚠️ No session found')
                    setStatus('error')
                    setMessage('Authentication failed. Please try signing in again.')
                }
            } catch (error) {
                console.error('💥 Callback processing error:', error)
                setStatus('error')
                setMessage('Something went wrong during authentication. Please try again.')
            }
        }

        handleAuthCallback()
    }, [router])

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                        {status === 'loading' && (
                            <div className="w-8 h-8 relative">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500/20 border-t-green-500"></div>
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                        )}
                    </div>

                    <CardTitle className="text-xl">
                        {status === 'loading' && 'Signing you in...'}
                        {status === 'success' && 'Welcome to Fynl-It!'}
                        {status === 'error' && 'Authentication Failed'}
                    </CardTitle>
                </CardHeader>

                <CardContent className="text-center space-y-4">
                    <p className={`text-sm ${status === 'success' ? 'text-green-800 dark:text-green-200' :
                            status === 'error' ? 'text-red-800 dark:text-red-200' :
                                'text-muted-foreground'
                        }`}>
                        {message}
                    </p>

                    {/* Error state actions */}
                    {status === 'error' && (
                        <div className="space-y-3 pt-4">
                            <Link href="/auth">
                                <Button variant="outline" className="w-full">
                                    Try Again
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="ghost" className="w-full">
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Loading state */}
                    {status === 'loading' && (
                        <div className="pt-4">
                            <p className="text-xs text-muted-foreground">
                                This may take a few seconds...
                            </p>
                        </div>
                    )}

                    {/* Success state - auto redirecting */}
                    {status === 'success' && (
                        <div className="pt-4">
                            <div className="flex items-center justify-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                                <p className="text-xs text-green-600">
                                    Redirecting to dashboard...
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

// Loading fallback component
function AuthCallbackLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 relative">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500/20 border-t-green-500"></div>
                        </div>
                    </div>
                    <CardTitle className="text-xl">Loading...</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground">
                        Processing authentication...
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

// Main component with Suspense boundary
export default function AuthCallback() {
    return (
        <Suspense fallback={<AuthCallbackLoading />}>
            <AuthCallbackContent />
        </Suspense>
    )
}