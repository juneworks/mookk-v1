import Image from 'next/image'

export const metadata = {
  title: '소개 - MOOKK',
  description: 'Stories worth mookking. 좋은 스토리를, 제대로 묶어냅니다.',
}

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-white text-black selection:bg-black selection:text-white">
      {/* 
        ============================================================
        SECTION 1: HERO (풀 배경 a.jpg + 우측 정렬 화이트 텍스트)
        ============================================================
      */}
      <section className="relative w-full min-h-[clamp(520px,58vw,770px)] flex items-center justify-center pt-24 sm:pt-28 pb-12 sm:pb-16 px-[clamp(1rem,4vw,4rem)] overflow-hidden">
        {/* 풀 배경 이미지 a.jpg */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/about/a.jpg"
            alt="Stories worth mookking"
            fill
            priority
            className="object-cover object-center w-full h-full"
            sizes="100vw"
          />
          {/* 다크 오버레이 */}
          <div className="absolute inset-0 bg-black/40 sm:bg-black/35" />
        </div>

        {/* 우측 정렬 텍스트 */}
        <div className="relative z-20 mx-auto max-w-[1440px] w-full flex justify-end">
          <div className="text-right text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            <h1
              className="font-black tracking-tight leading-[1.15] mb-2 sm:mb-4 sm:whitespace-nowrap"
              style={{ fontSize: 'clamp(1.8rem, 3.8vw, 3.6rem)' }}
            >
              Stories worth mookking
            </h1>
            <p
              className="font-black tracking-tight leading-[1.2] sm:whitespace-nowrap"
              style={{ fontSize: 'clamp(1.5rem, 3.2vw, 3.1rem)' }}
            >
              좋은 스토리를, 제대로 묶어냅니다
            </p>
          </div>
        </div>
      </section>

      {/* 
        ============================================================
        SECTION 2: MOOKK은 (풀 배경 b.jpg + 불투명도 20% 감소된 다크 오버레이 + 중앙 정렬 화이트 텍스트)
        ============================================================
      */}
      <section className="relative w-full min-h-[clamp(500px,54vw,700px)] flex items-center justify-center py-20 sm:py-28 lg:py-36 px-6 sm:px-12 overflow-hidden">
        {/* 풀 배경 이미지 b.jpg */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/about/b.jpg"
            alt="MOOKK은"
            fill
            className="object-cover object-center w-full h-full"
            sizes="100vw"
          />
          {/* 다크 오버레이: 기존 65%에서 20% 감소된 약 40~45% 적용 */}
          <div className="absolute inset-0 bg-black/45 sm:bg-black/40" />
        </div>

        {/* 중앙 정렬 화이트 텍스트 */}
        <div className="relative z-20 max-w-3xl mx-auto text-center space-y-8 sm:space-y-10 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-white">
            MOOKK은
          </h2>

          <div className="space-y-6 sm:space-y-8 text-base sm:text-xl lg:text-[23px] font-bold leading-relaxed sm:leading-[1.6] break-keep">
            <p>
              책(book)과 매거진(magazine)의<br />
              합성어 ‘mook’에 작은 위트를 담은 이름입니다.
            </p>
            <p>
              창작자의 좋은 스토리를 묶어내고,<br />
              그 이야기를 기다려온 후원자(독자)들의 마음까지<br />
              함께 묶어낸다는 뜻을 담았습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 
        ============================================================
        SECTION 3: 모인 만큼만, 정직하게 (풀 배경 c.jpg + 좌측 정렬 블랙 텍스트)
        ============================================================
      */}
      <section className="relative w-full min-h-[clamp(520px,58vw,750px)] flex items-center py-20 sm:py-28 lg:py-36 px-6 sm:px-12 lg:px-20 overflow-hidden">
        {/* 풀 배경 이미지 c.jpg */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/about/c.jpg"
            alt="모인 만큼만 정직하게"
            fill
            className="object-cover object-right sm:object-center w-full h-full"
            sizes="100vw"
          />
          {/* 좌측 텍스트 가독성을 위한 은은한 화이트 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent sm:from-white/85 sm:via-white/50" />
        </div>

        {/* 좌측 정렬 텍스트 */}
        <div className="relative z-20 max-w-[1440px] w-full mx-auto">
          <div className="max-w-2xl space-y-8 sm:space-y-10">
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-black">
              모인 만큼만, 정직하게
            </h2>

            <div className="space-y-6 sm:space-y-8 text-base sm:text-xl lg:text-[22px] font-bold text-black leading-relaxed sm:leading-[1.6] break-keep">
              <p>
                2026년 6월 16일, 종이의 날에 태어난 MOOKK은<br />
                종이책만을 위한 크라우드펀딩 플랫폼입니다.
              </p>
              <p>
                낭비되는 종이, 버려지는 책이 없도록<br />
                많이 모이면 많이, 적게 모이면 적게<br />
                팔리지 않을 책을 미리 쌓아두지 않고,<br />
                읽고 싶은 마음이 모인 만큼만 세상에 내놓습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ============================================================
        SECTION 4: 규모는 중요하지 않습니다 (풀 배경 d.jpg + 우측 정렬/배치 블랙 텍스트)
        ============================================================
      */}
      <section className="relative w-full min-h-[clamp(540px,60vw,780px)] flex items-center justify-end py-20 sm:py-28 lg:py-36 px-6 sm:px-12 lg:px-20 overflow-hidden">
        {/* 풀 배경 이미지 d.jpg */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/about/d.jpg"
            alt="규모는 중요하지 않습니다"
            fill
            className="object-cover object-left sm:object-center w-full h-full"
            sizes="100vw"
          />
          {/* 우측 텍스트 가독성을 위한 은은한 화이트 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-l from-white/95 via-white/70 to-transparent sm:from-white/90 sm:via-white/55" />
        </div>

        {/* 우측 배치 텍스트 */}
        <div className="relative z-20 max-w-[1440px] w-full mx-auto flex justify-end">
          <div className="max-w-2xl space-y-8 sm:space-y-10">
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-black">
              규모는 중요하지 않습니다
            </h2>

            <div className="text-base sm:text-xl lg:text-[22px] font-bold text-black leading-relaxed sm:leading-[1.65] break-keep">
              <p>
                작가 개인, 1인 출판사는 물론<br />
                중소형 출판사까지<br />
                MOOKK은 규모를 가리지 않고<br />
                좋은 이야기를 가진,<br />
                종이책으로 만들 준비가 된<br />
                모든 창작자와 협업합니다.<br />
                크라우드펀딩이 처음이라도 괜찮습니다.<br />
                종이책 제작부터 배송까지,<br />
                종이책 출간에 관한 과정을<br />
                MOOKK이 함께 합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ============================================================
        SECTION 5: 가끔 오리지널도 만듭니다 (풀 배경 e.jpg + 좌측 정렬 블랙 텍스트)
        ============================================================
      */}
      <section className="relative w-full min-h-[clamp(520px,58vw,750px)] flex items-center py-20 sm:py-28 lg:py-36 px-6 sm:px-12 lg:px-20 overflow-hidden">
        {/* 풀 배경 이미지 e.jpg */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/about/e.jpg"
            alt="가끔 오리지널도 만듭니다"
            fill
            className="object-cover object-right sm:object-center w-full h-full"
            sizes="100vw"
          />
          {/* 좌측 텍스트 가독성을 위한 은은한 화이트 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent sm:from-white/90 sm:via-white/55" />
        </div>

        {/* 좌측 정렬 텍스트 */}
        <div className="relative z-20 max-w-[1440px] w-full mx-auto">
          <div className="max-w-2xl space-y-8 sm:space-y-10">
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-black">
              가끔 오리지널도 만듭니다
            </h2>

            <div className="text-base sm:text-xl lg:text-[22px] font-bold text-black leading-relaxed sm:leading-[1.65] break-keep">
              <p>
                MOOKK은 플랫폼이면서 동시에 하나의 출판사로<br />
                직접 작가를 찾고 좋은 스토리를 만들어 냅니다.<br />
                좋은 스토리를 제대로 남기기 위해서<br />
                그 이야기를 기다리는 독자에게 닿기 위함입니다.<br />
                과정에서 쌓은 제작에 대한 모든 감각과 노하우는<br />
                다시 MOOKK과 함께하는 창작자들에게<br />
                고스란히 제공하고자 노력합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ============================================================
        SECTION 6: CLOSING (풀 배경 f.jpg + 우측 정렬 화이트 텍스트)
        ============================================================
      */}
      <section className="relative w-full min-h-[clamp(480px,52vw,680px)] flex items-center justify-center py-20 sm:py-28 lg:py-36 px-[clamp(1rem,4vw,4rem)] overflow-hidden">
        {/* 풀 배경 이미지 f.jpg */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/about/f.jpg"
            alt="MOOKK에서 함께 묶습니다"
            fill
            className="object-cover object-center w-full h-full"
            sizes="100vw"
          />
          {/* 다크 오버레이 */}
          <div className="absolute inset-0 bg-black/45 sm:bg-black/40" />
        </div>

        {/* 우측 정렬 화이트 텍스트 */}
        <div className="relative z-20 mx-auto max-w-[1440px] w-full flex justify-end">
          <div className="text-right text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] max-w-3xl">
            <h2
              className="font-black tracking-tight leading-[1.3] sm:leading-[1.35] break-keep"
              style={{ fontSize: 'clamp(1.6rem, 3.3vw, 3.2rem)' }}
            >
              좋은 스토리를 가진 창작자와<br />
              그 이야기를 기다리는 독자를,<br />
              MOOKK에서 함께 묶습니다
            </h2>
          </div>
        </div>
      </section>
    </div>
  )
}
