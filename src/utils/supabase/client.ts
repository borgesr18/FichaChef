import { createBrowserClient } from '@supabase/ssr'

// ✅ CLIENTE SUPABASE PARA CLIENT COMPONENTS
// Fonte: https://supabase.com/docs/guides/auth/server-side/nextjs

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
