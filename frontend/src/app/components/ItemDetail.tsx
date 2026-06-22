import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, MapPin, User, Edit2, CheckCircle, Trash2, RefreshCw, Archive, Users, Lock, AlertCircle, RotateCcw } from 'lucide-react'
import { Item, recordAction, deleteItem, updateItem, fetchItem, restoreItem } from '../../api/items'
import { statusConfig, riskConfig } from '../data/statusConfig'
import { AdBanner } from './AdBanner'
import { fileToCompressedDataUrl } from '../utils/image'
import { PhotoMultiPicker } from './PhotoMultiPicker'

interface ItemDetailProps {
  item: Item
  onBack: () => void
  onEdit: () => void
  onDeleted: () => void
}

export function ItemDetail({ item, onBack, onEdit, onDeleted }: ItemDetailProps) {
  const [photos, setPhotos] = useState<string[]>(item.photo_url ? [item.photo_url] : [])
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [actionLabel, setActionLabel] = useState('')
  const [actionType, setActionType] = useState('')
  const [actionError, setActionError] = useState('')
  const undoTimerRef = useRef<number | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [savingPhoto, setSavingPhoto] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // 가족 공유 상태 (항목별로 '가족 공유' ↔ '나만 보기' 전환 가능)
  const [shared, setShared] = useState(item.is_family_shared)
  const [familyId, setFamilyId] = useState<number | null>(item.family_id)
  const [createdBy, setCreatedBy] = useState<string | null>(item.created_by_name)
  const [togglingShare, setTogglingShare] = useState(false)

  // 목록 응답에는 사진이 빠져 있으므로, 상세 화면에서 사진을 따로 불러온다.
  useEffect(() => {
    let active = true
    fetchItem(item.id)
      .then((full) => {
        if (!active) return
        if (full.photos && full.photos.length > 0) setPhotos(full.photos)
        else if (full.photo_url) setPhotos([full.photo_url])
        setShared(full.is_family_shared)
        setFamilyId(full.family_id)
        setCreatedBy(full.created_by_name)
      })
      .catch(() => {})
    return () => { active = false }
  }, [item.id])

  const handleToggleShare = async () => {
    setTogglingShare(true)
    try {
      const updated = await updateItem(item.id, { is_family_shared: !shared })
      setShared(updated.is_family_shared)
      setFamilyId(updated.family_id)
    } catch (err) {
      console.error(err)
    } finally {
      setTogglingShare(false)
    }
  }

  const handleAddPhoto = async (file: File) => {
    if (photos.length >= 8) return
    setSavingPhoto(true)
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      if (dataUrl.length > 7_000_000) return
      const next = [...photos, dataUrl]
      setPhotos(next)
      await updateItem(item.id, { photos: next })
    } catch (err) {
      console.error(err)
    } finally {
      setSavingPhoto(false)
    }
  }

  const handleRemovePhoto = async (index: number) => {
    const next = photos.filter((_, i) => i !== index)
    setPhotos(next)
    try {
      await updateItem(item.id, { photos: next })
    } catch (err) {
      console.error(err)
    }
  }

  const statusInfo = statusConfig[item.status]
  const riskInfo = riskConfig[item.risk]

  const handleAction = async (action_type: string, label: string, deactivates = false) => {
    setLoading(true)
    setActionError('')
    try {
      await recordAction(item.id, action_type)
      setActionType(action_type)
      setActionLabel(label)
      setShowSuccessModal(true)
      if (deactivates) {
        // 항목이 '완료·폐기함'으로 이동. 5초 안에 되돌리기 가능, 이후 자동으로 화면 닫힘.
        undoTimerRef.current = window.setTimeout(() => {
          setShowSuccessModal(false)
          onDeleted()
        }, 5000)
      } else {
        window.setTimeout(() => setShowSuccessModal(false), 1500)
      }
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || '처리 중 오류가 발생했어요. 인터넷 상태를 확인하고 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleUndo = async () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setShowSuccessModal(false)
    try {
      await restoreItem(item.id)
    } catch (err) {
      console.error(err)
    }
    // 화면은 그대로 유지 (onDeleted 호출 안 함)
  }

  const handleDelete = async () => {
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
    <div className="h-full bg-[#F8F9FA] flex flex-col relative">
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
          <button onClick={() => setShowDeleteConfirm(true)} className="p-2 hover:bg-red-50 rounded-lg">
            <Trash2 size={20} className="text-red-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-48">
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
            {photos.length > 0 && (
              <img src={photos[0]} alt="대표 사진" className="w-full aspect-video object-cover rounded-xl bg-[#F8FAFC] mb-3" />
            )}
            <PhotoMultiPicker photos={photos} onAdd={handleAddPhoto} onRemove={handleRemovePhoto} max={8} busy={savingPhoto} />
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

          {familyId && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {shared
                    ? <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0"><Users size={18} className="text-[#14B8A6]" /></div>
                    : <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><Lock size={18} className="text-[#94A3B8]" /></div>}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{shared ? '가족과 함께 보는 항목' : '나만 보는 항목'}</p>
                    <p className="text-xs text-[#64748B] mt-0.5 truncate">
                      {createdBy ? `${createdBy} 등록` : ''}{shared ? ' · 가족 모두에게 보여요' : ' · 나만 볼 수 있어요'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleShare}
                  disabled={togglingShare}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${shared ? 'bg-gray-100 text-[#475569] hover:bg-gray-200' : 'bg-[#14B8A6] text-white hover:bg-[#0D9488]'}`}
                >
                  {togglingShare ? '...' : shared ? '나만 보기로' : '가족과 공유'}
                </button>
              </div>
            </div>
          )}

          <div className="-mx-6">
            <AdBanner variant="mid" text="소방 점검 전문 업체 안심119" subtext="우리 집 안전 점검 무료 상담 받아보세요" icon="shield" />
          </div>
          <div className="-mx-6">
            <AdBanner variant="bottom" text="가전 AS 전문 서비스 홈케어" subtext="당일 방문 수리, 합리적인 요금" icon="zap" />
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

      {showSuccessModal && (() => {
        const cfg: Record<string, { Icon: typeof CheckCircle; grad: string; desc: string; deact: boolean }> = {
          completed: { Icon: CheckCircle, grad: 'from-emerald-400 to-emerald-600', desc: '완료·폐기함으로 옮겼어요', deact: true },
          replaced: { Icon: RefreshCw, grad: 'from-teal-400 to-teal-600', desc: '기존 항목은 완료·폐기함으로 옮겼어요', deact: true },
          disposed: { Icon: Trash2, grad: 'from-rose-400 to-rose-600', desc: '완료·폐기함으로 옮겼어요', deact: true },
          kept: { Icon: Archive, grad: 'from-slate-400 to-slate-500', desc: '다음에 다시 확인할게요', deact: false },
        }
        const c = cfg[actionType] || cfg.completed
        return (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-6">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
              <div className={`w-16 h-16 bg-gradient-to-br ${c.grad} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <c.Icon size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">{actionLabel}</h3>
              <p className="text-sm text-[#64748B]">{c.desc}</p>
              {c.deact && (
                <button
                  onClick={handleUndo}
                  className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F1F5F9] text-[#1A1A1A] rounded-xl text-sm font-semibold hover:bg-[#E2E8F0] transition-colors"
                >
                  <RotateCcw size={16} />
                  되돌리기
                </button>
              )}
            </div>
          </div>
        )
      })()}

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">항목 삭제</h3>
            <p className="text-sm text-[#64748B] mb-6">이 항목을 삭제하시겠습니까? 삭제한 항목은 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#475569]"
              >
                취소
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); handleDelete() }}
                disabled={loading}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {actionError && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-6" onClick={() => setActionError('')}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">처리하지 못했어요</h3>
            <p className="text-sm text-[#64748B] mb-5">{actionError}</p>
            <button onClick={() => setActionError('')} className="w-full py-3 bg-[#14B8A6] text-white rounded-xl text-sm font-semibold">확인</button>
          </div>
        </div>
      )}
    </div>
  )
}
