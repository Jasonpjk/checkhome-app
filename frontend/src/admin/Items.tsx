import { useEffect, useState } from 'react'
import { Search, Loader2, Package } from 'lucide-react'
import { getAdminItems, AdminItem } from '../api/admin'

const STATUS_LABELS: Record<string, string> = {
  normal: '정상', warning: '주의', imminent: '임박', expired: '만료', 'check-needed': '점검필요',
}
const STATUS_BADGE: Record<string, string> = {
  normal: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-yellow-100 text-yellow-700',
  imminent: 'bg-orange-100 text-orange-700',
  expired: 'bg-red-100 text-red-700',
  'check-needed': 'bg-purple-100 text-purple-700',
}

const CATEGORIES = ['전체', '식품', '약품', '욕실/화장품', '세제/청소', '필터/가전', '차량', '육아용품', '반려동물', '비상용품', '문서/보증서', '캠핑용품', '정원용품']
const STATUSES = ['전체', 'normal', 'warning', 'imminent', 'expired', 'check-needed']

export function AdminItems() {
  const [items, setItems] = useState<AdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selCategory, setSelCategory] = useState('전체')
  const [selStatus, setSelStatus] = useState('전체')

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAdminItems(selCategory, selStatus)
      setItems(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [selCategory, selStatus])

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.owner_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const formatDday = (item: AdminItem) => {
    if (item.days_left === null) return '-'
    if (item.days_left < 0) return `+${Math.abs(item.days_left)}일`
    if (item.days_left === 0) return '오늘'
    return `D-${item.days_left}`
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) }
    catch { return d }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">항목 현황</h1>
        <p className="text-sm text-gray-500">전체 사용자의 등록 항목</p>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제품명·소유자 검색..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">카테고리</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelCategory(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selCategory === c ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">상태</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelStatus(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selStatus === s ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === '전체' ? '전체' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        총 <span className="font-bold text-gray-800">{filtered.length}개</span> 항목
      </p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-teal-500" />
        </div>
      ) : (
        <>
          {/* 데스크톱 테이블 */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">제품명</th>
                    <th className="text-left px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">카테고리</th>
                    <th className="text-left px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">상태</th>
                    <th className="text-left px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">소유자</th>
                    <th className="text-center px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">D-day</th>
                    <th className="text-left px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-800">{item.name}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{item.category}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[item.status] || 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABELS[item.status] || item.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{item.owner_name}</td>
                      <td className="px-5 py-3.5 text-center font-semibold text-gray-700">{formatDday(item)}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(item.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Package size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">항목이 없습니다</p>
              </div>
            )}
          </div>

          {/* 모바일 카드 */}
          <div className="md:hidden space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[item.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{item.category}</span>
                  <span>·</span>
                  <span>{item.owner_name}</span>
                  <span>·</span>
                  <span className="font-semibold text-gray-600">{formatDday(item)}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">항목이 없습니다</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
