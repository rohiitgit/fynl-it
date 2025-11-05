/**
 * Supabase Admin Client
 *
 * Server-side only client with elevated permissions using service role key.
 *
 * ⚠️ SECURITY WARNING:
 * - This client bypasses Row Level Security (RLS) policies
 * - Only use in server-side code (API routes, server actions)
 * - NEVER expose this client to the browser
 * - NEVER use in client components or pages
 *
 * Use Cases:
 * - Server-side operations requiring elevated permissions
 * - Scheduled jobs and cron handlers
 * - Webhook handlers from external services
 * - Admin operations that need to bypass RLS
 *
 * For client-side or authenticated user operations, use the regular
 * Supabase client from '@/lib/supabase' instead.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Environment variable validation
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
  );
}

/**
 * Supabase admin client with service role key
 *
 * Configuration:
 * - autoRefreshToken: false (server-side doesn't need token refresh)
 * - persistSession: false (server-side is stateless)
 */
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
