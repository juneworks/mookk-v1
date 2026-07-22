import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// RLS를 우회하는 Admin 클라이언트 생성 함수
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL or Service Role Key is missing in environment variables.')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

// GET 요청 처리 (수동 디버깅 및 브라우저 호출)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const action = searchParams.get('action') // 'approve' (수동 승인) 또는 'batch' (기본값, 배치 결제)

  if (!projectId) {
    return NextResponse.json({ error: 'projectId query parameter is required.' }, { status: 400 })
  }

  return processBatchPayment(projectId, action || 'batch')
}

// POST 요청 처리 (실서비스 호출)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectId, action } = body

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required in request body.' }, { status: 400 })
    }

    return processBatchPayment(projectId, action || 'batch')
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid JSON body' }, { status: 400 })
  }
}

// 배치 결제 / 수동 승인 통합 처리 함수
async function processBatchPayment(projectId: string, action: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    // 1. 프로젝트 상세 정보 조회
    const { data: project, error: projectError } = await supabaseAdmin
      .from('Project')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: `Project not found. ${projectError?.message}` }, { status: 404 })
    }

    // A. 수동 승인 (Live 전환) 처리 분기
    if (action === 'approve') {
      if (project.status !== 'draft') {
        return NextResponse.json({
          success: false,
          message: `Only 'draft' projects can be approved. Current status is '${project.status}'.`
        })
      }

      const { error: approveError } = await supabaseAdmin
        .from('Project')
        .update({ status: 'live' })
        .eq('id', projectId)

      if (approveError) {
        throw new Error(`Failed to approve project: ${approveError.message}`)
      }

      return NextResponse.json({
        success: true,
        message: `Project '${project.title}' is now LIVE.`,
        data: { projectId, newStatus: 'live' }
      })
    }

    // B. 배치 결제 및 정산 처리 분기
    if (action === 'batch') {
      // 이미 마감 완료된 상태인지 확인 (중복 처리 방지)
      if (['succeeded', 'failed', 'closed'].includes(project.status)) {
        return NextResponse.json({
          success: false,
          message: `Project is already in '${project.status}' status. Batch cannot be re-run.`
        })
      }

      // Live 상태일 때만 배치 결제가 돌아가도록 방어
      if (project.status !== 'live') {
        return NextResponse.json({
          success: false,
          message: `Only 'live' projects can be finalized via batch. Current status is '${project.status}'.`
        })
      }

      const currentAmount = project.current_amount || 0
      const goalAmount = project.goal_amount
      const isSuccess = currentAmount >= goalAmount
      const targetStatus = isSuccess ? 'succeeded' : 'failed'

      // 2. 프로젝트 상태 변경
      const { error: updateProjectError } = await supabaseAdmin
        .from('Project')
        .update({ status: targetStatus })
        .eq('id', projectId)

      if (updateProjectError) {
        throw new Error(`Failed to update project status: ${updateProjectError.message}`)
      }

      // 3. 해당 프로젝트의 'pending' 상태인 모든 후원(Pledge) 데이터 조회
      const { data: pledges, error: pledgesError } = await supabaseAdmin
        .from('Pledge')
        .select('*')
        .eq('project_id', projectId)
        .eq('payment_status', 'pending')

      if (pledgesError) {
        throw new Error(`Failed to fetch pledges: ${pledgesError.message}`)
      }

      const totalPledgesCount = pledges?.length || 0
      let processedPledgesCount = 0

      if (totalPledgesCount > 0) {
        // 4. 결제 예약 일괄 처리 (성공 시 paid, 실패 시 failed로 업데이트)
        const targetPaymentStatus = isSuccess ? 'paid' : 'failed'
        const pledgeIds = pledges.map((p) => p.id)

        const { error: updatePledgesError } = await supabaseAdmin
          .from('Pledge')
          .update({ payment_status: targetPaymentStatus })
          .in('id', pledgeIds)

        if (updatePledgesError) {
          throw new Error(`Failed to update pledges status: ${updatePledgesError.message}`)
        }
        processedPledgesCount = totalPledgesCount
      }

      // 5. 정산 내역(Settlement) 계산 및 생성 (성공 시에만 정산 실시)
      let settlementResult = null
      if (isSuccess) {
        const totalAmount = currentAmount
        const pgFee = Math.floor(totalAmount * 0.033) // PG 수수료 3.3%
        const platformFee = Math.floor(totalAmount * 0.05) // 플랫폼 수수료 5.0%
        const payoutAmount = totalAmount - pgFee - platformFee // 실수령 정산금
        
        const scheduledAt = new Date()
        scheduledAt.setDate(scheduledAt.getDate() + 7) // 정산 예정일: 마감 기준 +7일

        const { data: settlement, error: settlementError } = await supabaseAdmin
          .from('Settlement')
          .insert({
            project_id: projectId,
            total_amount: totalAmount,
            pg_fee: pgFee,
            platform_fee: platformFee,
            payout_amount: payoutAmount,
            status: 'calculated', // 계산 완료
            scheduled_at: scheduledAt.toISOString()
          })
          .select()
          .single()

        if (settlementError) {
          throw new Error(`Failed to insert settlement: ${settlementError.message}`)
        }
        settlementResult = settlement
      }

      return NextResponse.json({
        success: true,
        data: {
          projectId,
          title: project.title,
          finalStatus: targetStatus,
          goalAmount,
          collectedAmount: currentAmount,
          totalPledgesCount,
          processedPledgesCount,
          settlementCreated: isSuccess,
          settlement: settlementResult
        }
      })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })

  } catch (err: any) {
    console.error('Batch payment critical error:', err)
    return NextResponse.json({ error: err.message || 'Batch execution failed' }, { status: 500 })
  }
}
