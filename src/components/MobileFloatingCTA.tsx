'use client'

interface MobileFloatingCTAProps {
  status: string
  percent: number
  priceRange?: string
  onPledgeClick: () => void
}

export default function MobileFloatingCTA({
  status,
  percent,
  priceRange = '18,000원부터~',
  onPledgeClick,
}: MobileFloatingCTAProps) {
  const isEnded = status === 'succeeded' || status === 'failed'
  const isUpcoming = status === 'upcoming'

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#1C4025]/15 p-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-[#c84b15]">
          {isEnded ? '펀딩 마감됨' : isUpcoming ? '오픈 예정 펀딩' : `${percent}% 모금 달성`}
        </span>
        <span className="text-sm font-extrabold text-[#1C4025]">{priceRange}</span>
      </div>

      <button
        onClick={onPledgeClick}
        disabled={isEnded}
        className={`px-6 py-3 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
          isEnded
            ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            : isUpcoming
            ? 'bg-amber-600 text-white hover:bg-amber-700'
            : 'bg-[#1C4025] text-[#d6f9b4] hover:bg-[#1C4025]/90'
        }`}
      >
        {isEnded ? '펀딩이 종료되었습니다' : isUpcoming ? '오픈 알림 신청' : '이 프로젝트 후원하기'}
      </button>
    </div>
  )
}
