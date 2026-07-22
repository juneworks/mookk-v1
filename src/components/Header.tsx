'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

interface UserProfile {
  id: string
  email: string
  name: string
  role: 'creator' | 'backer' | 'admin'
}

interface HeaderProps {
  initialUser: UserProfile | null
}

export default function Header({ initialUser }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<UserProfile | null>(initialUser)

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  // 인증 상태 변화 감지 및 상태 동기화
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // 로그인 시 세션 데이터를 바탕으로 public.User 정보 다시 조회
        const { data: profile } = await supabase
          .from('User')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setUser(profile as UserProfile)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    // 1. Supabase Auth 로그아웃 실행 (클라이언트 세션 제거)
    await supabase.auth.signOut()

    // 2. Next.js 서버 사이드 쿠키 세션 제거를 위해 signout API 호출
    await fetch('/api/auth/signout', { method: 'POST' })

    // 3. 홈으로 이동 및 세션 갱신을 위해 refresh 실행
    router.push('/')
    router.refresh()
  }

  // 역할(Role) 한국어 매핑
  const getRoleLabel = (role: 'creator' | 'backer' | 'admin') => {
    switch (role) {
      case 'creator':
        return '창작자'
      case 'backer':
        return '후원자'
      case 'admin':
        return '관리자'
      default:
        return '사용자'
    }
  }

  // 역할별 마이페이지 또는 대시보드 이동 경로 설정
  const getMyPageLink = () => {
    return '/mypage'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 영역 */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-wider text-primary">Mookk</span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              v1.0
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
              프로젝트 탐색
            </Link>
            {user?.role === 'creator' && (
              <Link href="/projects/create" className="hover:text-black dark:hover:text-white transition-colors">
                프로젝트 등록
              </Link>
            )}
          </nav>
        </div>

        {/* 우측 로그인/유저 정보 영역 */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary sm:hidden">
                {user.name}
              </span>
              <Link href={getMyPageLink()}>
                <Button variant="outline" size="sm">
                  마이페이지
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm">로그인</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
