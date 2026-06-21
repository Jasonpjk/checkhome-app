import secrets
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, OAuthCodeRequest

router = APIRouter(prefix="/auth", tags=["auth"])


def _auto_grant_admin(user: User, db: Session) -> None:
    """ADMIN_EMAIL 환경변수에 등록된 이메일 로그인 시 자동으로 관리자 권한 부여"""
    admin_emails = getattr(settings, "ADMIN_EMAIL", "") or ""
    emails = [e.strip() for e in admin_emails.split(",") if e.strip()]
    if user.email in emails and not user.is_admin:
        user.is_admin = True
        db.commit()


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="이미 사용중인 이메일입니다")
    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        name=req.name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user_id=user.id, name=user.name, email=user.email, is_admin=user.is_admin)


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="이메일 또는 비밀번호가 잘못되었습니다")
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
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": req.redirect_uri,
                "grant_type": "authorization_code",
            },
        )

    if token_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Google 인증에 실패했습니다")

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
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    _auto_grant_admin(user, db)
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user_id=user.id, name=user.name, email=user.email, is_admin=user.is_admin)
