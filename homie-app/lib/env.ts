import { z } from 'zod'

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
})

function validateEnv() {
  const result = envSchema.safeParse({
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })

  if (!result.success) {
    console.error('Missing required environment variables:')
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
    throw new Error('Invalid environment configuration')
  }

  return result.data
}

// Lazy — only validate at runtime (inside request handlers), not at build time
let _env: ReturnType<typeof validateEnv> | null = null
export function getEnv() {
  if (!_env) _env = validateEnv()
  return _env
}
