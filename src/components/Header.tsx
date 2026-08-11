'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const isMain = pathname === '/'
  const supabase = createClient()
  const [user, setUser] = useState<UserProfile | null>(initialUser)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  // 라우트 변경 시 메뉴 닫기
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // ESC 키로 메뉴 닫기 & 메뉴 열림 시 배경 스크롤 방지
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  // 인증 상태 변화 감지 및 상태 동기화
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('User')
          .select('*' )
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
    setIsMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const handleNavigate = (href: string) => {
    setIsMenuOpen(false)
    router.push(href)
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

  // 사이트 전체 4가지 주메뉴
  const siteNavItems = [
    { label: '프로젝트', href: '/projects' },
    { label: '스튜디오', href: '/studio' },
    { label: '소개', href: '/about' },
    { label: '게시판', href: '/board' },
  ]

  return (
    <>
      <header 
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
          isMain
            ? (isScrolled 
                ? 'bg-white/70 backdrop-blur-xl border-b border-black/5 shadow-2xs' 
                : 'bg-transparent border-b border-transparent shadow-none')
            : 'bg-white/80 backdrop-blur-xl border-b border-[#1C4025]/10 shadow-2xs'
        }`}
      >
        {/* 1. 상단 GNB 메인 바 */}
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* 1) 좌측: 2선 아이콘 + MENU 버튼 */}
          <div className="shrink-0 z-20">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className={`flex items-center gap-2.5 sm:gap-3 ${
                isMain && !isScrolled ? 'text-white' : 'text-black'
              } hover:opacity-75 transition-colors py-2 cursor-pointer group`}
              aria-label="메뉴 열기"
            >
              {/* 2줄 평행 가로선 아이콘 */}
              <div className="flex flex-col gap-1.5 w-5 sm:w-6 justify-center">
                <span className={`block w-full h-[2px] ${isMain && !isScrolled ? 'bg-white' : 'bg-black'}`}></span>
                <span className={`block w-full h-[2px] ${isMain && !isScrolled ? 'bg-white' : 'bg-black'}`}></span>
              </div>
              <span className="text-base sm:text-lg font-black tracking-normal">
                MENU
              </span>
            </button>
          </div>

          {/* 2) 중앙: 사이트 제목(로고 & beta 뱃지) - 헤더 및 화면 가로 전체 대비 완벽한 정중앙 위치 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto z-10">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className={`text-[26px] sm:text-[30px] font-extrabold tracking-normal ${
                isMain && !isScrolled ? 'text-white' : 'text-[#1C4025]'
              } hover:opacity-90 transition-colors`}>
                MOOKK
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                isMain && !isScrolled ? 'bg-white/20 text-white' : 'bg-[#1C4025]/10 text-[#1C4025]'
              }`}>
                beta
              </span>
            </Link>
          </div>

          {/* 3) 우측: 로그인 아이콘 버튼 또는 유저 정보 */}
          <div className="flex items-center gap-3 shrink-0 z-20">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 hidden sm:flex">
                  <span className={`text-xs font-bold ${isMain && !isScrolled ? 'text-white' : 'text-[#1C4025]'}`}>
                    {user.name}
                  </span>
                  <span className={`rounded-full text-white px-2 py-0.5 text-[9px] font-bold ${user.role === 'creator' ? 'bg-[#c84b15]' : 'bg-[#1C4025]'}`}>
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
              <Link href="/login" title="로그인" aria-label="로그인">
                <button 
                  type="button"
                  className={`flex items-center justify-center p-2 rounded-lg ${
                    isMain && !isScrolled ? 'text-white hover:bg-white/10' : 'text-[#1C4025] hover:bg-[#1C4025]/5 hover:text-[#c84b15]'
                  } transition-colors cursor-pointer`}
                >
                  <svg 
                    className="w-6 h-6 sm:w-7 sm:h-7" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    {/* 왼쪽이 열린 문(Door) */}
                    <path d="M9 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9" />
                    {/* 문으로 들어가는 오른쪽 방향 화살표 */}
                    <path d="M3 12h11" />
                    <path d="M10 8l4 4-4 4" />
                  </svg>
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. 전체화면 메뉴 패널 (최상위 z-[9999] 독립 오버레이 - 모든 페이지에서 100% 동일하게 작동) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[9999] bg-[#FBF9F6]/98 backdrop-blur-md flex flex-col overflow-y-auto animate-in fade-in duration-200">
          {/* 상단 바: MENU 버튼과 100% 동일한 좌표에 ✕ CLOSE 배치 */}
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 w-full shrink-0">
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 text-sm sm:text-base font-black text-black hover:text-[#c84b15] transition-colors tracking-tight cursor-pointer py-2"
              aria-label="메뉴 닫기"
            >
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>CLOSE</span>
            </button>
          </div>

          {/* 본문 메뉴 목록 */}
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 flex flex-col justify-between flex-1">
            <nav className="flex flex-col space-y-4 sm:space-y-6 items-start">
              {siteNavItems.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNavigate(item.href)}
                  className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight leading-tight hover:text-[#c84b15] hover:translate-x-2 transition-all duration-200 cursor-pointer text-left"
                >
                  {item.label}
                </button>
              ))}
              {user?.role === 'creator' && (
                <button
                  type="button"
                  onClick={() => handleNavigate('/projects/create')}
                  className="text-xl sm:text-2xl font-extrabold text-[#c84b15] tracking-tight hover:opacity-80 transition-opacity pt-2 cursor-pointer text-left"
                >
                  + 프로젝트 등록
                </button>
              )}
            </nav>

            {/* 하단 보조 메뉴 & 유저 링크 */}
            <div className="pt-12 border-t border-black/10 mt-12 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-neutral-500">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <button type="button" onClick={() => handleNavigate('/notice')} className="hover:text-black transition-colors cursor-pointer">
                  공지 및 안내
                </button>
                <button type="button" onClick={() => handleNavigate('/guide')} className="hover:text-black transition-colors cursor-pointer">
                  창작가 가이드
                </button>
                <button type="button" onClick={() => handleNavigate('/terms')} className="hover:text-black transition-colors cursor-pointer">
                  이용약관
                </button>
                <button type="button" onClick={() => handleNavigate('/privacy')} className="hover:text-black transition-colors cursor-pointer">
                  개인정보처리방침
                </button>
              </div>

              <div>
                {user ? (
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => handleNavigate('/mypage')} className="text-[#1C4025] font-bold hover:underline cursor-pointer">
                      마이페이지 ({user.name})
                    </button>
                    <button type="button" onClick={handleSignOut} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => handleNavigate('/login')} className="text-[#1C4025] font-bold hover:underline cursor-pointer">
                    로그인 / 회원가입
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 서브페이지에서는 fixed 헤더 높이(h-16)만큼 스페이서 제공 */}
      {!isMain && <div className="h-16 w-full shrink-0" />}
    </>
  )
}
