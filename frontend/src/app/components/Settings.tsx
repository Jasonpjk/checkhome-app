import { useState, useEffect } from 'react'
import { User, Users, MapPin, Bell, CreditCard, Database, MessageCircle, Megaphone, FileText, ChevronRight, X, Plus, LogOut, Layers, Copy, Check, Loader2, Link, Trash2, Sparkles, Crown, Zap } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { AdBanner } from './AdBanner'
import { getMyFamily, createFamily, joinFamily, shareExistingItems, Family } from '../../api/families'
import { fetchLocations, createLocation, deleteLocation, StorageLocation } from '../../api/locations'
import { fetchItems } from '../../api/items'
import { getMySubscription, getPlans, subscribePlan, cancelSubscription, SubscriptionInfo, Plan } from '../../api/subscriptions'

interface SettingsProps {
  onLogout: () => void
}

const ALL_CATEGORIES = [
  { id: 'food', name: '식품', icon: '🍎' },
  { id: 'medicine', name: '약품', icon: '💊' },
  { id: 'bathroom', name: '욕실/화장품', icon: '🧴' },
  { id: 'cleaning', name: '세제/청소', icon: '🧹' },
  { id: 'filter', name: '필터/가전', icon: '🔌' },
  { id: 'vehicle', name: '차량', icon: '🚗' },
  { id: 'baby', name: '육아용품', icon: '🍼' },
  { id: 'pets', name: '반려동물', icon: '🐾' },
  { id: 'emergency', name: '비상용품', icon: '🚨' },
  { id: 'documents', name: '문서/보증서', icon: '📄' },
  { id: 'camping', name: '캠핑용품', icon: '⛺' },
  { id: 'garden', name: '정원용품', icon: '🌿' },
]

export function Settings({ onLogout }: SettingsProps) {
  const { user, clearAuth } = useAuthStore()
  const [showFamilyModal, setShowFamilyModal] = useState(false)
  const [family, setFamily] = useState<Family | null>(null)
  const [familyLoading, setFamilyLoading] = useState(false)
  const [familyError, setFamilyError] = useState('')
  const [familyView, setFamilyView] = useState<'main' | 'create' | 'join' | 'share-ask'>('main')
  const [familyName, setFamilyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [pendingShareCount, setPendingShareCount] = useState(0)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [locations, setLocations] = useState<StorageLocation[]>([])
  const [newLoc, setNewLoc] = useState('')
  const [locLoading, setLocLoading] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [toast, setToast] = useState('')
  const [exporting, setExporting] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const SUPPORT_EMAIL = 'business10082@gmail.com'

  const handleContact = () => {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('체크홈 문의')}`
  }

  // 내 데이터(보관 중 항목)를 JSON 파일로 내보내기
  const handleExport = async () => {
    setExporting(true)
    try {
      const items = await fetchItems()
      const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `체크홈_백업_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showToast('데이터를 내보냈어요')
    } catch {
      showToast('내보내기에 실패했어요')
    } finally {
      setExporting(false)
    }
  }
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [plans, setPlans] = useState<Record<string, Plan>>({})
  const [subLoading, setSubLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [enabledCategories, setEnabledCategories] = useState<Set<string>>(
    new Set(ALL_CATEGORIES.map((c) => c.id))
  )

  const openSubscriptionModal = async () => {
    setShowSubscriptionModal(true)
    setSubLoading(true)
    try {
      const [sub, planData] = await Promise.all([getMySubscription(), getPlans()])
      setSubscription(sub)
      setPlans(planData)
    } catch {
      setSubscription(null)
    } finally {
      setSubLoading(false)
    }
  }

  const handleSubscribePlan = async (planKey: string) => {
    if (planKey === 'free') return
    setCheckoutLoading(planKey)
    try {
      const storeId = import.meta.env.VITE_PORTONE_STORE_ID
      const channelKey = import.meta.env.VITE_PORTONE_CHANNEL_KEY
      if (!storeId || !channelKey) {
        showToast('결제 기능이 아직 준비 중입니다')
        return
      }
      const PortOne = await import('@portone/browser-sdk/v2')
      const response = await PortOne.requestIssueBillingKey({
        storeId,
        channelKey,
        billingKeyMethod: 'CARD',
        issueId: `issue-${Date.now()}`,
        issueName: '체크홈 정기결제 카드 등록',
        customer: {
          customerId: String(user?.user_id),
          fullName: user?.name || '',
          email: user?.email || '',
        },
      })
      if (!response || (response as any).code !== undefined) {
        showToast('카드 등록이 취소됐어요')
        return
      }
      await subscribePlan((response as any).billingKey, planKey)
      const [sub] = await Promise.all([getMySubscription()])
      setSubscription(sub)
      showToast('구독이 시작됐어요!')
    } catch {
      showToast('결제 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    if (!confirm('구독을 해지하시겠습니까? 현재 결제 기간이 끝날 때까지 이용 가능합니다.')) return
    try {
      const result = await cancelSubscription()
      showToast(result.message)
      const sub = await getMySubscription()
      setSubscription(sub)
    } catch {
      showToast('구독 해지 중 오류가 발생했어요')
    }
  }

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      clearAuth()
      onLogout()
    }
  }

  const openFamilyModal = async () => {
    setShowFamilyModal(true)
    setFamilyView('main')
    setFamilyError('')
    setFamilyLoading(true)
    try {
      const f = await getMyFamily()
      setFamily(f)
    } catch {
      setFamily(null)
    } finally {
      setFamilyLoading(false)
    }
  }

  // 가족 생성/참여 직후, 기존 개인 항목이 있으면 '공유할지' 묻는 화면으로, 없으면 메인으로.
  const afterJoinOrCreate = (f: Family) => {
    setFamily(f)
    if (f.personal_item_count && f.personal_item_count > 0) {
      setPendingShareCount(f.personal_item_count)
      setFamilyView('share-ask')
    } else {
      setFamilyView('main')
    }
  }

  const handleCreateFamily = async () => {
    if (!familyName.trim()) return
    setFamilyLoading(true)
    setFamilyError('')
    try {
      const f = await createFamily(familyName.trim())
      setFamilyName('')
      afterJoinOrCreate(f)
    } catch (e: any) {
      setFamilyError(e?.response?.data?.detail || '그룹 생성에 실패했습니다')
    } finally {
      setFamilyLoading(false)
    }
  }

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) return
    setFamilyLoading(true)
    setFamilyError('')
    try {
      const f = await joinFamily(inviteCode.trim())
      setInviteCode('')
      afterJoinOrCreate(f)
    } catch (e: any) {
      setFamilyError(e?.response?.data?.detail || '참여에 실패했습니다. 초대 코드를 확인해주세요.')
    } finally {
      setFamilyLoading(false)
    }
  }

  const handleShareExisting = async () => {
    setFamilyLoading(true)
    try {
      await shareExistingItems()
      const f = await getMyFamily()
      setFamily(f)
    } catch {
      // 실패해도 메인으로(개인 유지 상태)
    } finally {
      setFamilyLoading(false)
      setFamilyView('main')
    }
  }

  const openLocationModal = async () => {
    setShowLocationModal(true)
    setLocLoading(true)
    try {
      setLocations(await fetchLocations())
    } catch {
      setLocations([])
    } finally {
      setLocLoading(false)
    }
  }

  const handleAddLocation = async () => {
    const n = newLoc.trim()
    if (!n) return
    try {
      const created = await createLocation(n)
      setLocations((p) => [...p, created])
      setNewLoc('')
    } catch {
      // 중복 등 — 조용히 무시
    }
  }

  const handleDeleteLocation = async (id: number) => {
    if (!confirm('이 위치를 삭제할까요? 기존에 등록된 항목의 위치 표시는 그대로 유지됩니다.')) return
    try {
      await deleteLocation(id)
      setLocations((p) => p.filter((l) => l.id !== id))
    } catch {
      // 무시
    }
  }

  const copyInviteLink = (code: string) => {
    const link = `https://checkhome-app-seven.vercel.app/join/${code}`
    navigator.clipboard?.writeText(link).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ROLE_LABEL: Record<string, string> = {
    owner: '소유자', editor: '편집자', viewer: '보기전용', executor: '수행전용',
  }

  const toggleCategory = (id: string) => {
    setEnabledCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="h-full overflow-y-auto pb-20 relative bg-[#F8F9FA]">
      <div className="px-5 pt-8 pb-5">
        <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">설정</h1>
      </div>

      {user && (
        <div className="mx-5 mb-6 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-2xl p-5 text-white">
          <p className="font-bold text-lg">{user.name}</p>
          <p className="text-sm opacity-80">{user.email}</p>
        </div>
      )}

      <div className="px-6 space-y-6 pb-6">
        <section>
          <h2 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">계정</h2>
          <div className="bg-white border border-[#CBD5E1] rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => showToast('이름·비밀번호 변경 기능은 곧 제공됩니다')}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User size={18} className="text-[#475569]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">내 정보</p>
                  <p className="text-xs text-[#94A3B8]">{user?.name} · {user?.email}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">가족 및 관리</h2>
          <div className="bg-white border border-[#CBD5E1] rounded-xl overflow-hidden divide-y divide-gray-200 shadow-sm">
            <button
              onClick={openFamilyModal}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users size={18} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">가족 공유 관리</p>
                  <p className="text-xs text-[#94A3B8]">초대 코드로 가족 추가</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            <button
              onClick={openLocationModal}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <MapPin size={18} className="text-[#475569]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">보관 위치 관리</p>
                  <p className="text-xs text-[#94A3B8]">냉장고·창고 등 보관 장소 목록</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            <button
              onClick={() => setShowCategoriesModal(true)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Layers size={18} className="text-[#475569]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">관리 항목 설정</p>
                  <p className="text-xs text-[#94A3B8]">카테고리 표시 설정</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            <button
              onClick={() => setShowNotificationModal(true)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Bell size={18} className="text-[#475569]" />
                </div>
                <span className="text-sm font-medium">알림 설정</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </section>

        {/* 가족관리 ~ 구독 섹션 사이 광고 */}
        <div className="-mx-6">
          <AdBanner variant="mid" text="체크홈 프리미엄으로 업그레이드" subtext="가족 10명 공유 & 무제한 카테고리" icon="star" />
        </div>

        <section>
          <h2 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">구독 및 데이터</h2>
          <div className="bg-white border border-[#CBD5E1] rounded-xl overflow-hidden divide-y divide-gray-200 shadow-sm">
            <button
              onClick={openSubscriptionModal}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <CreditCard size={18} className="text-[#14B8A6]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">구독 관리</p>
                  <p className="text-xs text-[#94A3B8]">무료 · 스타터 · 프로 · 프리미엄</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Database size={18} className="text-[#475569]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">데이터 내보내기</p>
                  <p className="text-xs text-[#94A3B8]">내 항목을 파일로 저장</p>
                </div>
              </div>
              {exporting ? <Loader2 size={18} className="animate-spin text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">고객 지원</h2>
          <div className="bg-white border border-[#CBD5E1] rounded-xl overflow-hidden divide-y divide-gray-200 shadow-sm">
            <button onClick={handleContact} className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <MessageCircle size={18} className="text-[#475569]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">문의하기</p>
                  <p className="text-xs text-[#94A3B8]">{SUPPORT_EMAIL}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            <button onClick={() => showToast('등록된 공지사항이 없어요')} className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Megaphone size={18} className="text-[#475569]" />
                </div>
                <span className="text-sm font-medium">공지사항</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            <button onClick={() => setShowTermsModal(true)} className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText size={18} className="text-[#475569]" />
                </div>
                <span className="text-sm font-medium">약관 및 개인정보처리방침</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </section>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-rose-500 font-medium text-sm"
        >
          <LogOut size={18} />
          로그아웃
        </button>

        {/* 버전 정보 위 광고 */}
        <div className="-mx-6">
          <AdBanner variant="bottom" text="냉장고 정수기 렌탈 1위 코웨이" subtext="월 2만원대 홈케어 서비스 신청하기" icon="zap" />
        </div>

        <div className="text-center text-xs text-gray-400">
          <p>체크홈 v1.0.0</p>
        </div>
      </div>

      {showSubscriptionModal && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#CBD5E1] px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold">구독 플랜</h2>
              <button onClick={() => setShowSubscriptionModal(false)}><X size={20} /></button>
            </div>

            {subLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={28} className="animate-spin text-[#14B8A6]" />
              </div>
            ) : (
              <div className="px-4 py-5 space-y-4">
                {/* 현재 플랜 */}
                {subscription && (
                  <div className="bg-gradient-to-r from-[#0D9488] to-[#14B8A6] rounded-2xl p-4 text-white">
                    <p className="text-xs opacity-75 mb-1">현재 플랜</p>
                    <p className="text-lg font-bold capitalize">
                      {subscription.plan === 'free' ? '무료' :
                       subscription.plan === 'starter' ? '스타터' :
                       subscription.plan === 'pro' ? '프로' : '프리미엄'}
                    </p>
                    {subscription.current_period_end && subscription.plan !== 'free' && (
                      <p className="text-xs opacity-75 mt-1">
                        {subscription.cancel_at_period_end ? '해지 예정: ' : '다음 결제: '}
                        {new Date(subscription.current_period_end).toLocaleDateString('ko-KR')}
                      </p>
                    )}
                    {subscription.plan !== 'free' && !subscription.cancel_at_period_end && (
                      <button
                        onClick={handleManageSubscription}
                        className="mt-3 text-xs font-semibold underline opacity-80"
                      >
                        구독 해지
                      </button>
                    )}
                    {subscription.cancel_at_period_end && (
                      <p className="mt-2 text-xs opacity-80">해지 예정 · 기간 만료 후 무료 전환</p>
                    )}
                  </div>
                )}

                {/* 플랜 카드 목록 */}
                {[
                  { key: 'starter', label: '스타터', price: '₩4,900/월', icon: Zap, color: 'bg-blue-50 text-blue-600',
                    features: ['항목 무제한 등록', '사진 첨부 (최대 8장)', '보관 위치 관리', 'AI 사진 인식'] },
                  { key: 'pro', label: '프로', price: '₩9,900/월', icon: Sparkles, color: 'bg-teal-50 text-teal-600',
                    features: ['스타터 모든 기능', '가족 공유 (최대 6명)', 'AI 인식 강화 (고급 모델)', '데이터 우선 처리'] },
                  { key: 'premium', label: '프리미엄', price: '₩19,900/월', icon: Crown, color: 'bg-amber-50 text-amber-600',
                    features: ['프로 모든 기능', '가족 공유 무제한', '만료 알림 (이메일·앱)', '전용 고객지원'] },
                ].map(({ key, label, price, icon: Icon, color, features }) => {
                  const isCurrent = subscription?.plan === key
                  return (
                    <div key={key} className={`border rounded-2xl p-4 ${isCurrent ? 'border-[#14B8A6] bg-teal-50/30' : 'border-[#E2E8F0]'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-xl ${color}`}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-[#1A1A1A] text-sm">{label}</p>
                            <p className="text-xs text-[#14B8A6] font-semibold">{price}</p>
                          </div>
                        </div>
                        {isCurrent ? (
                          <span className="text-xs font-semibold text-[#14B8A6] bg-teal-100 px-2.5 py-1 rounded-full">현재 플랜</span>
                        ) : (
                          <button
                            onClick={() => handleSubscribePlan(key)}
                            disabled={checkoutLoading === key}
                            className="text-xs font-semibold bg-[#1A1A1A] text-white px-3 py-1.5 rounded-lg hover:bg-[#14B8A6] transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {checkoutLoading === key ? <Loader2 size={12} className="animate-spin" /> : null}
                            구독하기
                          </button>
                        )}
                      </div>
                      <ul className="space-y-1">
                        {features.map((f) => (
                          <li key={f} className="text-xs text-[#475569] flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-[#14B8A6] rounded-full flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}

                <p className="text-xs text-[#94A3B8] text-center pb-2">
                  결제는 토스페이먼츠를 통해 안전하게 처리됩니다. 언제든지 해지 가능.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {showFamilyModal && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#CBD5E1] px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold">
                {familyView === 'create' ? '가족 그룹 만들기' : familyView === 'join' ? '초대 코드로 참여' : familyView === 'share-ask' ? '기존 항목 공유' : '가족 공유 관리'}
              </h2>
              <button onClick={() => { setShowFamilyModal(false); setFamilyView('main'); setFamilyError('') }}>
                <X size={20} />
              </button>
            </div>

            {familyLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={28} className="animate-spin text-[#14B8A6]" />
              </div>
            ) : familyView === 'create' ? (
              <div className="px-4 py-4 space-y-4">
                <p className="text-sm text-[#64748B]">가족 그룹 이름을 입력하세요.</p>
                <input
                  type="text"
                  placeholder="예: 우리 가족"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
                {familyError && <p className="text-rose-500 text-xs">{familyError}</p>}
                <div className="flex gap-2">
                  <button onClick={() => { setFamilyView('main'); setFamilyError('') }} className="flex-1 py-3 border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#64748B]">취소</button>
                  <button onClick={handleCreateFamily} className="flex-1 py-3 bg-[#14B8A6] text-white rounded-xl text-sm font-semibold">만들기</button>
                </div>
              </div>
            ) : familyView === 'share-ask' ? (
              <div className="px-4 py-6 space-y-5">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto">
                  <Users size={28} className="text-[#14B8A6]" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg text-[#1A1A1A]">기존 항목을 가족과 공유할까요?</p>
                  <p className="text-sm text-[#64748B] mt-1.5">
                    참여 전에 등록해둔 <b className="text-[#14B8A6]">{pendingShareCount}개</b> 항목이 있어요.
                  </p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-4 text-sm text-[#475569] space-y-2 border border-[#E2E8F0]">
                  <div className="flex items-start gap-2">
                    <Users size={16} className="text-[#14B8A6] mt-0.5 flex-shrink-0" />
                    <p><b>함께 보기</b> — 기존 항목이 가족 공용이 되어 가족 모두가 보고 같이 챙겨요.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Layers size={16} className="text-[#94A3B8] mt-0.5 flex-shrink-0" />
                    <p><b>나만 보기</b> — 기존 항목은 나만 보고, 앞으로 등록하는 것만 공유돼요.</p>
                  </div>
                  <p className="text-xs text-[#94A3B8] pt-1">💡 나중에 각 항목 화면에서 언제든 바꿀 수 있어요.</p>
                </div>
                <div className="space-y-2">
                  <button onClick={handleShareExisting} className="w-full py-3 bg-[#14B8A6] text-white rounded-xl text-sm font-semibold">
                    가족과 함께 보기
                  </button>
                  <button onClick={() => setFamilyView('main')} className="w-full py-3 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm font-semibold">
                    나만 보기 (기존 항목 유지)
                  </button>
                </div>
              </div>
            ) : familyView === 'join' ? (
              <div className="px-4 py-4 space-y-4">
                <p className="text-sm text-[#64748B]">가족에게 받은 초대 코드를 입력하세요.</p>
                <input
                  type="text"
                  placeholder="초대 코드 입력"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#14B8A6] font-mono"
                />
                {familyError && <p className="text-rose-500 text-xs">{familyError}</p>}
                <div className="flex gap-2">
                  <button onClick={() => { setFamilyView('main'); setFamilyError('') }} className="flex-1 py-3 border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#64748B]">취소</button>
                  <button onClick={handleJoinFamily} className="flex-1 py-3 bg-[#14B8A6] text-white rounded-xl text-sm font-semibold">참여하기</button>
                </div>
              </div>
            ) : family ? (
              <div className="px-4 py-4 space-y-5">
                {/* 그룹 정보 */}
                <div className="bg-gradient-to-r from-[#0D9488] to-[#14B8A6] rounded-2xl p-4 text-white">
                  <p className="text-xs opacity-75 mb-1">내 가족 그룹</p>
                  <p className="text-lg font-bold">{family.name}</p>
                  <p className="text-xs opacity-75 mt-1">멤버 {family.members.length}명</p>
                </div>

                {/* 초대 링크 */}
                <div>
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase mb-2">초대 링크</p>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 flex items-center gap-3">
                    <Link size={16} className="text-[#14B8A6] flex-shrink-0" />
                    <p className="text-xs text-[#64748B] flex-1 truncate font-mono">{family.invite_code}</p>
                    <button
                      onClick={() => copyInviteLink(family.invite_code)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#14B8A6] text-white rounded-lg text-xs font-semibold flex-shrink-0"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? '복사됨' : '링크 복사'}
                    </button>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1.5">가족에게 이 링크를 공유하면 바로 참여할 수 있어요</p>
                </div>

                {/* 멤버 목록 */}
                <div>
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase mb-2">멤버</p>
                  <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden divide-y divide-[#F1F5F9]">
                    {family.members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                            {m.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1A1A1A]">
                              {m.name}
                              {m.user_id === user?.user_id && <span className="ml-1.5 text-xs text-[#14B8A6] font-normal">(나)</span>}
                            </p>
                            <p className="text-xs text-[#94A3B8]">{m.email}</p>
                          </div>
                        </div>
                        <span className="text-xs px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full font-medium">
                          {ROLE_LABEL[m.role] || m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-8 space-y-4 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                  <Users size={28} className="text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A] mb-1">가족 그룹이 없어요</p>
                  <p className="text-sm text-[#64748B]">그룹을 만들거나 초대 코드로 참여하세요</p>
                </div>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => { setFamilyView('create'); setFamilyError('') }}
                    className="w-full py-3 bg-[#14B8A6] text-white rounded-xl text-sm font-semibold"
                  >
                    가족 그룹 만들기
                  </button>
                  <button
                    onClick={() => { setFamilyView('join'); setFamilyError('') }}
                    className="w-full py-3 border border-[#14B8A6] text-[#14B8A6] rounded-xl text-sm font-semibold"
                  >
                    초대 코드로 참여하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showCategoriesModal && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#CBD5E1] px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold">관리 항목 설정</h2>
              <button onClick={() => setShowCategoriesModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="px-4 py-4">
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p className="text-xs text-[#475569]">홈 화면에 표시할 카테고리를 선택하세요.</p>
              </div>
              <div className="space-y-2">
                {ALL_CATEGORIES.map((cat) => (
                  <label key={cat.id} className="flex items-center justify-between py-2.5 border-b border-[#F1F5F9] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <span className="text-base leading-none">{cat.icon}</span>
                      </div>
                      <span className="text-sm font-medium text-[#1A1A1A]">{cat.name}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enabledCategories.has(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="w-5 h-5 rounded border-gray-300 accent-[#14B8A6]"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showLocationModal && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#CBD5E1] px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold">보관 위치 관리</h2>
              <button onClick={() => setShowLocationModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="px-4 py-4">
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p className="text-xs text-[#475569]">제품 등록 시 선택할 보관 장소예요. 가족과 공통으로 사용됩니다.</p>
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddLocation() }}
                  placeholder="새 위치 (예: 베란다 창고)"
                  className="flex-1 border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
                <button onClick={handleAddLocation} className="px-4 py-2.5 bg-[#14B8A6] text-white rounded-xl text-sm font-semibold flex items-center gap-1">
                  <Plus size={16} />추가
                </button>
              </div>
              {locLoading ? (
                <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#14B8A6]" /></div>
              ) : locations.length === 0 ? (
                <p className="text-sm text-[#94A3B8] text-center py-8">등록된 위치가 없어요. 위에서 추가해보세요.</p>
              ) : (
                <div className="space-y-1">
                  {locations.map((loc) => (
                    <div key={loc.id} className="flex items-center justify-between py-2.5 px-1 border-b border-[#F1F5F9] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <MapPin size={16} className="text-[#475569]" />
                        </div>
                        <span className="text-sm font-medium text-[#1A1A1A]">{loc.name}</span>
                      </div>
                      <button onClick={() => handleDeleteLocation(loc.id)} className="p-2 hover:bg-rose-50 rounded-lg">
                        <Trash2 size={16} className="text-rose-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showNotificationModal && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#CBD5E1] px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">알림 설정</h2>
              <button onClick={() => setShowNotificationModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="px-4 py-4 space-y-4">
              {[
                { title: '강 위험도 항목', items: ['D-90', 'D-30', 'D-7', 'D-1', '당일', '초과 알림'] },
                { title: '중 위험도 항목', items: ['D-30', 'D-7', 'D-1', '당일'] },
                { title: '약 위험도 항목', items: ['D-30', 'D-7', '월간 점검'] },
              ].map((section) => (
                <section key={section.title}>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">{section.title}</h3>
                  <div className="space-y-2">
                    {section.items.map((timing) => (
                      <label key={timing} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{timing}</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300" />
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}

      {showTermsModal && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#CBD5E1] px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold">약관 및 개인정보처리방침</h2>
              <button onClick={() => setShowTermsModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="px-5 py-4 text-sm text-[#475569] space-y-4 leading-relaxed">
              <section>
                <h3 className="font-bold text-[#1A1A1A] mb-1">서비스 이용약관</h3>
                <p>체크홈(이하 "서비스")은 가정용 제품의 유통기한·사용기한 관리를 돕는 앱입니다. 이용자는 본인 또는 가족의 제품 정보를 등록·관리할 수 있으며, 등록된 정보의 정확성에 대한 책임은 이용자에게 있습니다. 서비스는 안정적 제공을 위해 노력하나 천재지변·기술적 장애 등으로 일시 중단될 수 있습니다.</p>
              </section>
              <section>
                <h3 className="font-bold text-[#1A1A1A] mb-1">개인정보처리방침</h3>
                <p>서비스는 회원 식별을 위해 이메일·이름을 수집하며, 제품 등록 시 입력한 정보(제품명·사진·메모 등)를 저장합니다. 수집한 정보는 서비스 제공 목적으로만 사용하고 제3자에게 제공하지 않습니다. 이용자는 언제든 데이터 내보내기 또는 계정 삭제를 요청할 수 있습니다.</p>
              </section>
              <p className="text-xs text-[#94A3B8]">문의: {SUPPORT_EMAIL} · 본 약관은 서비스 개선에 따라 변경될 수 있으며 변경 시 앱 내 공지합니다.</p>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-[#1A1A1A] text-white text-sm px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}
