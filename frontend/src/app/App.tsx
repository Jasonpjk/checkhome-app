import { useState, useEffect, useRef } from 'react'
import { Home as HomeIcon, Archive, PlusCircle, Car, Settings as SettingsIcon } from 'lucide-react'
import { Onboarding } from './components/Onboarding'
import { Login } from './components/Login'
import { Home } from './components/Home'
import { Storage } from './components/Storage'
import { Register } from './components/Register'
import { Vehicle } from './components/Vehicle'
import { VehicleDetail } from './components/VehicleDetail'
import { Settings } from './components/Settings'
import { ItemDetail } from './components/ItemDetail'
import { ItemEdit } from './components/ItemEdit'
import { useAuthStore } from '../store/authStore'
import { socialLogin } from '../api/auth'
import { Item } from '../api/items'
import { Vehicle as VehicleType } from '../api/vehicles'

type Screen = 'onboarding' | 'login' | 'main' | 'social-callback'
type Tab = 'home' | 'storage' | 'register' | 'vehicle' | 'settings'
type SmartFilter = 'action-needed' | 'this-week' | null

const ONBOARDING_KEY = 'checkhome_onboarding_done'

function hasOAuthParams() {
  const p = new URLSearchParams(window.location.search)
  return p.has('code') && p.has('state')
}

export default function App() {
  const { user, token, setAuth } = useAuthStore()
  const [onboardingDone] = useState(() => localStorage.getItem(ONBOARDING_KEY) === '1')

  const getInitialScreen = (): Screen => {
    if (hasOAuthParams()) return 'social-callback'
    if (!onboardingDone) return 'onboarding'
    if (!token || !user) return 'login'
    return 'main'
  }

  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen)
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [smartFilter, setSmartFilter] = useState<SmartFilter>(null)
  // 등록 후 보관함을 강제로 다시 불러오기 위한 키 (값이 바뀌면 Storage가 재마운트되어 refetch)
  const [storageRefreshKey, setStorageRefreshKey] = useState(0)

  // ── 휴대폰 뒤로가기 통합 처리 (단일 네비게이션 스택) ──
  // 열린 서브화면을 '순서 있는 배열'로 표현하고, 우리가 실제 push한 history 엔트리 수(pushedRef)를
  // 원하는 깊이에 idempotent하게 맞춘다. 깊이가 같아도 '무엇이 열렸는지'가 바뀌면 정확히 1개가 push/pop된다.
  // (이전 '숫자 깊이 + skip 플래그' 방식의 desync 버그를 근본 제거)
  const overlay = [
    (!!selectedCategory || !!smartFilter) && activeTab === 'storage' ? 'filter' : null,
    selectedVehicle ? 'vehicle' : null,
    selectedItem ? 'item' : null,
    editingItem ? 'edit' : null,
  ].filter(Boolean) as string[]

  const pushedRef = useRef(0)
  const programmaticRef = useRef(0)
  const closeTopRef = useRef<() => void>(() => {})
  closeTopRef.current = () => {
    if (editingItem) setEditingItem(null)
    else if (selectedItem) setSelectedItem(null)
    else if (selectedVehicle) setSelectedVehicle(null)
    else if (selectedCategory || smartFilter) { setSelectedCategory(null); setSmartFilter(null); setActiveTab('home') }
  }

  useEffect(() => {
    const want = overlay.length
    // 더 깊어졌으면 부족한 만큼만 push
    while (pushedRef.current < want) { window.history.pushState({ ch: true }, ''); pushedRef.current++ }
    // 코드가 직접 화면을 닫아 얕아졌으면 남는 엔트리를 back으로 정리(이 back은 무시되도록 표시)
    while (pushedRef.current > want) { pushedRef.current--; programmaticRef.current++; window.history.back() }
  }, [overlay.join('|')])

  useEffect(() => {
    const onPop = () => {
      // 우리가 정리용으로 부른 back이면 무시
      if (programmaticRef.current > 0) { programmaticRef.current--; return }
      // 사용자가 누른 뒤로가기 → 최상위 화면 하나만 닫는다
      if (pushedRef.current > 0) { pushedRef.current--; closeTopRef.current() }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (!hasOAuthParams()) return

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')!
    const stateParam = params.get('state')!

    let provider: 'google' | 'kakao' = 'google'
    try {
      const stateData = JSON.parse(atob(stateParam))
      const savedNonce = sessionStorage.getItem('checkhome_oauth_nonce')
      if (savedNonce && stateData.nonce !== savedNonce) {
        setCurrentScreen('login')
        return
      }
      sessionStorage.removeItem('checkhome_oauth_nonce')
      if (stateData.provider === 'kakao') provider = 'kakao'
    } catch {
      // state 파싱 실패 시 기본 google 사용
    }

    const redirectUri = `${window.location.origin}/auth/callback`
    window.history.replaceState({}, '', '/')

    socialLogin(provider, code, redirectUri)
      .then((result) => {
        setAuth({ user_id: result.user_id, name: result.name, email: result.email, is_admin: result.is_admin }, result.access_token)
        setCurrentScreen('main')
      })
      .catch(() => {
        setCurrentScreen('login')
      })
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setCurrentScreen('login')
  }

  if (currentScreen === 'social-callback') {
    return (
      <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#14B8A6] mx-auto mb-4" />
          <p className="text-sm text-gray-500">로그인 중...</p>
        </div>
      </div>
    )
  }

  if (currentScreen === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  if (currentScreen === 'login') {
    return <Login onLogin={() => setCurrentScreen('main')} />
  }

  if (editingItem) {
    return (
      <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center">
        <div className="h-screen w-full max-w-md shadow-2xl">
          <ItemEdit
            item={editingItem}
            onBack={() => window.history.back()}
            onSaved={(updated) => {
              setSelectedItem(updated)
              setEditingItem(null)
            }}
          />
        </div>
      </div>
    )
  }

  if (selectedVehicle) {
    return (
      <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center">
        <div className="h-screen w-full max-w-md shadow-2xl">
          <VehicleDetail
            vehicle={selectedVehicle}
            onBack={() => window.history.back()}
          />
        </div>
      </div>
    )
  }

  if (selectedItem) {
    return (
      <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center">
        <div className="h-screen w-full max-w-md shadow-2xl">
          <ItemDetail
            item={selectedItem}
            onBack={() => window.history.back()}
            onEdit={() => setEditingItem(selectedItem)}
            onDeleted={() => { setSelectedItem(null); setActiveTab('storage'); setStorageRefreshKey((k) => k + 1) }}
          />
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'home' as Tab, label: '홈', icon: HomeIcon },
    { id: 'storage' as Tab, label: '보관함', icon: Archive },
    { id: 'register' as Tab, label: '등록', icon: PlusCircle },
    { id: 'vehicle' as Tab, label: '차량', icon: Car },
    { id: 'settings' as Tab, label: '설정', icon: SettingsIcon },
  ]

  return (
    <div className="min-h-screen w-full bg-[#E5E7EB] flex items-center justify-center">
      <div className="h-screen w-full max-w-md bg-[#F8F9FA] flex flex-col relative shadow-2xl">
        <div className="flex-1 overflow-hidden">
          {activeTab === 'home' && (
            <Home
              onCategoryClick={(category) => {
                setSelectedCategory(category)
                setSmartFilter(null)
                setActiveTab('storage')
              }}
              onItemClick={(item) => setSelectedItem(item)}
              onActionNeededClick={() => {
                setSmartFilter('action-needed')
                setSelectedCategory(null)
                setActiveTab('storage')
              }}
              onThisWeekClick={() => {
                setSmartFilter('this-week')
                setSelectedCategory(null)
                setActiveTab('storage')
              }}
            />
          )}
          {activeTab === 'storage' && (
            <Storage
              key={storageRefreshKey}
              onItemClick={(item) => setSelectedItem(item)}
              initialCategory={selectedCategory}
              smartFilter={smartFilter}
              onFilterChange={() => { setSelectedCategory(null); setSmartFilter(null) }}
            />
          )}
          {activeTab === 'register' && (
            <Register
              onRegistered={() => {
                // 등록 직후: 직전 카테고리/스마트필터를 비워 방금 등록한 항목이 가려지지 않게 하고,
                // 보관함을 강제로 다시 불러온다(stale 목록 방지).
                setSelectedCategory(null)
                setSmartFilter(null)
                setStorageRefreshKey((k) => k + 1)
                setActiveTab('storage')
              }}
            />
          )}
          {activeTab === 'vehicle' && (
            <Vehicle
              onVehicleClick={(vehicle) => setSelectedVehicle(vehicle)}
            />
          )}
          {activeTab === 'settings' && <Settings onLogout={() => setCurrentScreen('onboarding')} />}
        </div>

        <div className="bg-white border-t border-[#E2E8F0] safe-area-bottom shadow-lg">
          <div className="flex items-center justify-around px-2 py-3">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-col items-center gap-1.5 px-3 py-1 min-w-[60px] relative"
                >
                  {isActive && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#14B8A6] rounded-full" />
                  )}
                  <Icon
                    size={22}
                    className={`${isActive ? 'text-[#14B8A6]' : 'text-[#94A3B8]'} stroke-[2] transition-colors`}
                  />
                  <span className={`text-[10px] font-semibold ${isActive ? 'text-[#14B8A6]' : 'text-[#94A3B8]'}`}>
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
