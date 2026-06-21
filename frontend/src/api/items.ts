import { api } from './client'

export interface Item {
  id: number
  name: string
  category: string
  location: string | null
  expiry_date: string | null
  open_date: string | null
  pao_days: number | null
  photo_url: string | null
  handler_name: string | null
  is_family_shared: boolean
  family_id: number | null
  created_by_name: string | null
  quantity: number
  memo: string | null
  risk: 'high' | 'medium' | 'low'
  status: 'normal' | 'warning' | 'imminent' | 'expired' | 'check-needed'
  days_left: number | null
  created_at: string
}

export interface ItemStats {
  total: number
  action_needed: number
  this_week: number
  urgent_items: Item[]
}

export interface CreateItemPayload {
  name: string
  category: string
  location?: string
  expiry_date?: string
  open_date?: string
  pao_days?: number
  photo_url?: string | null
  handler_name?: string
  is_family_shared?: boolean
  quantity?: number
  memo?: string
  risk?: string
}

export interface PhotoAnalysis {
  name: string
  category: string
  expiry_date: string
  memo: string
  confidence: 'high' | 'medium' | 'low'
}

export async function fetchStats(): Promise<ItemStats> {
  const { data } = await api.get('/items/stats')
  return data
}

export async function fetchItems(category?: string): Promise<Item[]> {
  const params = category && category !== '전체' ? { category } : {}
  const { data } = await api.get('/items', { params })
  return data
}

export async function fetchItem(id: number): Promise<Item> {
  const { data } = await api.get(`/items/${id}`)
  return data
}

export async function createItem(payload: CreateItemPayload): Promise<Item> {
  const { data } = await api.post('/items', payload)
  return data
}

export async function updateItem(id: number, payload: Partial<CreateItemPayload>): Promise<Item> {
  const { data } = await api.put(`/items/${id}`, payload)
  return data
}

export async function deleteItem(id: number): Promise<void> {
  await api.delete(`/items/${id}`)
}

export async function recordAction(id: number, action_type: string, note?: string): Promise<void> {
  await api.post(`/items/${id}/action`, { action_type, note })
}

export async function analyzePhoto(images: string | string[]): Promise<PhotoAnalysis> {
  const list = Array.isArray(images) ? images : [images]
  const payload = list.length === 1 ? { image: list[0] } : { images: list }
  const { data } = await api.post('/items/analyze-photo', payload, { timeout: 60000 })
  return data
}
