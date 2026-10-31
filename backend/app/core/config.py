"""
Application configuration for Brightloop 360.
Loads settings from environment variables and .env file.
"""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Base paths
APP_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = APP_DIR.parent
ROOT_DIR = BACKEND_DIR.parent

# Load .env file (checks backend/.env first, then root .env)
backend_env = BACKEND_DIR / ".env"
root_env = ROOT_DIR / ".env"

if backend_env.exists():
    load_dotenv(dotenv_path=backend_env)
elif root_env.exists():
    load_dotenv(dotenv_path=root_env)
else:
    load_dotenv()

APP_NAME: str = os.getenv("APP_NAME", "Brightloop 360 API")
APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
APP_ENV: str = os.getenv("APP_ENV", "development")
DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))

# JWT Authentication
SECRET_KEY: str = os.getenv("JWT_SECRET", "brightloop360-super-secret-key-for-jwt-signing-2026")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

# CORS Origins
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
ALLOWED_ORIGINS: List[str] = [
    origin.strip() for origin in raw_origins.split(",") if origin.strip()
]
