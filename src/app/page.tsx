import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import Footer from '@/components/Footer'

// 가상(Mock) 프로젝트 데이터 정의 (DB 데이터가 비어 있을 경우 노출)
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
    <div className="flex flex-col min-h-screen bg-background text-[#203226]">
      
      {/* 1. Hero Section - Apple MacBook Air 스타일의 대담한 1단 타이포그래피 */}
      <section className="w-full bg-[#edfae0] pt-28 pb-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-tight">
            종이책을 사랑하는 사람들을<br />
            한데 묶는 공간
          </h1>
          <p className="mx-auto max-w-xl text-base sm:text-lg text-[#203226]/80 leading-relaxed font-light">
            MOOKK은 종이의 책에 탄생한 오직 종이책만을 위한 크라우드펀딩 출판 플랫폼입니다
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="rounded-full bg-[#203226] px-6 py-3 text-sm font-semibold text-[#d6f9b4] hover:bg-[#203226]/90 transition-all shadow-sm"
            >
              지금 시작하기
            </Link>
            <Link
              href="/projects/create"
              className="rounded-full border border-[#203226]/20 bg-white/40 px-6 py-3 text-sm font-semibold hover:bg-white/70 transition-all"
            >
              내 책 개설하기
            </Link>
          </div>
        </div>
      </section>

      {/* Hero 영역과 첫 프로젝트 사이 5px 흰색 구분선 */}
      <div className="w-full h-[5px] bg-white border-none shrink-0" />

      {/* 2. 프로젝트 1단 배너 목록 (상단 텍스트 중앙 정렬 + 하단 이미지 중앙 정렬 + '더 알아보기') */}
      {displayProjects.map((project, index) => {
        const percent = Math.min(100, Math.round((project.current_amount / project.goal_amount) * 100))
        const realPercent = Math.round((project.current_amount / project.goal_amount) * 100)

        const coverStyle = project.cover_image_url?.startsWith('linear-gradient')
          ? { backgroundImage: project.cover_image_url }
          : project.cover_image_url
          ? { backgroundImage: `url(${project.cover_image_url})` }
          : { backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }

        return (
          <div key={project.id} className="w-full flex flex-col">
            <section className="w-full bg-background pt-20 pb-16 text-center flex flex-col items-center">
              
              {/* 상단 텍스트 중앙 정렬 영역 */}
              <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6 flex flex-col items-center">
                
                {/* 카테고리, 저자명, D-Day 메타 정보 */}
                <div className="flex items-center gap-2 text-xs font-bold text-[#203226]/50">
                  {project.category && (
                    <span className="rounded-full bg-[#203226]/10 px-2.5 py-0.5 uppercase tracking-wider text-[#203226]">
                      {project.category}
                    </span>
                  )}
                  <span>by {project.User?.name || '창작 작가'}</span>
                  <span>•</span>
                  <span className="text-[#203226]/80">{getDaysRemaining(project.deadline)}</span>
                </div>

                {/* 대형 타이틀 */}
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-2xl text-[#203226]">
                  {project.title}
                </h2>

                {/* 요약 소개글 */}
                <p className="mx-auto max-w-xl text-sm sm:text-base text-[#203226]/70 leading-relaxed font-light">
                  {project.description}
                </p>

                {/* 펀딩 프로그레스 바 (중앙 매핑) */}
                <div className="w-full max-w-md space-y-2 pt-2">
                  <div className="flex justify-between items-baseline text-xs font-bold text-[#203226]/60">
                    <span className="text-lg font-black text-[#203226]">{realPercent}% 달성</span>
                    <span>{project.current_amount.toLocaleString()}원 모금</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#203226]/10 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-[#203226] rounded-full transition-all duration-700"
                    />
                  </div>
                </div>

                {/* '더 알아보기' 버튼 (가운데 정렬) */}
                <div className="pt-2">
                  <Link href={`/projects/${project.id}`}>
                    <button className="rounded-full bg-[#203226] text-[#F4F3EF] hover:bg-[#203226]/90 px-8 py-3 text-xs font-bold transition-all uppercase tracking-widest shadow-sm">
                      더 알아보기
                    </button>
                  </Link>
                </div>
              </div>

              {/* 하단 대형 비주얼 이미지 영역 (중앙 배치) */}
              <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 mt-12 flex justify-center">
                <div
                  style={coverStyle}
                  className="w-full aspect-[16/9] max-h-[420px] rounded-3xl bg-cover bg-center border border-[#203226]/10 shadow-sm flex items-center justify-center p-6 relative overflow-hidden"
                >
                  {!project.cover_image_url && (
                    <div className="text-center font-serif text-lg font-semibold text-[#203226] px-6 py-3 bg-white/90 rounded-lg shadow-sm border border-[#203226]/10">
                      {project.title}
                    </div>
                  )}
                </div>
              </div>

            </section>

            {/* 블록 간 5px 흰색 구분선 */}
            <div className="w-full h-[5px] bg-white border-none shrink-0" />
          </div>
        )
      })}
      
      {/* 푸터 영역 */}
      <Footer />
      
    </div>
  )
}
