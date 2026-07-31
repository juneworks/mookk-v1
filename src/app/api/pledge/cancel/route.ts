import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { mockProjects, mockPledges } from '@/data/projectsData'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const body = await request.json()
    const { pledgeId } = body

    if (!pledgeId) {
      return NextResponse.json({ error: 'pledgeId가 필요합니다.' }, { status: 400 })
    }

    // 1. Supabase RPC 취소 시도
    if (session?.user) {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('cancel_pledge_atomic', {
        p_pledge_id: pledgeId,
        p_user_id: session.user.id
      })

      if (!rpcError && rpcResult) {
        if (!rpcResult.success) {
          return NextResponse.json({ error: rpcResult.message }, { status: 400 })
        }
        return NextResponse.json({ success: true, message: rpcResult.message })
      }
    }

    // 2. Mock / Fallback 후원 데이터 취소 처리
    const pledge = mockPledges.find((p: any) => p.id === pledgeId)
    if (pledge) {
      const project = mockProjects.find((pr: any) => pr.id === pledge.project_id)
      if (project) {
        const deadlineDate = new Date(project.deadline)
        const now = new Date()
        const hoursLeft = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursLeft < 24) {
          return NextResponse.json(
            { error: '펀딩 마감 24시간 전 이후에는 후원 취소가 불가능합니다.' },
            { status: 400 }
          )
        }

        // 수치 원자적 차감 모기시뮬레이션
        project.current_amount = Math.max(0, project.current_amount - pledge.amount)
        project.backers_count = Math.max(0, project.backers_count - 1)
        pledge.payment_status = 'cancelled' as any
      }
    }

    return NextResponse.json({
      success: true,
      message: '후원이 성공적으로 취소되었습니다.'
    })
  } catch (err: any) {
    console.error('Cancel Pledge Error:', err)
    return NextResponse.json({ error: '후원 취소 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
