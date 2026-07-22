-- Supabase SQL Editor 실행용 DDL 스크립트

-- 기존 트리거 및 함수 삭제 (재시도 가능하도록)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 기존 테이블 삭제 (외래 키 제약 조건 순서 고려)
DROP TABLE IF EXISTS public."Settlement";
DROP TABLE IF EXISTS public."Pledge";
DROP TABLE IF EXISTS public."Reward";
DROP TABLE IF EXISTS public."Project";
DROP TABLE IF EXISTS public."User";

-- UUID 확장 기능 활성화 (필요한 경우)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User 테이블 (Supabase Auth 연동)
CREATE TABLE public."User" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('creator', 'backer', 'admin')) DEFAULT 'backer',
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 회원가입 시 public.User 자동 인서트 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."User" (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', '사용자'),
    COALESCE(new.raw_user_meta_data->>'role', 'backer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
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

-- RLS (Row Level Security) 설정 및 기본 Policy 추가
-- (베타 단계에서의 원활한 개발을 위해 기본 RLS를 비활성화하거나, 모든 사용자가 Read/Write 가능하도록 정책을 단순화할 수 있으나,
-- 여기서는 필요 시 활성화할 수 있도록 기본 테이블 권한을 부여합니다.)
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Reward" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Pledge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Settlement" ENABLE ROW LEVEL SECURITY;

-- 기본 조회(Select)는 누구나 가능하게 허용하고, 쓰기는 각 역할 및 관계자에 따라 허용하는 기본 정책 생성
-- 1. User 테이블 Policy
CREATE POLICY "Users can view all user profiles" ON public."User" FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public."User" FOR UPDATE USING (auth.uid() = id);

-- 2. Project 테이블 Policy
CREATE POLICY "Projects are viewable by everyone" ON public."Project" FOR SELECT USING (true);
CREATE POLICY "Creators can insert their own projects" ON public."Project" FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update their own projects" ON public."Project" FOR UPDATE USING (auth.uid() = creator_id);

-- 3. Reward 테이블 Policy
CREATE POLICY "Rewards are viewable by everyone" ON public."Reward" FOR SELECT USING (true);
CREATE POLICY "Creators can manage rewards of their projects" ON public."Reward"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public."Project"
      WHERE public."Project".id = public."Reward".project_id
      AND public."Project".creator_id = auth.uid()
    )
  );

-- 4. Pledge 테이블 Policy
CREATE POLICY "Backers can view their own pledges" ON public."Pledge" FOR SELECT USING (auth.uid() = backer_id);
CREATE POLICY "Creators can view pledges for their projects" ON public."Pledge" FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public."Project"
    WHERE public."Project".id = public."Pledge".project_id
    AND public."Project".creator_id = auth.uid()
  )
);
CREATE POLICY "Backers can insert their own pledges" ON public."Pledge" FOR INSERT WITH CHECK (auth.uid() = backer_id);
CREATE POLICY "Backers can update their own pending pledges" ON public."Pledge" FOR UPDATE USING (auth.uid() = backer_id AND payment_status = 'pending');

-- 5. Settlement 테이블 Policy
CREATE POLICY "Creators can view settlements of their projects" ON public."Settlement" FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public."Project"
    WHERE public."Project".id = public."Settlement".project_id
    AND public."Project".creator_id = auth.uid()
  )
);