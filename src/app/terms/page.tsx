import NoticeLayout from '@/components/NoticeLayout'

export const metadata = {
  title: '약관 및 정책 - MOOKK 알립니다',
  description: 'MOOKK 크라우드펀딩 서비스 이용 약관 및 정책 안내입니다.',
}

export default function TermsPage() {
  return (
    <NoticeLayout currentTab="terms">
      <div className="space-y-6">
        <div className="border-b border-[#1C4025]/15 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C4025]">
            약관 및 정책
          </h1>
          <p className="text-xs sm:text-sm text-[#1C4025]/70 mt-1">
            MOOKK 서비스 이용과 관련된 기본 약관 및 창작자/후원자 정책 안내입니다.
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
