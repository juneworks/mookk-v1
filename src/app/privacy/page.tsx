import NoticeLayout from '@/components/NoticeLayout'

export const metadata = {
  title: '개인정보 처리방침 - MOOKK 알립니다',
  description: 'MOOKK 이용자의 개인정보 수집, 이용 및 보호 조치에 관한 안내입니다.',
}

export default function PrivacyPage() {
  return (
    <NoticeLayout currentTab="privacy">
      <div className="space-y-6">
        <div className="border-b border-[#1C4025]/15 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C4025]">
            개인정보 처리방침
          </h1>
          <p className="text-xs sm:text-sm text-[#1C4025]/70 mt-1">
            MOOKK 서비스가 이용자의 개인정보를 어떻게 수집, 이용하고 보호하는지 알려드립니다.
          </p>
        </div>

        <div className="bg-white rounded-none p-6 border border-black/5 space-y-6 text-xs sm:text-sm text-[#1C4025]/90 leading-relaxed shadow-2xs">
          <div>
            <h2 className="font-bold text-base text-[#1C4025] mb-2">1. 수집하는 개인정보 항목</h2>
            <p className="text-neutral-600">
              회사는 회원가입, 후원 및 리워드 배송, 창작자 정산 서비스 제공을 위해 최소한의 개인정보(이메일, 이름, 연락처, 배송지 주소)를 수집합니다.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-base text-[#1C4025] mb-2">2. 개인정보의 수집 및 이용 목적</h2>
            <p className="text-neutral-600">
              수집된 개인정보는 후원 예약 내역 관리, 펀딩 성공 시 리워드 상품 배송, 창작자 서비스 이용자 확인 및 고객 문의 응대를 위해 사용됩니다.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-base text-[#1C4025] mb-2">3. 개인정보의 보유 및 파기</h2>
            <p className="text-neutral-600">
              이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기하며, 관계법령에 의해 보존할 필요가 있는 경우 지정된 기간 동안 보관합니다.
            </p>
          </div>
        </div>
      </div>
    </NoticeLayout>
  )
}
