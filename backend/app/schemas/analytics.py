"""
Financial Analytics schemas for Brightloop 360 Finance Lead dashboard.
"""

from decimal import Decimal
from typing import Dict, List
from pydantic import BaseModel


class StatusCountItem(BaseModel):
    status: str
    count: int


class OverdueInvoiceSummary(BaseModel):
    invoice_number: str
    customer_name: str
    due_date: str
    days_overdue: int
    outstanding_amount: Decimal


class FinancialAnalyticsResponse(BaseModel):
    active_subscriptions_count: int
    total_subscriptions_count: int
    total_revenue_collected: Decimal
    total_outstanding_owed: Decimal
    overdue_invoices_count: int
    overdue_amount: Decimal
    subscriptions_by_status: Dict[str, int]
    invoices_by_status: Dict[str, int]
    top_overdue_invoices: List[OverdueInvoiceSummary] = []
    query_execution_time_ms: float
