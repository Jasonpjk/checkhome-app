import { ArrowLeft, CheckCircle, ChevronRight } from 'lucide-react'
import { Vehicle, VehicleCheck, updateVehicleCheck } from '../../api/vehicles'
import { useState } from 'react'
import { AdBanner } from './AdBanner'

interface VehicleDetailProps {
  vehicle: Vehicle
  onBack: () => void
}

const statusConfig = {
  normal: { bg: 'bg-green-50', badge: 'bg-green-500', text: 'text-green-700' },
  warning: { bg: 'bg-yellow-50', badge: 'bg-yellow-500', text: 'text-yellow-700' },
  imminent: { bg: 'bg-orange-50', badge: 'bg-orange-500', text: 'text-orange-700' },
  expired: { bg: 'bg-red-50', badge: 'bg-red-500', text: 'text-red-700' },
}

function getCheckStatus(check: VehicleCheck): keyof typeof statusConfig {
  if (check.days_left === null) return 'normal'
  if (check.days_left < 0) return 'expired'
  if (check.days_left <= 7) return 'imminent'
  if (check.days_left <= 30) return 'warning'
  return 'normal'
}

export function VehicleDetail({ vehicle, onBack }: VehicleDetailProps) {
  const [checks, setChecks] = useState<VehicleCheck[]>(vehicle.checks)
  const [selectedCheck, setSelectedCheck] = useState<VehicleCheck | null>(null)
  const [nextDate, setNextDate] = useState('')
  const [lastDate, setLastDate] = useState('')
  const [checkMemo, setCheckMemo] = useState('')
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleCompleteCheck = async () => {
    if (!selectedCheck) return
    setSaving(true)
    try {
      const updated = await updateVehicleCheck(vehicle.id, selectedCheck.id, {
        last_check_date: lastDate || new Date().toISOString().split('T')[0],
        next_check_date: nextDate || undefined,
        memo: checkMemo || undefined,
      })
      setChecks((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)))
      setSelectedCheck(null)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1500)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full bg-[#F8F9FA] overflow-y-auto relative">
      <div className="bg-gradient-to-br from-[#0D9488] to-[#3a9d8d] px-6 pt-10 pb-6 text-white">
        <button onClick={onBack} className="flex items-center gap-2 text-white/80 mb-6">
          <ArrowLeft size={20} />
          차량 목록
        </button>
        <h1 className="text-2xl font-bold">{vehicle.name}</h1>
        <p className="text-sm opacity-80">{vehicle.plate}</p>
        <p className="text-sm opacity-80 mt-1">주행거리: {vehicle.mileage.toLocaleString()} km</p>
      </div>

      <div className="py-4">
        <div className="mb-4">
          <AdBanner variant="mid" text="차량 관리 전문 엔진엔" subtext="엔진오일·타이어 교체 최저가 예약" icon="zap" />
        </div>
        <div className="px-4">
        <h2 className="text-base font-semibold text-[#1A1A1A] mb-3">점검 항목</h2>
        <div className="space-y-2">
          {checks.length === 0 && (
            <div className="py-10 text-center text-[#94A3B8]">
              <p className="text-sm">점검 항목을 불러오는 중이에요</p>
            </div>
          )}
          {checks.map((check) => {
            const status = getCheckStatus(check)
            const cfg = statusConfig[status]
            return (
              <button
                key={check.id}
                onClick={() => { setSelectedCheck(check); setNextDate(check.next_check_date || ''); setLastDate(check.last_check_date || ''); setCheckMemo(check.memo || '') }}
                className={`w-full ${cfg.bg} rounded-xl p-4 flex items-center justify-between text-left`}
              >
                <div>
                  <p className={`text-sm font-semibold ${cfg.text}`}>{check.check_type}</p>
                  {check.last_check_date && (
                    <p className="text-xs text-[#475569] mt-1">마지막 점검: {check.last_check_date}</p>
                  )}
                  {check.next_check_date && (
                    <p className="text-xs text-[#475569]">다음 점검: {check.next_check_date}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {check.days_left !== null && (
                    <span className={`text-xs text-white px-2 py-1 rounded-full ${cfg.badge}`}>
                      D-{check.days_left}
                    </span>
                  )}
                  <ChevronRight size={18} className="text-[#CBD5E1]" />
                </div>
              </button>
            )
          })}
        </div>
        <div className="mt-4">
          <AdBanner variant="bottom" text="자동차 보험 비교 견적" subtext="5분만에 최대 30만원 절약하세요" icon="shield" />
        </div>
        </div>
      </div>

      {selectedCheck && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-[75vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-1">{selectedCheck.check_type}</h3>
            <p className="text-xs text-[#94A3B8] mb-6">점검 완료 처리</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#1A1A1A] mb-2 block">마지막 점검일</label>
                <input
                  type="date"
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] rounded-xl px-4 py-3 text-sm border border-[#E2E8F0] outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1A1A1A] mb-2 block">다음 점검 예정일</label>
                <input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] rounded-xl px-4 py-3 text-sm border border-[#E2E8F0] outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1A1A1A] mb-2 block">메모</label>
                <textarea
                  value={checkMemo}
                  onChange={(e) => setCheckMemo(e.target.value)}
                  placeholder="정비소, 영수증 번호 등"
                  rows={2}
                  className="w-full bg-[#F8FAFC] rounded-xl px-4 py-3 text-sm border border-[#E2E8F0] outline-none focus:ring-2 focus:ring-[#14B8A6] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelectedCheck(null)} className="flex-1 py-3 bg-[#F1F5F9] rounded-xl font-semibold text-sm">취소</button>
              <button
                onClick={handleCompleteCheck}
                disabled={saving}
                className="flex-1 py-3 bg-[#14B8A6] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle size={18} />
                {saving ? '저장 중...' : '점검 완료'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-lg">점검 완료!</p>
          </div>
        </div>
      )}
    </div>
  )
}
