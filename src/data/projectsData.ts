export interface Reward {
  id: string
  title: string
  price: number
  description: string
}

export interface BookSpec {
  subtitle?: string
  size?: string
  paper_inner?: string
  paper_cover?: string
  pages?: string
  binding?: string
  isbn?: string
}

export interface ProjectData {
  id: string
  title: string
  subtitle?: string
  description: string
  detail_story: string
  features: string[]
  spec: BookSpec
  author_intro: string
  publisher_intro: string
  publisher_name: string
  goal_amount: number
  current_amount: number
  backers_count: number
  deadline: string
  cover_image_url: string
  cover_width?: number
  cover_height?: number
  status: 'live' | 'upcoming' | 'succeeded' | 'failed'
  creator_name: string
  category: '문학' | '에세이' | '인문/교양' | '잡지/아트북' | '만화/그림' | '실용/취미/기타' | string
  rewards: Reward[]
}

export const sampleProjects: ProjectData[] = [
  // 1. [실시간 펀딩 1 - D-5 가장 임박] 시인들의 러브레터 (문학)
  {
    id: 'mookk-real-2',
    title: '시인들의 러브레터',
    subtitle: '시대를 뛰어넘어 이어지는 시인 12인의 헌정 서간집',
    description: '한국 현대시 12인이 연인과 주고받은\n친필 편지의 내용을 양장본 종이책으로 복원한 헌정 서간집',
    detail_story: `## 📖 책 소개
《시인들의 러브레터》는 한국 근현대문학을 대표하는 시인 12인이 아내, 연인, 친구에게 보낸 친필 편지와 시적 감성이 물씬 풍기는 서간들을 한데 엮은 프리미엄 종이책 양장본입니다.

빛바랜 종이 위 손글씨의 온기와 시인들의 가장 사적인 순간에 넘쳐나던 아련한 고백들을 정성스러운 사양으로 묶었습니다.

### 🌟 이 책의 특별함
- **친필 영인본 수록**: 시인들의 원본 친필 편지 스캔본 24p 특별 수록
- **패브릭 양장 제본**: 손끝에 감기는 아날로그 감성의 고급 리넨 패브릭 커버
- **금박 불박 타이포그래피**: 클래식한 소장 가치를 극대화한 후가공`,
    features: [
      '한국 대표 시인 12인의 친필 서간 24p 영인본 수록',
      '고급 120g 문켄 앙상블 내지 사용으로 눈의 피로 최소화',
      '소장용 하드커버 양장 제본 & 은은한 박 후가공'
    ],
    spec: {
      subtitle: '시대를 뛰어넘어 이어지는 시인 12인의 헌정 서간집',
      size: '128 x 188 mm (B6)',
      paper_inner: '문켄 앙상블 120g',
      paper_cover: '고급 리넨 패브릭 하드커버 (금박)',
      pages: '240쪽',
      binding: '사반양장 제본 (180도 펼침가능)',
      isbn: '979-11-984321-2-1'
    },
    author_intro: '김시인 외 12인. 문학을 사랑하고 시인들의 사적인 온기를 세상에 알리고자 손글씨 복원 작업을 진행한 문학 아카이브 그룹입니다.',
    publisher_intro: 'MOOKK 출판기획팀은 종이 물성이 가진 특유의 온기와 아날로그 서가를 가꾸는 크라우드펀딩 전용 출판 브랜드입니다.',
    publisher_name: '시인과 연서 출판사',
    goal_amount: 3000000,
    current_amount: 30120000,
    backers_count: 1506,
    deadline: '2026-08-05T23:59:59Z', // D-5 (가장 임박)
    cover_image_url: '/images/books/poet_loveletter.png',
    status: 'live',
    creator_name: '김시인',
    category: '문학',
    rewards: [
      { id: 'r2-1', title: '양장본 1권', price: 20000, description: '《시인들의 러브레터》 양장본 1권 + 시인 친필 엽서 3종 세트' },
      { id: 'r2-2', title: '세트 후원', price: 38000, description: '양장본 2권 + 친필 엽서 6종 + 패브릭 북커버' }
    ]
  },

  // 2. [실시간 펀딩 2 - D-8 두번째 임박] 바다 마을 소설 (문학)
  {
    id: 'mookk-real-3',
    title: '바다 마을 소설',
    subtitle: '파도 소리와 함께 흘러가는 조용한 바닷가 마을 사람들의 서사',
    description: '조용한 어느 시골 바다 마을에서 펼쳐지는\n충격적 미스테리 사건을 엮은 김파도 작가의 문제작',
    detail_story: `## 🌊 책 소개
《바다 마을 소설》은 동해안의 작은 포구 마을 '청호리'를 배경으로, 타지에서의 삶을 뒤로하고 고향으로 돌아온 사람들과 평생 바다를 지켜온 이들이 나누는 다정한 연결에 관한 이야기입니다.

파란 등대 아래 길모퉁이 작은 서점과 밤바다를 적시는 민트빛 노을을 그리듯 묘사한 감성 장편소설입니다.`,
    features: [
      '동해 바다 물결을 닮은 파스텔 쿨블루 내지 디자인',
      '김파도 작가의 서명 및 초판 한정 일러스트 포스터 증정',
      '도서 모서리 라운딩 마감'
    ],
    spec: {
      subtitle: '파도 소리와 함께 흘러가는 조용한 바닷가 마을 사람들의 서사',
      size: '130 x 195 mm',
      paper_inner: '모조지 100g',
      paper_cover: '스노우 250g (무광 코팅)',
      pages: '280쪽',
      binding: '무선 제본',
      isbn: '979-11-984321-3-8'
    },
    author_intro: '김파도 작가. 파도 소리를 들으며 글을 쓸 때 가장 자유로움을 느낍니다. 첫 소설 《바다 마을 소설》로 독자들과 만나기를 고대하고 있습니다.',
    publisher_intro: '미리문학사는 바다와 자연, 사람의 깊은 이야기를 담은 문학 도서를 전문 기획하는 독립 출판사입니다.',
    publisher_name: '미리문학사',
    goal_amount: 3000000,
    current_amount: 11340000,
    backers_count: 667,
    deadline: '2026-08-08T23:59:59Z', // D-8
    cover_image_url: '/images/books/sea_village.png',
    status: 'live',
    creator_name: '김파도',
    category: '문학',
    rewards: [
      { id: 'r3-1', title: '단권 후원', price: 17000, description: '《바다 마을 소설》 1권 + 바다 일러스트 엽서 2종' },
      { id: 'r3-2', title: '바다 북마크 패키지', price: 25000, description: '도서 1권 + 아크릴 바다 책갈피 + 작가 친필 서명본' }
    ]
  },

  // 3. [실시간 펀딩 3 - D-12] 계절을 건너는 온도 (에세이 - 오리지널 메인)
  {
    id: 'mookk-real-1',
    title: '계절을 건너는 온도',
    subtitle: '네 번의 계절, 일상의 가장 다정한 온도를 엮다',
    description: '네 번의 계절을 보내며 써 내려간\n이가을 작가의 두 번째 에세이',
    detail_story: `## 🌸 책 소개
《계절을 건너는 온도》는 빠르게 흘러가는 시간 속에서 우리가 잊고 지낸 네 번의 계절, 그 안에서 마주한 찰나의 다정한 온도들을 기록한 감성 에세이입니다.

봄날의 따스한 햇살부터 겨울밤 창가에 스미는 차가운 공기까지, 지나쳐버리기 쉬운 일상의 순간들을 문지은 작가 특유의 섬세하고 따뜻한 문체로 엮어냈습니다.`,
    features: [
      '180도 완전 펼침이 가능한 사반양장 고급 제본 방식 적용',
      '친환경 FSC 인증 종이 및 콩기름 인쇄(Soy Ink) 적용',
      '문지은 작가의 자필 서명 및 초판 한정 계절 엽서 4종 세트 포함'
    ],
    spec: {
      subtitle: '네 번의 계절, 일상의 가장 다정한 온도를 엮다',
      size: '128 x 188 mm (B6 사반)',
      paper_inner: '몽블랑 100g (자연스러운 미색)',
      paper_cover: '랑데뷰 240g (형압 후가공 적용)',
      pages: '224쪽 (컬러 도판 수록)',
      binding: '사반양장 제본 (180도 펼침가능)',
      isbn: '979-11-984321-0-7'
    },
    author_intro: '문지은 작가. 일상의 작은 순간들에서 온기를 찾아 글을 씁니다.',
    publisher_intro: 'MOOKK 묵 출판기획은 종이책만이 전달할 수 있는 감성과 질감에 집중하며 독립 작가들의 단단한 출판 펀딩을 돕습니다.',
    publisher_name: 'MOOKK 묵 출판기획',
    goal_amount: 3000000,
    current_amount: 7260000,
    backers_count: 403,
    deadline: '2026-08-12T23:59:59Z', // D-12
    cover_image_url: '/images/books/season_cover.webp',
    status: 'live',
    creator_name: '문지은',
    category: '에세이',
    rewards: [
      { id: 'r1-1', title: '[얼리버드] 기본 리워드', price: 18000, description: '《계절을 건너는 온도》 도서 1권 + 계절 엽서 4종 세트' },
      { id: 'r1-2', title: '[풀 패키지] 도서 + 패브릭 북커버', price: 29000, description: '도서 1권 + 계절 엽서 4종 + 한정판 패브릭 북커버 + 아크릴 책갈피' }
    ]
  },

  // 4. [실시간 펀딩 4 - D-18] 계약서에 도장을 찍고 (에세이)
  {
    id: 'mookk-real-4',
    title: '계약서에 도장을 찍고',
    subtitle: '30년 차 바리스타의 내 카페 만들기 프로젝트',
    description: '20년 차 김기현 바리스타의\n내 카페 만들기 실전 프로젝트 에세이',
    detail_story: `## ☕ 책 소개
《계약서에 도장을 찍고》는 30년 차 바리스타 김기현 저자가 자신만의 정성 어린 카페 공간을 열기까지 겪은 계약 및 카페 창업 고군분투기를 담아낸 현실 에세이입니다.`,
    features: [
      '30년 차 바리스타의 카페 창업 실전 노하우 부록 수록',
      '따뜻한 커피 아로마 일러스트 표지',
      '가벼운 휴대성의 무선 제본'
    ],
    spec: {
      subtitle: '30년 차 바리스타의 내 카페 만들기 프로젝트',
      size: '120 x 175 mm',
      paper_inner: '미색 모조 80g',
      paper_cover: '아르떼 210g',
      pages: '196쪽',
      binding: '무선 제본',
      isbn: '979-11-984321-4-5'
    },
    author_intro: '김기현 바리스타. 30년간 현장을 누비며 커피의 깊은 향과 사람들의 이야기를 수집한 카페 아티스트.',
    publisher_intro: '일상 속 깊은 커피 향처럼 은은한 에세이를 만듭니다.',
    publisher_name: '바리스타 서가',
    goal_amount: 3000000,
    current_amount: 3180000,
    backers_count: 198,
    deadline: '2026-08-18T23:59:59Z', // D-18
    cover_image_url: '/images/books/stamp_contract.png',
    status: 'live',
    creator_name: '김기현',
    category: '에세이',
    rewards: [
      { id: 'r4-1', title: '책 1권 후원', price: 16000, description: '《계약서에 도장을 찍고》 1권 + 바리스타 추천 드립백 2종' },
      { id: 'r4-2', title: '창작자 응원 세트', price: 23000, description: '도서 1권 + 드립백 세트 + 작가 친필 서명본' }
    ]
  },

  // 5. [펀딩 예정] 퇴사하러 출근합니다 (에세이)
  {
    id: 'mookk-sample-5',
    title: '퇴사하러 출근합니다',
    subtitle: '매일, 사표품고 출근하고 그냥 퇴근하는 당신에게 전하는\n30만 유튜버 김가현 작가의 퇴사부여 에세이',
    description: '매일, 사표품고 출근하고 그냥 퇴근하는 당신에게 전하는\n30만 유튜버 김가현 작가의 퇴사부여 에세이',
    detail_story: `💼 책 소개
아르바이트와 인턴 2년, 교육 회사의 조교로 1년. 치열한 삶의 현장에서 나만의 꿈을 찾아 결국 퇴사를 결정한 과정과 그 이후의 삶을 브이로그로 연재하며 30만 구독자에게 공감을 얻은 김가현 저자의 퇴사부여 에세이입니다.`,
    features: [
      '직장인 마음을 대변하는 캐릭터 종이 비행기 일러스트 표지',
      '퇴사 고민 노트 쓰기 특별 부록 사양',
      '따뜻한 라이트 크림 내지'
    ],
    spec: {
      subtitle: '매일, 사표품고 출근하고 그냥 퇴근하는 당신에게 전하는 30만 유튜버 김가현 작가의 퇴사부여 에세이',
      size: '128 x 188 mm',
      paper_inner: '미색 모조 90g',
      paper_cover: '스노우 250g',
      pages: '210쪽',
      binding: '무선 제본',
      isbn: '979-11-984321-5-2'
    },
    author_intro: "30만 구독자를 보유한 유튜브 '저, 퇴사할가현?' 채널의 운영자. 각종 아르바이트와 2곳의 인턴을 거쳐 IT 교육 회사 조교로 1년을 넘게 근무한 후, 홀연히 퇴사를 결심해 현재는 본인의 추구미를 담은 책 관련 미디어 플랫폼 창업을 준비 중.",
    publisher_intro: '천재 기획자로 불리는 김준 대표가 운영하는 개인의 브랜딩과 스토리텔링에 특화된 에세이 및 잡지 전문 출판사',
    publisher_name: '김준사',
    goal_amount: 2500000,
    current_amount: 0,
    backers_count: 0,
    deadline: '2026-09-01T23:59:59Z',
    cover_image_url: '/images/books/retire_work.png',
    status: 'upcoming',
    creator_name: '김가현',
    category: '에세이',
    rewards: [
      { id: 'r5-1', title: '알림 신청 전용 혜택', price: 16500, description: '도서 1권 + 퇴사 일기 부록 노트' },
      { id: 'r5-2', title: '[VIP 패키지] 도서 + 굿즈 + 저자와의 만남', price: 70000, description: '도서 1권 + 퇴사 일기 부록 노트 + 퇴사요정인형 키링 + 저자와의 만남 초대권' }
    ]
  },

  // 6. [펀딩 예정] 다시 또 여름 (문학)
  {
    id: 'mookk-sample-7',
    title: '다시 또 여름',
    subtitle: '그 해, 그 여름. 함께했던 뜨거운 여름의 공기',
    description: '그해 여름만큼 뜨겁던 첫 사랑의 강렬한 기억을 담은\n이여름 작가의 로맨스 소설',
    detail_story: `## ☀️ 책 소개
《다시 또 여름》은 분홍빛 모래사장과 옥빛 파도 소리가 가득한 여름 바닷가에서 시작된 소년 소녀의 파스텔빛 성장 소설입니다.`,
    features: [
      '파스텔 핑크 & 민트 감성의 올컬러 삽화 도판 수록',
      '이여름 작가의 여름 시 구절 엽서 세트',
      '무광 라미네이팅 표지 마감'
    ],
    spec: {
      subtitle: '그 해, 그 여름. 함께했던 뜨거운 여름의 공기',
      size: '135 x 200 mm',
      paper_inner: '랑데뷰 105g',
      paper_cover: '스노우 250g (무광 코팅)',
      pages: '256쪽',
      binding: '무선 제본',
      isbn: '979-11-984321-7-6'
    },
    author_intro: '이여름 작가. 계절의 변화 속에서 느껴지는 아련한 정서를 소설과 일러스트로 작업하고 있습니다.',
    publisher_intro: '청춘과 계절의 아름다움을 소장할 수 있는 도서로 만듭니다.',
    publisher_name: '여름 바다 서가',
    goal_amount: 3500000,
    current_amount: 0,
    backers_count: 0,
    deadline: '2026-09-10T23:59:59Z',
    cover_image_url: '/images/books/summer_again.png',
    status: 'upcoming',
    creator_name: '이여름',
    category: '문학',
    rewards: [
      { id: 'r7-1', title: '오픈 알림 리워드', price: 18000, description: '도서 1권 + 여름 바다 아크릴 책갈피' }
    ]
  },

  // 7. [펀딩 예정] 숲을 거닐며 떠오른 생각 (에세이)
  {
    id: 'mookk-sample-10',
    title: '숲을 거닐며 떠오른 생각',
    subtitle: '고요한 숲길 속 사색과 푸른 자연이 주는 위로',
    description: '브랜드 디자이너 박산책의\n숲 산책 루틴과 아이디어 발상 에세이',
    detail_story: `## 🌲 책 소개
《숲을 거닐며 떠오른 생각》은 숲속 길을 정처 없이 산책하며 발끝에 밟히는 나뭇잎 소리와 바람의 결을 보며 정립한 박산책 저자의 사색 에세이입니다.`,
    features: [
      '숲 향기가 날 것 같은 싱그러운 푸른 포플러 나무 표지',
      '수목원 산책 지도 인포그래픽 수록',
      '친환경 콩기름 인쇄'
    ],
    spec: {
      subtitle: '고요한 숲길 속 사색과 푸른 자연이 주는 위로',
      size: '128 x 188 mm',
      paper_inner: '친환경 재생지 90g',
      paper_cover: '크라프트지 220g',
      pages: '200쪽',
      binding: '무선 제본',
      isbn: '979-11-984321-9-0'
    },
    author_intro: '박산책 작가. 주말마다 숲을 산책하고 나무들의 이야기를 수집하는 사색가.',
    publisher_intro: '자연과 사람의 건강한 조화를 지향하는 그린 보이스 출판사.',
    publisher_name: 'design june',
    goal_amount: 2000000,
    current_amount: 0,
    backers_count: 0,
    deadline: '2026-09-15T23:59:59Z',
    cover_image_url: '/images/books/forest_thoughts.png',
    status: 'upcoming',
    creator_name: '박산책',
    category: '에세이',
    rewards: [
      { id: 'r10-1', title: '숲 패키지', price: 16000, description: '도서 1권 + 숲 엽서' }
    ]
  },

  // 8. [펀딩 예정] 북유럽 인테리어 공간 연출 가이드 (실용/취미/기타)
  {
    id: 'mookk-sample-8',
    title: '북유럽 인테리어 공간 연출 가이드',
    subtitle: 'Fragrance that fills your space - 내 집을 갤러리처럼 가꾸는 북유럽 홈스타일링',
    description: '디자인 전문가들이 정리한\n북유럽 스타일 공간 연출의 다양한 노하우',
    detail_story: `## 🏡 책 소개
《북유럽 인테리어 공간 연출 가이드》는 스칸디나비아 감성의 간결함과 따스한 조명, 미니멀한 조형미로 나만의 일상 공간을 갤러리처럼 연출하는 실전 홈스타일링 가이드북입니다.`,
    features: [
      '스웨덴/덴마크 현지 북유럽 하우스 화보 고화질 수록',
      '인테리어 컬러 칩 조화 팔레트 가이드 수록',
      '하드커버 대형 화보집 사양'
    ],
    spec: {
      subtitle: 'Fragrance that fills your space - 내 집을 갤러리처럼 가꾸는 북유럽 홈스타일링',
      size: '185 x 240 mm (대형 화보집)',
      paper_inner: '랑데뷰 130g (고화질 인쇄)',
      paper_cover: '하드커버 양장 제본',
      pages: '264쪽 (풀컬러)',
      binding: '양장 제본',
      isbn: '979-11-984321-8-3'
    },
    author_intro: '에밀리 한 공간디자이너. 북유럽에서 실내 건축을 전공하고 라이프스타일 브랜드 큐레이터로 활동 중입니다.',
    publisher_intro: '공간과 삶의 미학을 고화질 종이 화보 도서로 발간하는 디자이너스 북스.',
    publisher_name: '디자이너스 북스',
    goal_amount: 5000000,
    current_amount: 0,
    backers_count: 0,
    deadline: '2026-09-20T23:59:59Z',
    cover_image_url: '/images/books/nordic_interior.png',
    status: 'upcoming',
    creator_name: '에밀리 한',
    category: '실용/취미/기타',
    rewards: [
      { id: 'r8-1', title: '화보집 1권', price: 28000, description: '북유럽 인테리어 가이드 화보집 1권 + 인테리어 컬러 칩 미니북' }
    ]
  },

  // 9. [펀딩 종료] 이혼 후 결혼 (문학)
  {
    id: 'mookk-sample-6',
    title: '이혼 후 결혼',
    subtitle: '서로를 다시, 그리고 또 다시 선택한 유준 작가의 이야기',
    description: '이혼과 결혼을 반복한 두 주인공의 격정 사랑 소설,\n유준 작가의 세 번째 기대작',
    detail_story: `## 💍 책 소개
《이혼 후 결혼》은 수많은 아픔과 방황 끝에 서로의 소중함을 다시 깨닫고 또 한 번의 선택을 내린 남녀의 깊은 서사를 다룬 감동 장편소설입니다.`,
    features: [
      '유준 작가의 서재 한복스냅 사진 표지 적용',
      '펀딩 목표 320% 달성 성공 마감 도서',
      '고급 미색 양장 소장본'
    ],
    spec: {
      subtitle: '서로를 다시, 그리고 또 다시 선택한 유준 작가의 이야기',
      size: '130 x 195 mm',
      paper_inner: '모조지 90g',
      paper_cover: '아르떼 230g',
      pages: '310쪽',
      binding: '사반양장 제본',
      isbn: '979-11-984321-6-9'
    },
    author_intro: '유준 작가. 인간관계의 서사와 삶의 회복력에 대한 깊이 있는 통찰을 글로 녹여내는 소설가.',
    publisher_intro: '진솔한 인간의 삶과 사랑에 대한 이야기를 전합니다.',
    publisher_name: '다시 선택한 서가',
    goal_amount: 3000000,
    current_amount: 9600000,
    backers_count: 320,
    deadline: '2026-06-30T23:59:59Z',
    cover_image_url: '/images/books/marriage_after_divorce.jpg',
    status: 'succeeded',
    creator_name: '유준',
    category: '문학',
    rewards: [
      { id: 'r6-1', title: '펀딩 마감 성공 리워드', price: 19000, description: '도서 1권 + 양장 서명본' }
    ]
  },

  // 10. [펀딩 종료] 자전거로 달려간 420km (문학)
  {
    id: 'mookk-sample-9',
    title: '자전거로 달려간 420km',
    subtitle: '이 여정의 끝에 너를 만날 수 있다면 - 이륜차 저자의 420km 자전거 기행',
    description: '자전거만으로 홀로 전국을 다니며 쓴 단상을 모은\n이륜차 저자의 치유 힐링 에세이',
    detail_story: `## 🚴‍♂️ 책 소개
《자전거로 달려간 420km》는 국토종주 자전거길 420km를 페달로 저어가며 만난 사람들과 길 위의 풍경, 그리고 자신의 한계를 넘어서던 순간을 그리는 이륜차 저자의 감동 소설입니다.`,
    features: [
      '청량한 녹음 들판 자전거 일러스트 표지',
      '자전거 종주 지도 브로마이드 포함',
      '펀딩 성공 마감 도서'
    ],
    spec: {
      subtitle: '이 여정의 끝에 너를 만날 수 있다면',
      size: '130 x 190 mm',
      paper_inner: '모조지 100g',
      paper_cover: '스노우 250g',
      pages: '230쪽',
      binding: '무선 제본',
      isbn: '979-11-984321-9-9'
    },
    author_intro: '이륜차 작가. 자전거 여행가이자 감성 기행 문학 라이터.',
    publisher_intro: '길 위의 숨결을 책으로 담아냅니다.',
    publisher_name: '바람길 출판',
    goal_amount: 2000000,
    current_amount: 4100000,
    backers_count: 205,
    deadline: '2026-05-31T23:59:59Z',
    cover_image_url: '/images/books/bicycle_420km.png',
    status: 'succeeded',
    creator_name: '이륜차',
    category: '문학',
    rewards: [
      { id: 'r9-1', title: '성공 마감 도서', price: 17000, description: '도서 1권 + 종주 지도' }
    ]
  }
]

export const mockProjects = sampleProjects

export const mockPledges = [
  {
    id: 'pledge-demo-1',
    user_id: 'demo-user-1',
    project_id: 'mookk-real-1',
    reward_id: 'r1-1',
    pledge_amount: 18000,
    amount: 18000,
    payment_status: 'scheduled',
    created_at: '2026-07-28T10:00:00Z',
    address_locked: false,
    shipping_address: {
      recipientName: '김준',
      phone: '010-1234-5678',
      address: '서울특별시 마포구 독막로 123',
      detailAddress: '401호'
    },
    Project: {
      id: 'mookk-real-1',
      title: '계절을 건너는 온도',
      cover_image_url: '/images/books/season_cover.webp',
      deadline: '2026-08-12T23:59:59Z',
      status: 'live'
    }
  }
]
