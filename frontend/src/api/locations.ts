import { api } from './client'

export interface StorageLocation {
  id: number
  name: string
  sort_order: number
  created_at: string
}

export async function fetchLocations(): Promise<StorageLocation[]> {
  const { data } = await api.get('/locations')
  return data
}

export async function createLocation(name: string): Promise<StorageLocation> {
  const { data } = await api.post('/locations', { name })
  return data
}

export async function deleteLocation(id: number): Promise<void> {
  await api.delete(`/locations/${id}`)
}
