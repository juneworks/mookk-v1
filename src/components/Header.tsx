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
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  // 인증 상태 변화 감지 및 상태 동기화
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
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
    await supabase.auth.signOut()
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/projects?search=${encodeURIComponent(searchQuery.trim())}`)
  }

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

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#1C4025]/10">
      {/* 1. 상단 GNB 메인 바 */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* 좌측: 로고 + 2가지 전체 메뉴('프로젝트', '알립니다') + 캡슐 검색창 */}
        <div className="flex items-center gap-6 sm:gap-8 flex-1">
          {/* 로고 & beta 뱃지 */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-[28px] sm:text-[30px] font-extrabold tracking-normal text-[#1C4025]">
              MOOKK
            </span>
            <span className="rounded-full bg-[#1C4025]/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-[#1C4025]">
              beta
            </span>
          </Link>

          {/* GNB 2가지 전체 메뉴 ('프로젝트', '알립니다') */}
          <nav className="hidden sm:flex items-center gap-7 text-sm font-bold text-[#1C4025] shrink-0">
            {/* 1. 프로젝트 */}
            <Link href="/projects" className="hover:text-[#c84b15] transition-colors py-2">
              프로젝트
            </Link>

            {/* 2. 알립니다 */}
            <Link href="/notice" className="hover:text-[#c84b15] transition-colors py-2">
              알립니다
            </Link>

            {user?.role === 'creator' && (
              <Link href="/projects/create" className="hover:text-[#c84b15] transition-colors py-2 text-xs font-semibold text-[#c84b15]">
                + 프로젝트 등록
              </Link>
            )}
          </nav>

          {/* 타원 캡슐형 검색창 (Search Input Bar) */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs sm:max-w-sm ml-2">
            <input
              type="text"
              placeholder="프로젝트 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-4 pr-10 rounded-full border border-[#1C4025] text-xs font-medium text-[#1C4025] placeholder:text-[#1C4025]/50 focus:outline-none focus:ring-1 focus:ring-[#1C4025] bg-white transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C4025] hover:opacity-75 transition-opacity"
              aria-label="검색"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* 우측 로그인/유저 정보 */}
        <div className="flex items-center gap-4 ml-4 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 hidden sm:flex">
                <span className="text-xs font-bold text-[#1C4025]">
                  {user.name}
                </span>
                <span className={`rounded-full text-white px-2 py-0.5 text-[9px] font-bold ${user.role === 'creator' ? 'bg-[#c84b15]' : 'bg-[#1C4025]'
                  }`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <Link href="/mypage">
                <Button variant="outline" size="sm" className="rounded-full border-[#1C4025]/20 text-[#1C4025] hover:bg-[#1C4025]/5 text-xs font-bold">
                  마이페이지
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-[#1C4025]/80 hover:bg-[#1C4025]/5 text-xs">
                로그아웃
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <button className="rounded-full bg-[#1C4025] text-white hover:bg-[#1C4025]/90 px-6 py-2 text-xs font-bold transition-all shadow-xs">
                로그인
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* 2. 헤더 아래 딥 그린 서브 띠 배너 */}
      <div className="w-full bg-[#1C4025] py-1.5 px-4 text-center">
        <Link href="/about" className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-white hover:text-[#d6f9b4] transition-colors">
          <span>MOOKK은 오직 종이책만을 위한 크라우드펀딩 출판 서비스입니다</span>
          <span className="text-base font-normal">➔</span>
        </Link>
      </div>
    </header>
  )
}
