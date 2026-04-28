import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser-only lazy singleton — safe to import from client components
let _browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getBrowserClient() {
  if (!_browserClient) {
    _browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return _browserClient
}

export const supabase = {
  get auth() { return getBrowserClient().auth },
  from: (...args: Parameters<ReturnType<typeof createBrowserClient>['from']>) =>
    getBrowserClient().from(...args),
}
