import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

const slides = [
  {
    title: '식품부터 약품, 샴푸, 세제까지\n집 안 사용기한을\n한 번에 관리하세요',
    description: '우리 집 모든 사용기한을\n한곳에서 체계적으로 관리하세요',
    icon: '🏠',
  },
  {
    title: '차량 점검과\n필터 교체도 놓치지 않게',
    description: '가족이 함께\n확인할 수 있어요',
    icon: '🚗',
  },
  {
    title: '만료일, 개봉일, 점검일을\n미리 알려드려',
    description: '낭비와 위험을\n줄여드려요',
    icon: '🔔',
  },
]

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center">
      <div
        className="w-full max-w-md bg-gradient-to-b from-[#ECFDF5] to-white flex flex-col shadow-2xl"
        style={{ height: '100dvh' }}
      >
        <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto min-h-0 py-6">
          <div className="text-5xl mb-5">{slides[currentSlide].icon}</div>
          <h1 className="text-2xl font-semibold text-center text-[#1A1A1A] mb-3 whitespace-pre-line leading-snug">
            {slides[currentSlide].title}
          </h1>
          <p className="text-sm text-center text-[#475569] whitespace-pre-line leading-relaxed">
            {slides[currentSlide].description}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-5">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-[#1A1A1A]' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="px-6 pb-safe space-y-2" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
          <button
            onClick={handleNext}
            className="w-full bg-[#1A1A1A] text-white py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#14B8A6] transition-colors"
          >
            {currentSlide === slides.length - 1 ? '시작하기' : '다음'}
            <ChevronRight size={20} />
          </button>
          {currentSlide < slides.length - 1 && (
            <button onClick={onComplete} className="w-full text-[#94A3B8] py-2.5">
              건너뛰기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
