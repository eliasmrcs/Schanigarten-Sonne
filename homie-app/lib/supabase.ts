import { createClient } from '@supabase/supabase-js'

// Lazy singleton — not instantiated at module level so Next.js build doesn't crash
// when env vars are injected at runtime rather than build time
let _supabase: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    _supabase = createClient(url, key)
  }
  return _supabase
}

// Keep named export for backwards compat with any client-side usage
export const supabase = {
  get auth() { return getSupabase().auth },
  from: (...args: Parameters<ReturnType<typeof createClient>['from']>) => getSupabase().from(...args),
}

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}
