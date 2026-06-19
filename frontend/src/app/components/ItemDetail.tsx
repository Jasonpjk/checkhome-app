import { useState } from 'react'
import { ArrowLeft, MapPin, User, Camera, X, Edit2, CheckCircle, Trash2, RefreshCw, Archive } from 'lucide-react'
import { Item, recordAction, deleteItem } from '../../api/items'
import { statusConfig, riskConfig } from '../data/statusConfig'

interface ItemDetailProps {
  item: Item
  onBack: () => void
  onEdit: () => void
  onDeleted: () => void
}

export function ItemDetail({ item, onBack, onEdit, onDeleted }: ItemDetailProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(item.photo_url)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [actionLabel, setActionLabel] = useState('')
  const [loading, setLoading] = useState(false)

  const statusInfo = statusConfig[item.status]
  const riskInfo = riskConfig[item.risk]

  const handleAction = async (action_type: string, label: string, deactivates = false) => {
    setLoading(true)
    try {
      await recordAction(item.id, action_type)
      setActionLabel(label)
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        if (deactivates) onDeleted()
      }, 1500)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('이 항목을 삭제하시겠습니까?')) return
    setLoading(true)
    try {
      await deleteItem(item.id)
      onDeleted()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getHeroGradient = () => {
    switch (item.status) {
      case 'expired': return 'bg-gradient-to-br from-rose-50 via-rose-100 to-pink-50'
      case 'imminent': return 'bg-gradient-to-br from-amber-50 via-amber-100 to-orange-50'
      case 'warning': return 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-50'
      case 'check-needed': return 'bg-gradient-to-br from-violet-50 via-violet-100 to-purple-50'
      default: return 'bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-50'
    }
  }

  const daysLeftText = () => {
    if (item.days_left === null) return '-'
    if (item.days_left < 0) return `D+${Math.abs(item.days_left)}`
    return `D-${item.days_left}`
  }

  return (
    <div className="h-screen bg-[#F8F9FA] flex flex-col relative">
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-[#F8FAFC] rounded-lg">
            <ArrowLeft size={22} className="text-[#1A1A1A]" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A1A]">상세 정보</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="p-2 hover:bg-[#F8FAFC] rounded-lg">
            <Edit2 size={20} className="text-[#475569]" />
          </button>
          <button onClick={handleDelete} className="p-2 hover:bg-rose-50 rounded-lg">
            <Trash2 size={20} className="text-rose-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="p-6 space-y-4">
          <div className={`${getHeroGradient()} rounded-2xl p-6 border-2 border-white shadow-sm`}>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="px-3 py-1.5 bg-white/90 text-[#475569] text-xs rounded-lg font-semibold">{item.category}</span>
              <span className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${statusInfo.badge}`}>{statusInfo.label}</span>
              <span className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${riskInfo.badge}`}>위험도 {riskInfo.label}</span>
            </div>
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">{item.name}</h2>
            <div className="bg-white/95 rounded-xl px-5 py-4 mb-4 shadow-sm">
              <p className={`text-xl font-bold mb-1 ${item.status === 'expired' ? 'text-rose-600' : item.status === 'imminent' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {daysLeftText()}
              </p>
              <p className="text-[#475569] text-sm">{item.expiry_date || item.open_date || '-'}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#1A1A1A]">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#94A3B8]" />
                <span className="font-semibold">{item.location || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-[#94A3B8]" />
                <span className="font-semibold">{item.handler_name || '-'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0]">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">제품 사진</h3>
            {photoPreview ? (
              <div className="relative aspect-video bg-[#F8FAFC] rounded-xl overflow-hidden">
                <img src={photoPreview} alt="Product" className="w-full h-full object-cover" />
                <button onClick={() => setPhotoPreview(null)} className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow-lg">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPhotoPreview('https://via.placeholder.com/400x300')}
                className="w-full aspect-video bg-[#F8FAFC] rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-teal-50 transition-all"
              >
                <Camera size={32} className="text-[#94A3B8] mb-2" />
                <span className="text-sm text-[#64748B] font-medium">사진 추가</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0]">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">상세 정보</h3>
            <div className="space-y-3">
              {[
                { label: '보관 위치', value: item.location || '-' },
                { label: '수량', value: `${item.quantity}개` },
                { label: '유통기한', value: item.expiry_date || '-' },
                { label: '개봉일', value: item.open_date || '-' },
                { label: '담당자', value: item.handler_name || '-' },
                { label: '메모', value: item.memo || '-' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-0">
                  <span className="text-sm text-[#64748B]">{label}</span>
                  <span className="text-sm font-semibold text-[#1A1A1A]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction('completed', '사용 완료', true)}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <CheckCircle size={18} />
            사용 완료
          </button>
          <button
            onClick={() => handleAction('replaced', '교체함', true)}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 bg-[#14B8A6] text-white rounded-xl font-semibold text-sm hover:bg-[#0D9488] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} />
            교체함
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction('disposed', '폐기함', true)}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            <Trash2 size={18} />
            폐기함
          </button>
          <button
            onClick={() => handleAction('kept', '아직 보관')}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 bg-[#F1F5F9] text-[#475569] rounded-xl font-semibold text-sm hover:bg-[#E2E8F0] transition-colors disabled:opacity-50"
          >
            <Archive size={18} />
            아직 보관
          </button>
        </div>
      </div>

      {showSuccessModal && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">{actionLabel}</h3>
            <p className="text-sm text-[#64748B]">처리가 완료되었습니다</p>
          </div>
        </div>
      )}
    </div>
  )
}
