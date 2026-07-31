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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-5 bg-white rounded-none border border-black/5 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-[#c84b15]">STEP 1</span>
            <h3 className="text-base font-bold text-[#1C4025]">원고 준비 & 사양 결정</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              판형(예: 128x188mm B6), 내지 용지(몽블랑/모조지), 제본 방식(무선/양장)을 정하고 표지 아트워크를 준비합니다.
            </p>
          </div>

          <div className="p-5 bg-white rounded-none border border-black/5 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-[#c84b15]">STEP 2</span>
            <h3 className="text-base font-bold text-[#1C4025]">프로젝트 등록 & 심사</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              도서 스토리, 저자 소개, 리워드 구성(도서 1권 + 엽서 set 등) 및 목표 금액을 입력하여 제출합니다.
            </p>
          </div>

          <div className="p-5 bg-white rounded-none border border-black/5 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-[#c84b15]">STEP 3</span>
            <h3 className="text-base font-bold text-[#1C4025]">펀딩 마케팅 & 후원 유치</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              펀딩 기간(보통 30일) 동안 SNS 소통 및 커뮤니티 새소식을 통해 후원자들과 활발히 교류합니다.
            </p>
          </div>

          <div className="p-5 bg-white rounded-none border border-black/5 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-[#c84b15]">STEP 4</span>
            <h3 className="text-base font-bold text-[#1C4025]">목표 달성 & 배송 수행</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              목표 100% 달성 시 배치 결제가 진행되며, 정산금을 받아 도서 제작 후 후원자에게 배송을 완료합니다.
            </p>
          </div>
        </div>
      </div>
    </NoticeLayout>
  )
}
