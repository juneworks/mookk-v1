import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ProjectDetailClient from './ProjectDetailClient'

// 가상(Mock) 프로젝트 상세 데이터 (DB 매칭 실패 시 활용)
const mockProjectsDetail = [
  {
    id: "mock-1",
    title: "서점원들의 밤: 골목 안 작은 책방이 켜지는 시간",
    description: "골목 모퉁이, 밤이 깊어 갈수록 빛나는 동네 책방들의 숨겨진 이야기와 서점원들의 일상을 담은 에세이집입니다.\n\n[기획 의도]\n매일 아침 책 상자를 뜯고, 매대를 채우고, 손님들과 소소한 대화를 나누는 동네 책방지기들의 리얼한 삶을 들여다봅니다. 대형 서점이나 온라인 샵에서는 느낄 수 없는 골목 안 작은 서점만의 정취와 철학을 종이책의 질감으로 전합니다.\n\n[목차]\n- 1부: 서점을 여는 아침 (청소와 책 정리)\n- 2부: 손님이라는 우주 (서점에서 만난 사람들)\n- 3부: 책방이 켜지는 밤 (독서 모임과 골목 안 불빛)\n- 4부: 그래도 서점원입니다 (책방지기들의 현실과 꿈)",
    goal_amount: 3000000,
    current_amount: 4200000,
    deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    cover_image_url: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    User: { name: "민음책방 편집부" },
    category: "에세이",
    rewards: [
      { id: "mock-r1-1", title: "[기본 후원] 서점원들의 밤 일반판 1권", price: 15000, description: "도서 1권 + 책갈피 1개" },
      { id: "mock-r1-2", title: "[스페셜 에디션] 친필 서명본 + 엽서 세트", price: 32000, description: "저자 친필 서명 도서 1권 + 동네서점 엽서 세트(5종) + 책갈피 + 후원자 명단 표기" }
    ],
    pledgesCount: 142
  },
  {
    id: "mock-2",
    title: "한글 타이포그래피의 유산: 활판 인쇄에서 디지털 폰트까지",
    description: "납활자 인쇄 시절부터 현대 디지털 폰트 디자인까지, 한글 자형의 아름다움과 타이포그래피 역사를 정리한 전문 디자인 도서.\n\n[기획 의도]\n우리가 매일 마주하는 글자들의 역사적 배경과 구조적 아름다움을 학술적이면서도 흥미롭게 구성했습니다. 활판 작업소의 오래된 사진들과 귀중한 아카이브 자료들을 고해상도 인쇄로 복원하여 타이포그래퍼뿐만 아니라 디자인에 관심 있는 모든 독자들에게 훌륭한 레퍼런스가 될 도서입니다.\n\n[특징]\n- 올 컬러 양장본 인쇄\n- 한글 자형 폰트 구조 도판 수록\n- 소장 가치를 극대화한 전용 북 케이스 증정",
    goal_amount: 5000000,
    current_amount: 1500000,
    deadline: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString(),
    cover_image_url: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    User: { name: "스튜디오 글자" },
    category: "예술/디자인",
    rewards: [
      { id: "mock-r2-1", title: "[기본 소장판] 타이포그래피의 유산 하드커버", price: 35000, description: "하드커버 양장본 도서 1권 + 활판 엽서 2종" },
      { id: "mock-r2-2", title: "[콜렉터즈 에디션] 하드커버 + 수납 케이스 + 캘린더", price: 60000, description: "하드커버 양장본 도서 1권 + 타이포 활판 인쇄 2027 캘린더 + 전용 수납 슬리브 케이스 + 활판 엽서 5종 + 스튜디오 글자 감사 서한" }
    ],
    pledgesCount: 38
  },
  {
    id: "mock-3",
    title: "단편 소설 선집: 사소한 기억의 묶음",
    description: "독립 출판 씬에서 주목받는 젊은 소설가 5인이 그려내는 기억의 조각들. 우리 삶의 가장 사소하고 아름다운 순간들을 한 권의 단편선으로 묶었습니다.\n\n[참여 작가]\n김민지, 이수현, 박준영, 최유리, 한정현\n\n[기획 의도]\n'기억'이라는 주제 아래 각기 다른 결을 지닌 다섯 편의 단편 소설을 묶었습니다. 살아가며 문득 찾아오는 외로움과 따뜻함, 잊고 살았던 어릴 적 조각들을 섬세하고 수려한 문체로 이야기합니다. 소장하기 편리하고 가벼운 문고판 형태로 출판됩니다.",
    goal_amount: 4000000,
    current_amount: 6400000,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    cover_image_url: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    User: { name: "출판동인 묶음" },
    category: "소설",
    rewards: [
      { id: "mock-r3-1", title: "[단행본] 사소한 기억의 묶음 문고판 1권", price: 12000, description: "소설책 1권 + 미니 엽서 1종" },
      { id: "mock-r3-2", title: "[더블 패키지] 단행본 1권 + 작가 5인 엽서북 세트", price: 25000, description: "소설책 1권 + 5인 작가 미니 엽서북 1세트 + 작가 코멘터리 소책자(16p)" }
    ],
    pledgesCount: 295
  }
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const id = resolvedParams.id

  let project: any = null
  let rewards: any[] = []
  let pledgesCount = 0
  let currentUser: { id: string; role: string } | null = null

  // 1. 로그인 유저 권한 정보 가져오기
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('User')
        .select('id, role')
        .eq('id', user.id)
        .single()
      if (profile) {
        currentUser = profile
      }
    }
  } catch (e) {
    console.error("Auth check failed in detail page:", e)
  }

  // 2. 가상(Mock) ID에 해당하는 경우 가상 데이터 바인딩
  const matchedMock = mockProjectsDetail.find((m) => m.id === id)
  if (matchedMock) {
    project = {
      id: matchedMock.id,
      title: matchedMock.title,
      description: matchedMock.description,
      goal_amount: matchedMock.goal_amount,
      current_amount: matchedMock.current_amount,
      deadline: matchedMock.deadline,
      cover_image_url: matchedMock.cover_image_url,
      User: matchedMock.User,
      category: matchedMock.category
    }
    rewards = matchedMock.rewards
    pledgesCount = matchedMock.pledgesCount
  } else {
    // 3. 실제 DB 조회
    try {
      const supabase = await createClient()

      // 프로젝트 & 저자 정보 조회
      const { data: projectData, error: projectError } = await supabase
        .from('Project')
        .select('*, User(name)')
        .eq('id', id)
        .single()

      if (projectError || !projectData) {
        console.error("Project not found in DB:", projectError)
        return redirect('/')
      }

      project = projectData

      // 리워드 목록 조회
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('Reward')
        .select('*')
        .eq('project_id', id)
        .order('price', { ascending: true })

      rewards = rewardsError ? [] : (rewardsData || [])

      // 후원 참여 수 count 조회
      const { count, error: pledgesError } = await supabase
        .from('Pledge')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', id)

      pledgesCount = pledgesError ? 0 : (count || 0)

    } catch (e) {
      console.error("Database query error in detail page:", e)
      return redirect('/')
    }
  }

  return (
    <ProjectDetailClient
      project={project}
      rewards={rewards}
      pledgesCount={pledgesCount}
      currentUser={currentUser}
    />
  )
}
