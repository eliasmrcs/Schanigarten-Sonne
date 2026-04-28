'use client'

import { useEffect } from 'react'
import { getBrowserClient } from '@/lib/supabase'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const supabase = getBrowserClient()

    // Sign in anonymously on first visit — creates a real user_id in Supabase
    // that persists across refreshes via the session cookie set by middleware
    async function ensureSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        await supabase.auth.signInAnonymously()
      }
    }

    ensureSession()
  }, [])

  return <>{children}</>
}
