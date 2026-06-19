import { create } from 'zustand'

interface AuthUser {
  user_id: number
  name: string
  email: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
}

const storedUser = localStorage.getItem('checkhome_user')
const storedToken = localStorage.getItem('checkhome_token')

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  setAuth: (user, token) => {
    localStorage.setItem('checkhome_user', JSON.stringify(user))
    localStorage.setItem('checkhome_token', token)
    set({ user, token })
  },
  clearAuth: () => {
    localStorage.removeItem('checkhome_user')
    localStorage.removeItem('checkhome_token')
    set({ user: null, token: null })
  },
}))
