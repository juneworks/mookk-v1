'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sampleProjects, getProjectNumber } from '@/data/projectsData'

export default function Home() {
  // 실시간 펀딩 진행 중인 프로젝트 (4개)
  const liveProjects = sampleProjects.filter(p => p.status === 'live')
  const [activeIndex, setActiveIndex] = useState(0)

  const activeProject = liveProjects[activeIndex] || liveProjects[0]

  return (
    <div className="w-full bg-[#F0EEE9] text-[#1C4025] overflow-hidden">
      {/* 
        A24-Style Fluid Responsive Hero Section (풀 와이드 배경 이미지 & 헤더 일체형)
        - 헤더까지 꽉 차는 풀 백그라운드 이미지 (프로젝트별 001~004 매칭)
        - 10% 어두운 오버레이 처리로 텍스트 및 책 오브젝트 가독성 극대화
        - 브라우저 너비에 따라 3열의 상대적 위치, 텍스트 크기, 이미지 높이가 비례 축소/확대
      */}
      <section className="relative w-full min-h-[clamp(520px,58vw,770px)] flex items-end justify-center pt-24 sm:pt-28 pb-0 px-[clamp(1rem,4vw,4rem)] overflow-hidden">
        {/* 1. 풀 와이드 배경 이미지 레이어 (001~004 매칭 & 부드러운 크로스페이드) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {liveProjects.map((project, index) => (
            <div
              key={project.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
              <img
                src={project.hero_bg_image_url || '/images/hero/hero-loveletter.jpg'}
                alt={project.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>

        {/* 2. 전면 3열 인터랙티브 컨텐츠 (A24 Fluid Scaling) */}
        <div className="relative z-20 mx-auto max-w-[1440px] w-full grid grid-cols-12 gap-[clamp(0.75rem,2.5vw,3rem)] items-end">

          {/* 1열 (좌측 - 4 cols): 펀딩중 프로젝트 제목 목록 (맨 위 제목 위치 기준 고정 & 타이틀 간격 2/3 축소) */}
          <div className="col-span-12 md:col-span-4 flex flex-col space-y-[clamp(0.33rem,0.7vw,0.8rem)] items-start justify-end pb-[clamp(2.5rem,5.65vw,5rem)]">
            {liveProjects.map((project, index) => {
              const isActive = index === activeIndex
              return (
                <div
                  key={project.id}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`font-black tracking-tight leading-[1.15] transition-all duration-200 cursor-default drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] ${isActive
                      ? 'text-white translate-x-1.5'
                      : 'text-[#9e9e9e] hover:text-white hover:translate-x-1.5'
                    }`}
                  style={{
                    fontSize: 'clamp(1.6rem, 3.1vw, 2.8rem)',
                  }}
                >
                  {project.title}
                </div>
              )
            })}
          </div>

          {/* 2열 (중앙 - 4 cols): 책 커버이미지 하단 밀착 및 히어로 배경 대비 2/3(66.7%) 높이 차지 */}
          <div className="col-span-12 md:col-span-4 flex justify-center items-end self-end">
            <Link
              href={`/funding/${getProjectNumber(activeProject?.id)}`}
              className="block group cursor-pointer relative"
            >
              <img
                key={activeProject?.id}
                src={activeProject?.cover_image_url}
                alt={activeProject?.title}
                className="w-auto object-contain block filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.35)] transition-all duration-300 group-hover:scale-[1.03] group-hover:drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200"
                style={{
                  height: 'clamp(385px, 43.3vw, 560px)',
                  maxHeight: 'min(66.7vh, 560px)',
                }}
              />
            </Link>
          </div>

          {/* 3열 (우측 - 4 cols): 설명과 화살표가 있는 흰 배경 박스 링크 (모바일 시 상단 여백 mt-8 추가로 겹침 방지) */}
          <div className="col-span-12 md:col-span-4 flex flex-col items-center md:items-start justify-center self-center mt-8 sm:mt-10 md:mt-0 pb-10 md:pb-[clamp(2rem,5vw,4.5rem)] relative z-10">
            <Link
              href={`/funding/${getProjectNumber(activeProject?.id)}`}
              className="group block bg-white p-[clamp(1.25rem,2vw,1.75rem)] w-full max-w-[390px] transition-all duration-300 hover:scale-[1.03] cursor-pointer"
            >
              <div className="flex items-center justify-between gap-4">
                <p
                  className="font-extrabold text-[#111111] leading-[1.5] text-left font-sans break-keep animate-in fade-in duration-200"
                  style={{
                    fontSize: 'clamp(0.95rem, 1.22vw, 1.15rem)',
                    wordBreak: 'keep-all',
                  }}
                >
                  {activeProject?.description}
                </p>
                <svg
                  className="w-6 h-6 flex-shrink-0 text-black transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth="2.2"
                    d="M4 12h15m-5-5l5 5-5 5"
                  />
                </svg>
              </div>
            </Link>
          </div>

        </div>
      </section>

      {/* 
        2단: '소개' 섹션 (about MOOKK)
        - 좌측: 딥그린 mookk 정사각 아트워크 이미지
        - 우측: "묶을 소개합니다" 헤드라인(#1c4025) 및 about MOOKK 이어진 화살표 링크
      */}
      <section className="w-full bg-white py-[clamp(3.5rem,8vw,7.5rem)] px-[clamp(1.5rem,5vw,5rem)] border-t border-neutral-200/60">
        <div className="mx-auto max-w-[1440px] w-full">
          <Link
            href="/about"
            className="group grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-center cursor-pointer"
          >
            {/* 좌측: 딥그린 mookk 아트워크 이미지 */}
            <div className="md:col-span-6 lg:col-span-5 flex justify-start items-center">
              <div className="w-full max-w-[460px] aspect-square overflow-hidden bg-[#1C4025] shadow-xs group-hover:shadow-xl transition-all duration-300">
                <img
                  src="/images/about-mookk.png"
                  alt="about MOOKK"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
            </div>

            {/* 우측: 텍스트 및 링크 인디케이터 */}
            <div className="md:col-span-6 lg:col-span-7 flex flex-col items-start justify-center space-y-[clamp(1.5rem,3.5vw,3.5rem)] md:pl-4 lg:pl-10">
              <h2
                className="font-black text-[#1C4025] tracking-tight leading-[1.2] group-hover:text-[#c84b15] transition-colors"
                style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 3.25rem)',
                }}
              >
                묶을 소개합니다
              </h2>

              {/* about MOOKK 링크 인디케이터 (이어진 화살표 애니메이션) */}
              <div className="inline-flex flex-col items-start gap-1.5">
                <span className="text-sm sm:text-base lg:text-lg font-bold text-[#1C4025] group-hover:text-[#c84b15] transition-colors">
                  about MOOKK
                </span>
                <div className="flex items-center w-36 sm:w-44 lg:w-48 group-hover:translate-x-2 transition-transform duration-300">
                  <svg
                    className="w-full h-4 sm:h-5 text-[#1C4025] group-hover:text-[#c84b15] transition-colors"
                    viewBox="0 0 160 16"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <line x1="0" y1="8" x2="154" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                    <polyline points="146,3 154,8 146,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 
        3단: '스튜디오' 섹션 (studio MOOKK)
        - 좌측: "책과 스토리를 함께 만듭니다" 헤드라인(#1c4025) 및 studio MOOKK 이어진 화살표 링크
        - 우측: 화이트 스튜디오 작업실 이미지
      */}
      <section className="w-full bg-white py-[clamp(3.5rem,8vw,7.5rem)] px-[clamp(1.5rem,5vw,5rem)]">
        <div className="mx-auto max-w-[1440px] w-full">
          <Link
            href="/studio"
            className="group grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-center cursor-pointer"
          >
            {/* 좌측: 텍스트 및 링크 인디케이터 */}
            <div className="order-2 md:order-1 md:col-span-6 lg:col-span-5 flex flex-col items-start justify-center space-y-[clamp(1.5rem,3.5vw,3.5rem)]">
              <h2
                className="font-black text-[#1C4025] tracking-tight leading-[1.25] whitespace-pre-line group-hover:text-[#c84b15] transition-colors"
                style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 3.25rem)',
                }}
              >
                {`책과 스토리를\n함께 만듭니다`}
              </h2>

              {/* studio MOOKK 링크 인디케이터 (이어진 화살표 애니메이션) */}
              <div className="inline-flex flex-col items-start gap-1.5">
                <span className="text-sm sm:text-base lg:text-lg font-bold text-[#1C4025] group-hover:text-[#c84b15] transition-colors">
                  studio MOOKK
                </span>
                <div className="flex items-center w-36 sm:w-44 lg:w-48 group-hover:translate-x-2 transition-transform duration-300">
                  <svg
                    className="w-full h-4 sm:h-5 text-[#1C4025] group-hover:text-[#c84b15] transition-colors"
                    viewBox="0 0 160 16"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <line x1="0" y1="8" x2="154" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                    <polyline points="146,3 154,8 146,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 우측: 스튜디오 작업실 이미지 */}
            <div className="order-1 md:order-2 md:col-span-6 lg:col-span-7 flex justify-end items-center">
              <div className="w-full max-w-[620px] aspect-[16/10] overflow-hidden bg-neutral-100 shadow-xs group-hover:shadow-xl transition-all duration-300">
                <img
                  src="/images/studio-mookk.png"
                  alt="studio MOOKK"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
