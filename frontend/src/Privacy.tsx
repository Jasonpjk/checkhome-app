import { Package, ArrowLeft } from 'lucide-react'

export function Privacy() {
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
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">개인정보처리방침</h1>
        <p className="text-sm text-[#94A3B8] mb-10">최종 업데이트: 2026년 1월 1일</p>

        <div className="space-y-10 text-[#475569] text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">1. 개인정보의 수집 및 이용 목적</h2>
            <p>체크홈("서비스")은 다음의 목적을 위해 개인정보를 수집·이용합니다.</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>회원 가입 및 본인 확인</li>
              <li>서비스 제공 및 운영 (제품 유통기한 관리, 가족 공유 기능 등)</li>
              <li>고객 문의 및 불만 처리</li>
              <li>서비스 개선 및 새로운 기능 개발</li>
              <li>법령 상 의무 이행</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">2. 수집하는 개인정보의 항목</h2>
            <p className="mb-3"><strong className="text-[#1A1A1A]">필수 항목</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>이메일 주소 (회원가입 및 로그인)</li>
              <li>이름 또는 닉네임</li>
              <li>소셜 로그인 시 제공되는 프로필 정보 (Google, Kakao)</li>
            </ul>
            <p className="mt-4 mb-3"><strong className="text-[#1A1A1A]">서비스 이용 중 생성되는 정보</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>등록한 제품 정보 (제품명, 유통기한, 카테고리, 보관 위치, 수량)</li>
              <li>제품 사진 (직접 촬영하여 업로드한 경우)</li>
              <li>차량 정보 및 점검 기록</li>
              <li>서비스 이용 기록, 접속 IP, 쿠키</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <p>회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다. 단, 관련 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>소비자 보호 관련 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
              <li>접속 로그 기록: 3개월 (통신비밀보호법)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">4. 개인정보의 제3자 제공</h2>
            <p>체크홈은 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 다음의 경우에는 예외로 합니다.</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나 수사기관의 요청이 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">5. 개인정보 처리 위탁</h2>
            <p>서비스 운영을 위해 다음 업체에 개인정보 처리를 위탁합니다.</p>
            <div className="mt-3 border border-[#E2E8F0] rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-[#1A1A1A]">수탁업체</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1A1A1A]">위탁 업무</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  <tr><td className="px-4 py-3">Google Cloud (미국)</td><td className="px-4 py-3">서버 인프라 운영</td></tr>
                  <tr><td className="px-4 py-3">Anthropic (미국)</td><td className="px-4 py-3">AI 사진 분석 서비스</td></tr>
                  <tr><td className="px-4 py-3">PortOne</td><td className="px-4 py-3">결제 처리</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">6. 이용자의 권리</h2>
            <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>개인정보 조회, 수정, 삭제 요청</li>
              <li>개인정보 처리 정지 요청</li>
              <li>회원 탈퇴 (앱 내 설정 메뉴에서 직접 가능)</li>
            </ul>
            <p className="mt-3">위 권리 행사는 <a href="mailto:business10082@gmail.com" className="text-[#14B8A6] underline">business10082@gmail.com</a>으로 문의하시거나 앱 내 설정에서 직접 처리하실 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">7. 쿠키의 사용</h2>
            <p>체크홈은 로그인 상태 유지, 서비스 개선을 위해 쿠키 및 로컬 스토리지를 사용합니다. 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스 이용이 제한될 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">8. 광고 서비스</h2>
            <p>체크홈은 Google AdSense를 통해 광고를 제공합니다. Google은 쿠키를 사용해 이용자의 관심사 기반 광고를 표시할 수 있습니다. Google의 광고 사용 방식에 대한 자세한 내용은 <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-[#14B8A6] underline">Google 개인정보처리방침</a>을 확인하세요.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">9. 개인정보 보호책임자</h2>
            <p>개인정보 관련 문의사항은 아래로 연락해 주세요.</p>
            <div className="mt-3 bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
              <p><strong className="text-[#1A1A1A]">이메일:</strong> business10082@gmail.com</p>
              <p className="mt-1"><strong className="text-[#1A1A1A]">처리 기간:</strong> 문의 접수 후 10영업일 이내 답변</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">10. 방침 변경</h2>
            <p>본 개인정보처리방침은 법령·서비스 변경에 따라 수정될 수 있습니다. 변경 시 앱 내 공지를 통해 안내드립니다.</p>
          </section>
        </div>
      </main>

      <footer className="bg-[#1A1A1A] py-8 px-6 text-center mt-12">
        <p className="text-xs text-gray-500">© 2026 체크홈. All rights reserved.</p>
      </footer>
    </div>
  )
}
