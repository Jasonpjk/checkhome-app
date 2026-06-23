import { api } from './client'

export interface AuthUser {
  user_id: number
  name: string
  email: string
  access_token: string
  is_admin?: boolean
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export interface RequiresVerification {
  requires_verification: true
  email: string
}

export async function register(
  email: string,
  password: string,
  name: string,
): Promise<AuthUser | RequiresVerification> {
  const { data } = await api.post('/auth/register', { email, password, name })
  if (data && data.requires_verification) {
    return { requires_verification: true, email: data.email } as RequiresVerification
  }
  return data as AuthUser
}

export async function verifyEmail(email: string, code: string): Promise<AuthUser> {
  const { data } = await api.post('/auth/verify-email', { email, code })
  return data
}

export async function resendCode(email: string): Promise<void> {
  await api.post('/auth/resend-code', { email })
}

export async function socialLogin(provider: 'google' | 'kakao', code: string, redirectUri: string): Promise<AuthUser> {
  const endpoint = provider === 'google' ? '/auth/social/google-code' : '/auth/social/kakao'
  const { data } = await api.post(endpoint, { code, redirect_uri: redirectUri })
  return data
}

export function startGoogleLogin() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) return
  const nonce = Math.random().toString(36).substring(2, 18)
  sessionStorage.setItem('checkhome_oauth_nonce', nonce)
  const state = btoa(JSON.stringify({ nonce, provider: 'google' }))
  const redirectUri = `${window.location.origin}/auth/callback`
  // 백엔드는 google refresh_token을 쓰지 않으므로 access_type=offline 불필요.
  // 카카오(정상)와 동일한 최소 파라미터로 맞춰 unauthorized_client 회피.
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
  })
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export function startKakaoLogin() {
  const restKey = import.meta.env.VITE_KAKAO_REST_API_KEY
  if (!restKey) return
  const nonce = Math.random().toString(36).substring(2, 18)
  sessionStorage.setItem('checkhome_oauth_nonce', nonce)
  const state = btoa(JSON.stringify({ nonce, provider: 'kakao' }))
  const redirectUri = `${window.location.origin}/auth/callback`
  const params = new URLSearchParams({
    client_id: restKey,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  })
  window.location.href = `https://kauth.kakao.com/oauth/authorize?${params}`
}
