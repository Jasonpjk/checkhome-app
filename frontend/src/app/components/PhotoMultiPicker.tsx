import { Camera, Image, X, Loader2 } from 'lucide-react'

interface PhotoMultiPickerProps {
  photos: string[]
  onAdd: (file: File) => void
  onRemove: (index: number) => void
  max?: number
  dark?: boolean       // 어두운 배경(그라데이션 카드) 위에서 쓸 때
  busy?: boolean       // 압축/저장 중
  hint?: string
}

// 모든 화면 공용 사진 선택기: 카메라 촬영 / 갤러리 선택 둘 다 + 여러 장 추가
export function PhotoMultiPicker({ photos, onAdd, onRemove, max = 8, dark, busy, hint }: PhotoMultiPickerProps) {
  const btnClass = dark
    ? 'bg-white/20 hover:bg-white/30 text-white'
    : 'bg-white border-2 border-dashed border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-teal-50 text-[#64748B]'
  const iconClass = dark ? 'text-white' : 'text-[#94A3B8]'

  return (
    <div>
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {photos.map((p, i) => (
            <div key={i} className="relative w-16 h-16">
              <img src={p} className={`w-16 h-16 object-cover rounded-lg border ${dark ? 'border-white/40' : 'border-[#E2E8F0]'}`} alt={`사진 ${i + 1}`} />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow p-0.5 border border-[#E2E8F0]"
              >
                <X size={12} className="text-[#475569]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < max && (
        <div className="grid grid-cols-2 gap-2">
          <label className={`flex items-center justify-center gap-2 rounded-xl py-3 cursor-pointer transition-colors ${btnClass} ${busy ? 'opacity-60 pointer-events-none' : ''}`}>
            <input type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onAdd(f) }} />
            <Camera size={18} className={iconClass} />
            <span className="text-sm font-semibold">{photos.length === 0 ? '카메라 촬영' : '촬영 추가'}</span>
          </label>
          <label className={`flex items-center justify-center gap-2 rounded-xl py-3 cursor-pointer transition-colors ${btnClass} ${busy ? 'opacity-60 pointer-events-none' : ''}`}>
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onAdd(f) }} />
            <Image size={18} className={iconClass} />
            <span className="text-sm font-semibold">{photos.length === 0 ? '갤러리 선택' : '갤러리 추가'}</span>
          </label>
        </div>
      )}

      {busy && (
        <div className={`flex items-center gap-2 mt-2 text-xs ${dark ? 'text-white/80' : 'text-[#64748B]'}`}>
          <Loader2 size={14} className="animate-spin" />처리 중...
        </div>
      )}
      {hint && photos.length > 0 && photos.length < max && !busy && (
        <p className={`text-xs mt-1.5 ${dark ? 'text-white/70' : 'text-[#94A3B8]'}`}>{hint}</p>
      )}
    </div>
  )
}
