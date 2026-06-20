from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api import auth, items, vehicles, families, admin
import app.models  # noqa: F401 - ensure models are registered

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="체크홈 API",
    description="가정용 사용기한 통합 관리 앱 API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(items.router, prefix="/api")
app.include_router(vehicles.router, prefix="/api")
app.include_router(families.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "app": "체크홈 API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
