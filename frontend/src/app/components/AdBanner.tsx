import { useEffect, useRef, useState } from 'react'
import { Package, Star, Shield, Zap, ChevronRight, X } from 'lucide-react'

const ICONS = { package: Package, star: Star, shield: Shield, zap: Zap }

// Google AdSense 광고 단위 (VITE_ADSENSE_CLIENT 환경변수가 있으면 실제 광고, 없으면 하우스 광고)
const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined

// 광고 단위 슬롯 ID — adSlot prop을 전달하지 않으면 variant별 기본값 사용
const DEFAULT_AD_SLOTS: Record<string, string> = {
  mid: '5913692294',    // 체크홈 중간 배너
  bottom: '7243241361', // 체크홈 하단 배너
}

interface AdBannerProps {
  variant: 'mid' | 'bottom'
  text: string
  subtext: string
  icon?: 'package' | 'star' | 'shield' | 'zap'
  adSlot?: string  // Google AdSense 광고 단위 ID
  onClick?: () => void
}

function AdsenseUnit({ adSlot, variant }: { adSlot: string; variant: 'mid' | 'bottom' }) {
  const ref = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      ;(window as any).adsbygoogle.push({})
    } catch {}
  }, [])

  return (
    <div className={variant === 'mid' ? 'mx-6' : 'mx-6'}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '60px' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

export function AdBanner({ variant, text, subtext, icon = 'package', adSlot, onClick }: AdBannerProps) {
  const [closed, setClosed] = useState(false)
  if (closed) return null

  // AdSense가 설정되어 있으면 실제 광고 표시 (adSlot 미전달 시 variant별 기본값 사용)
  const slot = adSlot ?? DEFAULT_AD_SLOTS[variant]
  if (ADSENSE_CLIENT && slot) {
    return <AdsenseUnit adSlot={slot} variant={variant} />
  }

  const Icon = ICONS[icon]

  if (variant === 'mid') {
    return (
      <div className="relative mx-6 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] p-4 shadow-md">
        <span className="absolute top-2 left-3 text-[9px] text-white/60">광고</span>
        <button onClick={() => setClosed(true)} className="absolute top-1.5 right-2 text-white/60 hover:text-white">
          <X size={12} />
        </button>
        <button onClick={onClick} className="flex items-center gap-3 pt-3 w-full text-left">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">{text}</p>
            <p className="text-xs text-white/80 mt-0.5">{subtext}</p>
          </div>
          <ChevronRight size={16} className="text-white/80 flex-shrink-0" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative mx-6 rounded-xl bg-gradient-to-r from-[#F0FDFA] to-white border border-[#E2E8F0] shadow-sm p-4">
      <span className="absolute top-2 left-3 text-[9px] text-[#94A3B8]">광고</span>
      <button onClick={() => setClosed(true)} className="absolute top-1.5 right-2 text-[#CBD5E1] hover:text-[#94A3B8]">
        <X size={12} />
      </button>
      <button onClick={onClick} className="flex items-center gap-3 pt-3 w-full text-left">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100">
          <Icon size={20} className="text-[#14B8A6]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">{text}</p>
          <p className="text-xs text-[#64748B] mt-0.5">{subtext}</p>
        </div>
        <ChevronRight size={16} className="text-[#14B8A6] flex-shrink-0" />
      </button>
    </div>
  )
}
