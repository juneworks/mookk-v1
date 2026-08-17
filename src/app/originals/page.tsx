export const metadata = {
  title: '오리지널 - MOOKK',
  description: 'MOOKK 오리지널 컨텐츠를 준비중입니다',
}

export default function OriginalsPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-24 px-4 bg-white">
      <div className="text-center space-y-4 max-w-md w-full">
        <h1 className="text-3xl sm:text-4xl font-black text-[#1C4025] tracking-tight">
          오리지널
        </h1>
        <p className="text-base sm:text-lg font-bold text-neutral-500">
          MOOKK 오리지널 컨텐츠를 준비중입니다
        </p>
      </div>
    </div>
  )
}
