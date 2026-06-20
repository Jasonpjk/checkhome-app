import { useState } from 'react'
import { User, Users, MapPin, Bell, CreditCard, Database, MessageCircle, Megaphone, FileText, ChevronRight, X, Plus, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface SettingsProps {
  onLogout: () => void
}

export function Settings({ onLogout }: SettingsProps) {
  const { user, clearAuth } = useAuthStore()
  const [showFamilyModal, setShowFamilyModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      clearAuth()
      onLogout()
    }
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

      <div className="px-5 space-y-6 pb-6">
        <section>
          <h2 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">계정</h2>
          <div className="bg-white border border-[#CBD5E1] rounded-xl overflow-hidden shadow-sm">
            <button className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User size={18} className="text-[#475569]" />
                </div>
                <span className="text-sm font-medium">내 정보</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">가족 및 관리</h2>
          <div className="bg-white border border-[#CBD5E1] rounded-xl overflow-hidden divide-y divide-gray-200 shadow-sm">
            <button
              onClick={() => setShowFamilyModal(true)}
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
            <button className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <MapPin size={18} className="text-[#475569]" />
                </div>
                <span className="text-sm font-medium">보관 위치 관리</span>
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

        <section>
          <h2 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">구독 및 데이터</h2>
          <div className="bg-white border border-[#CBD5E1] rounded-xl overflow-hidden divide-y divide-gray-200 shadow-sm">
            {[
              { icon: CreditCard, label: '구독 관리' },
              { icon: Database, label: '데이터 백업' },
            ].map(({ icon: Icon, label }) => (
              <button key={label} className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon size={18} className="text-[#475569]" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">고객 지원</h2>
          <div className="bg-white border border-[#CBD5E1] rounded-xl overflow-hidden divide-y divide-gray-200 shadow-sm">
            {[
              { icon: MessageCircle, label: '문의하기' },
              { icon: Megaphone, label: '공지사항' },
              { icon: FileText, label: '약관 및 개인정보처리방침' },
            ].map(({ icon: Icon, label }) => (
              <button key={label} className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon size={18} className="text-[#475569]" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-rose-500 font-medium text-sm"
        >
          <LogOut size={18} />
          로그아웃
        </button>

        <div className="text-center text-xs text-gray-400">
          <p>체크홈 v1.0.0</p>
        </div>
      </div>

      {showFamilyModal && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#CBD5E1] px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold">가족 공유 관리</h2>
              <button onClick={() => setShowFamilyModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="px-4 py-4 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">공동 항목은 가족 중 누구 한 명이 완료하면 전체 완료로 표시됩니다.</p>
              </div>
              <button className="w-full border-2 border-[#1A1A1A] text-[#1A1A1A] py-2.5 rounded-lg text-sm font-medium hover:bg-[#F8FAFC] flex items-center justify-center gap-1.5">
                <Plus size={16} />
                가족 초대
              </button>
              <div className="text-xs text-[#475569] space-y-1.5">
                <p className="font-medium">권한 설명</p>
                <ul className="space-y-0.5 text-[10px]">
                  <li>• 소유자: 모든 항목 관리 및 가족 관리</li>
                  <li>• 편집자: 항목 등록, 수정, 삭제 가능</li>
                  <li>• 보기전용: 항목 조회만 가능</li>
                  <li>• 수행전용: 완료 처리만 가능</li>
                </ul>
              </div>
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
    </div>
  )
}
