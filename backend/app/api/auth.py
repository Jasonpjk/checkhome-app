import secrets
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    OAuthCodeRequest,
    VerifyEmailRequest,
    ResendRequest,
)
from app.services.email import send_verification_email, EmailSendError

router = APIRouter(prefix="/auth", tags=["auth"])

# 인증 코드 정책
VERIFICATION_CODE_TTL_MINUTES = 10
MAX_VERIFICATION_ATTEMPTS = 5
RESEND_COOLDOWN_SECONDS = 60


def _email_verification_enabled() -> bool:
    """RESEND_API_KEY가 설정돼 있으면 이메일 인증 단계를 활성화한다."""
    return bool(settings.RESEND_API_KEY)


def _generate_code() -> str:
    """6자리 숫자 인증 코드 생성 (앞자리 0 유지)"""
    return f"{secrets.randbelow(1000000):06d}"


def _issue_verification_code(user: User, db: Session) -> str:
    """새 인증 코드를 발급해 해시 저장하고 만료/시도횟수를 초기화한 뒤 평문 코드를 반환."""
    code = _generate_code()
    user.verification_code = get_password_hash(code)
    user.verification_expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=VERIFICATION_CODE_TTL_MINUTES
    )
    user.verification_attempts = 0
    db.commit()
    return code


def _auto_grant_admin(user: User, db: Session) -> None:
    """ADMIN_EMAIL 환경변수에 등록된 이메일 로그인 시 자동으로 관리자 권한 부여"""
    admin_emails = getattr(settings, "ADMIN_EMAIL", "") or ""
    emails = [e.strip() for e in admin_emails.split(",") if e.strip()]
    if user.email in emails and not user.is_admin:
        user.is_admin = True
        db.commit()


def _validate_password(password: str) -> None:
    """비밀번호 보안 표준: 8자 이상 + 영문/숫자/특수문자 중 2종 이상 조합 (프론트 통과해도 백엔드 재검증)"""
    import re
    kinds = sum(bool(re.search(p, password)) for p in (r"[a-zA-Z]", r"[0-9]", r"[^a-zA-Z0-9]"))
    if len(password) < 8 or kinds < 2:
        raise HTTPException(
            status_code=400,
            detail="비밀번호는 8자 이상이며 영문·숫자·특수문자 중 2가지 이상을 포함해야 합니다",
        )


@router.post("/register", response_model=None)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    _validate_password(req.password)
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="이미 사용중인 이메일입니다")

    verification_required = _email_verification_enabled()
    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        name=req.name,
        email_verified=not verification_required,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if not verification_required:
        # RESEND 미설정: 기존처럼 즉시 인증된 사용자로 자동 로그인
        token = create_access_token({"sub": str(user.id)})
        return TokenResponse(access_token=token, user_id=user.id, name=user.name, email=user.email, is_admin=user.is_admin)

    # RESEND 설정: 미인증 사용자 — 인증 코드 발급 후 메일 발송
    code = _issue_verification_code(user, db)
    try:
        send_verification_email(user.email, code)
    except EmailSendError:
        # 발송 실패 시 사용자가 인지할 수 있도록 명확히 알림(계정은 생성된 상태)
        raise HTTPException(
            status_code=502,
            detail="인증 메일 발송에 실패했습니다. 잠시 후 인증 코드 재전송을 시도해주세요.",
        )

    return {"requires_verification": True, "email": user.email}


@router.post("/verify-email", response_model=TokenResponse)
def verify_email(req: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    invalid_detail = "인증 코드가 올바르지 않거나 만료됐습니다"

    if not user or not user.verification_code or not user.verification_expires_at:
        raise HTTPException(status_code=400, detail=invalid_detail)

    # 시도 횟수 제한
    if (user.verification_attempts or 0) >= MAX_VERIFICATION_ATTEMPTS:
        raise HTTPException(status_code=400, detail=invalid_detail)

    # 만료 확인
    if datetime.now(timezone.utc) > user.verification_expires_at:
        raise HTTPException(status_code=400, detail=invalid_detail)

    # 코드 검증 (해시 비교)
    if not verify_password(req.code, user.verification_code):
        user.verification_attempts = (user.verification_attempts or 0) + 1
        db.commit()
        raise HTTPException(status_code=400, detail=invalid_detail)

    # 성공: 인증 완료 + 코드 클리어
    user.email_verified = True
    user.verification_code = None
    user.verification_expires_at = None
    user.verification_attempts = 0
    _auto_grant_admin(user, db)
    db.commit()

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user_id=user.id, name=user.name, email=user.email, is_admin=user.is_admin)


@router.post("/resend-code")
def resend_code(req: ResendRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    # 이메일 존재 여부를 노출하지 않도록 항상 ok 반환(이미 인증/미존재 포함)
    if not user or user.email_verified or not _email_verification_enabled():
        return {"ok": True}

    # 쿨다운: 직전 발급 후 일정 시간 내 재요청 차단
    if user.verification_expires_at is not None:
        issued_at = user.verification_expires_at - timedelta(minutes=VERIFICATION_CODE_TTL_MINUTES)
        if datetime.now(timezone.utc) - issued_at < timedelta(seconds=RESEND_COOLDOWN_SECONDS):
            raise HTTPException(status_code=429, detail="잠시 후 다시 시도해주세요")

    code = _issue_verification_code(user, db)
    try:
        send_verification_email(user.email, code)
    except EmailSendError:
        raise HTTPException(status_code=502, detail="인증 메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.")

    return {"ok": True}


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="이메일 또는 비밀번호가 잘못되었습니다")
    if _email_verification_enabled() and not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이메일 인증이 필요합니다. 메일의 인증 코드를 입력해주세요.",
        )
    _auto_grant_admin(user, db)
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user_id=user.id, name=user.name, email=user.email, is_admin=user.is_admin)


@router.post("/social/google-code", response_model=TokenResponse)
def google_social_login(req: OAuthCodeRequest, db: Session = Depends(get_db)):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Google 소셜 로그인이 설정되지 않았습니다")

    with httpx.Client() as client:
        token_resp = client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": req.code,
                # 값 끝의 공백/줄바꿈(환경변수 붙여넣기 시 흔함)이 invalid_client를 유발하므로 방어적으로 제거
                "client_id": (settings.GOOGLE_CLIENT_ID or "").strip(),
                "client_secret": (settings.GOOGLE_CLIENT_SECRET or "").strip(),
                "redirect_uri": req.redirect_uri,
                "grant_type": "authorization_code",
            },
        )

    if token_resp.status_code != 200:
        # 구글이 돌려준 실제 에러 코드만 노출 (error/error_description에는 비밀값 미포함)
        try:
            err = token_resp.json()
            g_error = err.get("error", "unknown")
            g_desc = err.get("error_description", "")
        except Exception:
            g_error, g_desc = "non_json", token_resp.text[:200]
        raise HTTPException(status_code=400, detail=f"Google 인증 실패: {g_error} - {g_desc}")

    id_token_str = token_resp.json().get("id_token")
    if not id_token_str:
        raise HTTPException(status_code=400, detail="Google ID 토큰을 받지 못했습니다")

    try:
        idinfo = id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Google 토큰 검증 실패")

    email = idinfo.get("email")
    name = idinfo.get("name") or idinfo.get("given_name") or "Google 사용자"
    if not email:
        raise HTTPException(status_code=400, detail="Google 이메일 정보가 없습니다")

    return _social_login(email, name, db)


@router.post("/social/kakao", response_model=TokenResponse)
def kakao_social_login(req: OAuthCodeRequest, db: Session = Depends(get_db)):
    if not settings.KAKAO_REST_API_KEY:
        raise HTTPException(status_code=503, detail="카카오 소셜 로그인이 설정되지 않았습니다")

    token_data: dict = {
        "grant_type": "authorization_code",
        "client_id": settings.KAKAO_REST_API_KEY,
        "redirect_uri": req.redirect_uri,
        "code": req.code,
    }
    if settings.KAKAO_CLIENT_SECRET:
        token_data["client_secret"] = settings.KAKAO_CLIENT_SECRET

    with httpx.Client() as client:
        token_resp = client.post(
            "https://kauth.kakao.com/oauth/token",
            data=token_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    if token_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="카카오 인증에 실패했습니다")

    access_token = token_resp.json().get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="카카오 액세스 토큰 없음")

    with httpx.Client() as client:
        user_resp = client.get(
            "https://kapi.kakao.com/v2/user/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )

    if user_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="카카오 사용자 정보 조회 실패")

    user_data = user_resp.json()
    kakao_account = user_data.get("kakao_account", {})
    email = kakao_account.get("email")
    profile = kakao_account.get("profile", {})
    name = profile.get("nickname") or "카카오 사용자"

    if not email:
        raise HTTPException(status_code=400, detail="카카오 이메일 정보가 없습니다. 이메일 제공 동의가 필요합니다.")

    return _social_login(email, name, db)


def _social_login(email: str, name: str, db: Session) -> TokenResponse:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password_hash=get_password_hash(secrets.token_hex(32)),
            name=name,
            email_verified=True,  # 소셜 공급자가 이메일을 인증함
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.email_verified:
        # 기존 미인증 계정이 소셜 로그인하면 공급자 인증으로 간주
        user.email_verified = True
        db.commit()
    _auto_grant_admin(user, db)
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user_id=user.id, name=user.name, email=user.email, is_admin=user.is_admin)
