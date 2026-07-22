'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  // 공통 로딩 상태 및 메시지
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // 로그인 상태값
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // 회원가입 상태값
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpName, setSignUpName] = useState('')
  const [signUpRole, setSignUpRole] = useState<'creator' | 'backer'>('backer')

  // 로그인 제출
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      setSuccessMessage('로그인에 성공했습니다. 홈으로 이동합니다.')
      
      // 세션 정보를 동기화하고 홈으로 리다이렉트
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 500)
    } catch (err: any) {
      setErrorMessage(err.message || '로그인 중 알 수 없는 에러가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 회원가입 제출
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!signUpName.trim()) {
      setErrorMessage('이름을 입력해 주세요.')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            name: signUpName,
            role: signUpRole,
          },
        },
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      // Supabase 프로젝트 설정에 따라 이메일 인증이 필수가 아니면 즉시 로그인 상태가 됨
      // 이메일 인증이 활성화되어 있을 경우를 대비한 하이브리드 가이드 문구
      if (data?.session) {
        setSuccessMessage('회원가입이 완료되었습니다. 자동으로 로그인합니다.')
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 1000)
      } else {
        setSuccessMessage('회원가입 완료! 입력하신 이메일의 가입 인증 링크를 확인해 주세요.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || '회원가입 중 에러가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
          </TabsList>

          {/* 에러 및 성공 메시지 노출 */}
          {errorMessage && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 rounded-md bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
              {successMessage}
            </div>
          )}

          {/* 1. 로그인 탭 */}
          <TabsContent value="signin">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight text-center">
                  Mookk 로그인
                </CardTitle>
                <CardDescription className="text-center">
                  이메일과 비밀번호를 입력하여 서비스에 로그인하세요.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="login-email">이메일 주소</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="login-password">비밀번호</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? '로그인 중...' : '로그인'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* 2. 회원가입 탭 */}
          <TabsContent value="signup">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight text-center">
                  Mookk 가입하기
                </CardTitle>
                <CardDescription className="text-center">
                  새로운 계정을 생성하여 크라우드펀딩에 참여해 보세요.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="grid gap-4">
                  {/* 이름 입력 */}
                  <div className="grid gap-2">
                    <Label htmlFor="signup-name">이름 (실명)</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="홍길동"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  {/* 이메일 입력 */}
                  <div className="grid gap-2">
                    <Label htmlFor="signup-email">이메일 주소</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="name@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* 비밀번호 입력 */}
                  <div className="grid gap-2">
                    <Label htmlFor="signup-password">비밀번호 (6자 이상)</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={loading}
                    />
                  </div>

                  {/* 역할 선택 카드 */}
                  <div className="grid gap-2 pt-2">
                    <Label className="mb-1">역할 선택 (가입 후 변경 불가)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setSignUpRole('backer')}
                        disabled={loading}
                        className={`flex flex-col items-center justify-between rounded-lg border-2 p-4 text-center cursor-pointer transition-all duration-200 outline-none ${
                          signUpRole === 'backer'
                            ? 'border-zinc-900 bg-zinc-50/80 dark:border-zinc-100 dark:bg-zinc-900/80 shadow-sm'
                            : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold">후원자로 시작</span>
                          {signUpRole === 'backer' && (
                            <span className="flex h-2.5 w-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-pulse" />
                          )}
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">책 후원 및 결제</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSignUpRole('creator')}
                        disabled={loading}
                        className={`flex flex-col items-center justify-between rounded-lg border-2 p-4 text-center cursor-pointer transition-all duration-200 outline-none ${
                          signUpRole === 'creator'
                            ? 'border-zinc-900 bg-zinc-50/80 dark:border-zinc-100 dark:bg-zinc-900/80 shadow-sm'
                            : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold">저자로 시작</span>
                          {signUpRole === 'creator' && (
                            <span className="flex h-2.5 w-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-pulse" />
                          )}
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">프로젝트 개설 및 정산</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? '가입 진행 중...' : '회원가입 완료'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
