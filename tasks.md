# Mookk v1.0 초압축 개발 현황판 (Tasks.md)

## 📌 전체 진행 상황: 5 / 21 완료 (23%)

---

### [Phase 0] 기준 문서 및 환경 준비
- [x] `prd.md` 파일 최상위 생성 및 가상 결제 방침 확인
- [x] `tasks.md` 현황판 세팅

### [Phase 1] DB & 배포 파이프라인 연동
- [ ] Supabase 프로젝트 생성 및 API Key (`URL`, `anon_key`, `service_role_key`) 확보
- [x] Supabase SQL Editor에서 5개 테이블 스키마 및 Auth Trigger DDL 전체 실행
- [x] Next.js (App Router) + Tailwind + shadcn/ui 프로젝트 기본 뼈대 생성
- [x] Supabase 브라우저용 / 서버용 클라이언트 유틸리티 파일 생성 (`utils/supabase`)
- [ ] GitHub 푸시 및 Vercel 실서버 배포 연동 테스트

### [Phase 2] 회원가입 및 역할(Role) 관리
- [ ] Supabase Auth 기반 이메일/비밀번호 회원가입 컴포넌트 구현
- [ ] 회원가입 시 역할(저자로 시작하기 / 후원자로 시작하기) 선택 UI 및 DB 바인딩
- [ ] 로그인 / 로그아웃 기능 및 GNB 로그인 상태 반영

### [Phase 3] 프로젝트 CRUD & 파일 업로드
- [ ] Supabase Storage 버킷 생성 (프로젝트 커버 이미지용)
- [ ] 저자용 프로젝트 개설 폼 구현 (`title`, `description`, `goal_amount`, `deadline`, 이미지 업로드)
- [ ] 리워드 동적 추가 UI 구현 (`title`, `price`, `description`) 및 DB 저장 (`status='draft'`)
- [ ] 메인 홈 (`/`) `status='live'` 프로젝트 카드 리스트 바인딩
- [ ] 프로젝트 상세 페이지 (`/projects/[id]`) 상세 정보 및 리워드 목록 바인딩

### [Phase 4] 가상 예약 결제(Mock Payment) 플로우
- [ ] 상세 페이지 내 배송 정보 입력 폼 (수령인, 연락처, 주소) 구현
- [ ] [가상 예약결제 완료] 버튼 모달 구현 및 `mock_billing_key_xxxx` 생성 로직 연결
- [ ] 빌링키 및 배송 정보 포함 `Pledge` 데이터 저장 (`payment_status='pending'`)

### [Phase 5] 마감 배치 결제 & 자동 정산 엔진
- [ ] 백엔드 배치 결제 API Route (`app/api/batch-payment/route.ts`) 작성
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 활용 배치 실행 시 Pledge 상태 업데이트 (`paid`)
- [ ] 수수료(PG 3.3%, 플랫폼 5%) 자동 계산 및 `Settlement` 테이블 자동 인서트 구현
- [ ] 마감 배치 실행을 위한 수동 관리자 호출 버튼 또는 배치 실행 테스트

### [Phase 6] 마이페이지 & 최종 QA
- [ ] 후원자 마이페이지 (`/mypage`): 내가 후원한 `Pledge` 리스트 및 배송 상태 표시
- [ ] 창작자 마이페이지 (`/mypage`): 내가 개설한 프로젝트 모금액 및 예상 정산금 표시
- [ ] E2E 전체 시나리오 테스트 (가입 → 프로젝트 생성 → 수동 승인 → 가상 후원 → 배치 정산)