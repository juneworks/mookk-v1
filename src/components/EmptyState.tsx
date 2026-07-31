import Link from 'next/link'

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  icon?: string
}

export default function EmptyState({
  title = '등록된 프로젝트가 없습니다.',
  description = '새로운 종이책 펀딩 소식이 곧 찾아옵니다. 다양한 책들을 둘러보세요.',
  actionLabel = '프로젝트 탐색하기',
  actionHref = '/projects',
  icon = '📚'
}: EmptyStateProps) {
  return (
    <div className="w-full bg-white p-12 sm:p-16 rounded-2xl border border-black/5 text-center space-y-4 shadow-xs">
      <div className="text-5xl sm:text-6xl animate-bounce duration-1000">
        {icon}
      </div>
      
      <div className="space-y-1 max-w-md mx-auto">
        <h3 className="text-lg sm:text-xl font-bold text-[#1C4025]">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && actionHref && (
        <div className="pt-2">
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 bg-[#1C4025] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#1C4025]/90 transition-all shadow-xs"
          >
            <span>{actionLabel}</span>
            <span>➔</span>
          </Link>
        </div>
      )}
    </div>
  )
}
