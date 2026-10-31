"""
Database connection, engine configuration, and session management for Brightloop 360.
Configures PostgreSQL connection via environment variables with complete error handling.
"""

import logging
import os
import urllib.parse
from contextlib import contextmanager
from typing import Generator, Optional, Tuple

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from database.base import Base

# Configure module-level logger
logger = logging.getLogger("brightloop360.database")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter("[%(asctime)s] [%(levelname)s] [database]: %(message)s")
    )
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Load environment variables from .env file (if present)
load_dotenv()


def get_database_url() -> str:
    """
    Constructs the PostgreSQL connection URL from environment variables.
    
    Priority:
    1. Direct `DATABASE_URL` environment variable.
       (Automatically normalizes legacy 'postgres://' scheme to 'postgresql+psycopg2://')
    2. Assembled from discrete variables: DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, DB_SSLMODE.
    
    Returns:
        str: SQLAlchemy-compatible PostgreSQL connection URL.
    """
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        # Standardize SQLAlchemy 2.0 driver dialect
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif database_url.startswith("postgresql://") and not database_url.startswith("postgresql+"):
            database_url = database_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return database_url

    # Assemble from individual environment variables
    user = os.getenv("DB_USER", "postgres")
    raw_password = os.getenv("DB_PASSWORD", "")
    # URL-encode password in case it contains special characters (@, :, /, etc.)
    password = urllib.parse.quote_plus(raw_password) if raw_password else ""
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "brightloop360")
    ssl_mode = os.getenv("DB_SSLMODE")

    auth = f"{user}:{password}" if password else user
    url = f"postgresql+psycopg2://{auth}@{host}:{port}/{db_name}"
    if ssl_mode:
        url += f"?sslmode={ssl_mode}"

    return url


def get_pool_settings() -> dict:
    """
    Retrieves engine connection pool settings from environment variables.
    """
    return {
        "pool_size": int(os.getenv("DB_POOL_SIZE", "10")),
        "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "20")),
        "pool_timeout": int(os.getenv("DB_POOL_TIMEOUT", "30")),
        "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "1800")),
        "echo": os.getenv("DB_ECHO", "False").lower() in ("true", "1", "t"),
    }


def create_db_engine(db_url: Optional[str] = None) -> Engine:
    """
    Creates and configures a SQLAlchemy engine with connection health checks (pool_pre_ping).
    """
    url = db_url or get_database_url()
    pool_cfg = get_pool_settings()

    return create_engine(
        url,
        pool_pre_ping=True,  # Proactively test connection validity before issuing SQL
        pool_size=pool_cfg["pool_size"],
        max_overflow=pool_cfg["max_overflow"],
        pool_timeout=pool_cfg["pool_timeout"],
        pool_recycle=pool_cfg["pool_recycle"],
        echo=pool_cfg["echo"],
    )


# Module-level engine and session factory
engine: Engine = create_db_engine()
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def verify_connection(custom_engine: Optional[Engine] = None) -> Tuple[bool, str]:
    """
    Verifies connectivity to the PostgreSQL database with comprehensive error diagnostics.
    
    Returns:
        Tuple[bool, str]: (is_successful, status_or_error_message)
    """
    active_engine = custom_engine or engine
    try:
        with active_engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            if result == 1:
                message = "PostgreSQL database connection successfully established."
                logger.info(message)
                return True, message
            return False, f"Unexpected ping response: {result}"
    except OperationalError as oe:
        error_msg = (
            f"Database OperationalError: Could not connect to PostgreSQL. "
            f"Details: {oe.orig if hasattr(oe, 'orig') else str(oe)}. "
            f"Verify your DB_HOST, DB_PORT, DB_NAME, DB_USER and DB_PASSWORD credentials."
        )
        logger.error(error_msg)
        return False, error_msg
    except SQLAlchemyError as se:
        error_msg = f"Database SQLAlchemyError: {str(se)}"
        logger.error(error_msg)
        return False, error_msg
    except Exception as exc:
        error_msg = f"Unexpected error while connecting to database: {str(exc)}"
        logger.error(error_msg)
        return False, error_msg


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI / web framework dependency that provides a transactional database session.
    Automatically closes session upon completion and rolls back on unhandled exceptions.
    
    Usage in FastAPI:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Customer).all()
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """
    Context manager for background workers, CLI scripts, and tasks.
    Automatically commits if no exceptions occur, rolls back if an exception is raised,
    and cleanly closes the session.
    
    Usage:
        with get_db_context() as session:
            customer = session.query(Customer).first()
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_db(target_engine: Optional[Engine] = None) -> None:
    """
    Initializes all database tables registered under Base.metadata.
    Ensures all models are imported prior to creating tables.
    """
    # Import all models to ensure they are registered with Base.metadata
    import database.models  # noqa: F401

    active_engine = target_engine or engine
    logger.info("Creating all registered database tables if they do not exist...")
    try:
        Base.metadata.create_all(bind=active_engine)
        logger.info("Database tables successfully created / verified.")
    except Exception as exc:
        logger.error(f"Failed to create database tables: {exc}")
        raise

