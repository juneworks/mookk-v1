'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import NoticeLayout from '@/components/NoticeLayout'
import { NoticeItem, getNoticeById, deleteLocalNotice, checkAdminStatus } from '@/data/noticesData'

export default function BoardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [notice, setNotice] = useState<NoticeItem | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const item = getNoticeById(id)
    if (item) {
      setNotice(item)
    }
    
    // 관리자 권한 확인
    checkAdminStatus().then((admin) => {
      setIsAdmin(admin)
      setLoading(false)
    })
  }, [id])

  // 공지사항 삭제 핸들러 (관리자 전용)
  const handleDelete = () => {
    if (!isAdmin) {
      alert('관리자만 삭제할 수 있습니다.')
      return
    }
    if (window.confirm('정말 이 공지글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.')) {
      deleteLocalNotice(id)
      alert('공지글이 삭제되었습니다.')
      router.push('/board')
    }
  }

  if (loading) {
    return (
      <NoticeLayout currentTab="notice">
        <div className="py-20 text-center text-sm font-medium text-neutral-400">
          불러오는 중...
        </div>
      </NoticeLayout>
    )
  }

  if (!notice) {
    return (
      <NoticeLayout currentTab="notice">
        <div className="py-20 text-center space-y-4">
          <p className="text-base font-bold text-neutral-600">존재하지 않거나 삭제된 공지글입니다.</p>
          <Link
            href="/board"
            className="inline-block bg-black text-white px-5 py-2 text-xs font-bold rounded-none hover:bg-neutral-800"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </NoticeLayout>
    )
  }

  return (
    <NoticeLayout currentTab="notice">
      <div className="w-full bg-white p-6 sm:p-10 border border-black/5 shadow-2xs">
        {/* 상단 얇은 라인 */}
        <div className="border-t border-neutral-200 w-full" />

        {/* 글 헤더 영역 */}
        <div className="py-6 sm:py-8 border-b border-neutral-200">
          <div className="text-xs text-neutral-400 font-medium mb-1.5">
            {notice.category || '공지'}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight mb-3">
            {notice.title}
          </h1>
          <div className="text-xs text-neutral-400 font-medium">
            {notice.date}
          </div>
        </div>

        {/* 글 본문 영역 */}
        <div className="py-8 sm:py-12 min-h-[260px] text-sm sm:text-base text-neutral-700 leading-relaxed whitespace-pre-line border-b border-neutral-300">
          {notice.content}
        </div>

        {/* 하단 액션 버튼 영역: 관리자일 때 수정/삭제 + 목록으로 */}
        <div className="flex items-center justify-between pt-6">
          {/* 관리자 전용 수정/삭제 버튼 */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/board/edit/${notice.id}`}
                className="inline-block bg-neutral-100 text-neutral-700 hover:bg-neutral-200 px-4 py-2 text-xs sm:text-sm font-bold rounded-none transition-colors"
              >
                수정
              </Link>
              <button
                onClick={handleDelete}
                className="inline-block bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 text-xs sm:text-sm font-bold rounded-none transition-colors cursor-pointer"
              >
                삭제
              </button>
            </div>
          ) : (
            <div />
          )}

          {/* 목록으로 버튼 */}
          <Link
            href="/board"
            className="inline-block bg-black text-white px-6 py-2.5 text-xs sm:text-sm font-bold tracking-tight rounded-none hover:bg-neutral-800 transition-colors shadow-2xs"
          >
            목록으로
          </Link>
        </div>
      </div>
    </NoticeLayout>
  )
}
