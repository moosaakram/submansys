"""
Schemas package for Brightloop 360.
"""

from app.schemas.analytics import FinancialAnalyticsResponse
from app.schemas.auth import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    StaffCreateRequest,
    TokenResponse,
    UserLoginRequest,
    UserResponse,
    UserSignupRequest,
)
from app.schemas.discounts import (
    DiscountEvaluationRequest,
    DiscountEvaluationResponse,
    DiscountRuleCreate,
    DiscountRuleResponse,
)
from app.schemas.health import HealthResponse, RootResponse
from app.schemas.invoices import (
    InvoiceLineResponse,
    InvoicePrintResponse,
    InvoiceResponse,
    RecurringBillingRunResponse,
)
from app.schemas.payments import PaymentCreate, PaymentResponse
from app.schemas.plans import PlanCreate, PlanResponse, PlanUpdate
from app.schemas.products import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    ProductVariantCreate,
    ProductVariantResponse,
)
from app.schemas.quotations import (
    QuotationTemplateCreate,
    QuotationTemplateLineCreate,
    QuotationTemplateLineResponse,
    QuotationTemplateResponse,
)
from app.schemas.subscriptions import (
    SubscriptionActionResponse,
    SubscriptionCreate,
    SubscriptionLineCreate,
    SubscriptionLineResponse,
    SubscriptionResponse,
)
from app.schemas.taxes import TaxRuleCreate, TaxRuleResponse

__all__ = [
    "HealthResponse",
    "RootResponse",
    "UserSignupRequest",
    "StaffCreateRequest",
    "UserLoginRequest",
    "ForgotPasswordRequest",
    "ResetPasswordRequest",
    "UserResponse",
    "TokenResponse",
    "ProductCreate",
    "ProductUpdate",
    "ProductResponse",
    "ProductVariantCreate",
    "ProductVariantResponse",
    "PlanCreate",
    "PlanUpdate",
    "PlanResponse",
    "QuotationTemplateCreate",
    "QuotationTemplateLineCreate",
    "QuotationTemplateLineResponse",
    "QuotationTemplateResponse",
    "SubscriptionCreate",
    "SubscriptionLineCreate",
    "SubscriptionLineResponse",
    "SubscriptionResponse",
    "SubscriptionActionResponse",
    "InvoiceResponse",
    "InvoiceLineResponse",
    "InvoicePrintResponse",
    "RecurringBillingRunResponse",
    "DiscountRuleCreate",
    "DiscountRuleResponse",
    "DiscountEvaluationRequest",
    "DiscountEvaluationResponse",
    "TaxRuleCreate",
    "TaxRuleResponse",
    "PaymentCreate",
    "PaymentResponse",
    "FinancialAnalyticsResponse",
]
