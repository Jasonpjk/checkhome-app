import { useState, useEffect } from 'react'
import { LayoutDashboard, Users, Package, LogOut, Menu, X, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { getAdminMe } from '../api/admin'
import { AdminDashboard } from './Dashboard'
import { AdminMembers } from './Members'
import { AdminItems } from './Items'

type AdminTab = 'dashboard' | 'members' | 'items'

export function AdminApp() {
  const { user, token, clearAuth } = useAuthStore()
  const [verified, setVerified] = useState<'loading' | 'ok' | 'denied'>('loading')
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!token) { setVerified('denied'); return }
    getAdminMe()
      .then(() => setVerified('ok'))
      .catch(() => setVerified('denied'))
  }, [token])

  if (verified === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
      </div>
    )
  }

  if (verified === 'denied') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield size={48} className="text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">접근 권한 없음</h1>
          <p className="text-gray-500 mb-6">관리자 계정으로 로그인해야 합니다.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold text-sm"
          >
            앱으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard' as AdminTab, label: '대시보드', icon: LayoutDashboard },
    { id: 'members' as AdminTab, label: '회원 관리', icon: Users },
    { id: 'items' as AdminTab, label: '항목 현황', icon: Package },
  ]

  const handleLogout = () => {
    clearAuth()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 (데스크톱) */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-200 flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">체크홈 관리자</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 h-full bg-white flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-800">체크홈 관리자</p>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
            <div className="px-3 py-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500"
              >
                <LogOut size={18} />
                로그아웃
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 모바일 헤더 */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} className="text-gray-600" />
          </button>
          <p className="font-bold text-gray-800">체크홈 관리자</p>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'members' && <AdminMembers />}
          {activeTab === 'items' && <AdminItems />}
        </main>
      </div>
    </div>
  )
}
