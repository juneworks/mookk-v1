'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'
import MobileFloatingCTA from '@/components/MobileFloatingCTA'
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

interface BookSpec {
  subtitle?: string
  size?: string
  paper_inner?: string
  paper_cover?: string
  pages?: string
  binding?: string
  isbn?: string
}

interface Project {
  id: string
  title: string
  subtitle?: string
  description: string
  detail_story?: string
  features?: { title: string; description: string; icon: string }[]
  spec?: BookSpec
  author_intro?: string
  publisher_intro?: string
  publisher_name?: string
  goal_amount: number
  current_amount: number
  deadline: string
  cover_image_url: string | null
  status?: string
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

  // 게시판 상태 (소식 및 소통)
  const [qaList, setQaList] = useState([
    { id: 1, author: '서점사랑독자', content: '양장본 하드커버 가름끈 색상은 무슨 색인가요?', answer: '안녕하세요! 가름끈은 에메랄드 그린 컬러로 제작될 예정입니다.' },
    { id: 2, author: '글쓰는민재', content: '배송 시 에어캡 안전 포장되나요?', answer: '네, 도서 모서리가 손상되지 않도록 에어캡 안전 봉투로 밀봉 배송됩니다.' }
  ])
  const [newQuestion, setNewQuestion] = useState('')

  // 배송 및 결제 폼 상태
  const [amount, setAmount] = useState('')
  const [shippingName, setShippingName] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')

  // 남은 일수 계산
  const getDaysRemaining = (deadlineStr: string, status?: string) => {
    if (status === 'succeeded' || status === 'failed') return '마감됨'
    if (status === 'upcoming') return '오픈 예정'
    const deadline = new Date(deadlineStr)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? `${diffDays}일` : '마감됨'
  }

  const daysLeft = getDaysRemaining(project.deadline, project.status)
  const isFinished = daysLeft === '마감됨'
  const isUpcoming = project.status === 'upcoming'

  const percent = project.goal_amount > 0 
    ? Math.min(100, Math.round((project.current_amount / project.goal_amount) * 100))
    : 0
  const realPercent = project.goal_amount > 0 
    ? Math.round((project.current_amount / project.goal_amount) * 100)
    : 0

  const coverSrc = project.cover_image_url || '/images/book-01.png'
  const creatorName = project.User?.name || '창작 작가'
  const publisherName = project.publisher_name || 'MOOKK 아틀리에 출판'

  // 후원 리워드 클릭 핸들러
  const handleSelectReward = (reward: Reward) => {
    if (isUpcoming) {
      alert('오픈 알림 신청이 완료되었습니다! 펀딩 개설 당일 소식을 전해드립니다.')
      return
    }

    if (!currentUser) {
      alert('후원하려면 로그인이 필요합니다. 로그인 페이지로 이동합니다.')
      router.push('/login')
      return
    }

    if (currentUser.role === 'creator') {
      alert('창작자 계정으로는 본인 또는 타 프로젝트에 후원할 수 없습니다. 후원자 계정으로 로그인해 주세요.')
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

  // Floating CTA 클릭 핸들러
  const handleFloatingCTAClick = () => {
    const targetElement = document.getElementById('rewards-selection-section')
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // 문의하기 등록 제출
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return
    setQaList([
      ...qaList,
      {
        id: Date.now(),
        author: '후원자님',
        content: newQuestion,
        answer: '창작자가 문의 내용을 확인 후 빠른 시일 내 답변을 등록할 예정입니다.'
      }
    ])
    setNewQuestion('')
    alert('문의 내용이 정상적으로 등록되었습니다.')
  }

  // 가상 결제 예약 제출 처리
  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReward || !currentUser) return

    setLoading(true)
    setErrorMsg(null)

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
      const mockBillingKey = `mock_billing_key_${Math.random().toString(36).substring(2, 10)}${Date.now().toString().slice(-4)}`

      if (project.id.startsWith('mock-') || project.id.startsWith('mookk-')) {
        setTimeout(() => {
          setLoading(false)
          setModalOpen(false)
          alert(`[시뮬레이션 완료] 가상 프로젝트 후원 예약이 정상 완료되었습니다!\n\n후원 리워드: ${selectedReward.title}\n후원 금액: ${pledgeAmount.toLocaleString()}원\n배송 수령인: ${shippingName}님 (${shippingPhone})\n가상 빌링키: ${mockBillingKey}`)
          router.push('/mypage')
        }, 800)
        return
      }

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

      const newCurrentAmount = project.current_amount + pledgeAmount
      await supabase
        .from('Project')
        .update({ current_amount: newCurrentAmount })
        .eq('id', project.id)

      setLoading(false)
      setModalOpen(false)
      alert(`[후원 성공] 가상 결제 예약이 완료되었습니다!\n마감일에 가상 빌링키로 일괄 결제됩니다.\n\n후원 가격: ${pledgeAmount.toLocaleString()}원\n수령인: ${shippingName}`)
      
      router.push('/mypage')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || '가상 예약 결제 처리 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const minPrice = rewards.length > 0 ? Math.min(...rewards.map(r => r.price)).toLocaleString() + '원부터~' : '18,000원부터~'

  return (
    <div className="w-full bg-[#F4F3EF] text-[#1C4025] min-h-screen font-sans pb-24">
      
      {/* ========================================================================= */}
      {/* 1) 소개 영역 (애플 스타일 1단 전면 구성) */}
      {/* ========================================================================= */}

      {/* 1-1. 메인 히어로 (도서 3D 실물 이미지, 타이틀, 펀딩 지표) */}
      <section className="w-full bg-[#F0EEE9] pt-20 pb-20 border-b border-[#1C4025]/10 text-center flex flex-col items-center">
        <div className="mx-auto max-w-4xl px-4 space-y-6 flex flex-col items-center">
          
          {/* 카테고리 / D-Day 뱃지 */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="rounded-full bg-[#c84b15] px-3 py-1 text-white text-[10px] uppercase font-extrabold shadow-2xs">
              {project.category || '도서'}
            </span>
            <span className="text-[#1C4025]/60">by {creatorName}</span>
            <span className="text-[#1C4025]/40">•</span>
            <span className="rounded-full bg-[#1C4025]/10 px-3 py-0.5 text-[#1C4025] text-xs font-bold">
              {daysLeft}
            </span>
          </div>

          {/* 대형 타이틀 및 부제 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C4025] leading-tight max-w-3xl">
            {project.title}
          </h1>
          {project.subtitle && (
            <p className="text-lg sm:text-xl text-[#1C4025]/70 font-light max-w-2xl font-eulyoo whitespace-pre-line">
              {project.subtitle}
            </p>
          )}

          {/* 3D 도서 실물 렌더링 이미지 */}
          <div className="w-full max-w-lg py-8 flex justify-center">
            <img
              src={coverSrc}
              alt={project.title}
              className="max-h-[380px] sm:max-h-[440px] object-contain filter drop-shadow-[0_30px_35px_rgba(0,0,0,0.35)] transition-transform duration-700 hover:scale-[1.03]"
            />
          </div>

          {/* 펀딩 현황 지표 카드 (애플 지표 스타일) */}
          <div className="w-full max-w-xl bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-[#1C4025]/10 shadow-sm space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[11px] font-bold text-[#1C4025]/50">현재 모금액</p>
                <p className="text-lg sm:text-xl font-black text-[#1C4025] mt-1">
                  {project.current_amount.toLocaleString()}원
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#1C4025]/50">달성률</p>
                <p className="text-lg sm:text-xl font-black text-[#c84b15] mt-1">
                  {realPercent}%
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#1C4025]/50">후원자 수</p>
                <p className="text-lg sm:text-xl font-black text-[#1C4025] mt-1">
                  {pledgesCount}명
                </p>
              </div>
            </div>

            {/* 게이지 바 */}
            <div className="space-y-1">
              <div className="h-2.5 w-full bg-[#1C4025]/10 rounded-full overflow-hidden">
                <div
                  style={{ width: `${percent}%` }}
                  className="h-full bg-[#1C4025] rounded-full transition-all duration-700"
                />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-[#1C4025]/60">
                <span>목표 금액: {project.goal_amount.toLocaleString()}원</span>
                <span>마감까지 {daysLeft}</span>
              </div>
            </div>

            {/* 펀딩 참여 CTA 버튼 */}
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById('rewards-selection-section')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
                className="px-8 py-3.5 rounded-full bg-[#1C4025] text-[#d6f9b4] font-extrabold text-sm hover:bg-[#1C4025]/90 transition-all shadow-md"
              >
                리워드선택 및 후원하기
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 1-2. 프로젝트 소개 (Apple 스토리텔링 스타일) */}
      <section className="w-full py-20 border-b border-[#1C4025]/10 bg-white">
        <div className="mx-auto max-w-3xl px-4 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold tracking-widest text-[#c84b15] uppercase">
              PROJECT STORY
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1C4025]">
              프로젝트 소개
            </h2>
          </div>

          <div className="text-base sm:text-lg text-[#1C4025]/85 leading-relaxed font-light whitespace-pre-line space-y-6 font-eulyoo">
            {project.detail_story || project.description}
          </div>
        </div>
      </section>

      {/* 1-3. 책 상세 스펙 (애플 스타일 라운딩 그리드 카체) */}
      <section className="w-full py-20 border-b border-[#1C4025]/10 bg-[#F4F3EF]">
        <div className="mx-auto max-w-4xl px-4 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold tracking-widest text-[#1C4025]/60 uppercase">
              BOOK SPECIFICATIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1C4025]">
              책 상세 스펙
            </h2>
          </div>

          {/* 6개 스펙 라운딩 카드 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-[#1C4025]/10 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-[#1C4025]/50">도서 제목 & 부제</span>
              <p className="font-extrabold text-base text-[#1C4025]">{project.title}</p>
              <p className="text-xs text-[#1C4025]/70 font-light">{project.spec?.subtitle || project.subtitle || '-'}</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#1C4025]/10 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-[#1C4025]/50">판형 (규격)</span>
              <p className="font-extrabold text-base text-[#1C4025]">{project.spec?.size || '128 x 188 mm (B6 변형)'}</p>
              <p className="text-xs text-[#1C4025]/70 font-light">손에 쏙 들어오는 소장형 수제 사이즈</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#1C4025]/10 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-[#1C4025]/50">내지 / 표지 종이</span>
              <p className="font-extrabold text-base text-[#1C4025]">{project.spec?.paper_inner || '몽블랑 100g'}</p>
              <p className="text-xs text-[#1C4025]/70 font-light">표지: {project.spec?.paper_cover || '양장 천지원단'}</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#1C4025]/10 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-[#1C4025]/50">페이지 수 & 제본</span>
              <p className="font-extrabold text-base text-[#1C4025]">{project.spec?.pages || '220쪽 내외'}</p>
              <p className="text-xs text-[#1C4025]/70 font-light">제본: {project.spec?.binding || '양장본 (하드커버)'}</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#1C4025]/10 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-[#1C4025]/50">국제표준도서번호 (ISBN)</span>
              <p className="font-extrabold text-base text-[#1C4025]">{project.spec?.isbn || '979-11-984021-0-1'}</p>
              <p className="text-xs text-[#1C4025]/70 font-light">정식 서지정보 등록 완료</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#1C4025]/10 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-[#1C4025]/50">발간 & 배송 예정일</span>
              <p className="font-extrabold text-base text-[#1C4025]">마감 후 14일 이내</p>
              <p className="text-xs text-[#1C4025]/70 font-light">안전 에어캡 개별 팩 포장 발송</p>
            </div>
          </div>
        </div>
      </section>

      {/* 1-4 & 1-5. 저자 소개 및 출판사 소개 카드 */}
      <section className="w-full py-20 border-b border-[#1C4025]/10 bg-white">
        <div className="mx-auto max-w-4xl px-4 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold tracking-widest text-[#1C4025]/60 uppercase">
              CREATOR & PUBLISHER
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1C4025]">
              저자 및 출판사 소개
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 저자 카드 */}
            <div className="p-8 bg-[#F4F3EF] rounded-2xl border border-[#1C4025]/10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#1C4025] text-[#d6f9b4] flex items-center justify-center font-bold text-xl shadow-xs">
                  {creatorName.substring(0, 1)}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#c84b15]">저자 (Author)</span>
                  <h3 className="text-xl font-extrabold text-[#1C4025]">{creatorName}</h3>
                </div>
              </div>
              <p className="text-sm text-[#1C4025]/80 font-light leading-relaxed">
                {project.author_intro || '책에 마음을 담아 따뜻한 글로 세상을 잇는 창작 작가입니다.'}
              </p>
            </div>

            {/* 출판사 카드 */}
            <div className="p-8 bg-[#F4F3EF] rounded-2xl border border-[#1C4025]/10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#c84b15] text-white flex items-center justify-center font-bold text-xl shadow-xs">
                  {publisherName.substring(0, 1)}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#1C4025]/60">출판 브랜드 (Publisher)</span>
                  <h3 className="text-xl font-extrabold text-[#1C4025]">{publisherName}</h3>
                </div>
              </div>
              <p className="text-sm text-[#1C4025]/80 font-light leading-relaxed">
                {project.publisher_intro || '오직 종이의 수제 질감과 만듦새에 집중하는 소규모 크라우드펀딩 출판사입니다.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 1-6. 책 특징 (Apple 하이라이트 박스) */}
      <section className="w-full py-20 border-b border-[#1C4025]/10 bg-[#F4F3EF]">
        <div className="mx-auto max-w-4xl px-4 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold tracking-widest text-[#c84b15] uppercase">
              KEY HIGHLIGHTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1C4025]">
              책의 핵심 특징
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {(project.features || [
              { title: "양각 금박 양장본", description: "소장 가치를 극대화한 하드커버 고급 양장 제본", icon: "✨" },
              { title: "몽블랑 100g 수입지", description: "눈이 편안하고 가벼운 최고급 자연 미색지", icon: "📖" },
              { title: "4계절 일러스트 엽서", description: "전 수량 4계절 감성 일러스트 엽서 포함", icon: "🎨" },
              { title: "후원자 명단 헌정", description: "판권지에 모든 후원자 성함 소중히 인쇄", icon: "✒️" }
            ]).map((feat, idx) => (
              <div key={idx} className="p-6 bg-white rounded-2xl border border-[#1C4025]/10 shadow-2xs flex items-start gap-4">
                <span className="text-3xl">{feat.icon}</span>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-[#1C4025]">{feat.title}</h4>
                  <p className="text-xs text-[#1C4025]/75 font-light leading-relaxed">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2) 리워드 선택 (펀딩) 섹션 */}
      {/* ========================================================================= */}
      <section id="rewards-selection-section" className="w-full py-20 border-b border-[#1C4025]/10 bg-white">
        <div className="mx-auto max-w-4xl px-4 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold tracking-widest text-[#1C4025]/60 uppercase">
              SELECT REWARD
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1C4025]">
              리워드 선택 (펀딩)
            </h2>
            <p className="text-sm text-[#1C4025]/70 font-light max-w-md mx-auto">
              원하시는 리워드 구성 옵션을 선택하여 예약을 완료해 주세요.<br />
              마감일까지 모금 목표가 달성되면 후원이 최종 승인됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                onClick={() => handleSelectReward(reward)}
                className="p-8 bg-[#F4F3EF] rounded-2xl border border-[#1C4025]/15 hover:border-[#1C4025] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black text-[#1C4025]">
                      {reward.price.toLocaleString()}원
                    </span>
                    <span className="text-xs font-extrabold text-[#c84b15] group-hover:underline">
                      후원하기 →
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#1C4025] group-hover:text-[#c84b15] transition-colors">
                    {reward.title}
                  </h3>
                  <p className="text-xs text-[#1C4025]/80 font-light leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                <Button className="w-full py-3 bg-[#1C4025] text-[#d6f9b4] hover:bg-[#1C4025]/90 text-xs font-bold rounded-xl shadow-xs">
                  이 리워드로 후원 참여하기
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3) 소식 및 소통 섹션 (게시판 형태) */}
      {/* ========================================================================= */}
      <section className="w-full py-20 bg-[#F4F3EF]">
        <div className="mx-auto max-w-4xl px-4 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold tracking-widest text-[#c84b15] uppercase">
              NEWS & COMMUNITY
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1C4025]">
              소식 및 소통
            </h2>
            <p className="text-sm text-[#1C4025]/70 font-light">
              창작자의 최신 제작 소식과 후원자분들의 문의글을 함께 나누는 공간입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 3-1. 창작자 소식 게시판 */}
            <div className="bg-white rounded-2xl p-6 border border-[#1C4025]/10 space-y-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#1C4025]/10 pb-4">
                <h3 className="font-extrabold text-base text-[#1C4025] flex items-center gap-2">
                  📢 창작자 새소식
                </h3>
                <span className="text-xs font-bold text-[#c84b15]">최신 1건</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#F4F3EF] rounded-xl space-y-2 text-xs border border-[#1C4025]/10">
                  <div className="flex justify-between text-[#1C4025]/50 font-bold">
                    <span className="text-[#c84b15]">[공지] 오픈 인사</span>
                    <span>2026.07.28</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#1C4025]">
                    🎉 《{project.title}》 프로젝트가 성공적으로 오픈되었습니다!
                  </h4>
                  <p className="text-[#1C4025]/80 font-light leading-relaxed">
                    많은 후원과 관심에 깊이 감사드립니다. 정성스런 제작 과정과 도서 감리 현장을 소식 탭을 통해 지속적으로 공유해 드리겠습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 3-2. 후원자 문의 & Q&A 게시판 */}
            <div className="bg-white rounded-2xl p-6 border border-[#1C4025]/10 space-y-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#1C4025]/10 pb-4">
                <h3 className="font-extrabold text-base text-[#1C4025] flex items-center gap-2">
                  💬 후원자 문의 & Q&A
                </h3>
                <span className="text-xs font-bold text-[#1C4025]/60">총 {qaList.length}건</span>
              </div>

              {/* 문의 작성 폼 */}
              <form onSubmit={handleAddQuestion} className="space-y-3 bg-[#F4F3EF] p-4 rounded-xl">
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="창작자에게 도서나 배송 관련 문의를 남겨주세요."
                  className="w-full p-3 rounded-lg border border-[#1C4025]/20 text-xs focus:outline-none focus:ring-1 focus:ring-[#1C4025] bg-white"
                  rows={2}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1C4025] text-[#d6f9b4] rounded-lg text-xs font-bold hover:bg-[#1C4025]/90 transition-all"
                  >
                    문의 남기기
                  </button>
                </div>
              </form>

              {/* Q&A 목록 */}
              <div className="space-y-3">
                {qaList.map((qa) => (
                  <div key={qa.id} className="p-4 border border-[#1C4025]/10 rounded-xl space-y-2 text-xs">
                    <div className="font-extrabold text-[#1C4025] flex justify-between">
                      <span>Q. {qa.content}</span>
                      <span className="text-[#1C4025]/40 font-normal">{qa.author}</span>
                    </div>
                    <div className="pl-3 border-l-2 border-[#1C4025]/30 text-[#1C4025]/80 pt-1">
                      <span className="font-bold text-[#c84b15]">A. </span>
                      <span>{qa.answer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 모바일 하단 Floating CTA 바 */}
      <MobileFloatingCTA
        status={project.status || 'live'}
        percent={realPercent}
        priceRange={minPrice}
        onPledgeClick={handleFloatingCTAClick}
      />

      {/* 가상 예약결제 및 배송 정보 입력 Dialog 모달 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white text-[#1C4025]">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-[#1C4025]">
              후원금 설정 및 배송 정보 입력
            </DialogTitle>
            <DialogDescription className="text-xs text-[#1C4025]/70">
              선택한 리워드: <strong className="text-[#1C4025] font-bold">{selectedReward?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePledgeSubmit} className="space-y-4 pt-2">
            {errorMsg && (
              <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* 후원 금액 */}
            <div className="grid gap-1.5">
              <Label htmlFor="amount" className="text-xs font-bold">후원할 최종 금액 (원)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={loading}
                className="text-xs border-[#1C4025]/20 focus:ring-[#1C4025]"
              />
              <p className="text-[10px] text-[#1C4025]/50">
                최소 금액: {selectedReward?.price.toLocaleString()}원 (원하는 경우 금액을 높여 추가 후원 가능)
              </p>
            </div>

            {/* 수령인 */}
            <div className="grid gap-1.5">
              <Label htmlFor="shippingName" className="text-xs font-bold">수령인 실명</Label>
              <Input
                id="shippingName"
                placeholder="홍길동"
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                required
                disabled={loading}
                className="text-xs border-[#1C4025]/20 focus:ring-[#1C4025]"
              />
            </div>

            {/* 연락처 */}
            <div className="grid gap-1.5">
              <Label htmlFor="shippingPhone" className="text-xs font-bold">수령인 연락처</Label>
              <Input
                id="shippingPhone"
                placeholder="010-1234-5678"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                required
                disabled={loading}
                className="text-xs border-[#1C4025]/20 focus:ring-[#1C4025]"
              />
            </div>

            {/* 주소 */}
            <div className="grid gap-1.5">
              <Label htmlFor="shippingAddress" className="text-xs font-bold">상세 배송 주소</Label>
              <textarea
                id="shippingAddress"
                rows={3}
                placeholder="우편번호와 함께 도로명 주소 또는 지번 상세 주소를 입력하세요."
                className="w-full rounded-md border border-[#1C4025]/20 bg-white p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#1C4025]"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <DialogFooter className="pt-4 border-t border-[#1C4025]/10 gap-2">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={loading} className="text-xs">
                취소
              </Button>
              <Button type="submit" disabled={loading} className="bg-[#1C4025] text-[#d6f9b4] hover:bg-[#1C4025]/90 text-xs font-bold">
                {loading ? '예약결제 처리 중...' : '가상 예약결제 완료'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
