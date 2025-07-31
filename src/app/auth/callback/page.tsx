// src/app/auth/callback/page.tsx - Fixed with Suspense boundary
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { EmailOtpType } from '@supabase/supabase-js'

// Separate component that uses useSearchParams
function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the token hash from URL
                const token_hash = searchParams.get('token_hash')
                const type = searchParams.get('type')
                const next = searchParams.get('next') ?? '/dashboard'

                if (token_hash && type) {
                    const { error } = await supabase.auth.verifyOtp({
                        token_hash,
                        type: type as EmailOtpType,
                    })

                    if (error) {
                        console.error('Verification error:', error)
                        setStatus('error')
                        setMessage(error.message || 'Email verification failed')
                    } else {
                        setStatus('success')
                        setMessage('Email verified successfully! Redirecting to your dashboard...')

                        // Wait a moment then redirect
                        setTimeout(() => {
                            router.push(next)
                        }, 2000)
                    }
                } else {
                    // No token in URL, might be a redirect after successful verification
                    const { data: { session } } = await supabase.auth.getSession()

                    if (session) {
                        setStatus('success')
                        setMessage('Already signed in! Redirecting...')
                        setTimeout(() => {
                            router.push('/dashboard')
                        }, 1000)
                    } else {
                        setStatus('error')
                        setMessage('Invalid verification link')
                    }
                }
            } catch (error) {
                console.error('Callback error:', error)
                setStatus('error')
                setMessage('Something went wrong during verification')
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
                            <div className="relative">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
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
                        {status === 'loading' && 'Verifying Email...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </CardTitle>
                </CardHeader>

                <CardContent className="text-center space-y-4">
                    <p className={`text-sm ${status === 'success' ? 'text-green-800 dark:text-green-200' :
                            status === 'error' ? 'text-red-800 dark:text-red-200' :
                                'text-muted-foreground'
                        }`}>
                        {message}
                    </p>

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

                    {status === 'loading' && (
                        <div className="pt-4">
                            <p className="text-xs text-muted-foreground">
                                This may take a few seconds...
                            </p>
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
                        <div className="relative">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
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