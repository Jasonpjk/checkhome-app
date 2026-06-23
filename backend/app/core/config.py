from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost/checkhome"
    SECRET_KEY: str = "changeme-use-a-real-secret-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "https://checkhome.vercel.app"]
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    KAKAO_REST_API_KEY: str = ""
    KAKAO_CLIENT_SECRET: Optional[str] = None
    # AI 사진 자동 인식 (Claude Vision)
    ANTHROPIC_API_KEY: Optional[str] = None
    # 기본은 저렴한 Haiku로 처리하고, 자신 없는(흐릿/작은 글씨) 사진만 상위 모델로 자동 재시도
    ANTHROPIC_MODEL: str = "claude-haiku-4-5"
    ANTHROPIC_ESCALATION_MODEL: str = "claude-opus-4-8"
    # 포트원 V2 결제
    PORTONE_STORE_ID: Optional[str] = None       # 스토어 아이디 (store-xxxx)
    PORTONE_API_SECRET: Optional[str] = None     # V2 API Secret
    PORTONE_WEBHOOK_SECRET: Optional[str] = None # 웹훅 시크릿
    PORTONE_CHANNEL_KEY: Optional[str] = None    # 채널키 (channel-key-xxxx)
    # 관리자 자동 부여 이메일 (쉼표 구분, 예: admin@example.com,ceo@example.com)
    ADMIN_EMAIL: Optional[str] = None
    # 회원가입 이메일 인증 (Resend) — 미설정 시 인증 단계 없이 자동 로그인
    RESEND_API_KEY: Optional[str] = None
    MAIL_FROM: str = "onboarding@resend.dev"
    APP_NAME: str = "체크홈"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("["):
                import json
                return json.loads(v)
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
