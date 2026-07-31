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

        <div className="bg-white rounded-none p-6 border border-black/5 space-y-6 text-xs sm:text-sm text-[#1C4025]/90 leading-relaxed shadow-2xs">
          <div>
            <h2 className="font-bold text-base text-[#1C4025] mb-2">제 1 조 (목적)</h2>
            <p className="text-neutral-600">
              본 약관은 MOOKK(이하 "회사")이 제공하는 종이책 크라우드펀딩 플랫폼 및 관련 제반 서비스의 이용 조건과 절차, 회원과 회사 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-base text-[#1C4025] mb-2">제 2 조 (용어의 정의)</h2>
            <ul className="list-disc list-inside space-y-1 text-neutral-600">
              <li>"프로젝트"라 함은 창작자가 종이책 출판을 목적으로 개설한 펀딩 캠페인을 의미합니다.</li>
              <li>"후원자"라 함은 프로젝트의 목표 달성을 위해 예약 결제를 신청한 회원을 의미합니다.</li>
              <li>"창작자"라 함은 도서 제작 및 배송의 최종 책임을 지고 프로젝트를 등록한 회원을 의미합니다.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-base text-[#1C4025] mb-2">제 3 조 (예약 결제 및 환불)</h2>
            <p className="text-neutral-600">
              후원 예약 시점에는 실제 결제가 발생하지 않으며, 모집 마감일까지 목표 금액(100%)을 도달할 경우에만 일괄 배치 결제가 수행됩니다. 마감 전 언제든지 마이페이지에서 취소가 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </NoticeLayout>
  )
}
