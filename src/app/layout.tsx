import type { Metadata } from 'next'
import './globals.css'
import AppHeader from '@/components/AppHeader'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'MOOKK - 오직 종이책만을 위한 크라우드펀딩 출판 플랫폼',
    template: '%s | MOOKK'
  },
  description: '디지털 시대 속에서도 변함없는 가치를 지닌 종이책 크라우드펀딩 플랫폼 MOOKK에서 특별한 독립 출판 프로젝트를 만나보세요.',
  keywords: ['MOOKK', '묵', '종이책', '크라우드펀딩', '독립출판', '북펀딩', '에세이', '소설', '리워드'],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
  openGraph: {
    title: 'MOOKK - 오직 종이책만을 위한 크라우드펀딩 출판 플랫폼',
    description: '작가와 독자가 함께 종이책 실물 형태의 꿈을 현실로 만들어가는 크라우드펀딩 공간입니다.',
    url: 'https://mookk.kr',
    siteName: 'MOOKK',
    images: [
      {
        url: '/images/books/season_cover.webp',
        width: 1200,
        height: 630,
        alt: 'MOOKK 종이책 크라우드펀딩 메인',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MOOKK - 오직 종이책만을 위한 크라우드펀딩 출판 플랫폼',
    description: '독립출판과 종이책 전용 크라우드펀딩 프로젝트를 MOOKK에서 후원하세요.',
    images: ['/images/books/season_cover.webp'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white font-sans antialiased text-[#1C4025] flex flex-col">
        {/* 1. 사이트 공통 전역 헤더 (GNB 2가지 주메뉴 & 드롭다운) */}
        <AppHeader />
        
        {/* 2. 각 페이지 메인 본문 콘텐츠 */}
        <div className="flex-1 w-full">
          {children}
        </div>

        {/* 3. 사이트 공통 전역 푸터 */}
        <Footer />
      </body>
    </html>
  )
}
