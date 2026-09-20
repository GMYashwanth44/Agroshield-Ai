import os
from pydantic_settings import BaseSettings

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "agroshield.db").replace("\\", "/")

class Settings(BaseSettings):
    APP_NAME: str = "AgroShield AI"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Security & Networking
    SECRET_KEY: str = os.getenv("SECRET_KEY", "agroshield_ai_super_secret_jwt_key_sih_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:8000,http://127.0.0.1:5173,http://127.0.0.1:8000,*"
    )
    
    # Database: Absolute path ensures identical DB across root, backend, and tests
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
    
    # AI Thresholds
    CONFIDENCE_THRESHOLD: float = 0.70  # Below 70% prompts expert verification
    BLUR_THRESHOLD: float = 45.0        # Laplacian variance threshold
    MIN_RESOLUTION: int = 150          # Min width & height
    
    # Demo & Data
    DEMO_MODE: bool = True
    STATIC_DIR: str = os.path.join(BASE_DIR, "static")

settings = Settings()
