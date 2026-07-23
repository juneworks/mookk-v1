import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import Footer from '@/components/Footer'

// 가상(Mock) 프로젝트 데이터 정의
const mockProjects = [
  {
    id: "mock-1",
    title: "서점원들의 밤: 골목 안 작은 책방이 켜지는 시간",
    description: "골목 모퉁이, 밤이 깊어 갈수록 빛나는 동네 책방들의 숨겨진 이야기와 서점원들의 따뜻한 일상을 담은 에세이집입니다. 독자들에게 위로와 온기를 건네는 서점원들의 조용한 기록입니다.",
    goal_amount: 3000000,
    current_amount: 4200000,
    deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    cover_image_url: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", 
    User: { name: "민음책방 편집부" },
    category: "에세이"
  },
  {
    id: "mock-2",
    title: "한글 타이포그래피의 유산: 활판 인쇄에서 디지털 폰트까지",
    description: "납활자 인쇄 시절부터 현대 디지털 폰트 디자인까지, 한글 자형의 아름다움과 타이포그래피 유산을 정리한 전문 예술 도서. 글자 뒤에 숨은 장인들의 노력을 엿봅니다.",
    goal_amount: 5000000,
    current_amount: 1500000,
    deadline: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString(),
    cover_image_url: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    User: { name: "스튜디오 글자" },
    category: "예술/디자인"
  },
  {
    id: "mock-3",
    title: "단편 소설 선집: 사소한 기억의 묶음",
    description: "독립 출판 씬에서 주목받는 신진 소설가 5인이 그려내는 기억의 조각들. 우리 삶의 가장 사소하고 아름다운 찰나를 문학의 그릇에 묶었습니다. 잔잔한 감동을 선사합니다.",
    goal_amount: 4000000,
    current_amount: 6400000,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    cover_image_url: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
    User: { name: "출판동인 묶음" },
    category: "소설"
  }
]

// 남은 일수 계산 헬퍼 함수
function getDaysRemaining(deadlineStr: string) {
  const deadline = new Date(deadlineStr)
  const today = new Date()
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? `D-${diffDays}` : '마감됨'
}

// 003 모크업 가이드를 오마주한 책 컬러 및 라벨 데이터 매핑 헬퍼 함수
function getBookColorTheme(index: number) {
  const pos = index % 3
  if (pos === 0) {
    return {
      // 003의 01번 레드 계열 책
      cover: 'linear-gradient(135deg, #d13535 0%, #8c1e1e 100%)',
      spine: '#8c1e1e',
      label: 'UNCOATED',
      no: '01'
    }
  } else if (pos === 1) {
    // 003의 02번 블루 계열 책
    return {
      cover: 'linear-gradient(135deg, #3577d1 0%, #1e4d8c 100%)',
      spine: '#1e4d8c',
      label: 'PART 02 - UNCOATED',
      no: '02'
    }
  } else {
    // 003의 03번 그린 계열 책
    return {
      cover: 'linear-gradient(135deg, #2ca664 0%, #1a6b3f 100%)',
      spine: '#1a6b3f',
      label: 'PART 03 - COATED',
      no: '03'
    }
  }
}

export default async function Home() {
  let dbProjects: any[] = []
  let useMock = false

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Project')
      .select('*, User(name)')
      .eq('status', 'live')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      useMock = true
    } else {
      dbProjects = data
    }
  } catch (e) {
    console.error("Database loading failed. Falling back to mock data.", e)
    useMock = true
  }

  const displayProjects = useMock ? mockProjects : dbProjects

  return (
    <div className="flex flex-col min-h-screen bg-background text-[#1C4025]">
      
      {/* 1. Hero Section - Apple MacBook Air 스타일의 대담한 1단 타이포그래피 */}
      <section className="w-full bg-[#edfae0] pt-28 pb-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            종이책을 사랑하는 사람들을<br />
            한데 묶는 공간
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-[#1C4025]/80 leading-relaxed font-light">
            MOOKK은 종이의 책에 탄생한<br />
            오직 종이책만을 위한 크라우드펀딩 출판 플랫폼입니다.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="rounded-full bg-[#1C4025] px-6 py-3 text-sm font-semibold text-[#d6f9b4] hover:bg-[#1C4025]/90 transition-all shadow-sm"
            >
              지금 시작하기
            </Link>
            <Link
              href="/projects/create"
              className="rounded-full border border-[#1C4025]/20 bg-white/40 px-6 py-3 text-sm font-semibold hover:bg-white/70 transition-all"
            >
              내 책 개설하기
            </Link>
          </div>
        </div>
      </section>

      {/* Hero 영역과 첫 프로젝트 사이 10px 흰색 구분선 */}
      <div className="w-full h-[10px] bg-white border-none shrink-0" />

      {/* 2. 프로젝트 1단 배너 목록 (상단 텍스트 중앙 정렬 + 하단 3D 책 목업 이미지 + '더 알아보기') */}
      {displayProjects.map((project, index) => {
        const percent = Math.min(100, Math.round((project.current_amount / project.goal_amount) * 100))
        const realPercent = Math.round((project.current_amount / project.goal_amount) * 100)

        // 3D 책 테마 정보 가져오기
        const theme = getBookColorTheme(index)
        const hasRealCover = project.cover_image_url && !project.cover_image_url.startsWith('linear-gradient')
        const coverBg = hasRealCover ? `url(${project.cover_image_url})` : theme.cover
        const spineBg = theme.spine

        return (
          <div key={project.id} className="w-full flex flex-col">
            <section className="w-full bg-[#F0EEE9] pt-20 pb-16 text-center flex flex-col items-center">
              
              {/* 상단 텍스트 중앙 정렬 영역 */}
              <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6 flex flex-col items-center">
                
                {/* 카테고리, 저자명, D-Day 메타 정보 */}
                <div className="flex items-center gap-2 text-xs font-bold text-[#1C4025]/50">
                  {project.category && (
                    <span className="rounded-full bg-[#c84b15] px-2.5 py-0.5 uppercase tracking-wider text-white text-[10px] font-bold border-none shrink-0">
                      {project.category}
                    </span>
                  )}
                  <span>by {project.User?.name || '창작 작가'}</span>
                  <span>•</span>
                  <span className="text-[#1C4025]/80">{getDaysRemaining(project.deadline)}</span>
                </div>

                {/* 대형 타이틀 */}
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-2xl text-[#1C4025]">
                  {project.title}
                </h2>

                {/* 요약 소개글 */}
                <p className="mx-auto max-w-xl text-sm sm:text-base text-[#1C4025]/70 leading-relaxed font-light">
                  {project.description}
                </p>

                {/* 펀딩 프로그레스 바 (중앙 매핑) */}
                <div className="w-full max-w-md space-y-2 pt-2">
                  <div className="flex justify-between items-baseline text-xs font-bold text-[#1C4025]/60">
                    <span className="text-lg font-black text-[#1C4025]">{realPercent}% 달성</span>
                    <span>{project.current_amount.toLocaleString()}원 모금</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1C4025]/10 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-[#1C4025] rounded-full transition-all duration-700"
                    />
                  </div>
                </div>

                {/* '더 알아보기' 버튼 (가운데 정렬) */}
                <div className="pt-2">
                  <Link href={`/projects/${project.id}`}>
                    <button className="rounded-full bg-[#1C4025] text-[#F4F3EF] hover:bg-[#1C4025]/90 px-8 py-3 text-xs font-bold transition-all uppercase tracking-widest shadow-sm">
                      더 알아보기
                    </button>
                  </Link>
                </div>
              </div>

              {/* 하단 3D 책 오브젝트 전시 영역 (Apple 스타일 단아한 렌더러) */}
              <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 mt-12 flex justify-center">
                {index === 0 ? (
                  /* 첫 번째 프로젝트: 배경 박스 없이 투명하게 이미지 그대로 배치 (Apple 프로덕트 샘플 스타일) */
                  <div className="relative w-full max-w-lg aspect-[16/10] flex items-center justify-center select-none py-4">
                    <img 
                      src="/images/book-01.png" 
                      alt={project.title}
                      className="w-full max-h-[360px] object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.22)]"
                    />
                  </div>
                ) : (
                  /* 두 번째, 세 번째 프로젝트: 기존 3D 입체 목업 플레이트 유지 */
                  <div className="w-full aspect-[16/9] max-h-[380px] rounded-3xl bg-[#ECEAE4] border border-[#1C4025]/5 shadow-inner flex items-center justify-center p-8 relative overflow-hidden">
                    
                    {/* 3D 원근 큐브 공간 */}
                    <div className="relative py-4" style={{ perspective: '1200px' }}>
                      <div 
                        className="relative w-[145px] h-[210px] transition-transform duration-500 hover:scale-[1.03] select-none"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: 'rotateY(-24deg) rotateX(12deg) rotateZ(-3deg)',
                          boxShadow: '-16px 20px 32px rgba(0,0,0,0.22), -3px 5px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        {/* [1] 책 앞표지 (Front Cover) */}
                        <div 
                          className="absolute inset-0 w-full h-full rounded-r-[4px] overflow-hidden flex flex-col justify-between p-4 z-10 border-l border-white/20"
                          style={{
                            background: coverBg,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backfaceVisibility: 'hidden'
                          }}
                        >
                          {/* 도서 정보 레이아웃 */}
                          <div className="text-left space-y-1">
                            <div className="text-[7px] font-black text-white/40 tracking-widest uppercase">
                              MOOKK COLLECTION
                            </div>
                            <h3 className="text-[11px] sm:text-xs font-extrabold text-white leading-snug font-serif break-keep line-clamp-3">
                              {project.title}
                            </h3>
                          </div>
                          
                          <div className="text-left flex flex-col gap-0.5">
                            <span className="text-[7px] text-white/50 font-serif">
                              {project.User?.name || 'Mookk Author'}
                            </span>
                            <div className="w-6 h-[1px] bg-white/20 my-1" />
                            <span className="text-[6px] text-white/30 tracking-wider font-mono">
                              {theme.label} {theme.no}
                            </span>
                          </div>
                        </div>

                        {/* [2] 책등 (Spine) - w-[20px] */}
                        <div 
                          className="absolute top-0 bottom-0 left-0 w-[20px] origin-left border-r border-black/10"
                          style={{
                            transform: 'rotateY(-90deg)',
                            background: `linear-gradient(to right, rgba(0,0,0,0.25) 0%, rgba(255,255,255,0.1) 40%, rgba(0,0,0,0.25) 100%), ${spineBg}`
                          }}
                        />

                        {/* [3] 책 종이 옆면 (Pages) - w-[18px] */}
                        <div 
                          className="absolute top-0 bottom-0 right-0 w-[18px] origin-right"
                          style={{
                            transform: 'rotateY(90deg) translateZ(127px)', // w-[145px] - w-[18px] 꺾임 보정 (145-18 = 127px)
                            background: 'linear-gradient(to right, #f4f3ef 0%, #e6e5e0 70%, #dcdad4 100%)',
                            boxShadow: 'inset 3px 0 6px rgba(0,0,0,0.12)'
                          }}
                        />
                      </div>
                    </div>
                    
                  </div>
                )}
              </div>

            </section>

            {/* 블록 간 10px 흰색 구분선 */}
            <div className="w-full h-[10px] bg-white border-none shrink-0" />
          </div>
        )
      })}
      
      {/* 푸터 영역 */}
      <Footer />
      
    </div>
  )
}
