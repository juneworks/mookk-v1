import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="w-full bg-[#F0EEE9] text-[#1C4025] flex-1 flex items-center justify-center min-h-[70vh] py-20">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-12 rounded-3xl border border-black/5 shadow-xl">
        
        <div className="relative inline-block">
          <span className="text-7xl font-extrabold text-[#1C4025]/20 tracking-tighter">404</span>
          <span className="absolute inset-0 flex items-center justify-center text-4xl">📖</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C4025]">
            찾으시는 페이지가 없습니다
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            요청하신 주소가 변경되었거나 삭제되었을 수 있습니다.<br />
            홈으로 돌아가 새로운 종이책 프로젝트들을 찾아보세요.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-block bg-[#1C4025] text-white px-8 py-3 rounded-full text-xs font-bold hover:bg-[#1C4025]/90 transition-all shadow-md"
          >
            메인 홈으로 돌아가기
          </Link>
        </div>

      </div>
    </div>
  )
}
