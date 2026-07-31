'use client'

import { useState } from 'react'

interface Reward {
  id: string
  title: string
  price: number
  description: string
}

interface ProjectDetailTabsProps {
  detailStory: string
  rewards: Reward[]
  creatorName: string
  onSelectReward: (reward: Reward) => void
}

export default function ProjectDetailTabs({
  detailStory,
  rewards,
  creatorName,
  onSelectReward,
}: ProjectDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'rewards' | 'news' | 'community'>('story')
  const [qaList, setQaList] = useState([
    { id: 1, author: '서점사랑독자', content: '양장본 하드커버 가름끈 색상은 무슨 색인가요?', answer: '안녕하세요! 가름끈은 에메랄드 그린 컬러로 제작될 예정입니다.' },
    { id: 2, author: '글쓰는민재', content: '배송 시 뽁뽁이 포함 안전 포장되나요?', answer: '네, 도서 모서리가 손상되지 않도록 에어캡 안전 봉투로 밀봉 배송됩니다.' }
  ])
  const [newQuestion, setNewQuestion] = useState('')

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return
    setQaList([
      ...qaList,
      {
        id: Date.now(),
        author: '후원자님',
        content: newQuestion,
        answer: '창작자가 문의 내용을 확인 후 답변을 작성할 예정입니다.'
      }
    ])
    setNewQuestion('')
  }

  return (
    <div className="w-full space-y-6">
      {/* 탭 네비게이션 헤더 */}
      <div className="flex border-b border-[#1C4025]/10 bg-[#edfae0]/40 rounded-t-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('story')}
          className={`flex-1 min-w-[100px] py-3.5 text-center text-sm font-bold transition-all border-b-2 ${
            activeTab === 'story'
              ? 'border-[#1C4025] text-[#1C4025] bg-white'
              : 'border-transparent text-[#1C4025]/60 hover:text-[#1C4025]'
          }`}
        >
          📖 프로젝트 스토리
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex-1 min-w-[100px] py-3.5 text-center text-sm font-bold transition-all border-b-2 ${
            activeTab === 'rewards'
              ? 'border-[#1C4025] text-[#1C4025] bg-white'
              : 'border-transparent text-[#1C4025]/60 hover:text-[#1C4025]'
          }`}
        >
          🎁 리워드 구성 ({rewards.length})
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`flex-1 min-w-[100px] py-3.5 text-center text-sm font-bold transition-all border-b-2 ${
            activeTab === 'news'
              ? 'border-[#1C4025] text-[#1C4025] bg-white'
              : 'border-transparent text-[#1C4025]/60 hover:text-[#1C4025]'
          }`}
        >
          📢 창작자 소식 (1)
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex-1 min-w-[100px] py-3.5 text-center text-sm font-bold transition-all border-b-2 ${
            activeTab === 'community'
              ? 'border-[#1C4025] text-[#1C4025] bg-white'
              : 'border-transparent text-[#1C4025]/60 hover:text-[#1C4025]'
          }`}
        >
          💬 커뮤니티/Q&A ({qaList.length})
        </button>
      </div>

      {/* 탭 본문 내용 */}
      <div className="p-6 bg-white rounded-b-xl border border-t-0 border-[#1C4025]/10 shadow-sm min-h-[300px]">
        {/* 1. 스토리 탭 */}
        {activeTab === 'story' && (
          <div className="prose max-w-none text-[#1C4025] space-y-4 font-light text-sm sm:text-base leading-relaxed">
            <div className="whitespace-pre-line">
              {detailStory || '창작자가 작성한 상세 소개글이 이곳에 렌더링됩니다.'}
            </div>
            <div className="pt-6 border-t border-[#1C4025]/10 mt-6 space-y-2">
              <h4 className="text-sm font-bold text-[#1C4025]">창작자 소개</h4>
              <div className="p-4 bg-[#F4F3EF] rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1C4025] text-[#d6f9b4] flex items-center justify-center font-bold text-sm">
                  {creatorName.substring(0, 1)}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1C4025]">{creatorName}</div>
                  <div className="text-xs text-[#1C4025]/60">MOOKK 수제 출판 창작자</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. 리워드 탭 */}
        {activeTab === 'rewards' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#1C4025] mb-2">원하시는 리워드를 선택해 주세요</h3>
            {rewards.map((reward) => (
              <div
                key={reward.id}
                onClick={() => onSelectReward(reward)}
                className="p-5 border border-[#1C4025]/20 rounded-xl hover:border-[#1C4025] hover:bg-[#edfae0]/30 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-black text-[#1C4025]">{reward.price.toLocaleString()}원 후원</span>
                  <span className="text-xs font-bold text-[#c84b15] group-hover:underline">선택하기 →</span>
                </div>
                <h4 className="font-bold text-sm text-[#1C4025]">{reward.title}</h4>
                <p className="text-xs text-[#1C4025]/70 font-light">{reward.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* 3. 소식 탭 */}
        {activeTab === 'news' && (
          <div className="space-y-4">
            <div className="p-5 bg-[#F4F3EF] rounded-xl space-y-2 border border-[#1C4025]/10">
              <div className="flex items-center gap-2 text-xs font-bold text-[#c84b15]">
                <span>[공지]</span>
                <span className="text-[#1C4025]/50">• 2026.07.28</span>
              </div>
              <h4 className="font-extrabold text-sm text-[#1C4025]">
                🎉 《{creatorName}》 프로젝트 펀딩이 성공적으로 오픈되었습니다!
              </h4>
              <p className="text-xs text-[#1C4025]/80 font-light leading-relaxed">
                많은 관심과 후원 감사드립니다. 마감일까지 정성스럽게 제작하여 최고의 도서로 보답하겠습니다.
              </p>
            </div>
          </div>
        )}

        {/* 4. 커뮤니티/Q&A 탭 */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            <form onSubmit={handleAddQuestion} className="space-y-3 bg-[#F4F3EF] p-4 rounded-xl">
              <label className="block text-xs font-bold text-[#1C4025]">창작자에게 문의 남기기</label>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="도서 제본, 배송 일정 등 궁금한 점을 자유롭게 물어보세요."
                className="w-full p-3 rounded-lg border border-[#1C4025]/20 text-xs focus:outline-none focus:ring-1 focus:ring-[#1C4025] bg-white"
                rows={2}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1C4025] text-[#d6f9b4] rounded-lg text-xs font-bold hover:bg-[#1C4025]/90 transition-all"
              >
                문의 등록하기
              </button>
            </form>

            <div className="space-y-4">
              {qaList.map((qa) => (
                <div key={qa.id} className="p-4 border border-[#1C4025]/10 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-[#1C4025] flex justify-between">
                    <span>Q. {qa.content}</span>
                    <span className="text-[#1C4025]/40 font-normal">{qa.author}</span>
                  </div>
                  <div className="pl-3 border-l-2 border-[#1C4025]/30 text-[#1C4025]/80 pt-1">
                    <span className="font-bold text-[#c84b15]">A. </span>
                    <span>{qa.answer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
