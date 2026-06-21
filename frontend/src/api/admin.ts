import { api } from './client'

export interface AdminStats {
  total_members: number
  total_families: number
  total_items: number
  action_needed: number
  this_week: number
  urgent_items: any[]
  category_counts: Record<string, number>
  status_counts: Record<string, number>
}

export interface AdminMember {
  id: number
  name: string
  email: string
  item_count: number
  vehicle_count: number
  family_group: string
  role: string
  created_at: string
  status: string
  subscription_status: string
  notification_enabled: boolean
}

export interface AdminItem {
  id: number
  name: string
  category: string
  status: string
  days_left: number | null
  owner_name: string
  user_id: number
  created_at: string
  expiry_date?: string
  is_family_shared: boolean
}

export async function getAdminMe() {
  const { data } = await api.get('/admin/me')
  return data
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get('/admin/stats')
  return data
}

export async function getAdminMembers(): Promise<AdminMember[]> {
  const { data } = await api.get('/admin/members')
  return data
}

export async function getAdminItems(category?: string, status?: string): Promise<AdminItem[]> {
  const params: Record<string, string> = {}
  if (category && category !== '전체') params.category = category
  if (status && status !== '전체') params.status = status
  const { data } = await api.get('/admin/items', { params })
  return data
}

export async function getAdminVehicles() {
  const { data } = await api.get('/admin/vehicles')
  return data
}

export async function makeAdmin(userId: number) {
  const { data } = await api.post(`/admin/members/${userId}/make-admin`)
  return data
}
