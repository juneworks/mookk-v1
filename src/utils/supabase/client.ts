import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co'))
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : 'https://yidtamzuuogralhophha.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Bzv6P3OjGzk7o5WV9fWF2g_iD3517fZ'

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

