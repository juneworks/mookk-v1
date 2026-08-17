import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { sampleProjects, findProjectByIdOrNumber } from '@/data/projectsData'
import ProjectDetailClient from '@/app/projects/[id]/ProjectDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function FundingDetailPage({ params }: PageProps) {
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
    console.error("Auth check failed in funding detail page:", e)
  }

  // 2. sampleProjects 매칭 (1~8 숫자 인덱스 또는 ID 매칭)
  const matched = findProjectByIdOrNumber(id)
  if (matched) {
    const matchedSample = matched.project
    project = {
      id: matchedSample.id,
      title: matchedSample.title,
      subtitle: matchedSample.subtitle,
      description: matchedSample.description,
      detail_story: matchedSample.detail_story,
      features: matchedSample.features,
      spec: matchedSample.spec,
      author_intro: matchedSample.author_intro,
      publisher_intro: matchedSample.publisher_intro,
      publisher_name: matchedSample.publisher_name,
      goal_amount: matchedSample.goal_amount,
      current_amount: matchedSample.current_amount,
      deadline: matchedSample.deadline,
      cover_image_url: matchedSample.cover_image_url,
      status: matchedSample.status,
      User: { name: matchedSample.creator_name },
      category: matchedSample.category
    }
    rewards = matchedSample.rewards
    pledgesCount = matchedSample.backers_count
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
        return redirect('/funding')
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
      console.error("Database query error in funding detail page:", e)
      return redirect('/funding')
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
