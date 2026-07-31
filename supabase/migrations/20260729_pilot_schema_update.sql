-- 1. Pledge 테이블 컬럼 확장 (재시도 및 배송지 잠금)
ALTER TABLE "Pledge" 
ADD COLUMN IF NOT EXISTS "payment_status" TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS "retry_count" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "next_retry_at" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "address_locked" BOOLEAN DEFAULT false;

-- 2. 동시성 보장 후원 취소 원자적 RPC 함수 (cancel_pledge_atomic)
CREATE OR REPLACE FUNCTION cancel_pledge_atomic(p_pledge_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pledge RECORD;
  v_project RECORD;
BEGIN
  -- 1) 대상 pledge 조회 및 본인 소유 확인
  SELECT * INTO v_pledge 
  FROM "Pledge" 
  WHERE "id" = p_pledge_id AND "user_id" = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', '후원 내역을 찾을 수 없거나 권한이 없습니다.');
  END IF;

  -- 2) 이미 취소되었는지 확인
  IF v_pledge.payment_status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'message', '이미 취소된 후원건입니다.');
  END IF;

  -- 3) 프로젝트 조회 및 마감 24시간 전 기한 검증
  SELECT * INTO v_project 
  FROM "Project" 
  WHERE "id" = v_pledge.project_id;

  IF v_project.deadline - INTERVAL '24 hours' < NOW() THEN
    RETURN jsonb_build_object('success', false, 'message', '펀딩 마감 24시간 전 이후에는 후원 취소가 불가능합니다.');
  END IF;

  -- 4) Pledge 상태 'cancelled'로 변경
  UPDATE "Pledge"
  SET "payment_status" = 'cancelled',
      "updated_at" = NOW()
  WHERE "id" = p_pledge_id;

  -- 5) Project 원자적 차감 (current_amount, backers_count)
  UPDATE "Project"
  SET "current_amount" = GREATEST(0, "current_amount" - v_pledge.amount),
      "backers_count" = GREATEST(0, "backers_count" - 1),
      "updated_at" = NOW()
  WHERE "id" = v_pledge.project_id;

  RETURN jsonb_build_object('success', true, 'message', '후원이 성공적으로 취소되었습니다.');
END;
$$;
