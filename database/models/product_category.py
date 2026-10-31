"""
Product Category Model for SubMan / Brightloop 360.
Organizes catalog products into hierarchical taxonomy.
"""

from typing import Optional, List
from sqlalchemy import Boolean, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ProductCategory(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Hierarchical product categories with parent/child relationships.
    """
    __tablename__ = "product_categories"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        comment="Category display name",
    )

    slug: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
        index=True,
        comment="URL-friendly unique slug identifier",
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Category description",
    )

    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("product_categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Parent category for hierarchical classification",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether category is active",
    )
