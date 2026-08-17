'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface NoticeLayoutProps {
  currentTab: 'notice' | 'guide' | 'terms' | 'privacy'
  children: ReactNode
}

const NOTICE_SUB_MENUS = [
  { id: 'notice', label: '공지 및 안내', href: '/board' },
  { id: 'guide', label: '창작자 가이드', href: '/guide' },
  { id: 'terms', label: '약관 및 정책', href: '/terms' },
  { id: 'privacy', label: '개인정보 처리방침', href: '/privacy' },
] as const

export default function NoticeLayout({ currentTab, children }: NoticeLayoutProps) {
  return (
    <div className="w-full bg-white text-[#1C4025]">
      {/* 20px 상단 여백 */}
      <div className="w-full h-[20px] shrink-0" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
          
          {/* 1. 좌측 스크롤 고정 소메뉴 영역 (프로젝트 소메뉴와 동일 구성) */}
          <aside className="w-full md:w-64 shrink-0 sticky top-16 md:top-24 z-30 bg-white/95 backdrop-blur-md pt-4 pb-4 border-b md:border-b-0 border-neutral-100/80">
            <div className="flex flex-col gap-2.5 items-start w-full">
              {NOTICE_SUB_MENUS.map((menu) => {
                const isActive = currentTab === menu.id

                return (
                  <Link
                    key={menu.id}
                    href={menu.href}
                    className={`text-xl sm:text-[26px] tracking-tight text-left transition-all duration-200 block w-full ${
                      isActive
                        ? 'text-black font-black opacity-100'
                        : 'text-neutral-400 font-extrabold opacity-60 hover:opacity-100 hover:text-black'
                    }`}
                  >
                    {menu.label}
                  </Link>
                )
              })}
            </div>
          </aside>

          {/* 2. 우측 메인 소메뉴 콘텐츠 영역 (백그라운드 컬러 #f0eee9 & 직각 사각 형태 rounded-none & 상단 높이 동일 일치 mt-4) */}
          <div className="flex-1 w-full mt-4">
            <div className="bg-[#F0EEE9] rounded-none p-6 sm:p-10 border border-black/5 shadow-2xs">
              {children}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
