'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { sampleProjects } from '@/data/projectsData'

function getDaysRemaining(deadlineStr: string, status: string) {
  if (status === 'succeeded' || status === 'failed') return '펀딩종료'
  if (status === 'upcoming') return '펀딩예정'
  const deadline = new Date(deadlineStr)
  const today = new Date()
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? `D-${diffDays}` : '펀딩종료'
}

function getStatusText(status: string) {
  switch (status) {
    case 'upcoming':
      return '펀딩예정'
    case 'live':
      return '펀딩진행'
    case 'succeeded':
    case 'failed':
      return '펀딩종료'
    default:
      return '펀딩진행'
  }
}

// 확정된 6가지 도서 분류 카테고리 리스트
const BOOK_GENRE_CATEGORIES = [
  { id: '문학', label: '문학' },
  { id: '에세이', label: '에세이' },
  { id: '인문/교양', label: '인문/교양' },
  { id: '잡지/아트북', label: '잡지/아트북' },
  { id: '만화/그림', label: '만화/그림' },
  { id: '실용/취미/기타', label: '실용/취미/기타' }
]

function ProjectsContent() {
  const searchParams = useSearchParams()
  const searchKeyword = searchParams.get('search') || ''
  
  // 1. 펀딩 상황 분류 소메뉴: 'live'(펀딩진행) | 'succeeded'(펀딩종료) | 'upcoming'(펀딩예정) | 'all'
  const [activeStatus, setActiveStatus] = useState<'live' | 'succeeded' | 'upcoming' | 'all'>('all')
  
  // 2. 좌측 통합 도서 분류 장르 필터
  const [activeBookCategory, setActiveBookCategory] = useState<string>('all')

  // 수량 계산
  const totalProjectsCount = sampleProjects.length
  const liveCount = sampleProjects.filter(p => p.status === 'live').length
  const endedCount = sampleProjects.filter(p => p.status === 'succeeded' || p.status === 'failed').length
  const upcomingCount = sampleProjects.filter(p => p.status === 'upcoming').length

  const getCategoryCount = (catId: string) => {
    if (catId === '잡지/아트북' || catId === '매거진/아트북') {
      return sampleProjects.filter(p => p.category === '잡지/아트북' || p.category === '매거진/아트북').length
    }
    return sampleProjects.filter(p => p.category === catId).length
  }

  const filteredProjects = sampleProjects.filter(p => {
    // 펀딩 상황 분류 필터링 (activeStatus가 'all'일 경우 펀딩상황 필터링 생략)
    if (activeStatus !== 'all') {
      if (activeStatus === 'live' && p.status !== 'live') return false
      if (activeStatus === 'succeeded' && (p.status !== 'succeeded' && p.status !== 'failed')) return false
      if (activeStatus === 'upcoming' && p.status !== 'upcoming') return false
    }

    // 확정 도서 분류 장르 필터링
    if (activeBookCategory !== 'all') {
      if (activeBookCategory === '잡지/아트북' || activeBookCategory === '매거진/아트북') {
        if (p.category !== '잡지/아트북' && p.category !== '매거진/아트북') return false
      } else if (p.category !== activeBookCategory) {
        return false
      }
    }

    // 상단 검색어 키워드 필터링
    if (searchKeyword.trim()) {
      const q = searchKeyword.trim().toLowerCase()
      const matchTitle = p.title.toLowerCase().includes(q)
      const matchCategory = p.category.toLowerCase().includes(q)
      const matchCreator = p.creator_name.toLowerCase().includes(q)
      const matchDesc = p.description.toLowerCase().includes(q)
      return matchTitle || matchCategory || matchCreator || matchDesc
    }
    return true
  }).sort((a, b) => {
    // [항상 적용할 규칙] 펀딩 진행(live) 중이면서 디데이가 가장 임박한 것(deadline 오름차순) 위주로 상단 배열
    if (a.status === 'live' && b.status !== 'live') return -1
    if (a.status !== 'live' && b.status === 'live') return 1
    if (a.status === 'live' && b.status === 'live') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    }
    return 0
  })

  return (
    <div className="w-full bg-white text-[#1C4025]">
      {/* 20px 높이 여백 공간 */}
      <div className="w-full h-[20px] shrink-0" />

      {/* 메인 영역: 좌측 스티키 소메뉴 + 우측 2단 프로젝트 카탈로그 */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
          
          {/* 1. PC 및 모바일 스크롤 고정 소메뉴 영역 (업로드 이미지와 100% 동일 구조) */}
          <aside className="w-full md:w-64 shrink-0 sticky top-16 md:top-24 z-30 bg-white/95 backdrop-blur-md py-4 border-b md:border-b-0 border-neutral-100/80">
            
            {/* 1-1. 맨 위: 총 프로젝트 10 (클릭 시 전체 프로젝트 노출) */}
            <div id="total-projects" className="mb-6 sm:mb-8 scroll-mt-24">
              <button
                onClick={() => {
                  setActiveStatus('all')
                  setActiveBookCategory('all')
                }}
                className={`text-xl sm:text-[26px] tracking-tight font-extrabold transition-all duration-200 text-left flex items-center gap-1.5 cursor-pointer ${
                  activeStatus === 'all' && activeBookCategory === 'all'
                    ? 'text-black opacity-100 font-black'
                    : 'text-neutral-400 opacity-60 hover:opacity-100 hover:text-black font-extrabold'
                }`}
                title="클릭 시 전체 10개 프로젝트 보기"
              >
                <span>총 프로젝트</span>
                <span className="text-[#c84b15] font-black text-[13px] sm:text-[17px]">{totalProjectsCount}</span>
              </button>
            </div>

            {/* 모바일/PC 소메뉴 수직 및 반응형 구획 */}
            <div className="flex flex-col gap-6 sm:gap-8 items-start w-full">
              
              {/* 1-2. 펀딩 상황 분류 (펀딩진행 4, 펀딩종료 2, 펀딩예정 4) */}
              <div className="flex flex-col gap-2.5 items-start w-full">
                <button
                  onClick={() => setActiveStatus('live')}
                  className={`text-lg sm:text-[20px] tracking-tight text-left transition-all duration-200 flex items-center gap-1.5 cursor-pointer w-full ${
                    activeStatus === 'live'
                      ? 'text-black font-black opacity-100'
                      : 'text-neutral-400 font-black opacity-60 hover:opacity-100 hover:text-black'
                  }`}
                >
                  <span>펀딩진행</span>
                  <span className="text-[#c84b15] font-black text-xs sm:text-[13px]">{liveCount}</span>
                </button>

                <button
                  onClick={() => setActiveStatus('succeeded')}
                  className={`text-lg sm:text-[20px] tracking-tight text-left transition-all duration-200 flex items-center gap-1.5 cursor-pointer w-full ${
                    activeStatus === 'succeeded'
                      ? 'text-black font-black opacity-100'
                      : 'text-neutral-400 font-black opacity-60 hover:opacity-100 hover:text-black'
                  }`}
                >
                  <span>펀딩종료</span>
                  <span className="text-[#c84b15] font-black text-xs sm:text-[13px]">{endedCount}</span>
                </button>

                <button
                  onClick={() => setActiveStatus('upcoming')}
                  className={`text-lg sm:text-[20px] tracking-tight text-left transition-all duration-200 flex items-center gap-1.5 cursor-pointer w-full ${
                    activeStatus === 'upcoming'
                      ? 'text-black font-black opacity-100'
                      : 'text-neutral-400 font-black opacity-60 hover:opacity-100 hover:text-black'
                  }`}
                >
                  <span>펀딩예정</span>
                  <span className="text-[#c84b15] font-black text-xs sm:text-[13px]">{upcomingCount}</span>
                </button>
              </div>

              {/* 1-3. 도서 장르 분류 (문학, 에세이, 인문/교양, 잡지/아트북, 만화/그림, 실용/취미/기타) */}
              <div className="flex flex-col gap-2.5 items-start w-full pt-2">
                {BOOK_GENRE_CATEGORIES.map((cat) => {
                  const isSelected = activeBookCategory === cat.id
                  const count = getCategoryCount(cat.id)

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveBookCategory(isSelected ? 'all' : cat.id)}
                      className={`text-lg sm:text-[20px] tracking-tight text-left transition-all duration-200 flex items-center gap-1.5 cursor-pointer w-full ${
                        isSelected 
                          ? 'text-black font-black opacity-100' 
                          : 'text-neutral-400 font-black opacity-60 hover:opacity-100 hover:text-black'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className="text-[#c84b15] font-black text-xs sm:text-[13px]">{count}</span>
                    </button>
                  )
                })}
              </div>

            </div>

          </aside>

          {/* 2. 우측 프로젝트 카탈로그 (2단 직사각형 그리드) */}
          <div className="flex-1 w-full space-y-6">
            
            {/* 2단 직사각형 프로젝트 카드 목록 */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-20 bg-[#F0EEE9] rounded-2xl space-y-4">
                <p className="text-base font-medium text-neutral-600">선택한 분류에 해당되는 프로젝트가 없습니다.</p>
                <button 
                  onClick={() => {
                    setActiveStatus('all')
                    setActiveBookCategory('all')
                  }}
                  className="px-5 py-2 rounded-full bg-[#1C4025] text-white text-xs font-bold"
                >
                  전체 펀딩진행 목록 보기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {filteredProjects.map((project) => {
                  const percent = project.goal_amount > 0 
                    ? Math.round((project.current_amount / project.goal_amount) * 100)
                    : 0

                  return (
                    <Link 
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block group"
                    >
                      <div className="bg-[#F0EEE9] rounded-none pt-[5px] px-[5px] pb-0 flex flex-col justify-between items-center text-center overflow-hidden border border-black/5 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 min-h-[380px] sm:min-h-[420px] cursor-pointer">
                        
                        {/* 1열: 상단 5px 여백 헤더 (왼쪽: D-Day / 펀딩예정 / 펀딩종료, 오른쪽: 달성률%) */}
                        <div className="flex items-start justify-between w-full mb-2 text-[#c84b15] font-extrabold text-xl sm:text-2xl leading-none">
                          {/* 왼쪽: D-Day / 펀딩예정 / 펀딩종료 */}
                          <span className="tracking-tight">
                            {getDaysRemaining(project.deadline, project.status)}
                          </span>

                          {/* 오른쪽: 달성률 % */}
                          <span className="tracking-tight">
                            {percent}%
                          </span>
                        </div>

                        {/* 2열: 도서 카테고리 알약 뱃지 */}
                        <div className="mt-1 mb-1.5">
                          <span className="inline-block bg-[#c84b15] text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                            {project.category || '도서'}
                          </span>
                        </div>

                        {/* 3열: 메인 도서 타이틀 (현재 크기의 1.4배 확대) */}
                        <h3 className="text-[25px] sm:text-[28px] font-extrabold text-[#1C4025] tracking-tight group-hover:text-[#c84b15] transition-colors px-3 line-clamp-1 mb-1.5">
                          {project.title}
                        </h3>

                        {/* 4열: 도서 설명 */}
                        <div className="px-4 mb-3 max-w-sm">
                          <p className="text-xs sm:text-sm font-medium text-[#1C4025] leading-relaxed font-eulyoo whitespace-pre-line">
                            {project.description}
                          </p>
                        </div>

                        {/* 5열: 하단 입체 책 표지 이미지 (그림자 효과 + 바닥 1px 밀착) */}
                        <div className="w-full flex justify-center items-end mt-auto mb-[1px]">
                          <div className="relative shadow-[0_12px_24px_rgba(0,0,0,0.22)] transition-transform duration-300 group-hover:scale-[1.03]">
                            <img 
                              src={project.cover_image_url} 
                              alt={project.title} 
                              className="h-[180px] sm:h-[210px] w-auto object-contain block"
                            />
                          </div>
                        </div>

                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">로딩 중...</div>}>
      <ProjectsContent />
    </Suspense>
  )
}
