'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import NoticeLayout from '@/components/NoticeLayout'
import { getNoticeById, updateLocalNotice, checkAdminStatus } from '@/data/noticesData'

const CATEGORIES = ['공지', '안내', '이벤트', '정책']

export default function BoardEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [category, setCategory] = useState('공지')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. 관리자 권한 확인
    checkAdminStatus().then((admin) => {
      if (!admin) {
        alert('공지 및 안내 글 수정은 관리자만 이용할 수 있습니다.')
        router.replace('/board')
        return
      }
      setIsAdmin(true)

      // 2. 기존 공지글 데이터 로드
      if (id) {
        const item = getNoticeById(id)
        if (item) {
          setCategory(item.category || '공지')
          setTitle(item.title)
          setContent(item.content)
        } else {
          alert('존재하지 않는 공지글입니다.')
          router.replace('/board')
          return
        }
      }
      setLoading(false)
    })
  }, [id, router])

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
    const updated = updateLocalNotice(id, {
      category,
      title: title.trim(),
      content: content.trim()
    })

    if (updated) {
      alert('공지글이 성공적으로 수정되었습니다.')
      router.push(`/board/${id}`)
    } else {
      alert('공지글 수정에 실패했습니다.')
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <NoticeLayout currentTab="notice">
        <div className="py-24 text-center text-sm font-medium text-neutral-400">
          공지글 정보를 불러오는 중...
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
            공지 및 안내 글 수정
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            등록된 공지사항의 제목, 카테고리 또는 본문 내용을 수정합니다.
          </p>
        </div>

        {/* 수정 폼 */}
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

          {/* 하단 액션 버튼 (취소 / 수정완료) */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href={`/board/${id}`}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white px-6 py-2.5 text-xs sm:text-sm font-bold rounded-none hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? '수정 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </NoticeLayout>
  )
}
