// src/app/auth/callback/page.tsx - Improved with better cross-device support
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CheckCircle, AlertCircle, Loader2, Smartphone, Monitor } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { EmailOtpType } from '@supabase/supabase-js'

// Separate component that uses useSearchParams
function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'cross-device'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the token hash from URL
                const token_hash = searchParams.get('token_hash')
                const type = searchParams.get('type')
                const next = searchParams.get('next') ?? '/dashboard'

                if (token_hash && type) {
                    console.log('🔗 Processing email verification token...')

                    const { data, error } = await supabase.auth.verifyOtp({
                        token_hash,
                        type: type as EmailOtpType,
                    })

                    console.log('Verification response:', { data, error })

                    if (error) {
                        console.error('❌ Verification error:', error)
                        setStatus('error')
                        setMessage(error.message || 'Email verification failed')
                    } else {
                        // Email verification was successful
                        console.log('✅ Email verified successfully!')

                        // Check if we have session data
                        if (data.session && data.user) {
                            // User is now signed in on this device
                            console.log('🔑 User signed in on this device:', data.user.email)
                            setStatus('success')
                            setMessage('Email verified successfully! Redirecting to your dashboard...')

                            setTimeout(() => {
                                router.push(next)
                            }, 2000)
                        } else if (data.user) {
                            // Email verified but no session (cross-device)
                            console.log('📱 Cross-device verification for:', data.user.email)
                            setStatus('cross-device')
                            setMessage('Email verified successfully! You can now sign in on your original device.')
                        } else {
                            // Verification successful but no user data
                            console.log('✅ Verification successful (minimal response)')
                            setStatus('cross-device')
                            setMessage('Email verified successfully! You can now sign in with your credentials.')
                        }
                    }
                } else {
                    // No token in URL - check if user is already signed in
                    const { data: { session } } = await supabase.auth.getSession()

                    if (session) {
                        console.log('👤 User already signed in, redirecting...')
                        setStatus('success')
                        setMessage('You&apos;re already signed in! Redirecting...')
                        setTimeout(() => {
                            router.push('/dashboard')
                        }, 1000)
                    } else {
                        console.log('⚠️ No verification token found')
                        setStatus('error')
                        setMessage('Invalid verification link. Please try signing up again.')
                    }
                }
            } catch (error) {
                console.error('💥 Callback processing error:', error)

                // Check if user can actually sign in (verification might have worked)
                try {
                    const { data: { session } } = await supabase.auth.getSession()
                    if (session?.user?.email_confirmed_at) {
                        console.log('🎯 Verification actually succeeded! User is confirmed.')
                        setStatus('cross-device')
                        setMessage('Email verified successfully! You can now sign in with your credentials.')
                        return
                    }
                } catch (sessionError) {
                    console.error('Session check failed:', sessionError)
                }

                setStatus('error')
                setMessage('Something went wrong during verification. Please try signing in - your email might already be verified.')
            }
        }

        handleAuthCallback()
    }, [searchParams, router])

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
                        {(status === 'success' || status === 'cross-device') && (
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
                        {status === 'loading' && 'Verifying Email...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'cross-device' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </CardTitle>
                </CardHeader>

                <CardContent className="text-center space-y-4">
                    <p className={`text-sm ${(status === 'success' || status === 'cross-device') ? 'text-green-800 dark:text-green-200' :
                            status === 'error' ? 'text-red-800 dark:text-red-200' :
                                'text-muted-foreground'
                        }`}>
                        {message}
                    </p>

                    {/* Cross-device verification success */}
                    {status === 'cross-device' && (
                        <div className="space-y-4 pt-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    <Smartphone className="h-4 w-4 text-blue-600" />
                                    <span className="text-blue-600">→</span>
                                    <Monitor className="h-4 w-4 text-blue-600" />
                                </div>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>Cross-device verification detected!</strong><br />
                                    Go back to your original device and sign in with your email and password.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Link href="/auth">
                                    <Button className="w-full">
                                        Sign In Now
                                    </Button>
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                    Your account is now verified and ready to use
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error state actions */}
                    {status === 'error' && (
                        <div className="space-y-3 pt-4">
                            <Link href="/auth">
                                <Button variant="outline" className="w-full">
                                    Try Signing Up Again
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

                    {/* Same device success - auto redirecting */}
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
                        Preparing email verification...
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