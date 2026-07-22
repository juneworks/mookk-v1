'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Footer() {
  const [isBusinessInfoOpen, setIsBusinessInfoOpen] = useState(false)

  return (
    <footer className="w-full bg-[#edfae0] py-16 mt-auto text-xs text-[#203226]/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* 푸터 상단 안내 문구 */}
        <div className="pb-8 font-light text-[11px] leading-relaxed space-y-2">
          <p>1. Mookk은 종이책 크라우드펀딩 플랫폼으로, 개설된 도서 프로젝트의 상품 제작 및 배송의 최종 책임은 개설자(작가)에게 있습니다.</p>
          <p>2. 후원 예약 시점에는 실제 승인이 발생하지 않으며, 모집 마감일까지 목표 금액(100%)을 도달할 경우에만 일괄 배치 결제가 수행됩니다.</p>
        </div>

        {/* 5열 링크 디렉토리 섹션 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="space-y-3">
            <h4 className="font-bold text-[#203226] text-[11px] tracking-wider uppercase">Mookk 서비스</h4>
            <ul className="space-y-2 font-light">
              <li><Link href="/" className="hover:underline">Mookk 소개</Link></li>
              <li><Link href="/" className="hover:underline">B2B 제휴</Link></li>
              <li><Link href="/" className="hover:underline">인재 채용</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-[#203226] text-[11px] tracking-wider uppercase">도서 탐색</h4>
            <ul className="space-y-2 font-light">
              <li><Link href="/" className="hover:underline">소설 카테고리</Link></li>
              <li><Link href="/" className="hover:underline">에세이 카테고리</Link></li>
              <li><Link href="/" className="hover:underline">예술 및 디자인</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-[#203226] text-[11px] tracking-wider uppercase">창작자 지원</h4>
            <ul className="space-y-2 font-light">
              <li><Link href="/projects/create" className="hover:underline">프로젝트 개설 가이드</Link></li>
              <li><Link href="/" className="hover:underline">수수료 정책 (8.3%)</Link></li>
              <li><Link href="/" className="hover:underline">정산 일정 안내</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-[#203226] text-[11px] tracking-wider uppercase">고객 센터</h4>
            <ul className="space-y-2 font-light">
              <li><Link href="/" className="hover:underline">자주 묻는 질문</Link></li>
              <li><Link href="/" className="hover:underline">이용약관</Link></li>
              <li><Link href="/" className="hover:underline">개인정보 처리방침</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-[#203226] text-[11px] tracking-wider uppercase">플랫폼 시뮬레이션</h4>
            <ul className="space-y-2 font-light">
              <li><Link href="/admin" className="hover:underline">관리자 테스트 콘솔</Link></li>
              <li><Link href="/mypage" className="hover:underline">통합 마이페이지</Link></li>
            </ul>
          </div>
        </div>

        {/* 푸터 하단 타이틀, 아코디언 및 카피라이트 정보 */}
        <div className="border-t border-[#203226]/8 pt-8 space-y-4">
          
          {/* 타이틀 및 아코디언 버튼 */}
          <div className="flex flex-col gap-2">
            <div className="font-semibold text-[#203226]/70 uppercase tracking-widest text-sm">
              MOOKK
            </div>
            
            {/* 아코디언 토글 헤더 */}
            <div className="flex items-center">
              <button 
                onClick={() => setIsBusinessInfoOpen(!isBusinessInfoOpen)}
                className="flex items-center gap-1.5 text-[11px] text-[#203226]/60 hover:text-[#203226] font-medium transition-colors focus:outline-none"
              >
                <span>묶 사업자 정보</span>
                <span className={`inline-block text-[8px] transform transition-transform duration-200 font-bold ${
                  isBusinessInfoOpen ? 'rotate-180' : ''
                }`}>
                  ▼
                </span>
              </button>
            </div>
          </div>

          {/* 아코디언 컨텐츠 - 부드럽고 촘촘하게 노출 */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isBusinessInfoOpen ? 'max-h-[150px] opacity-100 mt-2' : 'max-h-0 opacity-0 pointer-events-none'
          }`}>
            <div className="space-y-1 text-[11px] text-[#203226]/50 font-light leading-relaxed bg-[#203226]/3 p-4 rounded-xl border border-[#203226]/5">
              <p>대표 : 김준 | 사업자등록번호 : 000-00-00000 | 통신판매업 신고번호 : 2026-서울동작-0000</p>
              <p>문의 : mookk.contact@gmail.com  | 주소 : 서울특별시 동작구 만양로</p>
            </div>
          </div>

          {/* 카피라이트 */}
          <div className="text-[10px] text-[#203226]/40 font-light pt-2">
            Copyright © 2026 MOOKK Inc. All rights reserved.
          </div>

        </div>

      </div>
    </footer>
  )
}
