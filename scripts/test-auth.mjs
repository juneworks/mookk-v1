import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yidtamzuuogralhophha.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function runAuthTests() {
  console.log('====================================================')
  console.log('🚀 [MOOKK] 백엔드 인증(Auth & DB) 종합 자체 테스트 시작')
  console.log('====================================================')
  console.log(`- Supabase URL: ${SUPABASE_URL}`)
  console.log(`- Anon Key 존재 여부: ${Boolean(SUPABASE_ANON_KEY)}`)
  console.log(`- Service Key 존재 여부: ${Boolean(SUPABASE_SERVICE_KEY)}`)
  console.log('')

  const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const timestamp = Date.now()
  const testEmail = `test_user_${timestamp}@mookk.kr`
  const testPassword = `TestPass1234!@#`
  const testName = `테스터_${timestamp}`
  const testRole = 'backer'

  let createdUserId = null

  // ----------------------------------------------------
  // TEST 1: 회원가입 (SignUp) 테스트
  // ----------------------------------------------------
  console.log('▶ [TEST 1] 회원가입 (SignUp) API 테스트')
  try {
    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
          role: testRole,
          phone: '010-1234-5678',
        }
      }
    })

    if (signUpError) {
      console.error('❌ 회원가입 실패:', signUpError.message)
    } else {
      createdUserId = signUpData?.user?.id
      console.log('✅ 회원가입 성공!')
      console.log(`   - User ID: ${createdUserId}`)
      console.log(`   - Email: ${signUpData?.user?.email}`)
      console.log(`   - Metadata Name: ${signUpData?.user?.user_metadata?.name}`)
      console.log(`   - Metadata Role: ${signUpData?.user?.user_metadata?.role}`)
      console.log(`   - Session 생성 여부: ${Boolean(signUpData?.session)}`)
    }
  } catch (err) {
    console.error('❌ 회원가입 예외 발생:', err)
  }

  console.log('')

  // ----------------------------------------------------
  // TEST 2: DB User 테이블 트리거 및 프로필 확인
  // ----------------------------------------------------
  console.log('▶ [TEST 2] public."User" 프로필 테이블 동기화 확인')
  if (createdUserId) {
    try {
      const { data: userProfile, error: profileError } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('id', createdUserId)
        .single()

      if (profileError) {
        console.log('ℹ️ public.User 테이블 직접 조회 결과:', profileError.message)
      } else {
        console.log('✅ public.User 프로필 테이블 동기화 성공!')
        console.log(`   - Profile:`, userProfile)
      }
    } catch (err) {
      console.error('❌ 프로필 확인 예외:', err)
    }
  }

  console.log('')

  // ----------------------------------------------------
  // TEST 3: 정상 로그인 (SignIn With Password)
  // ----------------------------------------------------
  console.log('▶ [TEST 3] 정상 로그인 (SignIn with Password) 테스트')
  try {
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (signInError) {
      console.error('❌ 로그인 실패:', signInError.message)
    } else {
      console.log('✅ 로그인 성공!')
      console.log(`   - Access Token 발급 완료 (길이: ${signInData.session?.access_token?.length}자)`)
      console.log(`   - 토큰 만료 시간: ${new Date((signInData.session?.expires_at || 0) * 1000).toLocaleString()}`)
      console.log(`   - User Email: ${signInData.user?.email}`)
    }
  } catch (err) {
    console.error('❌ 로그인 예외 발생:', err)
  }

  console.log('')

  // ----------------------------------------------------
  // TEST 4: 잘못된 비밀번호로 로그인 시도시 예외 검증
  // ----------------------------------------------------
  console.log('▶ [TEST 4] 잘못된 비밀번호 로그인 시도시 예외 처리 테스트')
  try {
    const { data: failData, error: failError } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: 'WRONG_PASSWORD_123',
    })

    if (failError) {
      console.log('✅ 정상적으로 로그인 거부 처리됨!')
      console.log(`   - 반환 에러 메시지: "${failError.message}"`)
    } else {
      console.error('❌ 잘못된 비밀번호인데 로그인이 허용됨 (비정상)')
    }
  } catch (err) {
    console.error('❌ 로그인 실패 테스트 예외:', err)
  }

  console.log('')

  // ----------------------------------------------------
  // TEST 5: 비밀번호 재설정 이메일 발송 요청 테스트
  // ----------------------------------------------------
  console.log('▶ [TEST 5] 비밀번호 재설정 (Reset Password) 요청 테스트')
  try {
    const { data: resetData, error: resetError } = await supabaseAnon.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'https://mookk.kr/login'
    })

    if (resetError) {
      console.error('❌ 비밀번호 재설정 요청 실패:', resetError.message)
    } else {
      console.log('✅ 비밀번호 재설정 요청 API 성공!')
    }
  } catch (err) {
    console.error('❌ 비밀번호 재설정 예외:', err)
  }

  console.log('')

  // ----------------------------------------------------
  // TEST 6: 로그아웃 (SignOut) 테스트
  // ----------------------------------------------------
  console.log('▶ [TEST 6] 로그아웃 (SignOut) API 테스트')
  try {
    const { error: signOutError } = await supabaseAnon.auth.signOut()
    if (signOutError) {
      console.error('❌ 로그아웃 실패:', signOutError.message)
    } else {
      console.log('✅ 로그아웃 성공 (세션 정리 완료)')
    }
  } catch (err) {
    console.error('❌ 로그아웃 예외:', err)
  }

  console.log('')

  // ----------------------------------------------------
  // TEST 7: 테스트용 계정 삭제 (Cleanup)
  // ----------------------------------------------------
  console.log('▶ [CLEANUP] 테스트 계정 정리 (삭제)')
  if (createdUserId) {
    try {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(createdUserId)
      if (deleteError) {
        console.log('⚠️ 테스트 계정 삭제 실패:', deleteError.message)
      } else {
        console.log('✅ 테스트 계정 안전하게 삭제 완료')
      }
    } catch (err) {
      console.log('⚠️ 계정 삭제 예외:', err)
    }
  }

  console.log('')
  console.log('====================================================')
  console.log('🎉 [MOOKK] 백엔드 인증 자체 테스트 완료')
  console.log('====================================================')
}

runAuthTests()
