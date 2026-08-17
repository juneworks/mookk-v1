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
    { label: '소개', href: '/about' },
    { label: '펀딩', href: '/funding' },
    { label: '컨텐츠', href: '/contents' },
    { label: '게시판', href: '/board' },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full transition-all duration-300">
        {/* 0. 최상단 베타 안내 띠 배너 (상하 1px 여백 추가) */}
        <div className="w-full bg-[#c84b15] py-[2.5px] sm:py-[3px] px-4 text-center flex items-center justify-center leading-none">
          <Link 
            href="/about" 
            className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12.6px] font-normal text-white hover:opacity-90 transition-opacity leading-none"
          >
            <span>MOOKK은 현재 베타 운영 중이며, 일부는 샘플 페이지입니다</span>
            <span className="text-[12px] font-normal">➔</span>
          </Link>
        </div>

        {/* 1. 상단 GNB 메인 바 */}
        <div 
          className={`w-full px-[clamp(1rem,4vw,4rem)] transition-all duration-300 ${
            isScrolled
              ? 'bg-[#1C4025]/90 backdrop-blur-md shadow-2xs'
              : (isMain
                  ? 'bg-black/5 backdrop-blur-md shadow-none'
                  : 'bg-white/80 backdrop-blur-xl shadow-none')
          }`}
        >
          <div className="relative mx-auto flex h-[41px] sm:h-[51px] max-w-[1440px] w-full items-center justify-between">

            {/* 1) 좌측: 사이트 타이틀 로고 (MOOKK 크기만 4/5 축소: 20px/23px, beta 유지) */}
            <div className="flex items-center shrink-0 z-20">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <span className={`text-[20px] sm:text-[23px] font-extrabold tracking-tight ${
                  isScrolled || isMain ? 'text-white' : 'text-[#1C4025]'
                } hover:opacity-90 transition-colors`}>
                  MOOKK
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                  isScrolled || isMain ? 'bg-white/20 text-white' : 'bg-[#1C4025]/10 text-[#1C4025]'
                }`}>
                  beta
                </span>
              </Link>
            </div>

            {/* 2) 우측 (데스크톱): 펼쳐진 메뉴 목록 + 네모 박스 형태의 로그인/마이페이지 */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 z-20">
              {siteNavItems.map((item) => {
                const isActive = item.href === '/about'
                  ? pathname === '/about'
                  : item.href === '/funding'
                    ? pathname.startsWith('/funding') || pathname.startsWith('/projects')
                    : item.href === '/contents'
                      ? pathname.startsWith('/contents') || pathname.startsWith('/studio')
                      : item.href === '/board'
                        ? pathname.startsWith('/board') || pathname === '/notice' || pathname === '/guide' || pathname === '/terms' || pathname === '/privacy'
                        : pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm lg:text-base font-bold transition-all duration-150 ${
                      isScrolled
                        ? isActive
                          ? 'text-white font-extrabold'
                          : 'text-[#9e9e9e] hover:text-white'
                        : isMain
                          ? isActive
                            ? 'text-white font-extrabold'
                            : 'text-[#638E6E] hover:text-white'
                          : isActive
                            ? 'text-[#1C4025] font-extrabold'
                            : 'text-[#638e6e] hover:text-[#1C4025]'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}

              {/* 로그인 / 사용자 상태 메뉴 (네모 박스 형태) */}
              {user ? (
                <div className="flex items-center gap-3 ml-2">
                  <Link
                    href="/mypage"
                    className={`px-3 py-1.5 border text-xs sm:text-sm font-bold transition-all duration-150 ${
                      isScrolled
                        ? 'border-white text-white hover:bg-white/10'
                        : isMain
                          ? 'border-[#638E6E] text-[#638E6E] hover:border-white hover:text-white hover:bg-white/10'
                          : 'border-[#638E6E] text-[#638E6E] hover:border-[#1C4025] hover:text-[#1C4025] hover:bg-[#638E6E]/10'
                    }`}
                  >
                    마이페이지
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={`text-xs font-semibold cursor-pointer ${
                      isScrolled
                        ? 'text-white/70 hover:text-white'
                        : isMain
                          ? 'text-[#638E6E] hover:text-white'
                          : 'text-[#638E6E] hover:text-[#1C4025]'
                    }`}
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`ml-2 px-3.5 py-1.5 border text-xs sm:text-sm font-bold transition-all duration-150 ${
                    isScrolled
                      ? 'border-white text-white hover:bg-white/15'
                      : isMain
                        ? 'border-[#638E6E] text-[#638E6E] hover:border-white hover:text-white hover:bg-white/15'
                        : 'border-[#638E6E] text-[#638E6E] hover:border-[#1C4025] hover:text-[#1C4025] hover:bg-[#638E6E]/10'
                  }`}
                >
                  로그인
                </Link>
              )}
            </nav>

            {/* 3) 우측 (모바일): 'MENU' 글자 없는 2선 햄버거 아이콘 버튼 */}
            <div className="flex md:hidden items-center shrink-0 z-20">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className={`p-2 ${
                  isScrolled || isMain ? 'text-white' : 'text-[#1C4025]'
                } hover:opacity-75 transition-opacity cursor-pointer`}
                aria-label="메뉴 열기"
              >
                {/* 2줄 가로선 아이콘 */}
                <div className="flex flex-col gap-1.5 w-6 justify-center">
                  <span className={`block w-full h-[2px] ${isScrolled || isMain ? 'bg-white' : 'bg-[#1C4025]'}`}></span>
                  <span className={`block w-full h-[2px] ${isScrolled || isMain ? 'bg-white' : 'bg-[#1C4025]'}`}></span>
                </div>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. 전체화면 모바일 메뉴 패널 (최상위 z-[9999] 독립 오버레이) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[9999] bg-[#FBF9F6]/98 backdrop-blur-md flex flex-col overflow-y-auto px-[clamp(1rem,4vw,4rem)] animate-in fade-in duration-200">
          {/* 상단 바: 좌측 로고 + 우측 X 닫기 버튼 (CLOSE 텍스트 없음) */}
          <div className="mx-auto flex h-[41px] sm:h-[51px] max-w-[1440px] w-full items-center justify-between shrink-0">
            <div className="flex items-center">
              <span className="text-[20px] sm:text-[23px] font-extrabold tracking-tight text-[#1C4025]">
                MOOKK
              </span>
              <span className="ml-2 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider bg-[#1C4025]/10 text-[#1C4025]">
                beta
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-black hover:text-[#c84b15] transition-colors cursor-pointer"
              aria-label="메뉴 닫기"
            >
              <svg 
                className="w-6 h-6 stroke-[2.2]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 본문 메뉴 목록 & 로그인 네모 박스 ('X' 버튼 바로 아래 우측 정렬) */}
          <div className="mx-auto max-w-[1440px] w-full pt-6 sm:pt-10 pb-16 flex flex-col items-end">
            <nav className="flex flex-col space-y-6 sm:space-y-8 items-end w-full">
              {siteNavItems.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNavigate(item.href)}
                  className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight leading-tight hover:text-[#c84b15] hover:-translate-x-2 transition-all duration-200 cursor-pointer text-right"
                >
                  {item.label}
                </button>
              ))}

              {/* 로그인 / 사용자 상태 (네모 박스 형태 - 우측 정렬) */}
              <div className="pt-4 flex justify-end w-full">
                {user ? (
                  <div className="flex flex-col items-end gap-4">
                    <button
                      type="button"
                      onClick={() => handleNavigate('/mypage')}
                      className="px-5 py-2.5 border-2 border-black text-base font-bold text-black hover:bg-black hover:text-white transition-all cursor-pointer text-right"
                    >
                      마이페이지 ({user.name})
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="text-sm font-semibold text-neutral-500 hover:text-black cursor-pointer text-right"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleNavigate('/login')}
                    className="px-6 py-2.5 border-2 border-black text-base font-bold text-black hover:bg-black hover:text-white transition-all cursor-pointer text-center"
                  >
                    로그인
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* 서브페이지에서는 fixed 헤더 + 최상단 띠 배너 높이만큼 스페이서 제공 */}
      {!isMain && <div className="h-[61px] sm:h-[71px] w-full shrink-0" />}
    </>
  )
}
