import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


class EmailSendError(Exception):
    """인증 메일 발송 실패 (Resend 설정은 됐으나 전송에 실패한 경우)"""


def send_verification_email(to: str, code: str) -> None:
    """Resend로 6자리 이메일 인증 코드를 발송한다.

    RESEND_API_KEY 미설정 시 발송을 건너뛴다(개발/무인증 모드).
    발송 시도가 실패하면 EmailSendError를 던져 호출 측(register 등)이
    사용자에게 알릴 수 있게 한다.
    """
    if not settings.RESEND_API_KEY:
        # 인증 비활성화 모드 — 발송 skip
        return

    html = (
        f"<div style=\"font-family:sans-serif;max-width:480px;margin:0 auto;\">"
        f"<h2>{settings.APP_NAME} 이메일 인증</h2>"
        f"<p>아래 6자리 인증 코드를 입력해주세요.</p>"
        f"<p style=\"font-size:32px;font-weight:bold;letter-spacing:8px;\">{code}</p>"
        f"<p style=\"color:#888;font-size:13px;\">코드는 10분간 유효합니다. "
        f"본인이 요청하지 않았다면 이 메일을 무시하세요.</p>"
        f"</div>"
    )

    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(
                RESEND_API_URL,
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                json={
                    "from": settings.MAIL_FROM,
                    "to": [to],
                    "subject": "체크홈 이메일 인증 코드",
                    "html": html,
                },
            )
    except Exception as exc:  # 네트워크 오류 등
        logger.exception("인증 메일 발송 중 예외 발생: %s", exc)
        raise EmailSendError("인증 메일 발송에 실패했습니다") from exc

    if resp.status_code >= 400:
        # 응답 본문에는 자격증명이 포함되지 않으므로 상태코드/본문 일부만 로깅
        logger.error(
            "인증 메일 발송 실패 (status=%s): %s", resp.status_code, resp.text[:300]
        )
        raise EmailSendError("인증 메일 발송에 실패했습니다")
