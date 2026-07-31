import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { mockProjects, mockPledges } from '@/data/projectsData'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId가 필요합니다.' }, { status: 400 })
    }

    let backersData: any[] = []

    // 1. Supabase에서 후원자 목록 조회 시도
    if (session?.user) {
      const { data: pledges, error } = await supabase
        .from('Pledge')
        .select(`
          id,
          amount,
          created_at,
          payment_status,
          shipping_address,
          reward:Reward (
            title
          ),
          user:User (
            name,
            email
          )
        `)
        .eq('project_id', projectId)
        .neq('payment_status', 'cancelled')

      if (!error && pledges && pledges.length > 0) {
        backersData = pledges
      }
    }

    // 2. 만약 DB에 데이터가 없거나 더미인 경우 mockPledges 활용
    if (backersData.length === 0) {
      const mockList = mockPledges.filter(p => p.project_id === projectId || projectId.startsWith('mookk-real'))
      backersData = mockList.map(p => ({
        id: p.id,
        amount: p.amount,
        created_at: p.created_at,
        payment_status: 'pending',
        shipping_address: p.shipping_address,
        reward: { title: '도서 1권 + 작가 친필 서인엽서 set' },
        user: { name: '후원자', email: 'backer@example.com' }
      }))
    }

    // 3. 배송지 수정 잠금 (Lock) - CSV 추출 시 해당 프로젝트 pledge address_locked = true 업데이트
    if (session?.user) {
      await supabase
        .from('Pledge')
        .update({ address_locked: true })
        .eq('project_id', projectId)
    }

    // 4. CSV 헤더 및 데이터 줄 작성
    const headers = ['후원 번호', '후원자 이름', '이메일', '수령인', '연락처', '배송지 주소', '리워드 구성', '후원 금액(원)', '결제 상태', '후원 일시']
    
    const rows = backersData.map((b) => {
      const addr = b.shipping_address || {}
      const recipientName = addr.recipientName || b.user?.name || '미입력'
      const phone = addr.phone || '미입력'
      const fullAddress = addr.address ? `"${addr.address} ${addr.detailAddress || ''}"` : '"배송지 정보 없음"'
      const rewardTitle = b.reward?.title ? `"${b.reward.title.replace(/"/g, '""')}"` : '"기본 리워드"'
      const dateStr = new Date(b.created_at).toLocaleString('ko-KR')

      return [
        b.id,
        `"${b.user?.name || '후원자'}"`,
        `"${b.user?.email || ''}"`,
        `"${recipientName}"`,
        `"${phone}"`,
        fullAddress,
        rewardTitle,
        b.amount,
        b.payment_status || 'pending',
        `"${dateStr}"`
      ].join(',')
    })

    // UTF-8 BOM 추가 (Excel 한글 깨짐 방지)
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="mookk_backers_${projectId}_${Date.now()}.csv"`,
      },
    })
  } catch (err: any) {
    console.error('CSV Export Error:', err)
    return NextResponse.json({ error: 'CSV 추출 중 에러가 발생했습니다.' }, { status: 500 })
  }
}
