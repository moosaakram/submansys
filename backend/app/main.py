"""
Brightloop 360 - Subscription Management System Backend API.
Main FastAPI application initialization, middleware, routes, and lifespan lifecycle.
"""

import logging
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List

# Ensure parent and root directory paths are resolved for imports
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
ROOT_DIR = BACKEND_DIR.parent

for path in [str(ROOT_DIR), str(BACKEND_DIR)]:
    if path not in sys.path:
        sys.path.insert(0, path)

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import (
    ALLOWED_ORIGINS,
    APP_NAME,
    APP_VERSION,
    DEBUG,
    HOST,
    PORT,
)
from app.core.database import get_engine
from app.routes import (
    analytics_router,
    auth_router,
    discounts_router,
    health_router,
    invoices_router,
    payment_terms_router,
    payments_router,
    plans_router,
    products_router,
    quotations_router,
    subscriptions_router,
    taxes_router,
    users_router,
)
from app.schemas.health import RootResponse

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("brightloop360")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database engine, creates tables, and seeds initial catalog data."""
    logger.info("Initializing Brightloop 360 database and seed data...")
    get_engine()
    logger.info("Database and schema verification completed successfully.")
    yield
    logger.info("Shutting down Brightloop 360 server process.")


# -----------------------------------------------------------------------------
# FastAPI Application Initialization
# -----------------------------------------------------------------------------
app = FastAPI(
    title=APP_NAME,
    description="Unified software platform for Brightloop 360 (Odoo Subscription Management System). "
                "Handles plans, product variants, quotations, subscriptions, billing day recurring invoices, "
                "discount rules, payments reconciliation, and finance executive analytics.",
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    openapi_tags=[
        {"name": "General", "description": "General application root and info endpoints"},
        {"name": "Health", "description": "API operational health check"},
        {"name": "Authentication", "description": "Customer signup, login, session tokens, and password reset"},
        {"name": "User Management", "description": "Admin-only user and internal staff management"},
        {"name": "Products & Variants", "description": "Catalog products and price-modifying variants"},
        {"name": "Subscription Plans", "description": "Billing plans, intervals, minimums, and lifecycle rules"},
        {"name": "Quotation Templates", "description": "Reusable quote presets with default lines and validity"},
        {"name": "Subscriptions & Quotes", "description": "Quote-to-subscription lifecycle (Draft -> Confirmed -> Active -> Closed/Paused)"},
        {"name": "Invoicing & Billing Day", "description": "Billing Day engine, automated invoices, and tax calculation"},
        {"name": "Tax Rules", "description": "Tax percentages and automated rules"},
        {"name": "Discount Rules", "description": "Admin discount rules, seat/volume thresholds, and auto-application"},
        {"name": "Payments & Collections", "description": "Multi-method payment records and invoice reconciliation"},
        {"name": "Finance & Analytics", "description": "Real-time KPIs and executive metrics responding in under two seconds"},
    ],
)

# -----------------------------------------------------------------------------
# CORS Middleware Configuration (Next.js Frontend)
# -----------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Global Exception Handlers
# -----------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    logger.warning(f"HTTPException [{exc.status_code}] on {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
        },
    )


from fastapi.encoders import jsonable_encoder


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    details = jsonable_encoder(
        exc.errors(),
        custom_encoder={bytes: lambda b: b.decode("utf-8", errors="ignore")},
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "message": "Request validation failed",
            "details": details,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "An unexpected server error occurred. Please try again later.",
        },
    )


# -----------------------------------------------------------------------------
# Root & Health Endpoints
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


# Mount Health Check router directly at root
app.include_router(health_router)

# -----------------------------------------------------------------------------
# API v1 Routers Mount
# -----------------------------------------------------------------------------
API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(users_router, prefix=API_PREFIX)
app.include_router(products_router, prefix=API_PREFIX)
app.include_router(plans_router, prefix=API_PREFIX)
app.include_router(quotations_router, prefix=API_PREFIX)
app.include_router(subscriptions_router, prefix=API_PREFIX)
app.include_router(invoices_router, prefix=API_PREFIX)
app.include_router(payment_terms_router, prefix=API_PREFIX)
app.include_router(taxes_router, prefix=API_PREFIX)
app.include_router(discounts_router, prefix=API_PREFIX)
app.include_router(payments_router, prefix=API_PREFIX)
app.include_router(analytics_router, prefix=API_PREFIX)


# -----------------------------------------------------------------------------
# Direct Execution Entry Point
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=DEBUG)
