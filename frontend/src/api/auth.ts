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
