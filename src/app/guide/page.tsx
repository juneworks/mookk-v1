import NoticeLayout from '@/components/NoticeLayout'

export const metadata = {
  title: '창작가 가이드 - MOOKK 알립니다',
  description: 'MOOKK에서 나만의 종이책 크라우드펀딩 프로젝트를 성공시키는 가이드입니다.',
}

export default function GuidePage() {
  return (
    <NoticeLayout currentTab="guide">
      <div className="space-y-6">
        <div className="border-b border-[#1C4025]/15 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C4025]">
            창작가 가이드
          </h1>
          <p className="text-xs sm:text-sm text-[#1C4025]/70 mt-1">
            원고 작성부터 인쇄, 리워드 펀딩까지 성공적인 출판을 돕는 단계별 안내 가이드입니다.
          </p>
        </div>

        <div className="bg-white rounded-none h-[400px] flex items-center justify-center border border-black/5 text-center shadow-2xs">
          <p className="text-base sm:text-lg font-bold text-neutral-500">
            준비 중입니다.
          </p>
        </div>
      </div>
    </NoticeLayout>
  )
}
