import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

// 가상(Mock) 프로젝트 데이터정의 (DB 데이터가 비어 있을 경우 노출)
const mockProjects = [
  {
    id: "mock-1",
    title: "서점원들의 밤: 골목 안 작은 책방이 켜지는 시간",
    description: "골목 모퉁이, 밤이 깊어 갈수록 빛나는 동네 책방들의 숨겨진 이야기와 서점원들의 따뜻한 일상을 담은 에세이집입니다.",
    goal_amount: 3000000,
    current_amount: 4200000,
    deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    cover_image_url: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", // 그라디언트 임시 커버
    User: { name: "민음책방 편집부" },
    category: "에세이"
  },
  {
    id: "mock-2",
    title: "한글 타이포그래피의 유산: 활판 인쇄에서 디지털 폰트까지",
    description: "납활자 인쇄 시절부터 현대 디지털 폰트 디자인까지, 한글 자형의 아름다움과 타이포그래피 유산을 정리한 전문 예술 도서.",
    goal_amount: 5000000,
    current_amount: 1500000,
    deadline: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString(),
    cover_image_url: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    User: { name: "스튜디오 글자" },
    category: "예술/디자인"
  },
  {
    id: "mock-3",
    title: "단편 소설 선집: 사소한 기억의 묶음",
    description: "독립 출판 씬에서 주목받는 신진 소설가 5인이 그려내는 기억의 조각들. 우리 삶의 가장 사소하고 아름다운 찰나를 묶었습니다.",
    goal_amount: 4000000,
    current_amount: 6400000,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    cover_image_url: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    User: { name: "출판동인 묶음" },
    category: "소설"
  }
]

// 남은 일수(D-Day) 계산 헬퍼 함수
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
    
    // Project 테이블에서 live 상태인 프로젝트 목록 로드 (User 조인하여 창작자 이름 획득)
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
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section (메인 비주얼) */}
      <section className="relative overflow-hidden bg-zinc-900 py-24 text-white dark:bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-900 to-black opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300 ring-1 ring-inset ring-zinc-700">
              종이책 전문 크라우드펀딩
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white">
              독자와 작가가 함께 <br className="hidden sm:inline" />
              <span className="text-zinc-400">책의 숨결을 묶다</span>
            </h1>
            <p className="text-lg text-zinc-300 max-w-lg leading-relaxed">
              Mookk(묶)은 종이책 출판을 꿈꾸는 모든 작가들과, 세상에 단 하나뿐인 책의 첫 번째 주인이 되고 싶은 독자들을 잇는 펀딩 공간입니다.
            </p>
            <div className="flex flex-wrap gap-4 pt-4 justify-center sm:justify-start">
              <Link
                href="/login"
                className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-zinc-100 transition-colors"
              >
                Mookk로 가입하기
              </Link>
              <Link
                href="/projects/create"
                className="rounded-md border border-zinc-700 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
              >
                나의 책 등록하기
              </Link>
            </div>
          </div>

          {/* 플랫폼 주요 지표 카드 */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm bg-zinc-800/40 p-6 rounded-2xl border border-zinc-700/50 backdrop-blur-sm">
            <div className="p-4 bg-zinc-900/50 rounded-xl">
              <p className="text-xs text-zinc-400">누적 성공 펀딩</p>
              <p className="text-xl font-bold mt-1 text-white">248개</p>
            </div>
            <div className="p-4 bg-zinc-900/50 rounded-xl">
              <p className="text-xs text-zinc-400">총 후원자 수</p>
              <p className="text-xl font-bold mt-1 text-white">4.2만 명</p>
            </div>
            <div className="p-4 bg-zinc-900/50 rounded-xl">
              <p className="text-xs text-zinc-400">누적 펀딩 금액</p>
              <p className="text-xl font-bold mt-1 text-white">12.8억 원</p>
            </div>
            <div className="p-4 bg-zinc-900/50 rounded-xl">
              <p className="text-xs text-zinc-400">펀딩 평균 성공률</p>
              <p className="text-xl font-bold mt-1 text-white">94.2%</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Project List Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {useMock ? "🔥 주목받는 추천 펀딩" : "📚 진행 중인 펀딩"}
            </h2>
            <p className="text-sm text-zinc-500 mt-1 dark:text-zinc-400">
              {useMock
                ? "아직 등록된 실서버 프로젝트가 없습니다. 가상 데이터를 활용해 UI를 미리 체험해 보세요!"
                : "세상 밖으로 나올 준비를 하고 있는 새로운 종이책 목록입니다."}
            </p>
          </div>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            {displayProjects.length}개의 프로젝트
          </div>
        </div>

        {/* 프로젝트 그리드 */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {displayProjects.map((project) => {
            const percent = Math.min(
              100,
              Math.round((project.current_amount / project.goal_amount) * 100)
            )
            const realPercent = Math.round(
              (project.current_amount / project.goal_amount) * 100
            )

            // 커버 백그라운드 스타일 설정
            const coverStyle = project.cover_image_url?.startsWith('linear-gradient')
              ? { backgroundImage: project.cover_image_url }
              : project.cover_image_url
              ? { backgroundImage: `url(${project.cover_image_url})` }
              : { backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                {/* 책 커버 이미지 영역 */}
                <div
                  style={coverStyle}
                  className="aspect-[4/3] w-full bg-cover bg-center group-hover:scale-102 transition-transform duration-300 relative flex items-center justify-center p-6 border-b border-zinc-100 dark:border-zinc-800"
                >
                  {/* 카테고리 태그 */}
                  {project.category && (
                    <span className="absolute top-3 left-3 rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
                      {project.category}
                    </span>
                  )}
                  {/* D-Day 태그 */}
                  <span className="absolute top-3 right-3 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wider">
                    {getDaysRemaining(project.deadline)}
                  </span>
                  
                  {/* 이미지 부재 시 책 제목이 커버 자체에 멋지게 얹어지는 디자인 효과 */}
                  {!project.cover_image_url && (
                    <div className="text-center font-serif text-sm font-semibold max-w-xs text-zinc-800 px-4 py-2 bg-white/80 rounded shadow-sm backdrop-blur-xs">
                      {project.title}
                    </div>
                  )}
                </div>

                {/* 정보 영역 */}
                <div className="flex flex-1 flex-col p-5 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      by {project.User?.name || '창작자'}
                    </p>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2 min-h-11 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* 펀딩 통계 및 프로그레스 바 */}
                  <div className="mt-auto pt-2 space-y-2">
                    <div className="flex justify-between items-baseline text-sm">
                      <span className="font-extrabold text-primary text-base">
                        {realPercent}%
                      </span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {project.current_amount.toLocaleString()}원
                      </span>
                    </div>
                    {/* 게이지 바 */}
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-primary rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
