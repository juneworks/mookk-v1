import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

// 남은 일수 계산 헬퍼 함수
function getDaysRemaining(deadlineStr: string) {
  const deadline = new Date(deadlineStr)
  const today = new Date()
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? `D-${diffDays}` : '마감됨'
}

export default async function MyPage() {
  let profile: any = null
  let pledges: any[] = []
  let myProjects: any[] = []
  let settlements: any[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return redirect('/login')
    }

    // 1. 유저 프로필 조회
    const { data: userProfile } = await supabase
      .from('User')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return redirect('/login')
    }
    profile = userProfile

    // 2. 후원자 내역 조회 (Pledges)
    const { data: pledgeData } = await supabase
      .from('Pledge')
      .select('*, Project(title, cover_image_url, status, deadline), Reward(title)')
      .eq('backer_id', user.id)
      .order('created_at', { ascending: false })

    pledges = pledgeData || []

    // 3. 창작자용 개설 프로젝트 현황 조회 (Projects)
    const { data: projectData } = await supabase
      .from('Project')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })

    myProjects = projectData || []

    // 4. 창작자 프로젝트용 정산 로그 조회 (Settlements)
    if (myProjects.length > 0) {
      const myProjectIds = myProjects.map((p) => p.id)
      const { data: settlementData } = await supabase
        .from('Settlement')
        .select('*, Project(title)')
        .in('project_id', myProjectIds)
        .order('created_at', { ascending: false })

      settlements = settlementData || []
    }

  } catch (e) {
    console.error("MyPage data loading failed:", e)
  }

  // 기본 활성화할 탭 설정 (역할에 맞춤)
  const defaultTab = profile?.role === 'creator' ? 'creator' : 'backer'

  // 실시간 수수료 및 예상 정산 금액 산출 로직
  // 마감 전 진행 중인(live) 프로젝트의 예상 정산금 합계 계산
  const liveProjects = myProjects.filter((p) => p.status === 'live')
  const totalLiveCollected = liveProjects.reduce((sum, p) => sum + (p.current_amount || 0), 0)
  
  const estimatedPgFee = Math.floor(totalLiveCollected * 0.033) // 3.3% 예상
  const estimatedPlatformFee = Math.floor(totalLiveCollected * 0.05) // 5.0% 예상
  const estimatedPayout = totalLiveCollected - estimatedPgFee - estimatedPlatformFee // 91.7% 예상 정산 실수령액

  // 이미 펀딩 성공하여 확정 계산된 정산금 합계 계산
  const settledAmount = settlements.reduce((sum, s) => sum + s.payout_amount, 0)

  // 결제 상태 라벨 뱃지 헬퍼
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300">결제 예약 완료 (Pending)</span>
      case 'paid':
        return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">결제 완료 (Paid)</span>
      case 'failed':
        return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 dark:bg-red-950/40 dark:text-red-300">결제 실패 (Failed)</span>
      case 'refunded':
        return <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">환불 완료 (Refunded)</span>
      default:
        return <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-800">{status}</span>
    }
  }

  // 프로젝트 상태 뱃지 헬퍼
  const getProjectStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">승인 대기 (Draft)</span>
      case 'live':
        return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">펀딩 진행 중 (Live)</span>
      case 'succeeded':
        return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">펀딩 성공 (Succeeded)</span>
      case 'failed':
        return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 dark:bg-red-950/40 dark:text-red-300">펀딩 실패 (Failed)</span>
      default:
        return <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-800">{status}</span>
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950 space-y-8">
      
      {/* 유저 웰컴 프로필 영역 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-xl text-primary dark:bg-zinc-800">
            {profile?.name?.slice(0, 1)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {profile?.name}님, 안녕하세요!
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              이메일: {profile?.email} | 기본 권한: {profile?.role === 'creator' ? '창작자 (저자)' : '후원자'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {profile?.role === 'creator' && (
            <Link href="/projects/create">
              <Button size="sm">새 프로젝트 개설</Button>
            </Link>
          )}
          <Link href="/">
            <Button variant="outline" size="sm">프로젝트 탐색</Button>
          </Link>
        </div>
      </div>

      {/* 탭 구분 영역 */}
      <Tabs defaultValue={defaultTab} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="backer">내가 후원한 도서 ({pledges.length})</TabsTrigger>
          <TabsTrigger value="creator">내가 등록한 프로젝트 ({myProjects.length})</TabsTrigger>
        </TabsList>

        {/* 1. 후원자 탭 컨텐츠 */}
        <TabsContent value="backer" className="space-y-6 outline-none">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 px-1">
              후원 참여 내역
            </h3>
            {pledges.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-sm">
                후원하신 도서 프로젝트가 아직 없습니다. 다양한 종이책 프로젝트를 구경해 보세요!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pledges.map((pledge) => {
                  const coverStyle = pledge.Project?.cover_image_url?.startsWith('linear-gradient')
                    ? { backgroundImage: pledge.Project?.cover_image_url }
                    : pledge.Project?.cover_image_url
                    ? { backgroundImage: `url(${pledge.Project?.cover_image_url})` }
                    : { backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }

                  return (
                    <Card key={pledge.id} className="overflow-hidden flex flex-col justify-between">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <CardTitle className="text-base font-bold line-clamp-1">
                              {pledge.Project?.title}
                            </CardTitle>
                            <CardDescription className="text-xs font-semibold text-primary">
                              {pledge.Reward?.title}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col gap-1 items-end shrink-0">
                            {getPaymentStatusBadge(pledge.payment_status)}
                            <span className="text-[10px] text-zinc-400">
                              {getDaysRemaining(pledge.Project?.deadline || '')}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pb-4">
                        {/* 배송 정보 상세 요약 */}
                        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-[11px] space-y-1.5 text-zinc-600 dark:text-zinc-400">
                          <p className="font-bold text-zinc-800 dark:text-zinc-200 text-xs mb-1">📦 배송지 정보</p>
                          <p>• 수령인: {pledge.shipping_name}</p>
                          <p>• 연락처: {pledge.shipping_phone}</p>
                          <p className="line-clamp-1">• 주소: {pledge.shipping_address}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-3 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-between items-baseline bg-zinc-50/30 p-4">
                        <span className="text-xs text-zinc-400">결제 금액</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-50 text-base">
                          {pledge.amount.toLocaleString()}원
                        </span>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* 2. 창작자 탭 컨텐츠 */}
        <TabsContent value="creator" className="space-y-8 outline-none">
          {/* 창작자 정산 통계 위젯 */}
          {myProjects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="bg-zinc-900 text-white dark:bg-zinc-950">
                <CardHeader className="pb-2">
                  <CardDescription className="text-zinc-400 text-xs">진행 중인 예상 정산금 (91.7%)</CardDescription>
                  <CardTitle className="text-2xl font-black text-white">{estimatedPayout.toLocaleString()}원</CardTitle>
                </CardHeader>
                <CardContent className="text-[10px] text-zinc-400 leading-relaxed space-y-0.5">
                  <p>• 진행 중 펀딩 총액: {totalLiveCollected.toLocaleString()}원</p>
                  <p>• 예상 PG수수료(3.3%): {estimatedPgFee.toLocaleString()}원</p>
                  <p>• 예상 중개수수료(5.0%): {estimatedPlatformFee.toLocaleString()}원</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-zinc-400 text-xs">정산 지급 완료/예정액</CardDescription>
                  <CardTitle className="text-2xl font-black text-primary">{settledAmount.toLocaleString()}원</CardTitle>
                </CardHeader>
                <CardContent className="text-[10px] text-zinc-400">
                  성공 마감되어 정산 연산이 완료된 총액입니다. (관리자 페이지 배치 실행 기준)
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-zinc-400 text-xs">나의 개설 프로젝트 성공률</CardDescription>
                  <CardTitle className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                    {myProjects.length > 0
                      ? Math.round(
                          (myProjects.filter((p) => p.status === 'succeeded').length / myProjects.length) * 100
                        )
                      : 0}
                    %
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[10px] text-zinc-400">
                  전체 개설 도서 중 성공 마감된 비율입니다.
                </CardContent>
              </Card>
            </div>
          )}

          {/* 내가 작성한 프로젝트 리스트 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 px-1">
              나의 도서 등록 목록
            </h3>
            {myProjects.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-sm">
                개설한 종이책 프로젝트가 아직 없습니다. 상단의 '새 프로젝트 개설' 버튼을 눌러 시작해 보세요!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myProjects.map((project) => {
                  const percent = Math.min(
                    100,
                    Math.round((project.current_amount / project.goal_amount) * 100)
                  )
                  const realPercent = Math.round((project.current_amount / project.goal_amount) * 100)

                  return (
                    <Card key={project.id} className="overflow-hidden flex flex-col justify-between">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-4">
                          <CardTitle className="text-base font-bold line-clamp-1">
                            {project.title}
                          </CardTitle>
                          <div className="flex flex-col gap-1 items-end shrink-0">
                            {getProjectStatusBadge(project.status)}
                            <span className="text-[10px] text-zinc-400">
                              {getDaysRemaining(project.deadline)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pb-4">
                        {/* 펀딩 현황 지표 */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                          <div>
                            <span className="text-zinc-400">목표액:</span>{' '}
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                              {project.goal_amount.toLocaleString()}원
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-400">모금액:</span>{' '}
                            <span className="font-semibold text-primary">
                              {project.current_amount.toLocaleString()}원
                            </span>
                          </div>
                        </div>
                        {/* 게이지 바 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                            <span>달성률</span>
                            <span>{realPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                            <div
                              style={{ width: `${percent}%` }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-3 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-end gap-2 bg-zinc-50/20 p-4">
                        <Link href={`/projects/${project.id}`}>
                          <Button size="xs" variant="outline">
                            도서 상세 보기
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* 3. 자동 정산 입금 로그 리스트 (창작자 관점) */}
          {myProjects.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 px-1">
                정산 정산 실수령 기록 (Settlements)
              </h3>
              {settlements.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs">
                  마감 성공되어 정산 연산이 완료된 내역이 없습니다. (종료 성공된 프로젝트가 마감 배치를 통과해야 생성됩니다.)
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold bg-zinc-100/50 dark:bg-zinc-900/30">
                        <th className="p-3">프로젝트 제목</th>
                        <th className="p-3 text-right">총 모금액</th>
                        <th className="p-3 text-right">PG 수수료 (3.3%)</th>
                        <th className="p-3 text-right">플랫폼 수수료 (5.0%)</th>
                        <th className="p-3 text-right">최종 실수령 정산금</th>
                        <th className="p-3 text-center">정산 예정 시점</th>
                        <th className="p-3 text-center">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {settlements.map((s) => (
                        <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                          <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100 max-w-xs truncate">
                            {s.Project?.title || '도서명 미확인'}
                          </td>
                          <td className="p-3 text-right font-medium">{s.total_amount.toLocaleString()}원</td>
                          <td className="p-3 text-right text-zinc-500">{s.pg_fee.toLocaleString()}원</td>
                          <td className="p-3 text-right text-zinc-500">{s.platform_fee.toLocaleString()}원</td>
                          <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            {s.payout_amount.toLocaleString()}원
                          </td>
                          <td className="p-3 text-center text-zinc-500">
                            {s.scheduled_at ? new Date(s.scheduled_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                              {s.status === 'calculated' ? '정산 연산 완료' : s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
