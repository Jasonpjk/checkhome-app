import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, X, ChevronRight, Lock, Users } from 'lucide-react'
import { fetchItems, Item } from '../../api/items'
import { statusConfig } from '../data/statusConfig'
import { AdBanner } from './AdBanner'

const categories = ['전체', '식품', '약품', '욕실/화장품', '세제/청소', '필터/가전', '차량']
const statusFilters = ['전체', '정상', '주의', '임박', '만료', '점검필요']
const statusKey: Record<string, string> = { 정상: 'normal', 주의: 'warning', 임박: 'imminent', 만료: 'expired', 점검필요: 'check-needed' }
type SortOption = 'deadline' | 'recent' | 'category'
type SmartFilter = 'action-needed' | 'this-week' | null

interface StorageProps {
  onItemClick?: (item: Item) => void
  initialCategory?: string | null
  smartFilter?: SmartFilter
  onFilterChange?: () => void
}

export function Storage({ onItemClick, initialCategory, smartFilter, onFilterChange }: StorageProps) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '전체')
  const [selectedStatus, setSelectedStatus] = useState('전체')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('deadline')
  const [showFilters, setShowFilters] = useState(false)
  const [activeSmartFilter, setActiveSmartFilter] = useState<SmartFilter>(smartFilter || null)

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchItems()
      setItems(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadItems() }, [loadItems])

  useEffect(() => {
    if (initialCategory) { setSelectedCategory(initialCategory); setActiveSmartFilter(null) }
  }, [initialCategory])

  useEffect(() => {
    if (smartFilter) { setActiveSmartFilter(smartFilter); setSelectedCategory('전체'); setSelectedStatus('전체') }
  }, [smartFilter])

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (activeSmartFilter === 'action-needed') {
      return ['expired', 'imminent', 'check-needed'].includes(item.status) && matchSearch
    }
    if (activeSmartFilter === 'this-week') {
      return item.days_left !== null && item.days_left >= 0 && item.days_left <= 7 && matchSearch
    }
    const matchCat = selectedCategory === '전체' || item.category === selectedCategory
    const matchStatus = selectedStatus === '전체' || item.status === statusKey[selectedStatus]
    return matchCat && matchStatus && matchSearch
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'deadline') return (a.days_left ?? 9999) - (b.days_left ?? 9999)
    if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return a.category.localeCompare(b.category)
  })

  const formatDate = (item: Item) => {
    if (item.days_left === null) return '-'
    if (item.days_left < 0) return `${Math.abs(item.days_left)}일 경과`
    if (item.days_left === 0) return '오늘'
    return `D-${item.days_left}`
  }

  return (
    <div className="h-full overflow-y-auto pb-20 bg-[#F8F9FA]">
      <div className="bg-white px-6 pt-10 pb-6 shadow-sm">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-6">보관함</h1>
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제품명으로 검색..."
            className="w-full bg-[#F8FAFC] rounded-xl pl-12 pr-4 py-3.5 text-sm border border-[#E2E8F0] outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${showFilters ? 'bg-[#14B8A6] text-white' : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]'}`}
          >
            <SlidersHorizontal size={16} />
            필터
          </button>
          {activeSmartFilter && (
            <button
              onClick={() => { setActiveSmartFilter(null); onFilterChange?.() }}
              className="flex items-center gap-2 px-3 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium"
            >
              {activeSmartFilter === 'action-needed' ? '조치 필요' : '이번 주'}
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="bg-white border-y border-[#E2E8F0] px-6 py-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-[#94A3B8] mb-3 uppercase tracking-wide">카테고리</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setActiveSmartFilter(null); onFilterChange?.() }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-[#14B8A6] text-white' : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#94A3B8] mb-3 uppercase tracking-wide">상태</p>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSelectedStatus(s); setActiveSmartFilter(null); onFilterChange?.() }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedStatus === s ? 'bg-[#14B8A6] text-white' : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-4 flex items-center justify-between">
        <p className="text-sm text-[#475569]">총 <span className="font-semibold text-[#1A1A1A]">{sorted.length}개</span></p>
        <div className="flex gap-2">
          {(['deadline', 'recent', 'category'] as SortOption[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === opt ? 'bg-[#14B8A6] text-white' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
            >
              {opt === 'deadline' ? '기한순' : opt === 'recent' ? '최신순' : '카테고리'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="mb-4 -mx-6">
          <AdBanner variant="mid" text="체크홈 프리미엄으로 업그레이드" subtext="무제한 카테고리 & 가족 공유 기능" icon="star" />
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-[#E2E8F0] animate-pulse h-20" />
            ))}
          </div>
        ) : sorted.length > 0 ? (
          <div className="space-y-3">
            {sorted.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick?.(item)}
                className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-[#E2E8F0] hover:border-[#14B8A6] transition-all text-left group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[item.status].badge}`}>
                        {statusConfig[item.status].label}
                      </span>
                      <span className="text-xs text-[#94A3B8]">{item.category}</span>
                      {item.family_id && (item.is_family_shared ? (
                        <span className="inline-flex items-center gap-0.5 text-xs text-teal-600 font-medium">
                          <Users size={11} />{item.created_by_name || '공유'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-xs text-[#94A3B8]">
                          <Lock size={11} />나만
                        </span>
                      ))}
                    </div>
                    <h3 className="font-semibold text-[#1A1A1A] mb-1 truncate">{item.name}</h3>
                    <p className="text-sm text-[#475569]">{formatDate(item)}</p>
                  </div>
                  <ChevronRight size={20} className="text-[#CBD5E1] group-hover:text-[#14B8A6] flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-[#E2E8F0]">
            <Search size={28} className="text-[#94A3B8] mx-auto mb-3" />
            <p className="text-sm text-[#475569] font-medium mb-1">항목이 없습니다</p>
            <p className="text-xs text-[#94A3B8]">다른 필터를 선택해보세요</p>
          </div>
        )}
        <div className="-mx-6 mt-4">
          <AdBanner variant="bottom" text="소방 점검 전문 업체 안심119" subtext="우리 집 안전 점검 무료 상담 받아보세요" icon="shield" />
        </div>
      </div>
    </div>
  )
}
