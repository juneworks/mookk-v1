'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'

interface RewardInput {
  tempId: string
  title: string
  price: string
  description: string
}

export default function CreateProjectPage() {
  const router = useRouter()
  const supabase = createClient()

  // 권한 및 세션 검증 상태
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // 프로젝트 정보 입력 상태
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)

  // 리워드 정보 입력 상태 (기본 1개 뼈대)
  const [rewards, setRewards] = useState<RewardInput[]>([
    { tempId: 'init-1', title: '', price: '', description: '' }
  ])

  // 창작자 권한 및 로그인 세션 체크
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          alert('로그인이 필요한 페이지입니다. 로그인 페이지로 이동합니다.')
          router.push('/login')
          return
        }

        // User 테이블에서 역할 조회
        const { data: profile, error } = await supabase
          .from('User')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error || !profile || profile.role !== 'creator') {
          alert('프로젝트 등록은 창작자(저자) 권한이 있는 계정만 가능합니다.')
          router.push('/')
          return
        }

        setUserId(user.id)
        setCheckingAuth(false)
      } catch (err) {
        console.error('Auth verification check failed:', err)
        router.push('/')
      }
    }
    checkAuth()
  }, [supabase, router])

  // 리워드 필드 동적 추가
  const addReward = () => {
    setRewards([
      ...rewards,
      { tempId: `reward-${Date.now()}-${Math.random()}`, title: '', price: '', description: '' }
    ])
  }

  // 리워드 필드 삭제 (최소 1개 이상 유지)
  const removeReward = (tempId: string) => {
    if (rewards.length <= 1) {
      alert('최소 1개 이상의 리워드가 필요합니다.')
      return
    }
    setRewards(rewards.filter((r) => r.tempId !== tempId))
  }

  // 리워드 필드 값 변경 핸들러
  const handleRewardChange = (tempId: string, field: keyof RewardInput, value: string) => {
    setRewards(
      rewards.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    )
  }

  // 프로젝트 등록 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setSubmitting(true)
    setErrorMsg(null)

    // 기본적인 폼 검증
    if (!title.trim() || !description.trim() || !goalAmount || !deadline || !coverImage) {
      setErrorMsg('모든 필수 항목을 입력하고 커버 이미지를 업로드해 주세요.')
      setSubmitting(false)
      return
    }

    // 리워드 검증
    for (const r of rewards) {
      if (!r.title.trim() || !r.price || !r.description.trim()) {
        setErrorMsg('모든 리워드의 제목, 금액, 설명을 작성해 주세요.')
        setSubmitting(false)
        return
      }
    }

    try {
      // 1. Supabase Storage에 이미지 파일 업로드
      // 버킷명: project-covers
      const fileExt = coverImage.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('project-covers')
        .upload(fileName, coverImage, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`이미지 업로드 실패: ${uploadError.message}`)
      }

      // Public URL 획득
      const { data: { publicUrl } } = supabase.storage
        .from('project-covers')
        .getPublicUrl(fileName)

      // 2. Project 테이블 인서트 (디폴트: status = 'draft')
      const { data: newProject, error: projectError } = await supabase
        .from('Project')
        .insert({
          creator_id: userId,
          title: title.trim(),
          description: description.trim(),
          goal_amount: parseInt(goalAmount, 10),
          current_amount: 0,
          status: 'draft',
          deadline: new Date(deadline).toISOString(),
          cover_image_url: publicUrl
        })
        .select()
        .single()

      if (projectError || !newProject) {
        throw new Error(`프로젝트 데이터 저장 실패: ${projectError?.message}`)
      }

      // 3. Reward 테이블 인서트
      const rewardsPayload = rewards.map((r) => ({
        project_id: newProject.id,
        title: r.title.trim(),
        price: parseInt(r.price, 10),
        description: r.description.trim()
      }))

      const { error: rewardsError } = await supabase
        .from('Reward')
        .insert(rewardsPayload)

      if (rewardsError) {
        // 프로젝트 삭제는 실서버 롤백 대안
        await supabase.from('Project').delete().eq('id', newProject.id)
        throw new Error(`리워드 데이터 저장 실패: ${rewardsError.message}`)
      }

      alert('프로젝트 등록(초안 저장)이 완료되었습니다! 관리자 승인 후 라이브 전환됩니다.')
      
      // 마이페이지 또는 홈으로 이동
      router.push('/mypage')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || '프로젝트 등록 과정 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <div className="text-zinc-500 animate-pulse text-sm">창작자 권한 확인 중...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          새로운 도서 프로젝트 등록
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          종이책 출판을 위한 첫 발걸음. 책의 정보와 후원자들에게 전달할 멋진 리워드를 설계해 주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 에러 메시지 알림 */}
        {errorMsg && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
            {errorMsg}
          </div>
        )}

        {/* 1. 도서 기본 정보 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>1. 도서 기본 정보</CardTitle>
            <CardDescription>출판할 책의 기본 기획서 정보를 입력합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">프로젝트 제목</Label>
              <Input
                id="title"
                placeholder="책의 개성을 보여줄 매력적인 제목을 입력하세요."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">책 상세 소개 및 줄거리</Label>
              <textarea
                id="description"
                rows={5}
                placeholder="도서 기획 의도, 시놉시스, 작가 소개 등을 자세히 적어 독자들을 매료시켜 보세요."
                className="flex w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-zinc-500 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="goalAmount">목표 펀딩 금액 (원)</Label>
                <Input
                  id="goalAmount"
                  type="number"
                  placeholder="예: 3000000"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">펀딩 마감일</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="coverImage">책 표지 또는 홍보 이미지 (필수)</Label>
              <Input
                id="coverImage"
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                required
                disabled={submitting}
              />
              <p className="text-[11px] text-zinc-400">
                권장 비율: 4:3 비율의 가로 이미지를 업로드해 주세요.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 2. 리워드 설계 섹션 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>2. 후원 리워드 설계</CardTitle>
              <CardDescription>후원 금액별 독자들에게 증정할 리워드 세트 목록입니다.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addReward} disabled={submitting}>
              <Plus className="h-4 w-4 mr-1" />
              리워드 추가
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {rewards.map((reward, index) => (
              <div
                key={reward.tempId}
                className="relative p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-4"
              >
                {/* 리워드 삭제 버튼 */}
                <div className="absolute top-4 right-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => removeReward(reward.tempId)}
                    disabled={submitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-300">
                  리워드 #{index + 1}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 grid gap-2">
                    <Label>리워드 세트 명</Label>
                    <Input
                      placeholder="예: [얼리버드] 단행본 1권 + 엽서 세트"
                      value={reward.title}
                      onChange={(e) => handleRewardChange(reward.tempId, 'title', e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>최소 후원 가격 (원)</Label>
                    <Input
                      type="number"
                      placeholder="예: 25000"
                      value={reward.price}
                      onChange={(e) => handleRewardChange(reward.tempId, 'price', e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>리워드 구성품 상세 설명</Label>
                  <Input
                    placeholder="리워드 구성품을 쉼표(,) 등으로 나열해 주시거나 추가 상세 설명을 적어주세요."
                    value={reward.description}
                    onChange={(e) => handleRewardChange(reward.tempId, 'description', e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/')}
              disabled={submitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '프로젝트 등록 중...' : '프로젝트 등록 (초안 저장)'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
