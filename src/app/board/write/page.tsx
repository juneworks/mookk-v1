'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NoticeLayout from '@/components/NoticeLayout'
import { saveLocalNotice, checkAdminStatus } from '@/data/noticesData'

const CATEGORIES = ['공지', '안내', '이벤트', '정책']

export default function BoardWritePage() {
  const router = useRouter()
  const [category, setCategory] = useState('공지')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    // 관리자 권한 확인
    checkAdminStatus().then((admin) => {
      if (!admin) {
        alert('공지 및 안내 글 작성은 관리자만 이용할 수 있습니다.')
        router.replace('/board')
      } else {
        setIsAdmin(true)
        setCheckingAuth(false)
      }
    })
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) {
      alert('관리자 권한이 필요합니다.')
      return
    }
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    const newNotice = saveLocalNotice({
      category,
      title: title.trim(),
      content: content.trim()
    })

    alert('공지글이 정상적으로 등록되었습니다.')
    router.push(`/board/${newNotice.id}`)
  }

  if (checkingAuth) {
    return (
      <NoticeLayout currentTab="notice">
        <div className="py-24 text-center text-sm font-medium text-neutral-400">
          관리자 권한을 확인하는 중...
        </div>
      </NoticeLayout>
    )
  }

  return (
    <NoticeLayout currentTab="notice">
      <div className="w-full bg-white p-6 sm:p-10 border border-black/5 shadow-2xs">
        {/* 상단 얇은 라인 */}
        <div className="border-t border-neutral-200 w-full" />

        {/* 상단 타이틀 */}
        <div className="py-6 border-b border-neutral-200">
          <div className="inline-block bg-black text-white text-[10px] font-bold px-2 py-0.5 mb-2">
            관리자 전용
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight">
            공지 및 안내 글 작성
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            MOOKK 서비스의 새로운 공지사항 또는 안내 소식을 등록합니다.
          </p>
        </div>

        {/* 작성 폼 */}
        <form onSubmit={handleSubmit} className="py-8 space-y-6">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">
              카테고리
            </label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 입력 */}
          <div>
            <label htmlFor="title" className="block text-xs font-bold text-neutral-700 mb-2">
              제목
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지사항 제목을 입력하세요"
              className="w-full px-4 py-3 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-black rounded-none transition-colors"
              required
            />
          </div>

          {/* 본문 입력 */}
          <div>
            <label htmlFor="content" className="block text-xs font-bold text-neutral-700 mb-2">
              내용
            </label>
            <textarea
              id="content"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지 및 안내 내용을 입력하세요"
              className="w-full px-4 py-3 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-black rounded-none resize-y transition-colors leading-relaxed"
              required
            />
          </div>

          {/* 하단 구분선 */}
          <div className="border-b border-neutral-300 pt-4" />

          {/* 하단 액션 버튼 (취소 / 등록) */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/board"
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white px-6 py-2.5 text-xs sm:text-sm font-bold rounded-none hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </NoticeLayout>
  )
}
