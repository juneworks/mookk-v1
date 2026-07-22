# Mookk(묶) v1.0 통합 PRD & 기술 명세서 (Mock 결제 적용)


## 1. 프로젝트 개요 & 핵심 목적
- **서비스명:** Mookk (종이책 전문 크라우드펀딩 플랫폼)
- **목표:** 2026년 7월 31일 안정적인 v1.0 베타 서비스 라이브 오픈 (5일 내 핵심 개발 완료)
- **개발 방침:** 
  - PG사 정식 SDK 연동은 유예하고 **가상 결제(Mock Payment) 플로우**로 빠른 오픈 검증을 진행한다.
  - **단, 정식 PG 연동 시 DB 변경이 없도록 DB 스키마(Pledge의 billing_key, 배송지 정보 등) 구조는 100% 동일하게 유지·보존한다.**
  - UI는 shadcn/ui 기본 컴포넌트를 활용하여 디자인 공수를 최소화하고 데이터 플로우 완성에 집중한다.


## 2. 확정 테크 스택
- **Frontend:** Next.js (App Router, TypeScript) + Tailwind CSS + shadcn/ui
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Vercel (GitHub 연동 자동 배포)
- **Payment (Mock):** 가상 빌링키(Mock Billing Key) 생성 기반 All-or-Nothing 예약 결제 모의 처리


## 3. 데이터베이스 스키마 (Supabase SQL)
*주의: AI는 아래 필드명 및 테이블 구조를 자의적으로 삭제하거나 변경할 수 없음.*

```sql
-- 1. User 테이블 (Supabase Auth 연동)
CREATE TABLE public."User" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('creator', 'backer', 'admin')) DEFAULT 'backer',
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 회원가입 시 public.User 자동 인서트 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$ BEGIN   INSERT INTO public."User" (id, email, name, role)   VALUES (     new.id,     new.email,     COALESCE(new.raw_user_meta_data->>'name', '사용자'),     COALESCE(new.raw_user_meta_data->>'role', 'backer')   );   RETURN new; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Project 테이블
CREATE TABLE public."Project" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_amount INTEGER NOT NULL,
  current_amount INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('draft', 'live', 'succeeded', 'failed', 'closed')) DEFAULT 'draft',
  deadline TIMESTAMPTZ NOT NULL,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Reward 테이블
CREATE TABLE public."Reward" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public."Project"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT NOT NULL
);

-- 4. Pledge 테이블 (후원, 배송, 가상 빌링키 정보)
CREATE TABLE public."Pledge" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public."Project"(id) ON DELETE CASCADE,
  backer_id UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public."Reward"(id),
  amount INTEGER NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  billing_key TEXT,
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Settlement 테이블 (자동 정산 내역)
CREATE TABLE public."Settlement" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public."Project"(id) ON DELETE CASCADE,
  total_amount INTEGER NOT NULL,
  pg_fee INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL,
  payout_amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'calculated', 'completed', 'failed')) DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);


## 4. 화면 및 라우팅 구조 (Screen Map)
- / : 메인 홈 (status='live' 프로젝트 리스트, 카드로 진행률/모금액 표시)
- /projects/[id] : 상세 페이지 (책 상세 설명, 리워드 선택, 가상 결제 예약 모달)
- /projects/create : 저자용 프로젝트 개설 페이지 (status='draft' 저장, Storage 이미지 업로드)
- /login : 이메일/비밀번호 로그인 및 회원가입 (역할 선택: 저자/후원자)
- /mypage : 마이페이지 (후원자의 Pledge 내역 및 배송지 정보 / 창작자의 Project 및 정산 예정액 표시)


## 5. 핵심 유저 & 비즈니스 플로우 (Mock 적용)
- 저자(Creator): 가입(Role: creator) → 프로젝트/리워드 등록 (status='draft') → Supabase 콘솔에서 수동 승인 (status='live') → 마감 후 정산금 조회
- 후원자(Backer): 가입(Role: backer) → 프로젝트 탐색 → 리워드 선택 → 배송지 입력 & [가상 예약결제 완료] 클릭 → 시스템에서 mock_billing_key_xxxx 생성 후 Pledge 저장 (payment_status='pending')
- 배치 결제 & 정산 Engine: 프로젝트 마감 시 백엔드 API (/api/batch-payment) 실행 → 가상 빌링키 일괄 승인 처리 (payment_status='paid') → 결제 성공액 집계 후 수수료 계산 (pg_fee = 3.3%, platform_fee = 5.0%) → Settlement 레코드 자동 생성


## 6. Antigravity IDE 작업 행동 수칙 
- One-Session, One-Task: 한 세션에 오직 하나의 하위 작업만 지시한다.
- Schema Protection: PG SDK를 생략하더라도 DB 스키마 필드를 임의로 삭제하거나 변형하지 않는다.
- Environment Variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 클라이언트용으로, SUPABASE_SERVICE_ROLE_KEY는 서버 API 전용으로 분리 관리한다.