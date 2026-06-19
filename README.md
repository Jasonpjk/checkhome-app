# 체크홈 (CheckHome)

우리 집 사용기한을 가족이 함께 관리하는 앱

## 구조

```
checkhome-app/
├── frontend/    # React + TypeScript + Vite + Tailwind CSS
└── backend/     # FastAPI + PostgreSQL
```

## 기술 스택

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS 4, Zustand, Axios
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, JWT 인증
- **배포**: Vercel (프론트) + Railway (백엔드 + DB)

## 로컬 실행

### 백엔드

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # 환경변수 수정
uvicorn app.main:app --reload
```

### 프론트엔드

```bash
cd frontend
npm install
cp .env.example .env.local  # VITE_API_URL 설정
npm run dev
```

## API 문서

백엔드 실행 후 http://localhost:8000/docs 에서 확인

## 주요 기능

- 식품, 약품, 욕실/화장품, 세제/청소, 차량, 필터/가전 통합 관리
- 유통기한 / 개봉일 / 점검일 관리
- D-day 알림 (강/중/약 위험도별)
- 가족 공유 기능
- 차량 점검 항목 관리 (13개 항목 자동 생성)
- 완료/폐기/교체/보관 처리 이력
