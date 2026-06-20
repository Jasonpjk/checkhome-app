import { useState } from 'react'
import { Package, Star, Shield, Zap, ChevronRight, X } from 'lucide-react'

const ICONS = { package: Package, star: Star, shield: Shield, zap: Zap }

interface AdBannerProps {
  variant: 'mid' | 'bottom'
  text: string
  subtext: string
  icon?: 'package' | 'star' | 'shield' | 'zap'
}

export function AdBanner({ variant, text, subtext, icon = 'package' }: AdBannerProps) {
  const [closed, setClosed] = useState(false)
  if (closed) return null
  const Icon = ICONS[icon]

  if (variant === 'mid') {
    return (
      <div className="relative mx-6 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] p-4 shadow-md">
        <span className="absolute top-2 left-3 text-[9px] text-white/60">광고</span>
        <button onClick={() => setClosed(true)} className="absolute top-1.5 right-2 text-white/60 hover:text-white">
          <X size={12} />
        </button>
        <div className="flex items-center gap-3 pt-3">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">{text}</p>
            <p className="text-xs text-white/80 mt-0.5">{subtext}</p>
          </div>
          <ChevronRight size={16} className="text-white/80 flex-shrink-0" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative mx-6 rounded-xl bg-gradient-to-r from-[#F0FDFA] to-white border border-[#E2E8F0] shadow-sm p-4">
      <span className="absolute top-2 left-3 text-[9px] text-[#94A3B8]">광고</span>
      <button onClick={() => setClosed(true)} className="absolute top-1.5 right-2 text-[#CBD5E1] hover:text-[#94A3B8]">
        <X size={12} />
      </button>
      <div className="flex items-center gap-3 pt-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100">
          <Icon size={20} className="text-[#14B8A6]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">{text}</p>
          <p className="text-xs text-[#64748B] mt-0.5">{subtext}</p>
        </div>
        <ChevronRight size={16} className="text-[#14B8A6] flex-shrink-0" />
      </div>
    </div>
  )
}
