import { useState } from 'react'
import { Mail, Lock, ChevronRight, User, Eye, EyeOff } from 'lucide-react'
import { login, register, startGoogleLogin, startKakaoLogin } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'

interface LoginProps {
  onLogin: () => void
}

export function Login({ onLogin }: LoginProps) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTerms, setShowTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignup && (!agreeTerms || !agreePrivacy)) {
      setError('약관 및 개인정보처리방침에 동의해주세요')
      return
    }
    setLoading(true)
    setError('')
    try {
      let result
      if (isSignup) {
        result = await register(email, password, name)
      } else {
        result = await login(email, password)
      }
      setAuth({ user_id: result.user_id, name: result.name, email: result.email, is_admin: result.is_admin }, result.access_token)
      onLogin()
    } catch (err: any) {
      setError(err.response?.data?.detail || '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center">
      {showTerms && (
        <div className="absolute inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold">약관 및 개인정보처리방침</h2>
              <button onClick={() => setShowTerms(false)} className="text-gray-400 text-xl leading-none">✕</button>
            </div>
            <div className="px-5 py-4 text-sm text-[#475569] space-y-4 leading-relaxed">
              <section>
                <h3 className="font-bold text-[#1A1A1A] mb-1">서비스 이용약관</h3>
                <p>체크홈(이하 "서비스")은 가정용 제품의 유통기한·사용기한 관리를 돕는 앱입니다. 이용자는 본인 또는 가족의 제품 정보를 등록·관리할 수 있으며, 등록된 정보의 정확성에 대한 책임은 이용자에게 있습니다.</p>
              </section>
              <section>
                <h3 className="font-bold text-[#1A1A1A] mb-1">개인정보처리방침</h3>
                <p>서비스는 회원 식별을 위해 이메일·이름을 수집하며, 제품 등록 시 입력한 정보를 저장합니다. 수집한 정보는 서비스 제공 목적으로만 사용하고 제3자에게 제공하지 않습니다. 문의: business10082@gmail.com</p>
              </section>
            </div>
          </div>
        </div>
      )}
      <div className="h-screen w-full max-w-md bg-white shadow-2xl overflow-y-auto">
        <div className="px-6 pt-16 pb-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">체크홈</h1>
            <p className="text-[#475569]">
              우리 집 사용기한을
              <br />
              가족이 함께 관리하세요
            </p>
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={startGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl py-3.5 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Google로 계속하기</span>
            </button>

            <button
              type="button"
              onClick={startKakaoLogin}
              className="w-full flex items-center justify-center gap-3 bg-[#FEE500] rounded-xl py-3.5 hover:bg-[#F5DC00] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#3C1E1E">
                <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.696 1.613 5.069 4.08 6.488L5.1 21.5l4.667-2.812c.733.1 1.484.152 2.233.152 5.523 0 10-3.477 10-7.84S17.523 3 12 3z"/>
              </svg>
              <span className="text-sm font-medium text-[#3C1E1E]">카카오로 계속하기</span>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">또는 이메일로</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <label className="text-sm text-gray-700">이름</label>
                <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl px-4 py-3.5">
                  <User size={20} className="text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="flex-1 bg-transparent outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-gray-700">이메일</label>
              <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl px-4 py-3.5">
                <Mail size={20} className="text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="flex-1 bg-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-700">비밀번호</label>
              <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl px-4 py-3.5">
                <Lock size={20} className="text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="flex-1 bg-transparent outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    <button type="button" onClick={() => setShowTerms(true)} className="underline text-[#14B8A6]">서비스 이용약관</button>에 동의합니다
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    <button type="button" onClick={() => setShowTerms(true)} className="underline text-[#14B8A6]">개인정보처리방침</button>에 동의합니다
                  </span>
                </label>
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#14B8A6] transition-colors mt-4 disabled:opacity-50"
            >
              {loading ? '처리 중...' : isSignup ? '회원가입' : '로그인'}
              {!loading && <ChevronRight size={20} />}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between">
            {!isSignup && (
              <button
                type="button"
                onClick={() => alert('비밀번호 재설정은 곧 제공됩니다. 그 전까지는 business10082@gmail.com 으로 문의해주세요.')}
                className="text-[#94A3B8] text-sm hover:text-gray-700"
              >
                비밀번호 재설정
              </button>
            )}
            <button
              onClick={() => { setIsSignup(!isSignup); setError('') }}
              className="text-[#1A1A1A] text-sm ml-auto"
            >
              {isSignup ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
