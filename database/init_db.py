"""
Database Initialization CLI Script for Brightloop 360.
Tests database connectivity and creates all defined tables in the PostgreSQL database.
"""

import sys
from database.connection import engine, init_db, verify_connection


def main():
    print("=" * 60)
    print("Brightloop 360 - Database Initialization Utility")
    print("=" * 60)

    print("Step 1: Testing PostgreSQL Connection...")
    is_connected, message = verify_connection(engine)
    if not is_connected:
        print(f"\n[ERROR] Connection failed: {message}\n")
        print("Troubleshooting Steps:")
        print("1. Ensure PostgreSQL server is running.")
        print("2. Ensure the database specified in .env exists (default: brightloop360).")
        print("   Create it in psql or pgAdmin:")
        print("   CREATE DATABASE brightloop360;")
        print("3. Check that .env has the right DB_USER, DB_PASSWORD, DB_HOST, DB_PORT.")
        sys.exit(1)

    print(f"[SUCCESS] {message}")
    print("\nStep 2: Creating Database Tables (Base.metadata.create_all)...")
    try:
        init_db(engine)
        print("[SUCCESS] All database tables created successfully!")
    except Exception as e:
        print(f"[ERROR] Failed to create tables: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

