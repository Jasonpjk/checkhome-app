import { api } from './client'

export interface AuthUser {
  user_id: number
  name: string
  email: string
  access_token: string
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function register(email: string, password: string, name: string): Promise<AuthUser> {
  const { data } = await api.post('/auth/register', { email, password, name })
  return data
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
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
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
