import { useEffect, useState } from 'react'
import { Search, Users, Package, Car, Loader2 } from 'lucide-react'
import { getAdminMembers, AdminMember } from '../api/admin'

export function AdminMembers() {
  const [members, setMembers] = useState<AdminMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAdminMembers()
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.family_group.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) }
    catch { return d }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">회원 관리</h1>
          <p className="text-sm text-gray-500">총 {members.length}명의 회원</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름·이메일·가족그룹 검색..."
            className="w-full sm:w-72 pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-400 bg-white"
          />
        </div>
      </div>

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
                    <th className="text-left px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">회원</th>
                    <th className="text-left px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">가족그룹</th>
                    <th className="text-center px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">항목</th>
                    <th className="text-center px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">차량</th>
                    <th className="text-left px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">구독</th>
                    <th className="text-left px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {m.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{m.name}</p>
                            <p className="text-xs text-gray-400">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {m.family_group ? (
                          <div className="flex items-center gap-1.5">
                            <Users size={13} className="text-teal-500" />
                            <span className="text-gray-700 text-sm">{m.family_group}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-700">
                          <Package size={13} className="text-gray-400" />
                          <span className="font-semibold">{m.item_count}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-700">
                          <Car size={13} className="text-gray-400" />
                          <span className="font-semibold">{m.vehicle_count}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          m.subscription_status === '무료' ? 'bg-gray-100 text-gray-600' : 'bg-teal-100 text-teal-700'
                        }`}>
                          {m.subscription_status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(m.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">검색 결과가 없습니다</p>
              </div>
            )}
          </div>

          {/* 모바일 카드 */}
          <div className="md:hidden space-y-3">
            {filtered.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold">
                    {m.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                  <span className={`ml-auto inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                    m.subscription_status === '무료' ? 'bg-gray-100 text-gray-600' : 'bg-teal-100 text-teal-700'
                  }`}>
                    {m.subscription_status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-gray-50 rounded-lg py-2">
                    <p className="font-bold text-gray-800">{m.item_count}</p>
                    <p className="text-gray-400">항목</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-2">
                    <p className="font-bold text-gray-800">{m.vehicle_count}</p>
                    <p className="text-gray-400">차량</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-2">
                    <p className="font-bold text-gray-800 truncate">{m.family_group || '-'}</p>
                    <p className="text-gray-400">가족</p>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">검색 결과가 없습니다</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
