import { createBrowserClient } from '@supabase/ssr'

// ✅ CLIENTE SUPABASE PARA CLIENT COMPONENTS
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

