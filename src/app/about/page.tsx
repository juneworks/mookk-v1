import NoticeLayout from '@/components/NoticeLayout'

export const metadata = {
  title: 'MOOKK 소개 - MOOKK 알립니다',
  description: '종이의 질감과 만듦새에 집중하는 크라우드펀딩 출판 플랫폼 MOOKK을 소개합니다.',
}

export default function AboutPage() {
  return (
    <NoticeLayout currentTab="about">
      <div className="space-y-6">
        <div className="border-b border-[#1C4025]/15 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C4025]">
            MOOKK 소개
          </h1>
          <p className="text-xs sm:text-sm text-[#1C4025]/70 mt-1">
            MOOKK은 디지털 시대 속에서도 변함없는 가치를 지닌 '종이책'만을 위한 전용 크라우드펀딩 출판 플랫폼입니다.
          </p>
        </div>

        {/* 브랜드 철학 카드 */}
        <div className="bg-white p-6 sm:p-8 rounded-none border border-black/5 space-y-3 shadow-2xs">
          <h2 className="text-xl font-extrabold text-[#1C4025]">
            "책으로 묶는 중입니다"
          </h2>
          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
            손끝으로 느껴지는 종이의 질감, 인쇄 냄새, 그리고 한 장 한 장 넘기는 다정한 순간들. MOOKK은 작가와 독자가 함께 종이책이라는 실물 형태의 꿈을 현실로 만들어가는 과정을 함께합니다.
          </p>
        </div>

        {/* 핵심 서비스 특징 3가지 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 border border-[#1C4025]/10 rounded-none space-y-2 bg-white shadow-2xs">
            <div className="text-2xl">📚</div>
            <h3 className="font-bold text-sm sm:text-base text-[#1C4025]">오직 종이책 전용</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              전자책이나 디지털 파일이 아닌, 실제로 손에 쥐어지는 종이 출판물에만 특화된 펀딩 환경을 제공합니다.
            </p>
          </div>
          <div className="p-5 border border-[#1C4025]/10 rounded-none space-y-2 bg-white shadow-2xs">
            <div className="text-2xl">✍️</div>
            <h3 className="font-bold text-sm sm:text-base text-[#1C4025]">독립 작가 파트너</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              기성 출판사의 진입 장벽 없이 누구나 자신만의 원고로 독자들을 만나 후원을 유치할 수 있습니다.
            </p>
          </div>
          <div className="p-5 border border-[#1C4025]/10 rounded-none space-y-2 bg-white shadow-2xs">
            <div className="text-2xl">🌱</div>
            <h3 className="font-bold text-sm sm:text-base text-[#1C4025]">투명한 결제 & 정산</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              목표 금액 100% 달성 시에만 일괄 결제가 수행되는 안전한 예약결제 및 합리적인 수수료 구조입니다.
            </p>
          </div>
        </div>

        {/* 하단 베타 운영 안내 문구 */}
        <div className="pt-10 pb-16 sm:pb-24 text-center">
          <p className="text-sm sm:text-base font-bold text-[#C84C15] tracking-tight">
            현재 MOOKK 서비스는 베타 버전으로 운영 중입니다
          </p>
        </div>
      </div>
    </NoticeLayout>
  )
}
