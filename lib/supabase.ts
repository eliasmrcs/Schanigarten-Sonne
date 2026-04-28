import { createBrowserClient } from '@supabase/ssr'
import { createServerClient as createSSRServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client — lazy singleton, safe to call from client components
let _browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getBrowserClient() {
  if (!_browserClient) {
    _browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return _browserClient
}

// Legacy compat export used in client components
export const supabase = {
  get auth() { return getBrowserClient().auth },
  from: (...args: Parameters<ReturnType<typeof createBrowserClient>['from']>) =>
    getBrowserClient().from(...args),
}

// Server client — reads/writes session from Next.js cookies()
// Use this in API routes and Server Components
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component — cookies can't be set, middleware handles it
        }
      },
    },
  })
}
