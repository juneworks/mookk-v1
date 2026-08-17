'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { sampleProjects, getProjectNumber } from '@/data/projectsData'

function getDaysRemaining(deadlineStr: string, status: string) {
  if (status === 'succeeded' || status === 'failed') return '펀딩종료'
  if (status === 'upcoming') return '펀딩예정'
  const deadline = new Date(deadlineStr)
  const today = new Date()
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? `D-${diffDays}` : '펀딩종료'
}

function formatDescriptionBy15Chars(text: string): string {
  if (!text) return ''
  const lines = text.split('\n')
  const formattedLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.length <= 16) {
      formattedLines.push(trimmed)
      continue
    }

    let current = ''
    const words = trimmed.split(' ')

    for (const word of words) {
      if ((current + (current ? ' ' : '') + word).length <= 16) {
        current += (current ? ' ' : '') + word
      } else {
        if (current) formattedLines.push(current)
        current = word
      }
    }
    if (current) formattedLines.push(current)
  }

  return formattedLines.join('\n')
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

  // 1. 펀딩 상황 분류: 'all' | 'live' | 'succeeded' | 'upcoming'
  const [activeStatus, setActiveStatus] = useState<'all' | 'live' | 'succeeded' | 'upcoming'>('all')

  // 2. 도서 카테고리 필터
  const [activeBookCategory, setActiveBookCategory] = useState<string>('all')

  // 드롭다운 열림 상태
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false)
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
    // 펀딩 상황 분류 필터링
    if (activeStatus !== 'all') {
      if (activeStatus === 'live' && p.status !== 'live') return false
      if (activeStatus === 'succeeded' && (p.status !== 'succeeded' && p.status !== 'failed')) return false
      if (activeStatus === 'upcoming' && p.status !== 'upcoming') return false
    }

    // 도서 분류 장르 필터링
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
    // 펀딩 진행(live) 중이면서 디데이가 가장 임박한 것 위주로 상단 배열
    if (a.status === 'live' && b.status !== 'live') return -1
    if (a.status !== 'live' && b.status === 'live') return 1
    if (a.status === 'live' && b.status === 'live') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    }
    return 0
  })

  // 펀딩상태 라벨
  const getStatusLabel = () => {
    switch (activeStatus) {
      case 'live':
        return '펀딩진행'
      case 'succeeded':
        return '펀딩종료'
      case 'upcoming':
        return '펀딩예정'
      default:
        return '펀딩상태'
    }
  }

  return (
    <div className="w-full bg-white text-[#1C4025] min-h-screen">
      {/* 1. 상단 스크롤 고정 (Sticky) 필터 바: 전체 8, 펀딩상태 ▾, 카테고리 ▾ (구분선 삭제 및 폰트 80% 축소) */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md py-4 transition-all">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 sm:gap-8">

            {/* 전체 개수 버튼 */}
            <button
              onClick={() => {
                setActiveStatus('all')
                setActiveBookCategory('all')
              }}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-black tracking-tight text-black hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span>전체</span>
              <span className="text-[#c84b15] font-black">{totalProjectsCount}</span>
            </button>

            {/* 펀딩상태 드롭다운 */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => {
                  setIsStatusOpen(!isStatusOpen)
                  setIsCategoryOpen(false)
                }}
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-black tracking-tight transition-colors cursor-pointer ${activeStatus !== 'all' ? 'text-[#c84b15]' : 'text-black hover:text-black/70'
                  }`}
              >
                <span>{getStatusLabel()}</span>
                <span className="text-[10px] sm:text-xs transition-transform duration-200">
                  {isStatusOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* 펀딩상태 드롭다운 메뉴 */}
              {isStatusOpen && (
                <div className="absolute left-0 mt-3 w-48 rounded-xl bg-white shadow-xl border border-neutral-200/80 py-2 z-50 animate-in fade-in-0 zoom-in-95">
                  <button
                    onClick={() => {
                      setActiveStatus('all')
                      setIsStatusOpen(false)
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${activeStatus === 'all'
                        ? 'font-black text-black bg-neutral-50'
                        : 'font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-black'
                      }`}
                  >
                    <span>전체보기</span>
                    <span className="text-[#c84b15] font-black text-xs">{totalProjectsCount}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveStatus('live')
                      setIsStatusOpen(false)
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${activeStatus === 'live'
                        ? 'font-black text-black bg-neutral-50'
                        : 'font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-black'
                      }`}
                  >
                    <span>펀딩진행</span>
                    <span className="text-[#c84b15] font-black text-xs">{liveCount}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveStatus('succeeded')
                      setIsStatusOpen(false)
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${activeStatus === 'succeeded'
                        ? 'font-black text-black bg-neutral-50'
                        : 'font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-black'
                      }`}
                  >
                    <span>펀딩종료</span>
                    <span className="text-[#c84b15] font-black text-xs">{endedCount}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveStatus('upcoming')
                      setIsStatusOpen(false)
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${activeStatus === 'upcoming'
                        ? 'font-black text-black bg-neutral-50'
                        : 'font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-black'
                      }`}
                  >
                    <span>펀딩예정</span>
                    <span className="text-[#c84b15] font-black text-xs">{upcomingCount}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 카테고리 드롭다운 */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() => {
                  setIsCategoryOpen(!isCategoryOpen)
                  setIsStatusOpen(false)
                }}
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-black tracking-tight transition-colors cursor-pointer ${activeBookCategory !== 'all' ? 'text-[#c84b15]' : 'text-black hover:text-black/70'
                  }`}
              >
                <span>{activeBookCategory === 'all' ? '카테고리' : activeBookCategory}</span>
                <span className="text-[10px] sm:text-xs transition-transform duration-200">
                  {isCategoryOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* 카테고리 드롭다운 메뉴 */}
              {isCategoryOpen && (
                <div className="absolute left-0 mt-3 w-56 rounded-xl bg-white shadow-xl border border-neutral-200/80 py-2 z-50 animate-in fade-in-0 zoom-in-95">
                  <button
                    onClick={() => {
                      setActiveBookCategory('all')
                      setIsCategoryOpen(false)
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${activeBookCategory === 'all'
                        ? 'font-black text-black bg-neutral-50'
                        : 'font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-black'
                      }`}
                  >
                    <span>전체보기</span>
                    <span className="text-[#c84b15] font-black text-xs">{totalProjectsCount}</span>
                  </button>
                  {BOOK_GENRE_CATEGORIES.map((cat) => {
                    const isSelected = activeBookCategory === cat.id
                    const count = getCategoryCount(cat.id)
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveBookCategory(cat.id)
                          setIsCategoryOpen(false)
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${isSelected
                            ? 'font-black text-black bg-neutral-50'
                            : 'font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-black'
                          }`}
                      >
                        <span>{cat.label}</span>
                        <span className="text-[#c84b15] font-black text-xs">{count}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 2. 프로젝트 리스트 영역: 2단(2열) 가로형 직사각형 카드 레이아웃 */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-28">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-24 bg-[#F2EEE9] rounded-2xl space-y-4">
            <p className="text-base font-bold text-neutral-600">선택한 분류에 해당되는 프로젝트가 없습니다.</p>
            <button
              onClick={() => {
                setActiveStatus('all')
                setActiveBookCategory('all')
              }}
              className="px-6 py-2.5 rounded-full bg-[#1C4025] text-white text-xs font-bold hover:bg-[#1C4025]/90 transition-colors"
            >
              전체 프로젝트 보기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {filteredProjects.map((project) => {
              const percent = project.goal_amount > 0
                ? Math.round((project.current_amount / project.goal_amount) * 100)
                : 0

              const daysRemaining = getDaysRemaining(project.deadline, project.status)
              const formattedDescription = formatDescriptionBy15Chars(project.description)

              return (
                <Link
                  key={project.id}
                  href={`/funding/${getProjectNumber(project.id)}`}
                  className="block group"
                >
                  <div className="relative bg-[#F0EEE9] pt-2 sm:pt-2.5 px-4 sm:px-6 pb-0 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 min-h-[300px] sm:min-h-[330px] overflow-hidden">

                    {/* 1. 카테고리 사각 뱃지: 영역 오른쪽, 위 끝에 100% 밀착 (top-0 right-0) */}
                    <div className="absolute top-0 right-0 z-10">
                      <span className="inline-block bg-[#1C4025] text-white text-xs sm:text-sm font-bold px-4 py-1.5 tracking-tight">
                        {project.category || '도서'}
                      </span>
                    </div>

                    {/* 2. 상단 좌측: 펀딩상태와 펀딩률 (상단 끝 여백을 2/3로 줄이고 가운뎃점 포함) */}
                    <div className="flex items-center text-[#c84b15] font-extrabold text-base sm:text-lg tracking-tight mb-1">
                      <span>{daysRemaining}</span>
                      <span className="mx-1.5">•</span>
                      <span>{percent}%</span>
                    </div>

                    {/* 3. 본문 영역: 좌측 책 표지(absolute bottom-0으로 바닥선 0px 완전 밀착, 10px 오른쪽 이동) + 우측 텍스트 */}
                    <div className="relative flex-1 w-full flex items-center justify-end min-h-[220px] sm:min-h-[250px] mt-auto">
                      {/* 좌측: 도서 표지 이미지 (카드 하단 끝 bottom-0에 100% 완전 밀착 & 10px 오른쪽 이동) */}
                      <div className="absolute bottom-0 left-2 sm:left-5 translate-x-[10px] z-0 flex items-end">
                        <img 
                          src={project.cover_image_url} 
                          alt={project.title} 
                          className="h-[198px] sm:h-[242px] w-auto object-contain block align-bottom m-0 p-0 drop-shadow-[0_10px_18px_rgba(0,0,0,0.22)] transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>

                      {/* 우측: 도서 제목 및 설명 (가운데 정렬 & 15글자 초과 시 줄바꿈) */}
                      <div className="w-1/2 sm:w-7/12 ml-auto flex flex-col justify-center items-center text-center self-center px-2 py-4 z-10">
                        <h3 className="text-xl sm:text-2xl font-black text-[#1C4025] tracking-tight leading-snug mb-3 group-hover:text-[#c84b15] transition-colors text-center">
                          {project.title}
                        </h3>
                        <p className="text-xs sm:text-sm font-medium text-[#1C4025]/90 leading-relaxed whitespace-pre-line text-center font-sans max-w-[280px]">
                          {formattedDescription}
                        </p>
                      </div>
                    </div>

                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-[#1C4025]">로딩 중...</div>}>
      <ProjectsContent />
    </Suspense>
  )
}

