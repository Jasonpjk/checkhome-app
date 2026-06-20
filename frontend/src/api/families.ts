import { api } from './client'

export interface FamilyMember {
  id: number
  user_id: number
  role: 'owner' | 'editor' | 'viewer' | 'executor'
  name: string
  email: string
  joined_at: string
}

export interface Family {
  id: number
  name: string
  invite_code: string
  created_at: string
  members: FamilyMember[]
}

export async function getMyFamily(): Promise<Family> {
  const { data } = await api.get('/families/me')
  return data
}

export async function createFamily(name: string): Promise<Family> {
  const { data } = await api.post('/families', { name })
  return data
}

export async function joinFamily(invite_code: string): Promise<Family> {
  const { data } = await api.post('/families/join', { invite_code })
  return data
}
