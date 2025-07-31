// src/lib/auth-utils.ts - Fixed TypeScript errors
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export const runtime = 'nodejs';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
}

interface WindowWithTimer extends Window {
    nudgrAuthTimer?: NodeJS.Timeout;
}

// Custom event for auth state changes across tabs
const AUTH_STATE_CHANGE_EVENT = 'nudgr_auth_state_change';

// Utility functions for better session management
export const authUtils = {
    /**
     * Get current session with proper error handling
     */
    async getCurrentSession(): Promise<{ session: Session | null; error: Error | null }> {
        try {
            const { data, error } = await supabase.auth.getSession();
            return { session: data.session, error };
        } catch (error) {
            console.error('Error getting current session:', error);
            return { session: null, error: error as Error };
        }
    },

    /**
     * Refresh session with retry logic
     */
    async refreshSession(): Promise<{ session: Session | null; error: Error | null }> {
        try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
                console.error('Session refresh failed:', error);
                return { session: null, error };
            }
            return { session: data.session, error: null };
        } catch (error) {
            console.error('Error refreshing session:', error);
            return { session: null, error: error as Error };
        }
    },

    /**
     * Sign out with proper cleanup
     */
    async signOut(): Promise<{ error: Error | null }> {
        try {
            // Clear any pending timers or intervals
            this.clearAuthTimers();

            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('Sign out error:', error);
                return { error };
            }

            // Clear local storage manually as backup
            if (typeof window !== 'undefined') {
                localStorage.removeItem('nudgr_auth_token');
                localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1] + '-auth-token');
            }

            // Broadcast sign out event to other tabs
            this.broadcastAuthChange('SIGNED_OUT', null, null);

            return { error: null };
        } catch (error) {
            console.error('Error during sign out:', error);
            return { error: error as Error };
        }
    },

    /**
     * Check if session is expired
     */
    isSessionExpired(session: Session | null): boolean {
        if (!session) return true;

        const now = Math.floor(Date.now() / 1000);
        return session.expires_at ? session.expires_at < now : false;
    },

    /**
     * Get time until session expires (in seconds)
     */
    getTimeUntilExpiry(session: Session | null): number {
        if (!session || !session.expires_at) return 0;

        const now = Math.floor(Date.now() / 1000);
        return Math.max(0, session.expires_at - now);
    },

    /**
     * Set up automatic session refresh
     */
    setupAutoRefresh(session: Session | null, callback?: (newSession: Session | null) => void): void {
        if (!session || typeof window === 'undefined') return;

        const timeUntilExpiry = this.getTimeUntilExpiry(session);

        // Refresh 5 minutes before expiry or halfway to expiry, whichever is sooner
        const refreshTime = Math.min(timeUntilExpiry - 300, timeUntilExpiry / 2);

        if (refreshTime > 0) {
            const timeoutId = setTimeout(async () => {
                console.log('🔄 Auto-refreshing session...');
                const { session: newSession, error } = await this.refreshSession();

                if (!error && newSession) {
                    callback?.(newSession);
                    // Set up next refresh
                    this.setupAutoRefresh(newSession, callback);
                } else {
                    console.error('Auto-refresh failed:', error);
                }
            }, refreshTime * 1000);

            // Store timeout ID for cleanup
            if (typeof window !== 'undefined') {
                (window as WindowWithTimer).nudgrAuthTimer = timeoutId;
            }
        }
    },

    /**
     * Clear auth-related timers
     */
    clearAuthTimers(): void {
        if (typeof window !== 'undefined') {
            const windowWithTimer = window as WindowWithTimer;
            if (windowWithTimer.nudgrAuthTimer) {
                clearTimeout(windowWithTimer.nudgrAuthTimer);
                delete windowWithTimer.nudgrAuthTimer;
            }
        }
    },

    /**
     * Broadcast auth state changes to other tabs
     */
    broadcastAuthChange(event: string, session: Session | null, user: User | null): void {
        if (typeof window === 'undefined') return;

        const authEvent = new CustomEvent(AUTH_STATE_CHANGE_EVENT, {
            detail: { event, session, user, timestamp: Date.now() }
        });

        window.dispatchEvent(authEvent);

        // Also use localStorage for cross-tab communication
        localStorage.setItem('nudgr_auth_broadcast', JSON.stringify({
            event,
            session: session ? { ...session } : null,
            user: user ? { ...user } : null,
            timestamp: Date.now()
        }));
    },

    /**
     * Listen for auth changes from other tabs
     */
    listenForAuthChanges(callback: (event: string, session: Session | null, user: User | null) => void): (() => void) {
        if (typeof window === 'undefined') return () => { };

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'nudgr_auth_broadcast' && e.newValue) {
                try {
                    const { event, session, user } = JSON.parse(e.newValue);
                    callback(event, session, user);
                } catch (error) {
                    console.error('Error parsing auth broadcast:', error);
                }
            }
        };

        const handleCustomEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            const { event, session, user } = customEvent.detail;
            callback(event, session, user);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener(AUTH_STATE_CHANGE_EVENT, handleCustomEvent);

        // Return cleanup function
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handleCustomEvent);
        };
    },

    /**
     * Validate session integrity
     */
    async validateSession(session: Session | null): Promise<boolean> {
        if (!session) return false;

        try {
            // Check if session is expired
            if (this.isSessionExpired(session)) {
                console.log('Session is expired');
                return false;
            }

            // Verify session with a simple API call
            const { data, error } = await supabase.auth.getUser();

            if (error || !data.user) {
                console.log('Session validation failed:', error?.message);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error validating session:', error);
            return false;
        }
    },

    /**
     * Handle session recovery after page reload
     */
    async recoverSession(): Promise<AuthState> {
        console.log('🔍 Attempting session recovery...');

        try {
            // First, try to get the session from storage
            const { session, error } = await this.getCurrentSession();

            if (error) {
                console.error('Session recovery failed:', error);
                return { user: null, session: null, loading: false };
            }

            if (!session) {
                console.log('No session found in storage');
                return { user: null, session: null, loading: false };
            }

            // Validate the session
            const isValid = await this.validateSession(session);

            if (!isValid) {
                console.log('Session validation failed, clearing...');
                await this.signOut();
                return { user: null, session: null, loading: false };
            }

            console.log('✅ Session recovered successfully');

            // Set up auto-refresh for the recovered session
            this.setupAutoRefresh(session);

            return {
                user: session.user,
                session,
                loading: false
            };

        } catch (error) {
            console.error('Session recovery error:', error);
            return { user: null, session: null, loading: false };
        }
    },

    /**
     * Get auth state for debugging
     */
    getAuthDebugInfo(): Record<string, unknown> {
        if (typeof window === 'undefined') return {};

        const storageKeys = Object.keys(localStorage).filter(key =>
            key.includes('auth') || key.includes('supabase') || key.includes('nudgr')
        );

        const debugInfo: Record<string, unknown> = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            storageKeys,
            hasAuthTimer: !!(window as WindowWithTimer).nudgrAuthTimer,
        };

        storageKeys.forEach(key => {
            try {
                const value = localStorage.getItem(key);
                debugInfo[key] = value ? JSON.parse(value) : value;
            } catch {
                debugInfo[key] = localStorage.getItem(key);
            }
        });

        return debugInfo;
    }
};

// Export auth state change event name for external use
export { AUTH_STATE_CHANGE_EVENT };