import { useEffect, useState } from 'react'
import { Bell, AlertCircle, Calendar, ChevronRight } from 'lucide-react'
import { fetchStats, ItemStats, Item } from '../../api/items'
import { statusConfig } from '../data/statusConfig'
import { AdBanner } from './AdBanner'

interface HomeProps {
  onCategoryClick?: (category: string) => void
  onItemClick?: (item: Item) => void
  onActionNeededClick?: () => void
  onThisWeekClick?: () => void
}

export function Home({ onCategoryClick, onItemClick, onActionNeededClick, onThisWeekClick }: HomeProps) {
  const [stats, setStats] = useState<ItemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  useEffect(() => {
    setError(false)
    fetchStats()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const categories = ['식품', '약품', '욕실/화장품', '세제/청소', '차량', '필터/가전']
  const categoriesTop = categories.slice(0, 4)
  const categoriesBottom = categories.slice(4)

  return (
    <div className="h-full overflow-y-auto pb-20 bg-[#F8F9FA]">
      <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-6 pt-12 pb-8 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">체크홈</h1>
            <p className="text-teal-50 text-sm">오늘 확인할 항목</p>
          </div>
          <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <Bell size={20} className="text-white" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onActionNeededClick}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertCircle size={18} className="text-red-500" />
              </div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Urgent</span>
            </div>
            <p className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {loading ? '...' : error ? '-' : (stats?.action_needed ?? 0)}
            </p>
            <p className="text-xs text-[#475569]">조치 필요</p>
          </button>

          <button
            onClick={onThisWeekClick}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Calendar size={18} className="text-orange-500" />
              </div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Week</span>
            </div>
            <p className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {loading ? '...' : error ? '-' : (stats?.this_week ?? 0)}
            </p>
            <p className="text-xs text-[#475569]">이번 주</p>
          </button>
        </div>
      </div>

      <div className="pt-4">
        <AdBanner variant="mid" text="집 관리의 시작, 체크홈 프리미엄" subtext="더 스마트한 집 관리를 경험해보세요" icon="star" />
      </div>

      <div className="px-6 py-6 space-y-6">
        {stats && stats.urgent_items.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">긴급 확인</h2>
            <div className="space-y-3">
              {stats.urgent_items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onItemClick?.(item)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-[#E2E8F0] hover:border-[#14B8A6] transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[item.status].badge}`}>
                          {statusConfig[item.status].label}
                        </span>
                        <span className="text-xs text-[#94A3B8]">{item.category}</span>
                      </div>
                      <h3 className="font-semibold text-[#1A1A1A] mb-1 truncate">{item.name}</h3>
                      <p className="text-sm text-[#475569]">
                        {item.days_left !== null && item.days_left < 0
                          ? `${Math.abs(item.days_left)}일 경과`
                          : item.days_left === 0
                          ? '오늘'
                          : `D-${item.days_left}`}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-[#CBD5E1] group-hover:text-[#14B8A6] flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">카테고리</h2>
          {/* 카테고리 상단 4개 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {categoriesTop.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryClick?.(cat)}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-[#E2E8F0] hover:border-[#14B8A6] transition-all text-left group"
              >
                <span className="font-semibold text-[#1A1A1A] text-sm">{cat}</span>
                <p className="text-xs text-[#94A3B8] mt-2">항목 보기</p>
              </button>
            ))}
          </div>

          {/* 중간 광고 */}
          <div className="mb-4 -mx-6">
            <AdBanner variant="mid" text="소방 점검 전문 업체 안심119" subtext="우리 집 안전 점검 무료 상담 받아보세요" icon="shield" />
          </div>

          {/* 카테고리 하단 2개 */}
          <div className="grid grid-cols-2 gap-3">
            {categoriesBottom.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryClick?.(cat)}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-[#E2E8F0] hover:border-[#14B8A6] transition-all text-left group"
              >
                <span className="font-semibold text-[#1A1A1A] text-sm">{cat}</span>
                <p className="text-xs text-[#94A3B8] mt-2">항목 보기</p>
              </button>
            ))}
          </div>
        </section>

        {/* 하단 광고 */}
        <AdBanner variant="bottom" text="냉장고 정수기 렌탈 1위 코웨이" subtext="월 2만원대 홈케어 서비스 신청하기" icon="zap" />
      </div>
    </div>
  )
}
