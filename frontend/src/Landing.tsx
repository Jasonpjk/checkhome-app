import { ChevronRight, Camera, Bell, Users, Car, ShieldCheck, Star, Package, Clock } from 'lucide-react'

const FEATURES = [
  {
    icon: Camera,
    title: 'AI 사진 자동 인식',
    desc: '제품을 촬영하면 AI가 제품명과 유통기한을 자동으로 읽어줍니다. 라면, 우유, 약품 등 다양한 제품 지원.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: Bell,
    title: '유통기한 만료 알림',
    desc: '등록한 모든 제품의 유통기한을 한눈에 확인하고, 만료 전 미리 알림을 받아 낭비를 줄이세요.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Users,
    title: '가족 공유',
    desc: '가족 그룹을 만들어 냉장고, 약장, 세면대의 제품 정보를 함께 관리하세요. 중복 구매가 사라집니다.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Car,
    title: '차량 점검 관리',
    desc: '엔진오일, 타이어, 에어필터 등 13가지 차량 점검 항목을 자동으로 추적하고 교체 시기를 알려줍니다.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Package,
    title: '12가지 카테고리',
    desc: '식품·약품·욕실·세제·필터·차량·육아·반려동물·비상용품·문서·캠핑·정원까지 집 안의 모든 것을 관리.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: ShieldCheck,
    title: '안전한 보관',
    desc: '암호화된 서버에 안전하게 저장됩니다. 가족 간 공유 항목은 직접 설정한 것만 공개됩니다.',
    color: 'bg-rose-50 text-rose-600',
  },
]

const STEPS = [
  { step: '01', title: '제품 촬영', desc: '스마트폰 카메라로 제품 라벨을 찍으세요. AI가 제품명과 유통기한을 자동으로 읽습니다.' },
  { step: '02', title: '자동 등록', desc: '인식된 정보를 확인하고 카테고리, 보관 위치를 선택하면 등록 완료. 10초도 걸리지 않습니다.' },
  { step: '03', title: '스마트 알림', desc: '유통기한이 다가오면 알림을 보내줍니다. 가족과 공유 설정 시 모두에게 알림이 전달됩니다.' },
]

const CATEGORIES = ['식품', '약품', '욕실/화장품', '세제/청소', '필터/가전', '차량', '육아용품', '반려동물', '비상용품', '문서/보증서', '캠핑용품', '정원용품']

export function Landing() {
  const goToApp = () => { window.location.href = '/app' }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-lg flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-[#1A1A1A]">체크홈</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#475569]">
            <a href="#features" className="hover:text-[#14B8A6] transition-colors">기능</a>
            <a href="#how" className="hover:text-[#14B8A6] transition-colors">사용법</a>
            <a href="#categories" className="hover:text-[#14B8A6] transition-colors">카테고리</a>
          </nav>
          <button
            onClick={goToApp}
            className="bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm"
          >
            무료로 시작하기
          </button>
        </div>
      </header>

      {/* 히어로 */}
      <section className="bg-gradient-to-br from-[#F0FDFA] via-white to-[#F0FDFA] pt-20 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 text-sm text-teal-700 font-medium mb-8">
            <Star size={14} className="fill-teal-500 text-teal-500" />
            AI 기반 유통기한 자동 인식
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1A1A1A] leading-tight mb-6">
            우리 집 유통기한을<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14B8A6] to-[#0D9488]">
              AI가 알아서 관리
            </span>
          </h1>
          <p className="text-lg text-[#475569] leading-relaxed mb-10 max-w-2xl mx-auto">
            냉장고 안 유통기한 걱정, 이제 그만. 제품을 찍으면 AI가 자동으로 읽고, 가족과 함께 관리합니다.
            식품·약품·화장품·차량까지 집 안의 모든 것을 체크홈 하나로.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={goToApp}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold px-8 py-4 rounded-2xl shadow-lg text-base"
            >
              무료로 시작하기
              <ChevronRight size={20} />
            </button>
            <a
              href="#features"
              className="flex items-center justify-center gap-2 bg-white border border-[#E2E8F0] text-[#1A1A1A] font-semibold px-8 py-4 rounded-2xl text-base"
            >
              기능 살펴보기
            </a>
          </div>
          <p className="text-sm text-[#94A3B8] mt-4">회원가입 무료 · 신용카드 불필요</p>
        </div>
      </section>

      {/* 통계 */}
      <section className="bg-[#1A1A1A] py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { num: '12+', label: '관리 카테고리' },
            { num: '13', label: '차량 점검 항목' },
            { num: '무제한', label: '가족 공유' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-white mb-1">{s.num}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 기능 */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">똑똑한 집 관리의 모든 것</h2>
            <p className="text-[#475569]">집 안의 제품 관리에 필요한 기능을 하나의 앱에 담았습니다</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="bg-[#F8FAFC] rounded-2xl p-6 border border-[#E2E8F0]">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-[#1A1A1A] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#475569] leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 사용 방법 */}
      <section id="how" className="py-24 px-6 bg-gradient-to-br from-[#F0FDFA] to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">3단계로 시작하세요</h2>
            <p className="text-[#475569]">복잡한 설정 없이 바로 사용 가능합니다</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <span className="text-white font-extrabold text-lg">{s.step}</span>
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">{s.title}</h3>
                <p className="text-sm text-[#475569] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 카테고리 */}
      <section id="categories" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">집 안의 모든 카테고리</h2>
          <p className="text-[#475569] mb-12">12가지 카테고리로 집 안의 모든 소모품을 빠짐없이 관리하세요</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="px-4 py-2 bg-[#F0FDFA] border border-teal-200 rounded-full text-sm font-medium text-teal-700"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 유통기한 관리의 중요성 — 콘텐츠 섹션 (AdSense 정책용) */}
      <section className="py-20 px-6 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6 text-center">유통기한 관리가 왜 중요한가요?</h2>
          <div className="space-y-5 text-[#475569] text-sm leading-relaxed">
            <p>
              한국 소비자원에 따르면 가정에서 발생하는 식품 낭비의 상당 부분이 유통기한을 확인하지 못해 발생합니다.
              냉장고 안에 숨어있는 유통기한 지난 제품, 약장 속 오래된 약, 사용기한이 지난 화장품은
              건강에 위험을 줄 수 있고 불필요한 낭비로 이어집니다.
            </p>
            <p>
              체크홈은 이러한 문제를 해결하기 위해 설계되었습니다. 사진 한 장으로 유통기한을 등록하고,
              만료가 다가오면 알림을 받아 적시에 소비하거나 교체할 수 있습니다.
              가족 구성원 모두가 같은 정보를 공유하면 중복 구매나 미처 확인하지 못한 제품이 줄어듭니다.
            </p>
            <p>
              차량 관리 기능은 엔진오일, 타이어 교체, 에어필터, 와이퍼 등 주기적으로 점검해야 할 항목을
              자동으로 추적합니다. 차량 점검을 놓쳐 발생하는 수리비 절감에도 도움이 됩니다.
            </p>
            <p>
              의약품, 건강기능식품의 경우 유통기한이 지난 제품을 복용하면 효능이 저하되거나 부작용이
              발생할 수 있습니다. 체크홈으로 약장 속 모든 의약품의 유효기간을 한눈에 관리하세요.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#0D9488] to-[#14B8A6] text-center">
        <div className="max-w-2xl mx-auto">
          <Clock size={48} className="text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">지금 바로 시작하세요</h2>
          <p className="text-teal-50 mb-10">무료로 시작하고, 가족과 함께 스마트한 집 관리를 경험하세요</p>
          <button
            onClick={goToApp}
            className="bg-white text-[#0D9488] font-bold px-10 py-4 rounded-2xl text-base shadow-xl"
          >
            무료로 시작하기
          </button>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-[#1A1A1A] py-12 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-7 h-7 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-lg flex items-center justify-center">
              <Package size={15} className="text-white" />
            </div>
            <span className="text-white font-bold">체크홈</span>
          </div>
          <div className="flex justify-center gap-6 text-sm text-gray-400 mb-6">
            <a href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</a>
            <a href="/terms" className="hover:text-white transition-colors">이용약관</a>
            <a href="mailto:business10082@gmail.com" className="hover:text-white transition-colors">문의하기</a>
          </div>
          <p className="text-xs text-gray-600">© 2026 체크홈. All rights reserved.</p>
          <p className="text-xs text-gray-600 mt-1">본 서비스는 대한민국 개인정보보호법을 준수합니다.</p>
        </div>
      </footer>
    </div>
  )
}
