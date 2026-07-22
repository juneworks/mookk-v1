'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Project {
  id: string
  title: string
  status: 'draft' | 'live' | 'succeeded' | 'failed' | 'closed'
  goal_amount: number
  current_amount: number
  deadline: string
  created_at: string
  User: {
    name: string
    email: string
  } | null
}

interface Settlement {
  id: string
  project_id: string
  total_amount: number
  pg_fee: number
  platform_fee: number
  payout_amount: number
  status: 'pending' | 'calculated' | 'completed' | 'failed'
  scheduled_at: string | null
  created_at: string
  Project: {
    title: string
  } | null
}

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // 데이터 상태
  const [projects, setProjects] = useState<Project[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  
  // 배치 처리 결과 리포트 출력 모달/상태
  const [report, setReport] = useState<string | null>(null)

  // 데이터 로드 함수
  async function loadData() {
    try {
      setLoading(true)
      
      // 1. 모든 프로젝트 로드 (창작자 정보 조인)
      const { data: projectData, error: pError } = await supabase
        .from('Project')
        .select('*, User(name, email)')
        .order('created_at', { ascending: false })

      if (pError) throw pError
      setProjects(projectData || [])

      // 2. 모든 정산 내역 로드 (프로젝트 정보 조인)
      const { data: settlementData, error: sError } = await supabase
        .from('Settlement')
        .select('*, Project(title)')
        .order('created_at', { ascending: false })

      if (sError) throw sError
      setSettlements(settlementData || [])

    } catch (err: any) {
      console.error('Error loading admin dashboard data:', err)
      alert(`데이터를 불러오는 중 에러가 발생했습니다: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // 수동 승인 (Live 전환) API 호출
  const handleApprove = async (projectId: string) => {
    if (!confirm('해당 프로젝트를 승인하여 LIVE 상태로 전환하겠습니까? 메인 홈에 즉시 노출됩니다.')) return
    
    setActionLoading(projectId)
    try {
      const response = await fetch(`/api/batch-payment?projectId=${projectId}&action=approve`)
      const res = await response.json()
      
      if (res.success) {
        alert(res.message || '프로젝트 승인이 성공했습니다!')
        loadData()
      } else {
        alert(res.error || res.message || '승인에 실패했습니다.')
      }
    } catch (err: any) {
      alert(`에러 발생: ${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  // 마감 배치 실행 API 호출
  const handleBatchPayment = async (projectId: string) => {
    if (!confirm('해당 프로젝트의 펀딩 마감 배치를 강제 실행하시겠습니까?\n달성률에 따라 결제 성공/실패가 일괄 적용되며 정산 데이터가 자동 연산됩니다.')) return

    setActionLoading(projectId)
    setReport(null)
    try {
      const response = await fetch(`/api/batch-payment?projectId=${projectId}&action=batch`)
      const res = await response.json()

      if (res.success) {
        const data = res.data
        const finalStatusLabel = data.finalStatus === 'succeeded' ? '성공(Succeeded)' : '실패(Failed)'
        
        let reportText = `[배치 실행 리포트]\n`
        reportText += `• 프로젝트 명: ${data.title}\n`
        reportText += `• 최종 마감 상태: ${finalStatusLabel}\n`
        reportText += `• 목표 금액: ${data.goalAmount.toLocaleString()}원\n`
        reportText += `• 모금 금액: ${data.collectedAmount.toLocaleString()}원\n`
        reportText += `• 총 후원 Pledge 건수: ${data.totalPledgesCount}건\n`
        reportText += `• 결제 상태 갱신 건수: ${data.processedPledgesCount}건\n`

        if (data.settlementCreated && data.settlement) {
          const s = data.settlement
          reportText += `\n[정산 자동 연산 결과]\n`
          reportText += `• 총 펀딩 금액: ${s.total_amount.toLocaleString()}원\n`
          reportText += `• PG 대행 수수료(3.3%): ${s.pg_fee.toLocaleString()}원\n`
          reportText += `• 플랫폼 중개 수수료(5.0%): ${s.platform_fee.toLocaleString()}원\n`
          reportText += `• 최종 정산 실수령액: ${s.payout_amount.toLocaleString()}원\n`
          reportText += `• 정산 예정 시점: ${new Date(s.scheduled_at).toLocaleDateString()} (마감 +7일)\n`
        } else {
          reportText += `\n• 정산 생성 여부: 미생성 (펀딩 실패)`
        }

        setReport(reportText)
        alert('마감 배치 처리가 완료되었습니다! 결과를 확인하세요.')
        loadData()
      } else {
        alert(res.error || res.message || '배치 실행 실패')
      }
    } catch (err: any) {
      alert(`에러 발생: ${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  // 상태 배지 한글 라벨
  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'draft':
        return <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">초안 (Draft)</span>
      case 'live':
        return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">진행 중 (Live)</span>
      case 'succeeded':
        return <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">성공 (Succeeded)</span>
      case 'failed':
        return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-300">실패 (Failed)</span>
      default:
        return <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800">{status}</span>
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950 space-y-10">
      
      {/* 대시보드 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Mookk 플랫폼 관리자 콘솔
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            저자가 가입하여 개설한 도서 프로젝트들을 승인하고, 가상 결제 예약을 일괄 마감·정산 처리할 수 있는 시뮬레이터입니다.
          </p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          {loading ? '새로고침 중...' : '데이터 동기화'}
        </Button>
      </div>

      {/* 배치 결과 리포트 콘솔 노출 */}
      {report && (
        <Card className="border-zinc-300 dark:border-zinc-800 bg-zinc-900 text-zinc-50 font-mono text-xs">
          <CardHeader className="pb-2 border-b border-zinc-800">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold text-zinc-100">💻 배치 실행 로그 분석기</CardTitle>
              <Button size="xs" variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setReport(null)}>로그 닫기</Button>
            </div>
          </CardHeader>
          <CardContent className="p-5 whitespace-pre-line leading-relaxed">
            {report}
          </CardContent>
        </Card>
      )}

      {/* 1. 프로젝트 승인 및 정산 배치 패널 */}
      <Card>
        <CardHeader>
          <CardTitle>1. 도서 펀딩 프로젝트 리스트</CardTitle>
          <CardDescription>플랫폼에 개설된 전체 펀딩 현황 및 마감 배치 관리</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading && projects.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-sm">로딩 중...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-sm">등록된 프로젝트가 아직 없습니다.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold bg-zinc-100/50 dark:bg-zinc-900/30">
                  <th className="p-3">프로젝트 제목</th>
                  <th className="p-3">창작자 (저자)</th>
                  <th className="p-3 text-right">목표 금액</th>
                  <th className="p-3 text-right">현재 모금액</th>
                  <th className="p-3 text-center">달성률</th>
                  <th className="p-3 text-center">상태</th>
                  <th className="p-3 text-center">동작 및 제어</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {projects.map((project) => {
                  const percent = Math.round((project.current_amount / project.goal_amount) * 100)
                  const isActionLoading = actionLoading === project.id
                  return (
                    <tr key={project.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                      <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100 max-w-xs truncate">
                        {project.title}
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200">{project.User?.name || '저자명 미등록'}</div>
                        <div className="text-[10px] text-zinc-400">{project.User?.email || '-'}</div>
                      </td>
                      <td className="p-3 text-right font-medium">{project.goal_amount.toLocaleString()}원</td>
                      <td className="p-3 text-right font-medium text-primary">{project.current_amount.toLocaleString()}원</td>
                      <td className="p-3 text-center font-bold text-zinc-700 dark:text-zinc-300">{percent}%</td>
                      <td className="p-3 text-center">{getStatusBadge(project.status)}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {project.status === 'draft' && (
                            <Button
                              size="xs"
                              onClick={() => handleApprove(project.id)}
                              disabled={isActionLoading || loading}
                            >
                              {isActionLoading ? '승인 중...' : '수동 승인 (Live)'}
                            </Button>
                          )}
                          {project.status === 'live' && (
                            <Button
                              size="xs"
                              variant="destructive"
                              onClick={() => handleBatchPayment(project.id)}
                              disabled={isActionLoading || loading}
                            >
                              {isActionLoading ? '배치 중...' : '마감 배치 실행'}
                            </Button>
                          )}
                          {['succeeded', 'failed'].includes(project.status) && (
                            <span className="text-[10px] text-zinc-400 font-semibold">마감 완료</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* 2. Settlement 정산 로그 패널 */}
      <Card>
        <CardHeader>
          <CardTitle>2. 프로젝트 자동 정산 로그 (Settlements)</CardTitle>
          <CardDescription>펀딩 성공 프로젝트들의 3.3% PG수수료 및 5.0% 중개수수료를 계산한 정산 실수령액 적재 기록</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading && settlements.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-sm">로딩 중...</div>
          ) : settlements.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-sm">생성된 정산 내역이 없습니다. (성공한 펀딩이 있어야 생성됩니다.)</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold bg-zinc-100/50 dark:bg-zinc-900/30">
                  <th className="p-3">연관 도서 프로젝트</th>
                  <th className="p-3 text-right">총 모금액 (원)</th>
                  <th className="p-3 text-right">PG 수수료 (3.3%)</th>
                  <th className="p-3 text-right">플랫폼 수수료 (5.0%)</th>
                  <th className="p-3 text-right">작가 정산 실수령액</th>
                  <th className="p-3 text-center">정산 시점</th>
                  <th className="p-3 text-center">정산 상태</th>
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
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                        {s.status === 'calculated' ? '정산 계산 완료' : s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      
    </div>
  )
}
