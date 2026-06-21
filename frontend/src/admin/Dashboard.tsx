import { useEffect, useState } from 'react'
import { Users, Package, AlertCircle, Calendar, TrendingUp, Loader2 } from 'lucide-react'
import { getAdminStats, AdminStats } from '../api/admin'

const STATUS_LABELS: Record<string, string> = {
  normal: '정상', warning: '주의', imminent: '임박', expired: '만료', 'check-needed': '점검필요',
}
const STATUS_COLORS: Record<string, string> = {
  normal: 'bg-emerald-500', warning: 'bg-yellow-500', imminent: 'bg-orange-500',
  expired: 'bg-red-500', 'check-needed': 'bg-purple-500',
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    )
  }

  if (!stats) return <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>

  const kpis = [
    { label: '총 회원', value: stats.total_members, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '총 항목', value: stats.total_items, icon: Package, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: '조치 필요', value: stats.action_needed, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: '이번 주 만료', value: stats.this_week, icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  const catEntries = Object.entries(stats.category_counts).sort((a, b) => b[1] - a[1])
  const statusEntries = Object.entries(stats.status_counts)
  const totalItems = statusEntries.reduce((s, [, v]) => s + v, 0) || 1

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">대시보드</h1>
        <p className="text-sm text-gray-500">서비스 전체 현황을 한눈에 확인하세요</p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={kpi.color} />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{kpi.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 상태별 분포 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-teal-500" />
            <h2 className="font-bold text-gray-800">항목 상태 분포</h2>
          </div>
          <div className="space-y-3">
            {statusEntries.map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{STATUS_LABELS[status] || status}</span>
                  <span className="text-sm font-semibold text-gray-800">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${STATUS_COLORS[status] || 'bg-gray-400'} h-2 rounded-full transition-all`}
                    style={{ width: `${(count / totalItems) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 카테고리별 분포 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Package size={18} className="text-teal-500" />
            <h2 className="font-bold text-gray-800">카테고리별 항목 수</h2>
          </div>
          <div className="space-y-2.5">
            {catEntries.slice(0, 8).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{cat}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-teal-500 h-1.5 rounded-full"
                      style={{ width: `${(count / (catEntries[0]?.[1] || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 긴급 항목 */}
      {stats.urgent_items.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <AlertCircle size={18} className="text-red-500" />
            <h2 className="font-bold text-gray-800">긴급 확인 필요 항목</h2>
            <span className="ml-auto text-xs text-gray-400">최근 6개</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-medium pb-3">제품명</th>
                  <th className="text-left text-xs text-gray-400 font-medium pb-3">카테고리</th>
                  <th className="text-left text-xs text-gray-400 font-medium pb-3">상태</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-3">D-day</th>
                </tr>
              </thead>
              <tbody>
                {stats.urgent_items.map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 font-medium text-gray-800">{item.name}</td>
                    <td className="py-3 text-gray-500">{item.category}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        item.status === 'expired' ? 'bg-red-100 text-red-700' :
                        item.status === 'imminent' ? 'bg-orange-100 text-orange-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-700">
                      {item.days_left === null ? '-' : item.days_left < 0 ? `+${Math.abs(item.days_left)}` : `D-${item.days_left}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
