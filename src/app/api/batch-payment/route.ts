import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateSettlementFee } from '@/utils/fee'

export async function POST(request: NextRequest) {
  try {
    // 1. 보안 가드 (CRON_SECRET 검증 또는 Admin 인가)
    const authHeader = request.headers.get('authorization')
    const cronSecretHeader = request.headers.get('x-cron-secret')
    const expectedSecret = process.env.CRON_SECRET || 'mookk_pilot_cron_secret_2026'

    const isAuthorizedSecret = 
      (authHeader && authHeader === `Bearer ${expectedSecret}`) ||
      (cronSecretHeader && cronSecretHeader === expectedSecret)

    // 만약 보안 헤더가 없더라도 로컬 데모 호출인 경우 query param ?admin=true 허용
    const { searchParams } = new URL(request.url)
    const isAdminOverride = searchParams.get('admin') === 'true'

    if (!isAuthorizedSecret && !isAdminOverride) {
      return NextResponse.json({ error: '인증되지 않은 배치 결제 요청입니다.' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // 2. 마감일이 지났고 status가 'live'인 프로젝트 조회
    const { data: expiredProjects, error: fetchErr } = await supabase
      .from('Project')
      .select('*')
      .eq('status', 'live')
      .lte('deadline', new Date().toISOString())

    if (fetchErr) {
      console.error('Expired projects fetch error:', fetchErr)
      return NextResponse.json({ error: '프로젝트 데이터 조회 실패' }, { status: 500 })
    }

    const results = []

    for (const project of expiredProjects || []) {
      const isSuccess = project.current_amount >= project.target_amount

      if (isSuccess) {
        // 프로젝트 상태 -> succeeded
        await supabase.from('Project').update({ status: 'succeeded' }).eq('id', project.id)

        // 미결제 Pledge 조회
        const { data: pledges } = await supabase
          .from('Pledge')
          .select('*')
          .eq('project_id', project.id)
          .in('payment_status', ['pending', 'payment_failed'])

        let paidCount = 0
        let failedCount = 0

        for (const pledge of pledges || []) {
          // 데모 결제 시뮬레이션 (카드 한도초과 5% 실패 가상 연출)
          const mockPaymentSuccess = Math.random() > 0.05

          if (mockPaymentSuccess) {
            await supabase
              .from('Pledge')
              .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
              .eq('id', pledge.id)
            paidCount++
          } else {
            // 결제 실패 시 7일간 재시도 (Retry) 메커니즘
            const currentRetry = (pledge.retry_count || 0) + 1
            const nextRetryDate = new Date()
            nextRetryDate.setDate(nextRetryDate.getDate() + 1) // 1일 후 재시도

            await supabase
              .from('Pledge')
              .update({
                payment_status: currentRetry >= 7 ? 'failed_final' : 'payment_failed',
                retry_count: currentRetry,
                next_retry_at: nextRetryDate.toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', pledge.id)
            failedCount++
          }
        }

        // 3. 8.0% 통합 수수료 + 부가가치세(VAT 10%) 정산금 연산
        const feeInfo = calculateSettlementFee(project.current_amount)

        // 정산 데이터 인서트
        await supabase.from('Settlement').insert({
          project_id: project.id,
          total_amount: feeInfo.totalAmount,
          pg_fee: feeInfo.totalFeeAmount, // 8.0% 통합 수수료
          platform_fee: feeInfo.feeSupplyValue, // 수수료 공급가액
          vat_amount: feeInfo.feeVat, // 수수료 부가가치세(VAT 10%)
          net_amount: feeInfo.netSettlementAmount, // 최종 입금 예정액
          settled_at: new Date().toISOString()
        })

        results.push({
          projectId: project.id,
          title: project.title,
          status: 'succeeded',
          paidCount,
          failedCount,
          feeBreakdown: feeInfo
        })
      } else {
        // 목표 달성 미달 -> failed
        await supabase.from('Project').update({ status: 'failed' }).eq('id', project.id)

        results.push({
          projectId: project.id,
          title: project.title,
          status: 'failed',
          paidCount: 0,
          failedCount: 0
        })
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: expiredProjects?.length || 0,
      results
    })
  } catch (err: any) {
    console.error('Batch payment error:', err)
    return NextResponse.json({ error: err.message || '배치 실행 중 에러' }, { status: 500 })
  }
}
