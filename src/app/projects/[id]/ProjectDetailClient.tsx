'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Reward {
  id: string
  title: string
  price: number
  description: string
}

interface Project {
  id: string
  title: string
  description: string
  goal_amount: number
  current_amount: number
  deadline: string
  cover_image_url: string | null
  User: {
    name: string
  } | null
  category?: string
}

interface ProjectDetailClientProps {
  project: Project
  rewards: Reward[]
  pledgesCount: number
  currentUser: {
    id: string
    role: string
  } | null
}

export default function ProjectDetailClient({
  project,
  rewards,
  pledgesCount,
  currentUser
}: ProjectDetailClientProps) {
  const router = useRouter()
  const supabase = createClient()
  
  // 모달 상태 및 폼 상태
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // 배송 및 결제 폼 상태
  const [amount, setAmount] = useState('')
  const [shippingName, setShippingName] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')

  // 남은 일수 계산
  const getDaysRemaining = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? `${diffDays}일` : '마감됨'
  }

  const daysLeft = getDaysRemaining(project.deadline)
  const isFinished = daysLeft === '마감됨'

  const percent = Math.min(
    100,
    Math.round((project.current_amount / project.goal_amount) * 100)
  )
  const realPercent = Math.round((project.current_amount / project.goal_amount) * 100)

  const coverStyle = project.cover_image_url?.startsWith('linear-gradient')
    ? { backgroundImage: project.cover_image_url }
    : project.cover_image_url
    ? { backgroundImage: `url(${project.cover_image_url})` }
    : { backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }

  // 후원 리워드 클릭 핸들러
  const handleSelectReward = (reward: Reward) => {
    if (!currentUser) {
      alert('후원하려면 로그인이 필요합니다. 로그인 페이지로 이동합니다.')
      router.push('/login')
      return
    }

    if (currentUser.role === 'creator') {
      alert('창작자 계정으로는 본인 또는 타 프로젝트에 후원(Backer)할 수 없습니다. 후원자 계정으로 로그인해 주세요.')
      return
    }

    if (isFinished) {
      alert('마감된 프로젝트에는 후원할 수 없습니다.')
      return
    }

    setSelectedReward(reward)
    setAmount(reward.price.toString())
    setErrorMsg(null)
    setModalOpen(true)
  }

  // 가상 결제 예약 제출 처리
  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReward || !currentUser) return

    setLoading(true)
    setErrorMsg(null)

    // 검증
    const pledgeAmount = parseInt(amount, 10)
    if (isNaN(pledgeAmount) || pledgeAmount < selectedReward.price) {
      setErrorMsg(`최소 후원 금액은 ${selectedReward.price.toLocaleString()}원 이상이어야 합니다.`)
      setLoading(false)
      return
    }

    if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim()) {
      setErrorMsg('배송 정보를 누락 없이 모두 입력해 주세요.')
      setLoading(false)
      return
    }

    try {
      // 가상 빌링키 생성
      const mockBillingKey = `mock_billing_key_${Math.random().toString(36).substring(2, 10)}${Date.now().toString().slice(-4)}`

      // 1. 가상 프로젝트(mock-1 등)일 경우 실제 DB 인서트를 우회하고 모의 성공 처리
      if (project.id.startsWith('mock-')) {
        setTimeout(() => {
          setLoading(false)
          setModalOpen(false)
          alert(`[시뮬레이션 완료] 가상 프로젝트 후원 예약이 가상 완료되었습니다!\n\n후원 리워드: ${selectedReward.title}\n후원 금액: ${pledgeAmount.toLocaleString()}원\n배송 정보: ${shippingName}님 / ${shippingPhone}\n가상 빌링키: ${mockBillingKey}`)
          router.push('/')
        }, 1000)
        return
      }

      // 2. 실존 프로젝트일 경우 DB Pledge 테이블에 인서트 실행
      const { error: pledgeError } = await supabase
        .from('Pledge')
        .insert({
          project_id: project.id,
          backer_id: currentUser.id,
          reward_id: selectedReward.id,
          amount: pledgeAmount,
          payment_status: 'pending',
          billing_key: mockBillingKey,
          shipping_name: shippingName.trim(),
          shipping_phone: shippingPhone.trim(),
          shipping_address: shippingAddress.trim()
        })

      if (pledgeError) {
        throw new Error(`후원 정보 저장 실패: ${pledgeError.message}`)
      }

      // 3. 프로젝트의 current_amount 누적 업데이트
      // (현 펀딩 플랫폼의 실시간 반영을 위해, 후원 성공 시 해당 프로젝트의 current_amount를 누적 가산해 줍니다.)
      const newCurrentAmount = project.current_amount + pledgeAmount
      const { error: updateError } = await supabase
        .from('Project')
        .update({ current_amount: newCurrentAmount })
        .eq('id', project.id)

      if (updateError) {
        console.warn("Failed to update project current amount:", updateError.message)
      }

      setLoading(false)
      setModalOpen(false)
      alert(`[후원 성공] 가상 결제 예약이 정상 완료되었습니다!\n프로젝트가 마감(성공)되면 가상 빌링키를 통해 일괄 승인 결제됩니다.\n\n후원 가격: ${pledgeAmount.toLocaleString()}원\n배송 수령인: ${shippingName}`)
      
      // 마이페이지 또는 홈으로 이동
      router.push('/mypage')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || '가상 예약 결제 처리 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 좌측: 책 기획 상세 정보 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 큰 커버 영역 */}
          <div
            style={coverStyle}
            className="aspect-[16/10] w-full bg-cover bg-center rounded-2xl border border-zinc-200 dark:border-zinc-800 relative flex items-center justify-center p-8 shadow-sm"
          >
            {project.category && (
              <span className="absolute top-4 left-4 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white tracking-wider backdrop-blur-sm">
                {project.category}
              </span>
            )}
            {!project.cover_image_url && (
              <div className="text-center font-serif text-xl font-bold max-w-md text-zinc-800 px-6 py-4 bg-white/90 rounded-lg shadow-md backdrop-blur-sm">
                {project.title}
              </div>
            )}
          </div>

          {/* 도서 상세 기획 소개 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              도서 기획 소개 및 줄거리
            </h2>
            <div className="text-zinc-600 dark:text-zinc-300 space-y-4 text-sm leading-relaxed whitespace-pre-line font-sans">
              {project.description}
            </div>
          </div>
        </div>

        {/* 우측: 펀딩 상태 스티키 위젯 및 리워드 목록 */}
        <div className="space-y-6 lg:sticky lg:top-20 h-fit">
          <Card className="shadow-xs">
            <CardHeader className="space-y-2">
              <span className="text-xs text-primary font-bold tracking-wider">
                펀딩 진행 중 ({daysLeft} 남음)
              </span>
              <CardTitle className="text-2xl font-bold leading-tight">
                {project.title}
              </CardTitle>
              <CardDescription className="text-xs">
                by {project.User?.name || '창작자'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 모금 현황 지표 */}
              <div className="grid grid-cols-3 gap-2 text-center border-y border-zinc-100 dark:border-zinc-800 py-4">
                <div>
                  <p className="text-[10px] text-zinc-400">모금액</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                    {project.current_amount.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400">달성률</p>
                  <p className="text-sm font-bold text-primary mt-1">
                    {realPercent}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400">후원자수</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                    {pledgesCount}명
                  </p>
                </div>
              </div>

              {/* 게이지 바 */}
              <div className="space-y-1">
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                  <div
                    style={{ width: `${percent}%` }}
                    className="h-full bg-primary rounded-full transition-all duration-500"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 text-right">
                  목표 금액: {project.goal_amount.toLocaleString()}원
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 리워드 선택 목록 */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-300 px-1">
              후원 리워드 선택
            </h3>
            
            {rewards.map((reward) => (
              <Card
                key={reward.id}
                className="hover:border-zinc-900 dark:hover:border-zinc-100 transition-all cursor-pointer relative overflow-hidden group"
                onClick={() => handleSelectReward(reward)}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors">
                    {reward.title}
                  </CardTitle>
                  <CardDescription className="text-primary text-base font-extrabold mt-1">
                    {reward.price.toLocaleString()}원 이상 후원
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {reward.description}
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end">
                  <Button size="xs" variant="outline" className="text-[10px] h-7 px-3">
                    이 리워드로 후원하기
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

      </div>

      {/* 3. 가상 예약결제 및 배송 정보 입력 Dialog 모달 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>후원금 설정 및 배송 정보 입력</DialogTitle>
            <DialogDescription>
              선택한 리워드: <strong className="text-zinc-900 dark:text-zinc-100">{selectedReward?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePledgeSubmit} className="space-y-4 pt-2">
            {errorMsg && (
              <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
                {errorMsg}
              </div>
            )}

            {/* 후원 금액 */}
            <div className="grid gap-2">
              <Label htmlFor="amount">후원할 최종 금액 (원)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-[10px] text-zinc-400">
                최소 금액: {selectedReward?.price.toLocaleString()}원 (원하는 경우 금액을 높여 추가 후원할 수 있습니다.)
              </p>
            </div>

            {/* 수령인 */}
            <div className="grid gap-2">
              <Label htmlFor="shippingName">수령인 실명</Label>
              <Input
                id="shippingName"
                placeholder="홍길동"
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* 연락처 */}
            <div className="grid gap-2">
              <Label htmlFor="shippingPhone">수령인 연락처</Label>
              <Input
                id="shippingPhone"
                placeholder="010-1234-5678"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* 주소 */}
            <div className="grid gap-2">
              <Label htmlFor="shippingAddress">상세 배송 주소</Label>
              <textarea
                id="shippingAddress"
                rows={3}
                placeholder="우편번호와 함께 도로명 주소 또는 지번 상세 주소를 적어주세요."
                className="flex w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-zinc-500 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <DialogFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800 gap-2">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={loading}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '예약결제 처리 중...' : '가상 예약결제 완료'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
