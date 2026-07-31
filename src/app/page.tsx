import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { sampleProjects } from '@/data/projectsData'

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
    console.error("Database loading failed. Falling back to sample data.", e)
    useMock = true
  }

  // 실시간 펀딩 진행 중인 프로젝트 (status === 'live') 디데이 임박한 순(deadline 오름차순)으로 정렬
  const liveSampleProjects = sampleProjects
    .filter(p => p.status === 'live')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  const displayProjects = useMock ? liveSampleProjects : dbProjects.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  return (
    <div className="w-full bg-white text-[#1C4025]">
      
      {/* 서브 띠 배너 아래 헤더 타이틀 띠 카피 영역 (3/4 크기 축소 + 상하 완전 동등 여백) */}
      <div className="w-full py-8 sm:py-10 bg-white shrink-0 flex items-center justify-center text-center px-4">
        <h1 className="text-[21px] sm:text-[28px] font-extrabold tracking-tight text-[#1C4025] leading-none">
          책으로 묶는 중입니다
        </h1>
      </div>

      {/* 메인 실시간 펀딩 진행 프로젝트 타일 그리드 섹션 */}
      <section className="w-full bg-white pt-2 sm:pt-4 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* 실시간 펀딩 진행 프로젝트 전체 2x2 타일 그리드로 나열 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {displayProjects.map((project, index) => {
              const realPercent = project.goal_amount > 0 
                ? Math.round((project.current_amount / project.goal_amount) * 100)
                : 0
              const coverImg = project.cover_image_url || `/images/book-01.png`

              return (
                <Link 
                  key={project.id || index}
                  href={`/projects/${project.id}`}
                  className="block group"
                >
                  <div className="bg-[#F0EEE9] rounded-none pt-[5px] px-[5px] pb-0 flex flex-col justify-between items-center text-center overflow-hidden border border-black/5 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 min-h-[550px] sm:min-h-[590px] cursor-pointer">
                    
                    {/* 1열: 상단 5px 여백 라인 헤더 (왼쪽: D-Day / 오른쪽: 달성률%) */}
                    <div className="flex items-start justify-between w-full mb-3 text-[#c84b15] font-extrabold text-2xl sm:text-3xl leading-none">
                      {/* 왼쪽 위 5px 여백 D-Day */}
                      <span className="tracking-tight">{getDaysRemaining(project.deadline)}</span>

                      {/* 오른쪽 위 5px 여백 달성률% */}
                      <span className="tracking-tight">{realPercent}%</span>
                    </div>

                    {/* 2열: 카테고리 오렌지 뱃지 버튼 */}
                    <div className="mt-1 mb-2">
                      <span className="inline-block bg-[#c84b15] text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                        {project.category}
                      </span>
                    </div>

                    {/* 3열: 메인 타이틀 (현재 크기의 1.4배 확대) */}
                    <h3 className="text-[26px] sm:text-[34px] font-extrabold text-[#1C4025] tracking-tight group-hover:text-[#c84b15] transition-colors px-4 line-clamp-1 mb-2">
                      {project.title}
                    </h3>

                    {/* 4열: 책 설명 부분 */}
                    <div className="px-6 mb-4 max-w-lg">
                      <p className="text-base sm:text-lg font-medium text-[#1C4025] leading-relaxed font-eulyoo whitespace-pre-line">
                        {project.description}
                      </p>
                    </div>

                    {/* 5열: 책 커버 이미지 (그림자 효과 + 영역 박스 하단 선 간격 1px) */}
                    <div className="w-full flex justify-center items-end mt-auto mb-[1px]">
                      <div className="relative shadow-[0_15px_30px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-[1.03]">
                        <img 
                          src={coverImg} 
                          alt={project.title} 
                          className="h-[260px] sm:h-[300px] w-auto object-contain block"
                        />
                      </div>
                    </div>

                  </div>
                </Link>
              )
            })}
          </div>

        </div>
      </section>

    </div>
  )
}
