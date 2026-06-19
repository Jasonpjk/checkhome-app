import { useState } from 'react'
import { Camera, ChevronLeft, CheckCircle, X } from 'lucide-react'
import { createItem } from '../../api/items'
import { getCategoryTemplates, categoryIdMap } from '../data/categoryTemplates'

const categories = [
  { id: 'food', name: '식품', icon: '🍎' },
  { id: 'medicine', name: '약품', icon: '💊' },
  { id: 'bathroom', name: '욕실/화장품', icon: '🧴' },
  { id: 'cleaning', name: '세제/청소', icon: '🧹' },
  { id: 'filter', name: '필터/가전', icon: '🔌' },
  { id: 'vehicle', name: '차량', icon: '🚗' },
]

export function Register() {
  const [step, setStep] = useState<'category' | 'form'>('category')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [productName, setProductName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [openDate, setOpenDate] = useState('')
  const [location, setLocation] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [handlerName, setHandlerName] = useState('')
  const [memo, setMemo] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePhotoClick = () => {
    setPhotoPreview('https://via.placeholder.com/400x300?text=Sample+Photo')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory) return
    setLoading(true)
    setError('')
    try {
      await createItem({
        name: productName,
        category: categoryIdMap[selectedCategory],
        location: location || undefined,
        expiry_date: expiryDate || undefined,
        open_date: openDate || undefined,
        quantity: parseInt(quantity) || 1,
        handler_name: handlerName || undefined,
        memo: memo || undefined,
      })
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        setStep('category')
        setSelectedCategory(null)
        setProductName('')
        setExpiryDate('')
        setOpenDate('')
        setLocation('')
        setQuantity('1')
        setHandlerName('')
        setMemo('')
        setPhotoPreview(null)
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.detail || '저장 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'category') {
    return (
      <div className="h-full overflow-y-auto pb-24 bg-[#F8F9FA]">
        <div className="px-6 pt-10 pb-6">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">항목 등록</h1>
          <p className="text-sm text-[#64748B]">카테고리를 선택하세요</p>
        </div>
        <div className="px-6 grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setStep('form') }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-[#E2E8F0] hover:border-[#14B8A6] transition-all text-center"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <p className="font-semibold text-[#1A1A1A] text-sm">{cat.name}</p>
            </button>
          ))}
        </div>

        <div className="px-6 mt-6">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-3">곧 지원 예정</p>
          <div className="grid grid-cols-2 gap-3">
            {['육아용품', '반려동물', '비상용품', '문서/보증서', '캠핑용품', '정원용품'].map((cat) => (
              <div key={cat} className="bg-[#F1F5F9] rounded-2xl p-5 text-center opacity-60">
                <p className="font-medium text-[#94A3B8] text-sm">{cat}</p>
                <span className="text-xs text-[#CBD5E1]">준비중</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const selectedCategoryInfo = categories.find((c) => c.id === selectedCategory)

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#F8F9FA]">
      <div className="bg-white px-6 pt-10 pb-6 shadow-sm">
        <button
          onClick={() => setStep('category')}
          className="flex items-center gap-2 text-[#64748B] text-sm mb-6 hover:text-[#14B8A6] transition-colors"
        >
          <ChevronLeft size={18} />
          뒤로
        </button>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{selectedCategoryInfo?.icon}</span>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">{selectedCategoryInfo?.name}</h1>
        </div>
        <p className="text-sm text-[#64748B]">항목 정보를 입력하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
            제품명 <span className="text-red-500">*</span>
          </label>
          {selectedCategory && (
            <div className="mb-3 flex flex-wrap gap-2">
              {getCategoryTemplates(selectedCategory).slice(0, 6).map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => setProductName(template)}
                  className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>
          )}
          <input
            type="text"
            placeholder="예: 서울우유 900ml"
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
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">사진 첨부</label>
          {photoPreview ? (
            <div className="relative aspect-video bg-[#F8FAFC] rounded-xl overflow-hidden">
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow-md"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePhotoClick}
              className="w-full aspect-video bg-white border-2 border-dashed border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center hover:border-[#14B8A6] hover:bg-teal-50 transition-all"
            >
              <Camera size={32} className="text-[#94A3B8] mb-2" />
              <p className="text-sm text-[#64748B] font-medium">사진 선택</p>
            </button>
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
          {loading ? '저장 중...' : '저장하기'}
        </button>
      </form>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">등록 완료!</h3>
            <p className="text-sm text-[#64748B]">항목이 성공적으로 등록되었습니다</p>
          </div>
        </div>
      )}
    </div>
  )
}
