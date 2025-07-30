// src/middleware.ts - Updated authentication middleware using @supabase/ssr
import { createServerClient, CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest): Promise<NextResponse> {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables')
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
        // Get session - this will refresh the session if needed
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
            console.error('Session error:', error)
            return supabaseResponse
        }

        const { pathname } = request.nextUrl

        // Define protected routes
        const protectedRoutes: readonly string[] = ['/dashboard', '/invoices'] as const
        const authRoutes: readonly string[] = ['/auth'] as const

        // Check if current path is protected
        const isProtectedRoute: boolean = protectedRoutes.some((route: string) => pathname.startsWith(route))
        const isAuthRoute: boolean = authRoutes.some((route: string) => pathname.startsWith(route))

        // Handle protected routes
        if (isProtectedRoute && !session) {
            // Redirect to auth if trying to access protected route without session
            const redirectUrl: URL = new URL('/auth', request.url)
            return NextResponse.redirect(redirectUrl)
        }

        // Handle auth routes when already logged in
        if (isAuthRoute && session) {
            // Redirect to dashboard if trying to access auth page while logged in
            const redirectUrl: URL = new URL('/dashboard', request.url)
            return NextResponse.redirect(redirectUrl)
        }

        return supabaseResponse
    } catch (error: unknown) {
        console.error('Middleware error:', error instanceof Error ? error.message : String(error))
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
} as const