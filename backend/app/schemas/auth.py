"""
Authentication and User schemas for Brightloop 360.
"""

import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from database.models.user import UserRole


class UserSignupRequest(BaseModel):
    email: EmailStr = Field(description="Customer email address (must be unique)")
    full_name: str = Field(min_length=2, max_length=255, description="Full name or company representative")
    password: str = Field(
        min_length=9,
        description="Password must be > 8 characters, with uppercase, lowercase, and special character",
    )
    company_name: Optional[str] = Field(default=None, description="Optional company / business name")
    phone: Optional[str] = Field(default=None, description="Optional phone contact")


class StaffCreateRequest(BaseModel):
    email: EmailStr = Field(description="Staff member email address")
    full_name: str = Field(min_length=2, max_length=255, description="Staff member full name")
    password: str = Field(min_length=9, description="Initial temporary password")
    role: UserRole = Field(default=UserRole.STAFF, description="Assigned role: staff or admin")


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(description="Registered email address to receive password reset link")


class ResetPasswordRequest(BaseModel):
    token: str = Field(description="Reset token received via email link")
    new_password: str = Field(min_length=9, description="New strong password")


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    customer_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
