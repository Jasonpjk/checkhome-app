import { useState, useEffect } from 'react'
import { Plus, Car, ChevronRight, Gauge, Trash2, CheckCircle, X } from 'lucide-react'
import { fetchVehicles, createVehicle, deleteVehicle, Vehicle as VehicleType } from '../../api/vehicles'
import { AdBanner } from './AdBanner'

interface VehicleProps {
  onVehicleClick?: (vehicle: VehicleType) => void
}

export function Vehicle({ onVehicleClick }: VehicleProps) {
  const [vehicles, setVehicles] = useState<VehicleType[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [vehicleName, setVehicleName] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleMileage, setVehicleMileage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchVehicles()
      .then(setVehicles)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const v = await createVehicle(vehicleName, vehiclePlate, parseInt(vehicleMileage) || 0)
      setVehicles((prev) => [...prev, v])
      setShowAddModal(false)
      setShowSuccessModal(true)
      setTimeout(() => setShowSuccessModal(false), 1500)
      setVehicleName('')
      setVehiclePlate('')
      setVehicleMileage('')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteVehicle(id)
      setVehicles((prev) => prev.filter((v) => v.id !== id))
    } catch (err) {
      console.error(err)
    }
    setDeleteTargetId(null)
  }

  const getNextCheck = (vehicle: VehicleType) => {
    const urgent = vehicle.checks.filter(
      (c) => c.days_left !== null && c.days_left <= 30
    )
    if (urgent.length === 0) return vehicle.checks[0]
    return urgent.sort((a, b) => (a.days_left ?? 9999) - (b.days_left ?? 9999))[0]
  }

  return (
    <div className="h-full overflow-y-auto pb-20 relative">
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A] mb-0.5">차량 관리</h1>
            <p className="text-xs text-[#475569]">등록된 차량 {vehicles.length}대</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#1A1A1A] text-white p-2.5 rounded-lg hover:bg-[#14B8A6] transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-28 animate-pulse" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-[#E2E8F0]">
            <Car size={32} className="text-[#94A3B8] mx-auto mb-3" />
            <p className="text-sm text-[#475569] font-medium">등록된 차량이 없습니다</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-xs text-[#14B8A6] font-semibold"
            >
              + 차량 추가
            </button>
          </div>
        ) : (
          <>
          <div className="space-y-2.5">
            {vehicles.map((vehicle) => {
              const nextCheck = getNextCheck(vehicle)
              return (
                <div
                  key={vehicle.id}
                  onClick={() => onVehicleClick?.(vehicle)}
                  className="w-full bg-gradient-to-br from-[#0D9488] to-[#3a9d8d] rounded-lg p-4 text-white text-left hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Car size={16} />
                        <h3 className="text-base font-semibold">{vehicle.name}</h3>
                      </div>
                      <p className="text-xs opacity-90">{vehicle.plate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTargetId(vehicle.id) }}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/20">
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Gauge size={14} />
                        <p className="text-xs opacity-90">현재 주행거리</p>
                      </div>
                      <p className="text-base font-semibold">{vehicle.mileage.toLocaleString()} km</p>
                    </div>
                    {nextCheck && (
                      <div className="text-right">
                        <p className="text-xs opacity-90 mb-0.5">다음 점검</p>
                        <p className="text-sm font-semibold">{nextCheck.check_type}</p>
                        {nextCheck.days_left !== null && (
                          <p className="text-xs opacity-90">D-{nextCheck.days_left}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 -mx-4">
            <AdBanner variant="mid" text="차량 관리 전문 엔진엔" subtext="엔진오일·타이어 교체 최저가 예약" icon="zap" />
          </div>
          <div className="mt-3 -mx-4">
            <AdBanner variant="bottom" text="자동차 보험 비교 견적" subtext="5분만에 최대 30만원 절약하세요" icon="shield" />
          </div>
          </>
        )}
      </div>

      {showAddModal && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">차량 추가</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <input
                type="text"
                placeholder="차량명 (예: 아빠 차)"
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                className="w-full bg-[#F8FAFC] rounded-xl px-4 py-3 text-sm border border-[#E2E8F0] outline-none focus:ring-2 focus:ring-[#14B8A6]"
                required
              />
              <input
                type="text"
                placeholder="차량번호 (예: 12가3456)"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="w-full bg-[#F8FAFC] rounded-xl px-4 py-3 text-sm border border-[#E2E8F0] outline-none focus:ring-2 focus:ring-[#14B8A6]"
                required
              />
              <input
                type="number"
                placeholder="현재 주행거리 (km)"
                value={vehicleMileage}
                onChange={(e) => setVehicleMileage(e.target.value)}
                className="w-full bg-[#F8FAFC] rounded-xl px-4 py-3 text-sm border border-[#E2E8F0] outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-semibold hover:bg-[#14B8A6] transition-colors disabled:opacity-50"
              >
                {submitting ? '추가 중...' : '차량 추가'}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteTargetId !== null && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">차량 삭제</h3>
            <p className="text-sm text-[#475569] mb-6">이 차량을 삭제하시겠습니까?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTargetId(null)} className="flex-1 py-3 bg-[#F1F5F9] rounded-xl font-semibold text-sm">취소</button>
              <button onClick={() => handleDelete(deleteTargetId!)} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold text-sm">삭제</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-lg">차량이 추가되었습니다</p>
          </div>
        </div>
      )}
    </div>
  )
}
