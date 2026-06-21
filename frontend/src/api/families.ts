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
  // 가족 생성/참여 직후, 아직 공유 안 된 내 개인 항목 수 (0보다 크면 "공유할까요?" 안내)
  personal_item_count?: number | null
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

// 가족 참여 전에 만들어둔 내 개인 항목들을 가족과 공유 상태로 전환
export async function shareExistingItems(): Promise<{ ok: boolean; shared_count: number }> {
  const { data } = await api.post('/families/me/share-existing')
  return data
}
