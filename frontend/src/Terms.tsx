import { Package, ArrowLeft } from 'lucide-react'

export function Terms() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <a href="/" className="flex items-center gap-1.5 text-[#475569] hover:text-[#14B8A6] transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">홈으로</span>
          </a>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-lg flex items-center justify-center">
              <Package size={15} className="text-white" />
            </div>
            <span className="font-bold text-[#1A1A1A]">체크홈</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">이용약관</h1>
        <p className="text-sm text-[#94A3B8] mb-10">최종 업데이트: 2026년 1월 1일</p>

        <div className="space-y-10 text-[#475569] text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">제1조 (목적)</h2>
            <p>이 약관은 체크홈(이하 "서비스")이 제공하는 유통기한 관리 서비스의 이용에 관한 조건과 절차, 이용자와 서비스 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">제2조 (정의)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-[#1A1A1A]">"서비스"</strong>: 체크홈이 제공하는 유통기한 관리, AI 사진 인식, 가족 공유, 차량 점검 관리 등의 기능</li>
              <li><strong className="text-[#1A1A1A]">"이용자"</strong>: 이 약관에 동의하고 서비스를 이용하는 자</li>
              <li><strong className="text-[#1A1A1A]">"콘텐츠"</strong>: 이용자가 서비스 내에 등록하는 제품 정보, 사진, 메모 등</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">제3조 (약관의 게시 및 변경)</h2>
            <p>① 이 약관은 서비스 화면에 게시하거나 앱 내 공지를 통해 이용자에게 공지합니다.</p>
            <p className="mt-2">② 서비스는 합리적인 사유가 있는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 적용일 7일 전에 공지합니다. 이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">제4조 (회원가입)</h2>
            <p>① 이용자는 이메일 또는 소셜 계정(Google, Kakao)으로 회원가입할 수 있습니다.</p>
            <p className="mt-2">② 이용자는 가입 시 실제 정보를 입력해야 하며, 허위 정보 입력으로 인한 불이익은 이용자 본인이 부담합니다.</p>
            <p className="mt-2">③ 만 14세 미만은 법정대리인의 동의 없이 가입할 수 없습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">제5조 (서비스 이용)</h2>
            <p>① 서비스는 연중무휴, 24시간 제공을 원칙으로 합니다. 단, 시스템 점검·장애·기타 사유로 일시 중단될 수 있습니다.</p>
            <p className="mt-2">② 무료 플랜과 유료 플랜(프리미엄)의 기능 차이는 앱 내 구독 페이지에서 확인할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">제6조 (유료 서비스 및 결제)</h2>
            <p>① 유료 서비스 이용 시 결제 금액, 결제 방법, 결제 시기 등은 앱 내에서 안내합니다.</p>
            <p className="mt-2">② 정기 구독은 이용자가 직접 해지하기 전까지 매월 자동 결제됩니다.</p>
            <p className="mt-2">③ 해지는 앱 내 설정 → 구독 관리에서 언제든지 가능하며, 해지 후 현재 결제 기간 만료 시까지 이용 가능합니다.</p>
            <p className="mt-2">④ 환불은 소비자보호법 및 관련 법령에 따릅니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">제7조 (이용자의 의무)</h2>
            <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>타인의 계정을 도용하거나 다른 이용자를 사칭하는 행위</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>서비스를 통해 얻은 정보를 무단으로 복제·배포·판매하는 행위</li>
              <li>관계 법령을 위반하거나 타인의 권리를 침해하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">제8조 (콘텐츠의 소유권)</h2>
            <p>이용자가 서비스 내에 등록한 콘텐츠(제품 정보, 사진 등)의 소유권은 이용자에게 있습니다. 서비스는 이용자 콘텐츠를 서비스 제공 목적으로만 이용하며, 제3자에게 제공하지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">제9조 (책임의 제한)</h2>
            <p>① 서비스는 AI 사진 인식 결과의 정확성을 보장하지 않습니다. 유통기한 등 중요 정보는 직접 확인하시기 바랍니다.</p>
            <p className="mt-2">② 천재지변, 서버 장애 등 불가항력으로 인한 서비스 중단에 대해 책임지지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">제10조 (회원 탈퇴)</h2>
            <p>이용자는 앱 내 설정에서 언제든지 회원 탈퇴를 요청할 수 있습니다. 탈퇴 즉시 개인정보 및 등록 데이터가 삭제되며 복구가 불가능합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">제11조 (준거법 및 분쟁 해결)</h2>
            <p>이 약관은 대한민국 법률에 따라 해석됩니다. 서비스와 이용자 간 분쟁은 대한민국 법원을 관할 법원으로 합니다.</p>
          </section>

          <section className="bg-[#F8FAFC] rounded-xl p-5 border border-[#E2E8F0]">
            <p className="font-semibold text-[#1A1A1A] mb-2">문의처</p>
            <p>이메일: <a href="mailto:business10082@gmail.com" className="text-[#14B8A6] underline">business10082@gmail.com</a></p>
          </section>
        </div>
      </main>

      <footer className="bg-[#1A1A1A] py-8 px-6 text-center mt-12">
        <p className="text-xs text-gray-500">© 2026 체크홈. All rights reserved.</p>
      </footer>
    </div>
  )
}
