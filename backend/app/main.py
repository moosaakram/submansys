import logging
import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes.health import router as health_router
from app.schemas.health import RootResponse

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("brightloop360")

# -----------------------------------------------------------------------------
# Environment Configuration
# -----------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
    logger.info(f"Loaded environment variables from {ENV_PATH}")
else:
    load_dotenv()
    logger.info("Loaded environment variables from default environment")

APP_NAME: str = os.getenv("APP_NAME", "Brightloop 360 API")
APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
APP_ENV: str = os.getenv("APP_ENV", "development")
DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))

# Parse CORS origins for local Next.js frontend
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
ALLOWED_ORIGINS: List[str] = [
    origin.strip() for origin in raw_origins.split(",") if origin.strip()
]

# -----------------------------------------------------------------------------
# FastAPI Application Initialization
# -----------------------------------------------------------------------------
app = FastAPI(
    title=APP_NAME,
    description="Backend API for Brightloop 360 - Subscription Management System",
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "General",
            "description": "General application information endpoints",
        },
        {
            "name": "Health",
            "description": "API health and readiness verification",
        },
    ],
)

# -----------------------------------------------------------------------------
# CORS Middleware Configuration (Next.js Frontend)
# -----------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Global Exception Handlers
# -----------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handles standard HTTP exceptions with structured error responses."""
    logger.warning(f"HTTPException [{exc.status_code}] on {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handles request payload / parameter validation errors."""
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "message": "Request validation failed",
            "details": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handles unexpected runtime exceptions without leaking internal stack traces."""
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "An unexpected server error occurred. Please try again later.",
        },
    )


# -----------------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------------
@app.get(
    "/",
    response_model=RootResponse,
    tags=["General"],
    summary="Root Info",
    description="Returns project name, API version, and documentation link",
)
async def get_root() -> RootResponse:
    return RootResponse(
        project="Brightloop 360",
        version=APP_VERSION,
        status="online",
        docs="/docs",
    )


# Include health check router
app.include_router(health_router)


# -----------------------------------------------------------------------------
# Direct Execution Entry Point
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=DEBUG)
