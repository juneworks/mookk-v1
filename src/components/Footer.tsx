'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Footer() {
  const [isBusinessInfoOpen, setIsBusinessInfoOpen] = useState(false)

  return (
    <footer className="w-full bg-[#1C4025] py-16 mt-auto text-xs text-white/70 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* 푸터 메뉴 섹션 ('프로젝트' 및 '알립니다' 5가지 하위 메뉴) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 max-w-3xl">
          
          {/* 1. 프로젝트 */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs tracking-wider uppercase border-b border-white/15 pb-2">
              프로젝트
            </h4>
            <ul className="space-y-2.5 font-normal text-white/60">
              <li>
                <Link href="/projects#total-projects" className="hover:text-white transition-colors">
                  프로젝트 전체 보기
                </Link>
              </li>
            </ul>
          </div>

          {/* 2. 알립니다 하위 5가지 메뉴 */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs tracking-wider uppercase border-b border-white/15 pb-2">
              알립니다
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-light text-white/60">
              <li>
                <Link href="/notice" className="hover:text-white transition-colors">
                  공지 및 안내
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-white transition-colors">
                  창작가 가이드
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  약관 및 정책
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  개인정보 처리방침
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  MOOKK 소개
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* 푸터 하단 타이틀, 아코디언 및 카피라이트 정보 */}
        <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
          
          {/* 타이틀 */}
          <div className="font-semibold text-white uppercase tracking-normal text-sm leading-none">
            MOOKK
          </div>
          
          {/* 아코디언 토글 헤더 */}
          <div className="flex items-center leading-none">
            <button 
              onClick={() => setIsBusinessInfoOpen(!isBusinessInfoOpen)}
              className="flex items-center gap-1.5 text-[11px] text-white/60 hover:text-white font-medium transition-colors focus:outline-none leading-none"
            >
              <span>사업자 정보</span>
              <span className={`inline-block text-[8px] transform transition-transform duration-200 font-bold ${
                isBusinessInfoOpen ? 'rotate-180' : ''
              }`}>
                ▼
              </span>
            </button>
          </div>

          {/* 아코디언 컨텐츠 */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isBusinessInfoOpen ? 'max-h-[150px] opacity-100 my-1' : 'max-h-0 opacity-0 pointer-events-none'
          }`}>
            <div className="space-y-1 text-[11px] text-white/50 font-light leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
              <p>현재 MOOKK 서비스는 베타 버전으로 운영 중입니다.</p>
              <p>문의 : mookk.contact@gmail.com</p>
            </div>
          </div>

          {/* 카피라이트 */}
          <div className="text-[10px] text-white/40 font-light leading-none">
            Copyright 2026. MOOKK. All rights reserved.
          </div>

        </div>

      </div>
    </footer>
  )
}
