import NoticeLayout from '@/components/NoticeLayout'

export const metadata = {
  title: '공지 및 안내 - MOOKK 알립니다',
  description: 'MOOKK 크라우드펀딩 플랫폼의 주요 공지 및 소식을 안내해 드립니다.',
}

export default function NoticePage() {
  const notices = [
    { id: 1, title: 'MOOKK 크라우드펀딩 베타 서비스 정식 오픈 안내', date: '2026.07.29', category: '안내' },
    { id: 2, title: '창작자 수수료 통합 8.0% (플랫폼+PG, VAT 포함) 정책 시행', date: '2026.07.25', category: '정책' },
    { id: 3, title: '종이책 독립 출판 프로젝트 1차 작가 모집 (~8/31 마감)', date: '2026.07.20', category: '이벤트' },
  ]

  return (
    <NoticeLayout currentTab="notice">
      <div className="space-y-6">
        <div className="border-b border-[#1C4025]/15 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C4025]">
            공지 및 안내
          </h1>
          <p className="text-xs sm:text-sm text-[#1C4025]/70 mt-1">
            MOOKK 서비스 업데이트, 주요 이벤트 및 플랫폼 안내 소식입니다.
          </p>
        </div>

        <div className="bg-white rounded-none border border-black/5 divide-y divide-black/5 shadow-2xs overflow-hidden">
          {notices.map((n) => (
            <div key={n.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F0EEE9]/40 transition-colors">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#c84b15] bg-[#c84b15]/10 px-2.5 py-0.5 rounded-md inline-block">
                  {n.category}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-[#1C4025] hover:underline cursor-pointer">
                  {n.title}
                </h3>
              </div>
              <span className="text-xs text-neutral-400 font-medium shrink-0">
                {n.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </NoticeLayout>
  )
}
