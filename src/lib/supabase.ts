import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging for environment variables (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔧 Supabase Environment Check:', {
    hasUrl: !!supabaseUrl,
    urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING',
    hasKey: !!supabaseAnonKey,
    keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING'
  })
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Use a single client instance to avoid multiple client warnings
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createSupabaseBrowserClient() {
  if (!supabaseClient) {
    // We've already checked that these exist above, so we can safely assert they're strings
    supabaseClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!)
  }
  return supabaseClient
}

// For backwards compatibility
export const supabase = createSupabaseBrowserClient()
