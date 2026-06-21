import { useState, useEffect } from 'react'
import { Camera, ChevronLeft, CheckCircle, X, Sparkles, Loader2, Image, Users, Lock } from 'lucide-react'
import { createItem, analyzePhoto } from '../../api/items'
import { getCategoryTemplates, categoryIdMap } from '../data/categoryTemplates'
import { AdBanner } from './AdBanner'
import { fileToCompressedDataUrl } from '../utils/image'
import { useAuthStore } from '../../store/authStore'
import { getMyFamily } from '../../api/families'

const categories = [
  { id: 'food', name: '식품', icon: '🍎' },
  { id: 'medicine', name: '약품', icon: '💊' },
  { id: 'bathroom', name: '욕실/화장품', icon: '🧴' },
  { id: 'cleaning', name: '세제/청소', icon: '🧹' },
  { id: 'filter', name: '필터/가전', icon: '🔌' },
  { id: 'vehicle', name: '차량', icon: '🚗' },
  { id: 'baby', name: '육아용품', icon: '🍼' },
  { id: 'pets', name: '반려동물', icon: '🐾' },
  { id: 'emergency', name: '비상용품', icon: '🚨' },
  { id: 'documents', name: '문서/보증서', icon: '📄' },
  { id: 'camping', name: '캠핑용품', icon: '⛺' },
  { id: 'garden', name: '정원용품', icon: '🌿' },
]

interface RegisterProps {
  onRegistered?: () => void
}

// AI가 준 날짜를 YYYY-MM-DD로 정규화 (2026-3-5, 2026.03.05, 2026/3/5 등 허용)
function normalizeDate(raw: string): string | null {
  const m = raw?.trim().match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/)
  if (!m) return null
  const [, y, mo, d] = m
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
}

export function Register({ onRegistered }: RegisterProps) {
  const { user } = useAuthStore()
  const [step, setStep] = useState<'category' | 'form'>('category')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [productName, setProductName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [openDate, setOpenDate] = useState('')
  const [paoDays, setPaoDays] = useState('')
  const [location, setLocation] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [handlerName, setHandlerName] = useState(user?.name || '')
  const [memo, setMemo] = useState('')
  // 제품 사진 여러 장 (포장 형태에 따라 1장~여러 장). 첫 장이 대표 사진으로 저장됨.
  const [photos, setPhotos] = useState<string[]>([])
  const MAX_PHOTOS = 5
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [aiNote, setAiNote] = useState('')
  const [aiNoteWarn, setAiNoteWarn] = useState(false)
  // 가족에 속해 있으면 '가족과 함께 보기' 토글 노출 (기본 ON = 같이 챙기기)
  const [hasFamily, setHasFamily] = useState(false)
  const [shareWithFamily, setShareWithFamily] = useState(true)

  useEffect(() => {
    getMyFamily().then(() => setHasFamily(true)).catch(() => setHasFamily(false))
  }, [])

  const runAnalysis = async (photoList: string[], jumpToForm: boolean) => {
    if (photoList.length === 0) return
    setAnalyzing(true)
    setAnalyzeError('')
    setAiNote('')
    setAiNoteWarn(false)
    try {
      const result = await analyzePhoto(photoList)
      if (result.name) setProductName(result.name)
      const nd = normalizeDate(result.expiry_date)
      if (nd) setExpiryDate(nd)
      if (result.memo) setMemo(result.memo)

      let jumped = false
      if (jumpToForm) {
        const cat = categories.find((c) => c.name === result.category)
        if (cat) {
          // 카테고리를 정확히 인식했을 때만 폼으로 이동
          setSelectedCategory(cat.id)
          setStep('form')
          jumped = true
        }
        // 인식 실패 시: 카테고리 화면에 남아 사용자가 직접 선택 (이름·기한·메모는 미리 채워둠)
      }

      // AI 결과 신뢰도에 따라 정직한 안내 메시지 (돈 낸 고객이 잘못된 값에 속지 않게)
      const gotSomething = !!(result.name || nd || result.memo)
      if (!gotSomething) {
        setAiNote('사진에서 정보를 거의 못 읽었어요. 더 밝게/가까이 찍거나 직접 입력해주세요.')
        setAiNoteWarn(true)
      } else if (result.confidence === 'low') {
        setAiNote('사진이 흐릿해 일부만 읽었을 수 있어요. 제품명·유통기한을 꼭 확인하고 수정해주세요.')
        setAiNoteWarn(true)
      } else if (jumpToForm && !jumped) {
        setAiNote('정보를 읽었어요. 카테고리를 직접 선택하면 자동으로 채워져요.')
        setAiNoteWarn(false)
      } else if (!nd) {
        setAiNote('제품명은 읽었어요. 유통기한은 안 보여서 비어 있으니 직접 입력해주세요.')
        setAiNoteWarn(false)
      } else {
        setAiNote('AI가 자동으로 입력했어요. 확인 후 수정하세요.')
        setAiNoteWarn(false)
      }
    } catch (err: any) {
      setAnalyzeError(err?.response?.data?.detail || 'AI 분석에 실패했습니다. 직접 입력해주세요.')
    } finally {
      setAnalyzing(false)
    }
  }

  // 사진 추가(첫 장이든 추가 장이든 동일). 추가 후 전체 사진으로 다시 분석.
  const addPhoto = async (file: File | undefined, jumpToForm: boolean) => {
    if (!file) return
    if (photos.length >= MAX_PHOTOS) {
      setAnalyzeError(`사진은 최대 ${MAX_PHOTOS}장까지 추가할 수 있어요.`)
      return
    }
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      if (dataUrl.length > 7_000_000) {
        setAnalyzeError('이 사진은 처리할 수 없습니다. 다른 사진으로 다시 시도해주세요.')
        return
      }
      const next = [...photos, dataUrl]
      setPhotos(next)
      await runAnalysis(next, jumpToForm)
    } catch {
      setAnalyzeError('사진을 불러오지 못했습니다')
    }
  }

  const removePhoto = (index: number) => {
    const next = photos.filter((_, i) => i !== index)
    setPhotos(next)
    if (next.length === 0) {
      setAiNote('')
      setAiNoteWarn(false)
    }
  }

  // 카메라/갤러리 버튼 + 추가한 사진 썸네일 그리드 (카테고리·폼 두 단계 공용)
  const PhotoPicker = ({ jumpToForm, dark }: { jumpToForm: boolean; dark?: boolean }) => (
    <div>
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {photos.map((p, i) => (
            <div key={i} className="relative w-16 h-16">
              <img src={p} className={`w-16 h-16 object-cover rounded-lg border ${dark ? 'border-white/40' : 'border-[#E2E8F0]'}`} alt={`사진 ${i + 1}`} />
              <button type="button" onClick={() => removePhoto(i)}
                className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow p-0.5 border border-[#E2E8F0]">
                <X size={12} className="text-[#475569]" />
              </button>
            </div>
          ))}
        </div>
      )}
      {photos.length < MAX_PHOTOS && (
        <div className="grid grid-cols-2 gap-2">
          <label className={`flex items-center justify-center gap-2 rounded-xl py-3 cursor-pointer transition-colors ${dark ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-white border-2 border-dashed border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-teal-50 text-[#64748B]'}`}>
            <input type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; addPhoto(f, jumpToForm) }} />
            <Camera size={18} className={dark ? 'text-white' : 'text-[#94A3B8]'} />
            <span className="text-sm font-semibold">{photos.length === 0 ? '카메라 촬영' : '촬영 추가'}</span>
          </label>
          <label className={`flex items-center justify-center gap-2 rounded-xl py-3 cursor-pointer transition-colors ${dark ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-white border-2 border-dashed border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-teal-50 text-[#64748B]'}`}>
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; addPhoto(f, jumpToForm) }} />
            <Image size={18} className={dark ? 'text-white' : 'text-[#94A3B8]'} />
            <span className="text-sm font-semibold">{photos.length === 0 ? '갤러리 선택' : '갤러리 추가'}</span>
          </label>
        </div>
      )}
      {photos.length > 0 && photos.length < MAX_PHOTOS && (
        <p className={`text-xs mt-1.5 ${dark ? 'text-white/70' : 'text-[#94A3B8]'}`}>
          제품명·유통기한이 다른 면에 있으면 사진을 더 추가하면 AI가 더 정확히 읽어요
        </p>
      )}
    </div>
  )

  const resetForm = () => {
    setStep('category')
    setSelectedCategory(null)
    setProductName('')
    setExpiryDate('')
    setOpenDate('')
    setPaoDays('')
    setLocation('')
    setQuantity('1')
    setHandlerName(user?.name || '')
    setMemo('')
    setPhotos([])
    setAiNote('')
    setAiNoteWarn(false)
    setAnalyzeError('')
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
        pao_days: paoDays ? parseInt(paoDays) : undefined,
        photo_url: photos[0] || undefined,
        quantity: parseInt(quantity) || 1,
        handler_name: handlerName || undefined,
        memo: memo || undefined,
        is_family_shared: hasFamily ? shareWithFamily : false,
      })
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        resetForm()
        onRegistered?.()
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.detail || '저장 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const analyzingOverlay = analyzing && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
        <Loader2 size={40} className="text-[#14B8A6] mx-auto mb-3 animate-spin" />
        <p className="font-bold text-lg text-[#1A1A1A]">AI가 분석 중...</p>
        <p className="text-sm text-[#64748B] mt-1">제품명·유통기한을 읽고 있어요</p>
      </div>
    </div>
  )

  if (step === 'category') {
    return (
      <div className="h-full overflow-y-auto pb-24 bg-[#F8F9FA]">
        <div className="px-6 pt-10 pb-6">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">항목 등록</h1>
          <p className="text-sm text-[#64748B]">사진으로 자동 등록하거나 카테고리를 선택하세요</p>
        </div>

        {/* AI 사진 자동 등록 */}
        <div className="px-6 mb-5">
          <div className={`rounded-2xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] shadow-md transition-opacity ${analyzing ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3 px-5 pt-5 pb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold">AI 사진 자동 등록</p>
                <p className="text-white/80 text-xs mt-0.5">제품을 촬영하면 이름·유통기한을 자동 입력해요</p>
              </div>
            </div>
            <div className="px-4 pb-4">
              <PhotoPicker jumpToForm dark />
            </div>
          </div>
          {analyzeError && <p className="text-rose-500 text-xs mt-2 px-1">{analyzeError}</p>}
          {aiNote && !analyzing && (
            <p className={`text-xs mt-2 px-1 flex items-center gap-1 ${aiNoteWarn ? 'text-amber-600' : 'text-[#14B8A6]'}`}>
              <Sparkles size={12} className="flex-shrink-0" />
              {aiNote}
            </p>
          )}
        </div>

        <div className="px-6 flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-xs text-[#94A3B8]">또는 직접 선택</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        <div className="px-6 grid grid-cols-2 gap-3">
          {categories.slice(0, 6).map((cat) => (
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

        <div className="mt-4">
          <AdBanner variant="mid" text="체크홈 프리미엄으로 업그레이드" subtext="12개 카테고리 무제한 관리" icon="star" />
        </div>

        <div className="px-6 grid grid-cols-2 gap-3 mt-4">
          {categories.slice(6).map((cat) => (
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

        <div className="mt-4 pb-4">
          <AdBanner variant="bottom" text="냉장고 정수기 렌탈 1위 코웨이" subtext="월 2만원대 홈케어 서비스 신청하기" icon="zap" />
        </div>

        {analyzingOverlay}
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
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">사진 첨부</label>
          <PhotoPicker jumpToForm={false} />
          {photos.length > 0 && !analyzing && (
            <button
              type="button"
              onClick={() => runAnalysis(photos, false)}
              className="mt-3 flex items-center gap-1.5 px-3 py-2 bg-teal-50 text-[#14B8A6] rounded-lg text-xs font-semibold hover:bg-teal-100 transition-colors"
            >
              <Sparkles size={14} />
              AI로 다시 분석
            </button>
          )}
          {aiNote && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${aiNoteWarn ? 'text-amber-600' : 'text-[#14B8A6]'}`}>
              <Sparkles size={12} className="flex-shrink-0" />
              {aiNote}
            </p>
          )}
          {analyzeError && <p className="text-rose-500 text-xs mt-2">{analyzeError}</p>}
        </div>

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
          <p className="text-xs text-[#94A3B8] mt-1">개봉일이 있을 때, 개봉일 + 이 일수로 만료일을 계산합니다</p>
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

        {hasFamily && (
          <div className={`flex items-center justify-between rounded-xl px-4 py-3.5 border transition-colors ${shareWithFamily ? 'bg-teal-50 border-teal-200' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
            <div className="flex items-center gap-3">
              {shareWithFamily
                ? <Users size={20} className="text-[#14B8A6] flex-shrink-0" />
                : <Lock size={20} className="text-[#94A3B8] flex-shrink-0" />}
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  {shareWithFamily ? '가족과 함께 보기' : '나만 보기'}
                </p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {shareWithFamily ? '가족 모두가 이 항목을 보고 같이 챙겨요' : '이 항목은 나만 볼 수 있어요'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShareWithFamily((v) => !v)}
              className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${shareWithFamily ? 'bg-[#14B8A6]' : 'bg-gray-300'}`}
              aria-label="가족 공유 토글"
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${shareWithFamily ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        )}

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

      {analyzingOverlay}

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
