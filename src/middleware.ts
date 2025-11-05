// src/middleware.ts - Middleware with request ID and structured logging (Edge Runtime compatible)
import { createServerClient, CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authLogger } from '@/lib/logger'

// Edge Runtime compatible UUID generator
function generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
    // Generate unique request ID for tracing (Edge-compatible)
    const requestId = generateRequestId()

    const supabaseResponse = NextResponse.next({
        request,
    })

    // Add request ID to response headers for client-side correlation
    supabaseResponse.headers.set('x-request-id', requestId)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        authLogger.error({
            requestId,
            action: 'middleware_config_error',
            path: request.nextUrl.pathname,
        }, 'Missing Supabase environment variables')
        return supabaseResponse
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    try {
        // Only refresh the session, don't redirect here
        // Let the client-side AuthProvider handle routing
        await supabase.auth.getSession()

        return supabaseResponse
    } catch (error: unknown) {
        authLogger.error({
            requestId,
            action: 'middleware_session_error',
            path: request.nextUrl.pathname,
            err: error instanceof Error ? error : new Error(String(error)),
        }, 'Middleware session error')
        // On error, let the request continue (don't break the app)
        return supabaseResponse
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}