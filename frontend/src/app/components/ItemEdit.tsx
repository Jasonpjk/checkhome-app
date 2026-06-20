import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, CheckCircle, X, Camera, Loader2 } from 'lucide-react'
import { Item, updateItem, fetchItem } from '../../api/items'
import { fileToCompressedDataUrl } from '../utils/image'

interface ItemEditProps {
  item: Item
  onBack: () => void
  onSaved: (updated: Item) => void
}

export function ItemEdit({ item, onBack, onSaved }: ItemEditProps) {
  const [productName, setProductName] = useState(item.name)
  const [expiryDate, setExpiryDate] = useState(item.expiry_date || '')
  const [openDate, setOpenDate] = useState(item.open_date || '')
  const [paoDays, setPaoDays] = useState(item.pao_days?.toString() || '')
  const [location, setLocation] = useState(item.location || '')
  const [quantity, setQuantity] = useState(item.quantity.toString())
  const [handlerName, setHandlerName] = useState(item.handler_name || '')
  const [memo, setMemo] = useState(item.memo || '')
  const [photoPreview, setPhotoPreview] = useState<string | null>(item.photo_url)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savingPhoto, setSavingPhoto] = useState(false)
  // 사용자가 사진을 변경/삭제했을 때만 photo_url을 전송 (미변경 시 기존 사진 보존)
  const photoDirtyRef = useRef(false)

  // 목록 응답에는 사진이 빠져 있으므로, 수정 화면에서 기존 사진을 따로 불러온다.
  useEffect(() => {
    let active = true
    fetchItem(item.id)
      .then((full) => {
        if (active && !photoDirtyRef.current && full.photo_url) setPhotoPreview(full.photo_url)
      })
      .catch(() => {})
    return () => { active = false }
  }, [item.id])

  const handlePhotoPick = async (file?: File) => {
    if (!file) return
    setSavingPhoto(true)
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      if (dataUrl.length > 7_000_000) return
      photoDirtyRef.current = true
      setPhotoPreview(dataUrl)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingPhoto(false)
    }
  }

  const handlePhotoRemove = () => {
    photoDirtyRef.current = true
    setPhotoPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const updated = await updateItem(item.id, {
        name: productName,
        location: location || undefined,
        expiry_date: expiryDate || undefined,
        open_date: openDate || undefined,
        pao_days: paoDays ? parseInt(paoDays) : undefined,
        quantity: parseInt(quantity) || 1,
        handler_name: handlerName || undefined,
        memo: memo || undefined,
        ...(photoDirtyRef.current ? { photo_url: photoPreview } : {}),
      })
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        onSaved(updated)
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.detail || '저장 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#F8F9FA]">
      <div className="bg-white px-6 pt-10 pb-6 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#64748B] text-sm mb-6 hover:text-[#14B8A6] transition-colors"
        >
          <ChevronLeft size={18} />
          취소
        </button>
        <h1 className="text-3xl font-bold text-[#1A1A1A]">항목 수정</h1>
        <p className="text-sm text-[#64748B] mt-1">{item.category} · {item.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
            제품명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#14B8A6]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">유통기한 / 사용기한</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">개봉일</label>
          <input
            type="date"
            value={openDate}
            onChange={(e) => setOpenDate(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">개봉 후 사용 기한 (일)</label>
          <input
            type="number"
            value={paoDays}
            onChange={(e) => setPaoDays(e.target.value)}
            placeholder="예: 30"
            min="1"
            className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
          <p className="text-xs text-[#94A3B8] mt-1">개봉일 입력 시, 개봉일 + 이 일수로 만료일을 계산합니다</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">보관 위치</label>
            <input
              type="text"
              placeholder="냉장고"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#14B8A6]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">수량</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#14B8A6]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">사진</label>
          {photoPreview ? (
            <div className="relative aspect-video bg-[#F8FAFC] rounded-xl overflow-hidden">
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handlePhotoRemove}
                className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow-md"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label className="w-full aspect-video bg-white border-2 border-dashed border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center hover:border-[#14B8A6] hover:bg-teal-50 transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={savingPhoto}
                onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; handlePhotoPick(f) }}
              />
              {savingPhoto ? (
                <Loader2 size={32} className="text-[#14B8A6] mb-2 animate-spin" />
              ) : (
                <Camera size={32} className="text-[#94A3B8] mb-2" />
              )}
              <p className="text-sm text-[#64748B] font-medium">{savingPhoto ? '처리 중...' : '사진 선택'}</p>
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">담당자</label>
          <input
            type="text"
            placeholder="예: 엄마, 아빠, 공동"
            value={handlerName}
            onChange={(e) => setHandlerName(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">메모</label>
          <textarea
            placeholder="추가 정보를 입력하세요"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#14B8A6] resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? '저장 중...' : '수정 완료'}
        </button>
      </form>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">수정 완료!</h3>
            <p className="text-sm text-[#64748B]">항목이 성공적으로 수정되었습니다</p>
          </div>
        </div>
      )}
    </div>
  )
}
