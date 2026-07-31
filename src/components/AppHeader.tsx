import { createClient } from '@/utils/supabase/server'
import Header from './Header'

export default async function AppHeader() {
  let initialUser = null

  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const { data: profile } = await supabase
        .from('User')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (profile) {
        initialUser = profile
      } else {
        initialUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || '사용자',
          role: session.user.user_metadata?.role || 'backer'
        }
      }
    }
  } catch (err) {
    // Supabase 미연결 시 fallback
    initialUser = null
  }

  return <Header initialUser={initialUser} />
}
