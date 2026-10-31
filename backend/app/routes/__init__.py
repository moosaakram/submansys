"""
API Routes Package for Brightloop 360.
"""

from app.routes.analytics import router as analytics_router
from app.routes.auth import router as auth_router
from app.routes.discounts import router as discounts_router
from app.routes.health import router as health_router
from app.routes.invoices import router as invoices_router
from app.routes.payments import router as payments_router
from app.routes.plans import router as plans_router
from app.routes.products import router as products_router
from app.routes.quotation_templates import router as quotations_router
from app.routes.subscriptions import router as subscriptions_router
from app.routes.taxes import router as taxes_router
from app.routes.users import router as users_router

__all__ = [
    "health_router",
    "auth_router",
    "users_router",
    "products_router",
    "plans_router",
    "quotations_router",
    "subscriptions_router",
    "invoices_router",
    "taxes_router",
    "discounts_router",
    "payments_router",
    "analytics_router",
]
