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

        <div className="bg-white rounded-none h-[400px] flex items-center justify-center border border-black/5 text-center shadow-2xs">
          <p className="text-base sm:text-lg font-bold text-neutral-500">
            준비 중입니다.
          </p>
        </div>
      </div>
    </NoticeLayout>
  )
}
