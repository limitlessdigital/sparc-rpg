import { createClient as supabaseCreateClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Type-safe Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Browser/client-side Supabase client
 * Uses anon key for public access with RLS
 */
export function createClient(): TypedSupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
    );
  }

  return supabaseCreateClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Server-side Supabase client
 * Can use service role key for admin operations or anon key with user token
 */
export function createServerClient(accessToken?: string): TypedSupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }

  // Use service role key for admin operations, or anon key with user token
  const key = supabaseServiceKey ?? supabaseAnonKey;

  if (!key) {
    throw new Error('Missing Supabase key: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY required');
  }

  return supabaseCreateClient<Database>(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
}

/**
 * Admin client with service role (bypasses RLS)
 * ⚠️ Only use server-side for admin operations
 */
export function createAdminClient(): TypedSupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase admin credentials: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'
    );
  }

  return supabaseCreateClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Singleton instance for client-side usage
let browserClient: TypedSupabaseClient | null = null;

/**
 * Get or create a singleton browser client
 * Useful for React components to avoid creating multiple instances
 */
export function getClient(): TypedSupabaseClient {
  if (typeof window === 'undefined') {
    // Server-side: always create fresh instance
    return createClient();
  }

  // Client-side: use singleton
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
