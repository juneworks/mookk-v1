'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import NoticeLayout from '@/components/NoticeLayout'
import { NoticeItem, getLocalNotices, checkAdminStatus } from '@/data/noticesData'

const ITEMS_PER_PAGE = 10

export default function BoardPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. 공지사항 데이터 불러오기 (샘플 글 삭제 상태 확인)
    const list = getLocalNotices()
    setNotices(list)
    setLoading(false)

    // 2. 관리자 권한 확인
    checkAdminStatus().then((admin) => {
      setIsAdmin(admin)
    })
  }, [])

  // 페이지네이션 계산
  const totalPages = Math.ceil(notices.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentNotices = notices.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <NoticeLayout currentTab="notice">
      <div className="w-full bg-white p-6 sm:p-10 border border-black/5 shadow-2xs">
        {/* 상단 얇은 라인 */}
        <div className="border-t border-neutral-200 w-full" />

        {/* 게시글 목록 또는 빈 상태 */}
        {loading ? (
          <div className="py-24 text-center text-sm font-medium text-neutral-400">
            불러오는 중...
          </div>
        ) : notices.length === 0 ? (
          <div className="py-24 sm:py-32 text-center">
            <p className="text-sm sm:text-base font-bold text-neutral-400">
              등록된 공지 및 안내 글이 없습니다.
            </p>
            {isAdmin && (
              <p className="text-xs text-neutral-400 mt-2">
                우측 하단의 [글쓰기] 버튼을 눌러 첫 번째 공지사항을 등록해 보세요.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {currentNotices.map((notice) => {
              const formattedNumber = String(notice.id).padStart(2, '0')
              return (
                <div
                  key={notice.id}
                  className="py-6 px-2 sm:px-4 flex items-start gap-4 sm:gap-8 group hover:bg-black/[0.015] transition-colors"
                >
                  {/* 1. 번호 (05, 04 등 2자리 숫자) */}
                  <div className="w-8 sm:w-10 shrink-0 text-sm sm:text-base font-bold text-neutral-400 pt-5">
                    {formattedNumber}
                  </div>

                  {/* 2. 본문 내용 (카테고리 + 제목 + 날짜) */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] sm:text-xs text-neutral-400 font-medium mb-1 tracking-tight">
                      {notice.category || '공지'}
                    </div>
                    <Link
                      href={`/board/${notice.id}`}
                      className="block group-hover:text-[#1C4025] transition-colors"
                    >
                      <h2 className="text-base sm:text-[17px] font-bold text-neutral-900 leading-snug tracking-tight mb-2 hover:underline">
                        {notice.title}
                      </h2>
                    </Link>
                    <div className="text-xs text-neutral-400 font-normal">
                      {notice.date}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 하단 얇은 라인 */}
        <div className="border-b border-neutral-300 w-full" />

        {/* 하단 영역: 페이지네이션(중앙) + 관리자 전용 글쓰기 버튼(우측) */}
        <div className="relative flex items-center justify-center pt-8 pb-4 mt-2">
          {/* 페이지네이션 버튼 (공지글이 있을 때만 표시) */}
          {notices.length > 0 && (
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-1 cursor-pointer transition-colors ${
                  currentPage === 1 ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-600 hover:text-black'
                }`}
                aria-label="이전 페이지"
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = currentPage === pageNum
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-6 h-6 flex items-center justify-center cursor-pointer transition-all ${
                      isActive
                        ? 'font-black text-black text-sm sm:text-base'
                        : 'font-normal text-neutral-400 hover:text-neutral-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-1 cursor-pointer transition-colors ${
                  currentPage === totalPages ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-600 hover:text-black'
                }`}
                aria-label="다음 페이지"
              >
                &gt;
              </button>
            </div>
          )}

          {/* 관리자 전용 글쓰기 버튼 (관리자 로그인 시에만 노출) */}
          {isAdmin && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <Link
                href="/board/write"
                className="inline-block bg-black text-white px-5 py-2.5 text-xs sm:text-sm font-bold tracking-tight rounded-none hover:bg-neutral-800 transition-colors shadow-2xs"
              >
                글쓰기
              </Link>
            </div>
          )}
        </div>
      </div>
    </NoticeLayout>
  )
}
