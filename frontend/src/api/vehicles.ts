import { api } from './client'

export interface VehicleCheck {
  id: number
  vehicle_id: number
  check_type: string
  last_check_date: string | null
  next_check_date: string | null
  last_mileage: number | null
  interval_mileage: number | null
  memo: string | null
  days_left: number | null
  created_at: string
}

export interface Vehicle {
  id: number
  name: string
  plate: string
  mileage: number
  created_at: string
  checks: VehicleCheck[]
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const { data } = await api.get('/vehicles')
  return data
}

export async function createVehicle(name: string, plate: string, mileage: number): Promise<Vehicle> {
  const { data } = await api.post('/vehicles', { name, plate, mileage })
  return data
}

export async function deleteVehicle(id: number): Promise<void> {
  await api.delete(`/vehicles/${id}`)
}

export async function updateVehicleCheck(
  vehicleId: number,
  checkId: number,
  payload: Partial<VehicleCheck>
): Promise<VehicleCheck> {
  const { data } = await api.put(`/vehicles/${vehicleId}/checks/${checkId}`, payload)
  return data
}
