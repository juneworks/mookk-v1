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
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md dark:bg-[#1c2b20]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 영역 */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span 
              className="text-2xl font-black tracking-wider text-[#244C28] dark:text-[#edfae0]"
              style={{ WebkitTextStroke: '0.7px currentColor' }}
            >
              MOOKK
            </span>
            <span className="rounded-full bg-[#244C28]/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-[#244C28] dark:bg-white/10 dark:text-[#edfae0]">
              beta
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#244C28]/70 dark:text-[#edfae0]/70">
            <Link href="/" className="hover:text-[#244C28] dark:hover:text-[#edfae0] transition-colors font-bold">
              프로젝트
            </Link>
            <Link href="#" className="hover:text-[#244C28] dark:hover:text-[#edfae0] transition-colors font-bold">
              커뮤니티
            </Link>
            {user?.role === 'creator' && (
              <Link href="/projects/create" className="hover:text-[#244C28] dark:hover:text-[#edfae0] transition-colors">
                프로젝트 등록
              </Link>
            )}
          </nav>
        </div>

        {/* 우측 로그인/유저 정보 영역 */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* 유저명과 역할을 1열로 배치하고 짙은 배경의 흰색 글자 박스 뱃지 처리 */}
              <div className="flex items-center gap-2 hidden sm:flex">
                <span className="text-sm font-semibold text-[#244C28] dark:text-[#edfae0]">
                  {user.name}
                </span>
                <span className="rounded bg-[#244C28] text-white dark:bg-[#edfae0] dark:text-[#142017] px-2 py-0.5 text-[10px] font-bold tracking-wide">
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:hidden">
                <span className="text-xs font-semibold text-[#244C28] dark:text-[#edfae0]">
                  {user.name}
                </span>
                <span className="rounded bg-[#244C28] text-white dark:bg-[#edfae0] dark:text-[#142017] px-1.5 py-0.5 text-[9px] font-bold">
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <Link href={getMyPageLink()}>
                <Button variant="outline" size="sm" className="border-[#244C28]/20 text-[#244C28] hover:bg-[#244C28]/5 dark:border-white/20 dark:text-[#edfae0] dark:hover:bg-white/5">
                  마이페이지
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-[#244C28]/80 hover:bg-[#244C28]/5 dark:text-[#edfae0]/80 dark:hover:bg-white/5">
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" className="bg-[#244C28] text-[#d6f9b4] hover:bg-[#244C28]/90 dark:bg-[#edfae0] dark:text-[#142017] dark:hover:bg-[#edfae0]/90 font-bold">
                  로그인
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
