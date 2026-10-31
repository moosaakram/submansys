"""
Financial Analytics Endpoints for Finance Lead.
Delivers real-time KPIs: active subscriptions, total revenue, outstanding balances, overdue invoices with sub-2-second response time.
"""

import time
from datetime import datetime, timezone
from decimal import Decimal
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin
from app.schemas.analytics import FinancialAnalyticsResponse, OverdueInvoiceSummary
from database.models import (
    Invoice,
    InvoiceStatus,
    Payment,
    Subscription,
    SubscriptionStatus,
    User,
)

router = APIRouter(prefix="/analytics", tags=["Finance & Analytics"])


@router.get(
    "/dashboard",
    response_model=FinancialAnalyticsResponse,
    summary="Finance Lead Executive Dashboard",
    description="Provides real-time financial metrics: active subscriptions, revenue collected, outstanding owed, overdue invoices, and breakdown statistics in under two seconds.",
)
def get_finance_dashboard(
    start_date: Optional[datetime] = Query(None, description="Filter invoices/payments from date"),
    end_date: Optional[datetime] = Query(None, description="Filter invoices/payments to date"),
    db: Session = Depends(get_db),
    user: User = Depends(require_staff_or_admin),
):
    start_time = time.perf_counter()
    now = datetime.now(timezone.utc)

    # 1. Subscription Metrics
    total_subs = db.query(Subscription).count()
    active_subs = (
        db.query(Subscription)
        .filter(Subscription.status == SubscriptionStatus.ACTIVE)
        .count()
    )

    # Subscriptions breakdown by status
    sub_counts = (
        db.query(Subscription.status, func.count(Subscription.id))
        .group_by(Subscription.status)
        .all()
    )
    subs_by_status: Dict[str, int] = {s.value: c for s, c in sub_counts}

    # 2. Revenue Collected (Total Payments)
    payment_query = db.query(func.coalesce(func.sum(Payment.amount), Decimal("0.00")))
    if start_date:
        payment_query = payment_query.filter(Payment.payment_date >= start_date)
    if end_date:
        payment_query = payment_query.filter(Payment.payment_date <= end_date)
    total_revenue = payment_query.scalar() or Decimal("0.00")

    # 3. Invoices Status & Balances
    inv_query = db.query(Invoice).filter(Invoice.status != InvoiceStatus.CANCELLED)
    if start_date:
        inv_query = inv_query.filter(Invoice.issue_date >= start_date)
    if end_date:
        inv_query = inv_query.filter(Invoice.issue_date <= end_date)

    invoices = inv_query.all()

    total_outstanding = Decimal("0.00")
    overdue_count = 0
    overdue_amount = Decimal("0.00")
    inv_status_counts: Dict[str, int] = {}
    top_overdue: List[OverdueInvoiceSummary] = []

    for inv in invoices:
        status_key = inv.status.value
        inv_status_counts[status_key] = inv_status_counts.get(status_key, 0) + 1

        outstanding = inv.outstanding_amount
        if inv.status != InvoiceStatus.PAID:
            total_outstanding += outstanding

        if inv.is_overdue:
            overdue_count += 1
            overdue_amount += outstanding
            due_tz = inv.due_date if inv.due_date.tzinfo else inv.due_date.replace(tzinfo=timezone.utc)
            days = max(1, (now - due_tz).days)
            top_overdue.append(
                OverdueInvoiceSummary(
                    invoice_number=inv.invoice_number,
                    customer_name=inv.customer_name,
                    due_date=inv.due_date.strftime("%Y-%m-%d"),
                    days_overdue=days,
                    outstanding_amount=outstanding,
                )
            )

    # Sort top overdue by outstanding amount descending
    top_overdue.sort(key=lambda x: x.outstanding_amount, reverse=True)

    execution_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return FinancialAnalyticsResponse(
        active_subscriptions_count=active_subs,
        total_subscriptions_count=total_subs,
        total_revenue_collected=total_revenue,
        total_outstanding_owed=total_outstanding,
        overdue_invoices_count=overdue_count,
        overdue_amount=overdue_amount,
        subscriptions_by_status=subs_by_status,
        invoices_by_status=inv_status_counts,
        top_overdue_invoices=top_overdue[:10],
        query_execution_time_ms=execution_ms,
    )
