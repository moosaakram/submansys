"""
Database schema migration utility for Brightloop 360 / SubMan.
Safely inspects existing tables and adds missing columns without dropping any tables or data.
Compatible with both PostgreSQL and SQLite.
"""

import logging
from sqlalchemy import inspect, text
from database.connection import engine, init_db

logger = logging.getLogger("brightloop360.migration")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] [migration]: %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


def run_migrations():
    """Checks tables and columns, adds missing ones safely."""
    # Step 1: Ensure all registered tables exist
    init_db(engine)

    # Step 2: Check for missing columns in existing tables
    inspector = inspect(engine)
    is_sqlite = engine.dialect.name == "sqlite"

    with engine.begin() as conn:
        # Invoices columns
        if inspector.has_table("invoices"):
            existing_invoice_cols = {col["name"] for col in inspector.get_columns("invoices")}
            columns_to_add = [
                ("invoice_kind", "VARCHAR(20) DEFAULT 'standard' NOT NULL"),
                ("billing_period_start", "DATE NULL"),
                ("billing_period_end", "DATE NULL"),
                ("currency", "VARCHAR(3) DEFAULT 'INR' NOT NULL"),
                ("balance", "NUMERIC(12, 2) DEFAULT 0.00 NOT NULL"),
                ("replaces_invoice_id", "UUID NULL" if not is_sqlite else "CHAR(36) NULL"),
                ("cancellation_reason", "TEXT NULL"),
            ]
            for col_name, col_def in columns_to_add:
                if col_name not in existing_invoice_cols:
                    logger.info(f"Adding missing column invoices.{col_name}...")
                    conn.execute(text(f"ALTER TABLE invoices ADD COLUMN {col_name} {col_def}"))

        # Invoice lines columns
        if inspector.has_table("invoice_lines"):
            existing_inv_line_cols = {col["name"] for col in inspector.get_columns("invoice_lines")}
            columns_to_add = [
                ("description", "TEXT NULL"),
                ("total", "NUMERIC(12, 2) DEFAULT 0.00 NOT NULL"),
            ]
            for col_name, col_def in columns_to_add:
                if col_name not in existing_inv_line_cols:
                    logger.info(f"Adding missing column invoice_lines.{col_name}...")
                    conn.execute(text(f"ALTER TABLE invoice_lines ADD COLUMN {col_name} {col_def}"))

        # Payments columns
        if inspector.has_table("payments"):
            existing_payment_cols = {col["name"] for col in inspector.get_columns("payments")}
            columns_to_add = [
                ("customer_id", "UUID NULL" if not is_sqlite else "CHAR(36) NULL"),
                ("payment_type", "VARCHAR(20) DEFAULT 'payment' NOT NULL"),
                ("status", "VARCHAR(20) DEFAULT 'posted' NOT NULL"),
                ("reversed_payment_id", "UUID NULL" if not is_sqlite else "CHAR(36) NULL"),
            ]
            for col_name, col_def in columns_to_add:
                if col_name not in existing_payment_cols:
                    logger.info(f"Adding missing column payments.{col_name}...")
                    conn.execute(text(f"ALTER TABLE payments ADD COLUMN {col_name} {col_def}"))

    logger.info("Schema migrations completed successfully.")


if __name__ == "__main__":
    run_migrations()
