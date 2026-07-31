'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { calculateSettlementFee, FeeBreakdown } from '@/utils/fee'
import { mockPledges, mockProjects } from '@/data/projectsData'

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<'backer' | 'creator'>('backer')
  const [isCsvDownloading, setIsCsvDownloading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  
  // 취소 모달 상태
  const [cancelTargetPledgeId, setCancelTargetPledgeId] = useState<string | null>(null)
  const [cancelAgreed, setCancelAgreed] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // 주소 수정 상태
  const [editingPledgeId, setEditingPledgeId] = useState<string | null>(null)
  const [editRecipient, setEditRecipient] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editAddress, setEditAddress] = useState('')

  // 더미 사용자 데이터 (김준 작가/후원자)
  const userProjects = mockProjects.slice(0, 2)
  const [myPledges, setMyPledges] = useState(mockPledges)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // 후원자 CSV 다운로드 함수
  const handleExportCsv = async (projectId: string) => {
    try {
      setIsCsvDownloading(true)
      const res = await fetch(`/api/creator/export-backers?projectId=${projectId}`)
      
      if (!res.ok) {
        throw new Error('CSV 다운로드 실패')
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mookk_backers_${projectId}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      showToast('후원자 명단(.csv)이 다운로드되었습니다. (배송지가 잠금 처리되었습니다)')
    } catch (err: any) {
      showToast('CSV 다운로드 실패: ' + err.message)
    } finally {
      setIsCsvDownloading(false)
    }
  }

  // 후원 취소 실행 함수
  const handleConfirmCancel = async () => {
    if (!cancelTargetPledgeId) return
    try {
      setIsCancelling(true)
      const res = await fetch('/api/pledge/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pledgeId: cancelTargetPledgeId })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || '취소 실패')
      }

      // 프론트 상태 업데이트
      setMyPledges(prev => prev.map(p => p.id === cancelTargetPledgeId ? { ...p, payment_status: 'cancelled' as any } : p))
      showToast(data.message || '후원이 성공적으로 취소되었습니다.')
      setCancelTargetPledgeId(null)
      setCancelAgreed(false)
    } catch (err: any) {
      showToast(err.message)
    } finally {
      setIsCancelling(false)
    }
  }

  // 주소 수정 저장
  const handleSaveAddress = (pledgeId: string) => {
    setMyPledges(prev => prev.map(p => {
      if (p.id === pledgeId) {
        return {
          ...p,
          shipping_address: {
            recipientName: editRecipient || p.shipping_address.recipientName,
            phone: editPhone || p.shipping_address.phone,
            address: editAddress || p.shipping_address.address,
            detailAddress: p.shipping_address.detailAddress
          }
        }
      }
      return p
    }))
    setEditingPledgeId(null)
    showToast('배송지 주소가 수정되었습니다.')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-300">결제 성공</span>
      case 'payment_failed':
        return <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-bold border border-rose-300">결제 실패 (7일 재시도 중)</span>
      case 'cancelled':
        return <span className="bg-neutral-100 text-neutral-600 text-xs px-2.5 py-1 rounded-full font-bold border border-neutral-300">취소됨</span>
      case 'pending':
      default:
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold border border-amber-300">예약 완료 (마감일 결제)</span>
    }
  }

  return (
    <div className="w-full bg-[#F0EEE9] text-[#1C4025]">

      {/* Toast 알림 */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-[#1C4025] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          🔔 {toastMessage}
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        
        {/* 상단 프로필 헤더 */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-black/5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[#c84b15] uppercase tracking-wider bg-[#c84b15]/10 px-3 py-1 rounded-full">
              MY DASHBOARD
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">김준 님의 마이페이지</h1>
            <p className="text-xs text-[#1C4025]/70 mt-1">jun@mookk.com · 창작자 & 후원자 회원</p>
          </div>

          {/* 탭 전환 버튼 */}
          <div className="flex bg-[#F0EEE9] p-1 rounded-xl border border-black/5 self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab('backer')}
              className={`flex-1 sm:flex-initial px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'backer' ? 'bg-[#1C4025] text-white shadow-xs' : 'text-[#1C4025]/70 hover:text-[#1C4025]'
              }`}
            >
              🎁 나의 후원 내역 ({myPledges.length})
            </button>
            <button
              onClick={() => setActiveTab('creator')}
              className={`flex-1 sm:flex-initial px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'creator' ? 'bg-[#1C4025] text-white shadow-xs' : 'text-[#1C4025]/70 hover:text-[#1C4025]'
              }`}
            >
              ✍️ 나의 창작 프로젝트 ({userProjects.length})
            </button>
          </div>
        </div>

        {/* =======================================
            TAB 1: 후원자 마이페이지 (Backer View)
           ======================================= */}
        {activeTab === 'backer' && (
          <div className="space-y-6">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <span>내가 후원한 종이책 프로젝트</span>
              <span className="text-xs font-medium text-[#1C4025]/60">(총 {myPledges.length}건)</span>
            </h2>

            {myPledges.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-black/5 space-y-4">
                <p className="text-sm font-semibold text-neutral-500">아직 후원한 프로젝트가 없습니다.</p>
                <Link href="/projects" className="inline-block bg-[#1C4025] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#1C4025]/90">
                  프로젝트 둘러보기
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myPledges.map((pledge: any) => {
                  const project = mockProjects.find((p: any) => p.id === pledge.project_id) || mockProjects[0]
                  const isLocked = pledge.address_locked
                  const isCancelled = pledge.payment_status === 'cancelled'

                  return (
                    <div key={pledge.id} className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-4">
                      
                      {/* 상단 프로젝트 타이틀 및 뱃지 */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-black/5">
                        <div>
                          <span className="text-[10px] font-bold text-[#c84b15] uppercase tracking-wider">{project.category}</span>
                          <h3 className="text-base font-bold text-[#1C4025] hover:underline">
                            <Link href={`/projects/${project.id}`}>{project.title}</Link>
                          </h3>
                        </div>
                        <div>
                          {getStatusBadge(pledge.payment_status)}
                        </div>
                      </div>

                      {/* 리워드 및 결제 금액 정보 */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-[#F0EEE9]/50 p-4 rounded-xl">
                        <div>
                          <span className="text-[#1C4025]/60 font-semibold block">후원 금액</span>
                          <span className="text-sm font-extrabold text-[#1C4025]">{pledge.amount.toLocaleString()}원</span>
                        </div>
                        <div>
                          <span className="text-[#1C4025]/60 font-semibold block">선택 리워드</span>
                          <span className="font-bold text-[#1C4025]">도서 1권 + 작가 친필 서명 엽서</span>
                        </div>
                        <div>
                          <span className="text-[#1C4025]/60 font-semibold block">펀딩 마감일</span>
                          <span className="font-medium text-[#1C4025]">{project.deadline} (예약 결제일)</span>
                        </div>
                      </div>

                      {/* 배송지 정보 & 액션 버튼 (수정 / 취소) */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 text-xs">
                        
                        {/* 배송 주소 표기 */}
                        <div className="space-y-1">
                          <span className="font-bold text-[#1C4025] flex items-center gap-1.5">
                            <span>📦 배송지 주소</span>
                            {isLocked && <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-semibold">🔒 창작자 수령확인으로 주소 잠김</span>}
                          </span>
                          <p className="text-neutral-700">
                            {pledge.shipping_address.recipientName} ({pledge.shipping_address.phone}) — {pledge.shipping_address.address}
                          </p>
                        </div>

                        {/* 액션 버튼 그룹 */}
                        {!isCancelled && (
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            
                            {/* 배송지 수정 버튼 */}
                            {!isLocked && (
                              <button
                                onClick={() => {
                                  setEditingPledgeId(pledge.id)
                                  setEditRecipient(pledge.shipping_address.recipientName)
                                  setEditPhone(pledge.shipping_address.phone)
                                  setEditAddress(pledge.shipping_address.address)
                                }}
                                className="px-3.5 py-1.5 rounded-lg border border-[#1C4025]/20 text-[#1C4025] font-bold hover:bg-[#1C4025]/5"
                              >
                                배송지 수정
                              </button>
                            )}

                            {/* 후원 취소 버튼 */}
                            <button
                              onClick={() => {
                                setCancelTargetPledgeId(pledge.id)
                                setCancelAgreed(false)
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 border border-rose-200"
                            >
                              후원 취소
                            </button>
                          </div>
                        )}

                      </div>

                      {/* Inline 배송지 수정 Form */}
                      {editingPledgeId === pledge.id && (
                        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                          <h4 className="font-bold text-xs text-amber-900">✏️ 배송지 주소 변경</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <input
                              type="text"
                              placeholder="수령인 이름"
                              value={editRecipient}
                              onChange={(e) => setEditRecipient(e.target.value)}
                              className="p-2 rounded-md border border-neutral-300 bg-white"
                            />
                            <input
                              type="text"
                              placeholder="연락처"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="p-2 rounded-md border border-neutral-300 bg-white"
                            />
                            <input
                              type="text"
                              placeholder="주소"
                              value={editAddress}
                              onChange={(e) => setEditAddress(e.target.value)}
                              className="p-2 rounded-md border border-neutral-300 bg-white"
                            />
                          </div>
                          <div className="flex justify-end gap-2 text-xs">
                            <button
                              onClick={() => setEditingPledgeId(null)}
                              className="px-3 py-1 text-neutral-600 font-semibold"
                            >
                              취소
                            </button>
                            <button
                              onClick={() => handleSaveAddress(pledge.id)}
                              className="px-4 py-1 bg-[#1C4025] text-white rounded-md font-bold"
                            >
                              저장
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* =======================================
            TAB 2: 창작자 대시보드 (Creator View)
           ======================================= */}
        {activeTab === 'creator' && (
          <div className="space-y-6">
            <h2 className="text-lg font-extrabold flex items-center justify-between">
              <span>개설한 프로젝트 및 정산 내역</span>
              <Link href="/projects/create" className="text-xs font-bold text-white bg-[#c84b15] px-4 py-2 rounded-full hover:bg-[#c84b15]/90">
                + 새 프로젝트 개설
              </Link>
            </h2>

            <div className="space-y-8">
              {userProjects.map((project: any) => {
                // 통합 수수료 8.0% + 부가가치세(VAT 10%) 정산 연산
                const feeBreakdown: FeeBreakdown = calculateSettlementFee(project.current_amount)

                return (
                  <div key={project.id} className="bg-white p-6 sm:p-8 rounded-2xl border border-black/5 shadow-xs space-y-6">
                    
                    {/* 상단 프로젝트 요약 */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-black/5">
                      <div>
                        <span className="text-xs font-bold text-[#c84b15] uppercase tracking-wider">{project.category}</span>
                        <h3 className="text-xl font-extrabold text-[#1C4025] mt-1">{project.title}</h3>
                        <p className="text-xs text-neutral-500 mt-1">마감일: {project.deadline} · 상태: {project.status}</p>
                      </div>

                      {/* CSV 다운로드 버튼 */}
                      <button
                        onClick={() => handleExportCsv(project.id)}
                        disabled={isCsvDownloading}
                        className="flex items-center gap-2 bg-[#1C4025] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1C4025]/90 transition-all shadow-xs disabled:opacity-50"
                      >
                        {isCsvDownloading ? (
                          <>
                            <span className="animate-spin text-sm">⏳</span>
                            <span>다운로드 생성 중...</span>
                          </>
                        ) : (
                          <>
                            <span>📥</span>
                            <span>후원자 명단 엑셀 다운로드 (.csv)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* 달성률 & 위젯 카드 */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-[#F0EEE9] rounded-xl text-center">
                        <span className="text-xs font-bold text-[#1C4025]/70 block">실시간 모금액</span>
                        <span className="text-xl font-extrabold text-[#1C4025] mt-1 block">
                          {project.current_amount.toLocaleString()}원
                        </span>
                        <span className="text-[10px] font-bold text-[#c84b15] mt-0.5 block">
                          달성률 {project.target_amount ? Math.round((project.current_amount / project.target_amount) * 100) : 142}%
                        </span>
                      </div>

                      <div className="p-4 bg-[#F0EEE9] rounded-xl text-center">
                        <span className="text-xs font-bold text-[#1C4025]/70 block">후원자 수</span>
                        <span className="text-xl font-extrabold text-[#1C4025] mt-1 block">
                          {project.backers_count}명
                        </span>
                        <span className="text-[10px] text-neutral-500 mt-0.5 block">종이책 예약 완료</span>
                      </div>

                      <div className="p-4 bg-[#1C4025] text-white rounded-xl text-center">
                        <span className="text-xs font-bold text-white/70 block">입금 예정 정산액</span>
                        <span className="text-xl font-extrabold text-[#d6f9b4] mt-1 block">
                          {feeBreakdown.netSettlementAmount.toLocaleString()}원
                        </span>
                        <span className="text-[10px] text-white/60 mt-0.5 block">수수료 8.0%(VAT 포함) 차감</span>
                      </div>
                    </div>

                    {/* 영수증 형태 정산서 카드 (Settlement Breakdown) */}
                    <div className="bg-[#F0EEE9]/70 p-6 rounded-2xl border border-black/5 space-y-4">
                      <h4 className="text-xs font-extrabold text-[#1C4025] uppercase tracking-wider flex items-center gap-1.5 border-b border-black/10 pb-3">
                        <span>🧾 정산 명세서 (통합 수수료 8.0% + 부가가치세 10% 연산)</span>
                      </h4>

                      <div className="space-y-2 text-xs text-neutral-700">
                        <div className="flex justify-between font-bold text-[#1C4025]">
                          <span>1. 총 모금액 (Gross Amount)</span>
                          <span>{feeBreakdown.totalAmount.toLocaleString()} 원</span>
                        </div>

                        <div className="flex justify-between text-neutral-600 pl-4 border-l-2 border-[#1C4025]/20">
                          <span>2. 통합 이용 수수료 (8.0%)</span>
                          <span className="text-rose-700 font-semibold">- {feeBreakdown.totalFeeAmount.toLocaleString()} 원</span>
                        </div>

                        <div className="flex justify-between text-[11px] text-neutral-500 pl-8">
                          <span>- 수수료 공급가액</span>
                          <span>{feeBreakdown.feeSupplyValue.toLocaleString()} 원</span>
                        </div>

                        <div className="flex justify-between text-[11px] text-neutral-500 pl-8">
                          <span>- 수수료 부가가치세 (VAT 10%)</span>
                          <span>{feeBreakdown.feeVat.toLocaleString()} 원</span>
                        </div>

                        <div className="pt-3 border-t border-black/10 flex justify-between font-extrabold text-sm text-[#1C4025]">
                          <span>3. 최종 창작자 입금 예정액 (Net Settlement)</span>
                          <span className="text-emerald-700 text-base">{feeBreakdown.netSettlementAmount.toLocaleString()} 원</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
          </div>
        )}

      </main>

      {/* 후원 취소 모달 팝업 */}
      {cancelTargetPledgeId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-2xl shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-extrabold text-[#1C4025] flex items-center gap-2">
              <span>⚠️ 후원을 정말 취소하시겠습니까?</span>
            </h3>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2 leading-relaxed">
              <p className="font-bold">• 펀딩 마감 24시간 전까지만 후원 취소가 가능합니다.</p>
              <p>• 마감 이후에는 출판 인쇄 및 리워드 제작에 들어가므로 취소가 불가능합니다.</p>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-[#1C4025] cursor-pointer">
              <input
                type="checkbox"
                checked={cancelAgreed}
                onChange={(e) => setCancelAgreed(e.target.value as any)}
                className="w-4 h-4 rounded-md border-neutral-300 text-[#1C4025]"
              />
              <span>위 안내 사항을 확인했으며, 후원 취소에 동의합니다.</span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelTargetPledgeId(null)}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-100"
              >
                닫기
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={!cancelAgreed || isCancelling}
                className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
              >
                {isCancelling ? '취소 처리 중...' : '확인 및 후원 취소'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
