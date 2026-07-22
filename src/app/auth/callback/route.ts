import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 인증 후 리다이렉트할 경로 (기본값은 홈)
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
      const supabase = await createClient()
      
      // 전달된 일회용 code를 세션 세션쿠키로 교환
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // 호스트 네임 전달 시 x-forwarded-host 헤더가 있으면 실서버(Vercel 등) 환경에 맞추어 리다이렉트
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
      
      console.error('Session exchange failed:', error.message)
    } catch (err) {
      console.error('Auth Callback unexpected error:', err)
    }
  }

  // 실패 또는 코드 미존재 시 에러 안내 리다이렉션 또는 홈 리다이렉션
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
