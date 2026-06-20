import { useState, useEffect } from 'react'
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
        setAuth({ user_id: result.user_id, name: result.name, email: result.email }, result.access_token)
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
            onBack={() => setEditingItem(null)}
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
            onBack={() => setSelectedVehicle(null)}
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
            onBack={() => setSelectedItem(null)}
            onEdit={() => setEditingItem(selectedItem)}
            onDeleted={() => { setSelectedItem(null); setActiveTab('storage') }}
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
              onItemClick={(item) => setSelectedItem(item)}
              initialCategory={selectedCategory}
              smartFilter={smartFilter}
              onFilterChange={() => { setSelectedCategory(null); setSmartFilter(null) }}
            />
          )}
          {activeTab === 'register' && (
            <Register
              onRegistered={() => setActiveTab('storage')}
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
