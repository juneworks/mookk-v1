'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-[#1C4025] text-white/70">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-12 lg:px-16 py-10 sm:py-14">
        
        {/* 1. 상단: 중앙 정렬 MOOKK 로고 (사이트 제목과 동일한 tracking-tight 자간 적용) */}
        <div className="text-center pb-6 sm:pb-8">
          <Link
            href="/"
            className="inline-block text-xl sm:text-2xl font-extrabold tracking-tight text-white/70 hover:text-white active:text-white transition-colors"
          >
            MOOKK
          </Link>
        </div>

        {/* 2. 중간 메뉴 영역 (상/하단 얇은 가로선, 4개 열 균등 배치) */}
        <div className="border-t border-b border-white/20 py-8 sm:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            
            {/* 1열: MOOKK 소개, MOOKK 펀딩, MOOKK 컨텐츠 */}
            <div className="space-y-3">
              <div>
                <Link href="/about" className="text-sm sm:text-[15px] font-bold text-white/70 hover:text-white active:text-white transition-colors block">
                  MOOKK 소개
                </Link>
              </div>
              <div>
                <Link href="/funding" className="text-sm sm:text-[15px] font-bold text-white/70 hover:text-white active:text-white transition-colors block">
                  MOOKK 펀딩
                </Link>
              </div>
              <div>
                <Link href="/contents" className="text-sm sm:text-[15px] font-bold text-white/70 hover:text-white active:text-white transition-colors block">
                  MOOKK 컨텐츠
                </Link>
              </div>
            </div>

            {/* 2열: 공지 및 안내, 창작자 가이드 */}
            <div className="space-y-3">
              <div>
                <Link href="/board" className="text-sm sm:text-[15px] font-bold text-white/70 hover:text-white active:text-white transition-colors block">
                  공지 및 안내
                </Link>
              </div>
              <div>
                <Link href="/guide" className="text-sm sm:text-[15px] font-bold text-white/70 hover:text-white active:text-white transition-colors block">
                  창작자 가이드
                </Link>
              </div>
            </div>

            {/* 3열: 약관 및 정책, 개인정보 처리방침 */}
            <div className="space-y-3">
              <div>
                <Link href="/terms" className="text-sm sm:text-[15px] font-bold text-white/70 hover:text-white active:text-white transition-colors block">
                  약관 및 정책
                </Link>
              </div>
              <div>
                <Link href="/privacy" className="text-sm sm:text-[15px] font-bold text-white/70 hover:text-white active:text-white transition-colors block">
                  개인정보 처리방침
                </Link>
              </div>
            </div>

            {/* 4열: 연락 및 문의, 공식 인스타그램, 공식 유튜브 */}
            <div className="space-y-3">
              <div>
                <a href="mailto:mookk.contact@gmail.com" className="text-sm sm:text-[15px] font-bold text-white/70 hover:text-white active:text-white transition-colors block">
                  연락 및 문의
                </a>
              </div>
              <div>
                <a
                  href="https://www.instagram.com/mookk.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-[15px] font-bold text-white/70 hover:text-white active:text-white transition-colors block"
                >
                  공식 인스타그램
                </a>
              </div>
              <div>
                <a
                  href="https://www.youtube.com/@mookk.youtube"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-[15px] font-bold text-white/70 hover:text-white active:text-white transition-colors block"
                >
                  공식 유튜브
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* 3. 하단 영역: 좌측 서비스/카피라이트 정보 & 우측 대형 MOOKK 묶 로고 */}
        <div className="pt-8 sm:pt-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          {/* 좌측 정보 (기본 색 text-white/70, 이메일 호버 시 흰색) */}
          <div className="space-y-1.5 text-xs sm:text-[13px] text-white/70 font-bold leading-relaxed">
            <p>현재 MOOKK 서비스는 베타 버전으로 운영 중입니다.</p>
            <p>
              <a href="mailto:mookk.contact@gmail.com" className="hover:text-white active:text-white transition-colors">
                mookk.contact@gmail.com
              </a>
            </p>
            <p>Copyright 2026. MOOKK. All rights reserved.</p>
          </div>

          {/* 우측 대형 MOOKK 묶 로고 */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 select-none self-end md:self-auto group">
            <span className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-tight text-white/70 group-hover:text-white group-active:text-white transition-colors leading-none">
              MOOKK
            </span>
            <span className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white/70 group-hover:text-white group-active:text-white transition-colors leading-none font-sans">
              묶
            </span>
          </Link>

        </div>

      </div>
    </footer>
  )
}
