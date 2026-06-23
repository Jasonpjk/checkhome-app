export const statusConfig: Record<string, { badge: string; label: string; color: string }> = {
  expired: {
    badge: 'bg-rose-100 text-rose-700 border border-rose-200',
    label: '만료',
    color: '#F43F5E',
  },
  imminent: {
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    label: '임박',
    color: '#F59E0B',
  },
  warning: {
    badge: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    label: '주의',
    color: '#EAB308',
  },
  'check-needed': {
    badge: 'bg-violet-100 text-violet-700 border border-violet-200',
    label: '점검필요',
    color: '#8B5CF6',
  },
  normal: {
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    label: '정상',
    color: '#10B981',
  },
}

export const riskConfig: Record<string, { badge: string; label: string }> = {
  high: { badge: 'bg-rose-500 text-white', label: '강' },
  medium: { badge: 'bg-amber-500 text-white', label: '중' },
  low: { badge: 'bg-slate-400 text-white', label: '약' },
}

// 백엔드가 정의되지 않은 status/risk 값을 주더라도 화면이 흰 화면으로 죽지 않도록 안전 폴백 제공
const FALLBACK_STATUS = { badge: 'bg-gray-100 text-gray-600 border border-gray-200', label: '확인', color: '#94A3B8' }
const FALLBACK_RISK = { badge: 'bg-slate-400 text-white', label: '-' }

export const getStatusConfig = (status?: string) =>
  (status && statusConfig[status]) || FALLBACK_STATUS
export const getRiskConfig = (risk?: string) =>
  (risk && riskConfig[risk]) || FALLBACK_RISK
