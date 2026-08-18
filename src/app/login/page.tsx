'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

type AuthMode = 'login' | 'signup' | 'find-id' | 'find-pw'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // 모드 상태: 'login' | 'signup' | 'find-id' | 'find-pw'
  const [mode, setMode] = useState<AuthMode>('login')

  // URL 쿼리 파라미터로 모드 초기화 (예: /login?mode=signup)
  useEffect(() => {
    const modeParam = searchParams.get('mode') as AuthMode
    if (modeParam && ['login', 'signup', 'find-id', 'find-pw'].includes(modeParam)) {
      setMode(modeParam)
    }
  }, [searchParams])

  // 공통 로딩 & 메시지 상태
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // 1. 로그인 폼 상태 (001.png 매칭)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // 2. 회원가입 폼 상태 (002.png 매칭)
  const [memberRole, setMemberRole] = useState<'backer' | 'creator'>('backer')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpPasswordConfirm, setSignUpPasswordConfirm] = useState('')
  const [signUpName, setSignUpName] = useState('')
  
  // 휴대전화 번호 분할
  const [phonePrefix, setPhonePrefix] = useState('010')
  const [phoneMid, setPhoneMid] = useState('')
  const [phoneLast, setPhoneLast] = useState('')

  // 약관 동의 상태
  const [agreeAll, setAgreeAll] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [agreeSms, setAgreeSms] = useState(false)
  const [agreeEmail, setAgreeEmail] = useState(false)

  // 전체 동의 핸들러
  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked)
    setAgreeTerms(checked)
    setAgreePrivacy(checked)
    setAgreeSms(checked)
    setAgreeEmail(checked)
  }

  // 개별 동의 변경 시 전체 동의 상태 동기화
  useEffect(() => {
    if (agreeTerms && agreePrivacy && agreeSms && agreeEmail) {
      setAgreeAll(true)
    } else {
      setAgreeAll(false)
    }
  }, [agreeTerms, agreePrivacy, agreeSms, agreeEmail])

  // 3. 비밀번호 찾기 & 아이디 찾기 상태
  const [findEmail, setFindEmail] = useState('')
  const [findName, setFindName] = useState('')
  const [findPhone, setFindPhone] = useState('')

  // 모드 변경 시 에러/성공 메시지 초기화
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  // --- [로그인 처리] ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('아이디와 패스워드를 모두 입력해 주세요.')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('아이디(이메일) 또는 패스워드가 올바르지 않습니다.')
        } else {
          setErrorMessage(error.message)
        }
        return
      }

      setSuccessMessage('로그인되었습니다. 홈으로 이동합니다.')
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 400)
    } catch (err: any) {
      setErrorMessage(err.message || '로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // --- [회원가입 처리] ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!signUpEmail.trim()) {
      setErrorMessage('아이디(이메일)를 입력해 주세요.')
      setLoading(false)
      return
    }

    if (!signUpPassword) {
      setErrorMessage('비밀번호를 입력해 주세요.')
      setLoading(false)
      return
    }

    if (signUpPassword !== signUpPasswordConfirm) {
      setErrorMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      setLoading(false)
      return
    }

    if (!signUpName.trim()) {
      setErrorMessage('이름을 입력해 주세요.')
      setLoading(false)
      return
    }

    if (!agreeTerms || !agreePrivacy) {
      setErrorMessage('필수 이용약관 및 개인정보 수집에 동의해 주세요.')
      setLoading(false)
      return
    }

    const fullPhone = `${phonePrefix}-${phoneMid}-${phoneLast}`

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail.trim(),
        password: signUpPassword,
        options: {
          data: {
            name: signUpName.trim(),
            role: memberRole,
            phone: fullPhone,
            agree_sms: agreeSms,
            agree_email: agreeEmail,
          },
        },
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      if (data?.session) {
        setSuccessMessage('회원가입이 완료되었습니다. 자동으로 로그인됩니다.')
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 800)
      } else {
        setSuccessMessage('회원가입이 완료되었습니다! 가입하신 이메일의 인증 링크를 확인해 주세요.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || '회원가입 중 에러가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // --- [비밀번호 찾기 처리] ---
  const handleFindPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!findEmail.trim()) {
      setErrorMessage('가입하신 이메일(아이디)을 입력해 주세요.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(findEmail.trim(), {
        redirectTo: `${window.location.origin}/login`,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      setSuccessMessage('입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.')
    } catch (err: any) {
      setErrorMessage(err.message || '비밀번호 재설정 메일 발송 중 에러가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-white text-[#222222] flex flex-col justify-center items-center px-4 pt-28 sm:pt-36 pb-24">
      {/* 
        ============================================================
        VIEW 1: 로그인 폼 (001.png 매거진B 스타일 100% 동일 구현)
        ============================================================
      */}
      {mode === 'login' && (
        <div className="w-full max-w-[380px] sm:max-w-[400px] mx-auto animate-in fade-in duration-300">
          {/* 메시지 알림 */}
          {errorMessage && (
            <div className="mb-5 p-3 text-xs sm:text-[13px] text-red-600 bg-red-50 border border-red-200">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-5 p-3 text-xs sm:text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-3">
            {/* 타이틀 (가운데 정렬 & 2배 크기) */}
            <div className="pb-4 text-center">
              <h2 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#111111]">로그인</h2>
            </div>

            {/* 아이디 인풋 */}
            <div>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="아이디"
                autoComplete="email"
                className="w-full h-[50px] px-4 border border-[#e5e5e5] rounded-none text-sm text-[#222222] placeholder:text-[#999999] focus:outline-none focus:border-[#222222] transition-colors"
              />
            </div>

            {/* 패스워드 인풋 */}
            <div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="패스워드"
                autoComplete="current-password"
                className="w-full h-[50px] px-4 border border-[#e5e5e5] rounded-none text-sm text-[#222222] placeholder:text-[#999999] focus:outline-none focus:border-[#222222] transition-colors"
              />
            </div>

            {/* 로그인 버튼 (다크 차콜 사각 버튼) */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-[#222222] hover:bg-[#111111] active:bg-black text-white font-medium text-sm rounded-none transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </div>
          </form>

          {/* 하단 링크 목록 (001.png 매칭) */}
          <div className="mt-8 flex items-center justify-center gap-2.5 text-xs text-[#777777]">
            <Link
              href="/funding"
              className="hover:text-[#222222] transition-colors"
            >
              주문조회
            </Link>
            <span className="text-[#e5e5e5]">|</span>
            <button
              type="button"
              onClick={() => switchMode('find-id')}
              className="hover:text-[#222222] transition-colors cursor-pointer"
            >
              아이디찾기
            </button>
            <span className="text-[#e5e5e5]">|</span>
            <button
              type="button"
              onClick={() => switchMode('find-pw')}
              className="hover:text-[#222222] transition-colors cursor-pointer"
            >
              비밀번호찾기
            </button>
            <span className="text-[#e5e5e5]">|</span>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="hover:text-[#222222] transition-colors cursor-pointer font-medium"
            >
              회원가입
            </button>
          </div>
        </div>
      )}

      {/* 
        ============================================================
        VIEW 2: 회원가입 폼 (002.png 매거진B 스타일 100% 동일 구현)
        ============================================================
      */}
      {mode === 'signup' && (
        <div className="w-full max-w-[420px] sm:max-w-[440px] mx-auto animate-in fade-in duration-300">
          {/* 메시지 알림 */}
          {errorMessage && (
            <div className="mb-6 p-3 text-xs sm:text-[13px] text-red-600 bg-red-50 border border-red-200">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-3 text-xs sm:text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-8">
            {/* 1. 회원인증 */}
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-[#111111]">회원인증</h3>
              
              <div className="flex items-center gap-6 text-xs text-[#333333]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="memberRole"
                    value="backer"
                    checked={memberRole === 'backer'}
                    onChange={() => setMemberRole('backer')}
                    className="w-3.5 h-3.5 accent-[#222222]"
                  />
                  <span>개인회원 (후원자)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="memberRole"
                    value="creator"
                    checked={memberRole === 'creator'}
                    onChange={() => setMemberRole('creator')}
                    className="w-3.5 h-3.5 accent-[#222222]"
                  />
                  <span>창작자회원 (저자/출판사)</span>
                </label>
              </div>

              {/* 휴대폰 인증 안내 라인 */}
              <div className="flex items-center gap-3 pt-2 text-xs text-[#666666]">
                <span className="inline-block w-3.5 h-3.5 rounded-full border border-[#999999] flex items-center justify-center text-[9px]">●</span>
                <span>휴대폰인증</span>
                <span className="text-[#888888]">휴대폰인증</span>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneVerified(true)
                    alert('휴대폰 간편 인증이 완료되었습니다.')
                  }}
                  className="px-2.5 py-1 bg-[#888888] hover:bg-[#666666] text-white text-[11px] font-medium rounded-none flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>📱</span>
                  <span>{phoneVerified ? '인증완료' : '휴대폰 인증'}</span>
                </button>
              </div>
            </div>

            <div className="border-b border-[#eeeeee]" />

            {/* 2. 기본정보 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[#111111]">기본정보</h3>
                <span className="text-[11px] text-[#888888]">필수 *</span>
              </div>

              {/* 아이디 (이메일) */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#333333] font-medium">아이디 *</label>
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="이메일 주소를 입력해 주세요"
                  className="w-full h-[46px] px-3.5 border border-[#e5e5e5] rounded-none text-xs sm:text-sm text-[#222222] focus:outline-none focus:border-[#222222]"
                />
              </div>

              {/* 비밀번호 */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#333333] font-medium">비밀번호 *</label>
                <input
                  type="password"
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="영문, 숫자, 특수문자 조합 6자 이상"
                  className="w-full h-[46px] px-3.5 border border-[#e5e5e5] rounded-none text-xs sm:text-sm text-[#222222] focus:outline-none focus:border-[#222222]"
                />
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#333333] font-medium">비밀번호 확인 *</label>
                <input
                  type="password"
                  required
                  value={signUpPasswordConfirm}
                  onChange={(e) => setSignUpPasswordConfirm(e.target.value)}
                  placeholder="비밀번호를 다시 입력해 주세요"
                  className="w-full h-[46px] px-3.5 border border-[#e5e5e5] rounded-none text-xs sm:text-sm text-[#222222] focus:outline-none focus:border-[#222222]"
                />
              </div>

              {/* 이름 */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#333333] font-medium">이름 *</label>
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="이름을 입력해 주세요"
                  className="w-full h-[46px] px-3.5 border border-[#e5e5e5] rounded-none text-xs sm:text-sm text-[#222222] focus:outline-none focus:border-[#222222]"
                />
              </div>

              {/* 휴대전화 */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#333333] font-medium">휴대전화 *</label>
                <div className="grid grid-cols-7 gap-2 items-center">
                  <select
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    className="col-span-2 h-[46px] px-2 border border-[#e5e5e5] rounded-none text-xs sm:text-sm text-[#222222] bg-white focus:outline-none focus:border-[#222222]"
                  >
                    <option value="010">010</option>
                    <option value="011">011</option>
                    <option value="016">016</option>
                    <option value="017">017</option>
                    <option value="018">018</option>
                    <option value="019">019</option>
                  </select>
                  <span className="text-center text-zinc-400">-</span>
                  <input
                    type="text"
                    maxLength={4}
                    value={phoneMid}
                    onChange={(e) => setPhoneMid(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0000"
                    className="col-span-2 h-[46px] px-2 text-center border border-[#e5e5e5] rounded-none text-xs sm:text-sm text-[#222222] focus:outline-none focus:border-[#222222]"
                  />
                  <span className="text-center text-zinc-400">-</span>
                  <input
                    type="text"
                    maxLength={4}
                    value={phoneLast}
                    onChange={(e) => setPhoneLast(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0000"
                    className="col-span-2 h-[46px] px-2 text-center border border-[#e5e5e5] rounded-none text-xs sm:text-sm text-[#222222] focus:outline-none focus:border-[#222222]"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-[#eeeeee]" />

            {/* 3. 서비스 이용 동의 */}
            <div className="space-y-4 text-xs text-[#444444]">
              <h3 className="text-[13px] font-bold text-[#111111]">서비스 이용 동의</h3>

              {/* 전체 동의 박스 */}
              <div className="space-y-1 pt-1">
                <label className="flex items-center gap-2 font-bold text-[#111111] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeAll}
                    onChange={(e) => handleAgreeAll(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#222222]"
                  />
                  <span>이용약관에 모두 동의합니다. (선택 정보 포함)</span>
                </label>
                <p className="text-[11px] text-[#888888] pl-5.5">
                  이용약관 및 개인정보수집 및 이용에 모두 동의합니다.
                </p>
              </div>

              <div className="border-b border-[#f2f2f2] my-3" />

              {/* 개별 체크 항목들 */}
              <div className="space-y-2.5 pl-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#222222]"
                  />
                  <span>
                    [필수] <Link href="/terms" target="_blank" className="underline text-[#222222]">이용약관</Link>에 동의합니다.
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#222222]"
                  />
                  <span>
                    [필수] <Link href="/privacy" target="_blank" className="underline text-[#222222]">개인정보 수집 및 이용</Link>에 동의합니다.
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeSms}
                    onChange={(e) => setAgreeSms(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#222222]"
                  />
                  <span>[선택] SMS 수신여부에 동의합니다.</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeEmail}
                    onChange={(e) => setAgreeEmail(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#222222]"
                  />
                  <span>[선택] 이메일 수신여부에 동의합니다.</span>
                </label>
              </div>
            </div>

            {/* 가입하기 버튼 */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-[#222222] hover:bg-[#111111] active:bg-black text-white font-bold text-sm rounded-none transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {loading ? '가입 처리 중...' : '가입하기'}
              </button>
            </div>

            {/* 로그인으로 돌아가기 */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-xs text-[#777777] hover:text-[#222222] transition-colors underline cursor-pointer"
              >
                이미 계정이 있으신가요? 로그인으로 이동
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 
        ============================================================
        VIEW 3: 아이디 찾기 폼
        ============================================================
      */}
      {mode === 'find-id' && (
        <div className="w-full max-w-[380px] sm:max-w-[400px] mx-auto animate-in fade-in duration-300">
          <div className="text-center mb-6">
            <h2 className="text-base font-bold text-[#111111]">아이디 찾기</h2>
            <p className="text-xs text-[#777777] mt-1">
              가입 시 등록하신 이름과 휴대전화 번호를 입력해 주세요.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 text-xs text-red-600 bg-red-50 border border-red-200">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-5 p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200">
              {successMessage}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!findName.trim() || !findPhone.trim()) {
                setErrorMessage('이름과 휴대전화 번호를 모두 입력해 주세요.')
                return
              }
              setErrorMessage(null)
              setSuccessMessage('가입된 계정 안내: 가입 시 사용하신 이메일로 로그인해 주시기 바랍니다. 분실 시 관리자에게 문의해 주세요.')
            }}
            className="space-y-3"
          >
            <div>
              <input
                type="text"
                value={findName}
                onChange={(e) => setFindName(e.target.value)}
                placeholder="이름"
                className="w-full h-[50px] px-4 border border-[#e5e5e5] rounded-none text-sm text-[#222222] placeholder:text-[#999999] focus:outline-none focus:border-[#222222]"
              />
            </div>

            <div>
              <input
                type="text"
                value={findPhone}
                onChange={(e) => setFindPhone(e.target.value)}
                placeholder="휴대전화 번호 (01012345678)"
                className="w-full h-[50px] px-4 border border-[#e5e5e5] rounded-none text-sm text-[#222222] placeholder:text-[#999999] focus:outline-none focus:border-[#222222]"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full h-[52px] bg-[#222222] hover:bg-[#111111] text-white font-medium text-sm rounded-none transition-colors cursor-pointer"
              >
                아이디 찾기
              </button>
            </div>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2.5 text-xs text-[#777777]">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="hover:text-[#222222] transition-colors cursor-pointer font-medium"
            >
              로그인
            </button>
            <span className="text-[#e5e5e5]">|</span>
            <button
              type="button"
              onClick={() => switchMode('find-pw')}
              className="hover:text-[#222222] transition-colors cursor-pointer"
            >
              비밀번호찾기
            </button>
            <span className="text-[#e5e5e5]">|</span>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="hover:text-[#222222] transition-colors cursor-pointer"
            >
              회원가입
            </button>
          </div>
        </div>
      )}

      {/* 
        ============================================================
        VIEW 4: 비밀번호 찾기 폼
        ============================================================
      */}
      {mode === 'find-pw' && (
        <div className="w-full max-w-[380px] sm:max-w-[400px] mx-auto animate-in fade-in duration-300">
          <div className="text-center mb-6">
            <h2 className="text-base font-bold text-[#111111]">비밀번호 찾기</h2>
            <p className="text-xs text-[#777777] mt-1">
              가입하신 이메일(아이디)을 입력하시면 재설정 링크를 보내드립니다.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 text-xs text-red-600 bg-red-50 border border-red-200">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-5 p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleFindPassword} className="space-y-3">
            <div>
              <input
                type="email"
                required
                value={findEmail}
                onChange={(e) => setFindEmail(e.target.value)}
                placeholder="아이디 (이메일 주소)"
                className="w-full h-[50px] px-4 border border-[#e5e5e5] rounded-none text-sm text-[#222222] placeholder:text-[#999999] focus:outline-none focus:border-[#222222]"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-[#222222] hover:bg-[#111111] text-white font-medium text-sm rounded-none transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? '발송 중...' : '비밀번호 재설정 메일 발송'}
              </button>
            </div>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2.5 text-xs text-[#777777]">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="hover:text-[#222222] transition-colors cursor-pointer font-medium"
            >
              로그인
            </button>
            <span className="text-[#e5e5e5]">|</span>
            <button
              type="button"
              onClick={() => switchMode('find-id')}
              className="hover:text-[#222222] transition-colors cursor-pointer"
            >
              아이디찾기
            </button>
            <span className="text-[#e5e5e5]">|</span>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="hover:text-[#222222] transition-colors cursor-pointer"
            >
              회원가입
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen bg-white" />}>
      <LoginContent />
    </Suspense>
  )
}
