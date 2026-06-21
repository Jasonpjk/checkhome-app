import { api } from './client'

export interface SubscriptionInfo {
  plan: string
  status: string
  current_period_end?: string
  cancel_at_period_end?: boolean
  has_billing_key?: boolean
}

export interface Plan {
  name: string
  price: number
  description: string
}

export async function getMySubscription(): Promise<SubscriptionInfo> {
  const { data } = await api.get('/subscriptions/me')
  return data
}

export async function getPlans(): Promise<Record<string, Plan>> {
  const { data } = await api.get('/subscriptions/plans')
  return data
}

export async function subscribePlan(billingKey: string, plan: string): Promise<void> {
  await api.post('/subscriptions/subscribe', { billing_key: billingKey, plan })
}

export async function cancelSubscription(): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post('/subscriptions/cancel')
  return data
}
