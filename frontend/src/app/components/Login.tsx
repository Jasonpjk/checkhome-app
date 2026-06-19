import { useState } from 'react'
import { Mail, Lock, ChevronRight, User } from 'lucide-react'
import { login, register } from '../../api/auth'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      setAuth({ user_id: result.user_id, name: result.name, email: result.email }, result.access_token)
      onLogin()
    } catch (err: any) {
      setError(err.response?.data?.detail || '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center">
      <div className="h-screen w-full max-w-md bg-white shadow-2xl overflow-y-auto">
        <div className="px-6 pt-16 pb-8">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">체크홈</h1>
            <p className="text-[#475569]">
              우리 집 사용기한을
              <br />
              가족이 함께 관리하세요
            </p>
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="flex-1 bg-transparent outline-none"
                  required
                />
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
                  <span className="text-sm text-gray-700">서비스 이용약관에 동의합니다</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">개인정보처리방침에 동의합니다</span>
                </label>
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#14B8A6] transition-colors mt-6 disabled:opacity-50"
            >
              {loading ? '처리 중...' : isSignup ? '회원가입' : '로그인'}
              {!loading && <ChevronRight size={20} />}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between">
            {!isSignup && (
              <button className="text-[#94A3B8] text-sm hover:text-gray-700">
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
