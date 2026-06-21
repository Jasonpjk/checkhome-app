import { api } from './client'

export interface SubscriptionInfo {
  plan: string
  status: string
  current_period_end?: string
  cancel_at_period_end?: boolean
  stripe_subscription_id?: string
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

export async function createCheckout(plan: string): Promise<{ checkout_url: string }> {
  const { data } = await api.post('/subscriptions/checkout', {
    plan,
    success_url: `${window.location.origin}/?payment=success`,
    cancel_url: `${window.location.origin}/?payment=cancel`,
  })
  return data
}

export async function createPortal(): Promise<{ portal_url: string }> {
  const { data } = await api.post('/subscriptions/portal', {
    return_url: `${window.location.origin}/`,
  })
  return data
}
