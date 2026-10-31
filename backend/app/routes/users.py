"""
User Management Endpoints.
Only Administrators can add staff members and manage roles.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.core.security import hash_password, validate_password_strength
from app.schemas.auth import StaffCreateRequest, UserResponse
from database.models import User, UserRole

router = APIRouter(prefix="/users", tags=["User Management"])


@router.post(
    "/staff",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Staff Member (Admin Only)",
    description="Allows only administrators to onboard new internal staff members",
)
def add_staff_member(
    req: StaffCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    # Verify email uniqueness
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    # Validate temporary password strength
    is_valid_pw, pw_err = validate_password_strength(req.password)
    if not is_valid_pw:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=pw_err,
        )

    # Ensure role is staff or admin
    if req.role not in [UserRole.STAFF, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Staff members can only be created with role 'staff' or 'admin'.",
        )

    new_staff = User(
        email=req.email.lower(),
        full_name=req.full_name,
        hashed_password=hash_password(req.password),
        role=req.role,
        is_active=True,
    )
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)

    return UserResponse.model_validate(new_staff)


@router.get(
    "/",
    response_model=List[UserResponse],
    summary="List Users (Admin Only)",
    description="Returns all users in the system, with optional role filter",
)
def list_users(
    role: Optional[UserRole] = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.all()
    return [UserResponse.model_validate(u) for u in users]
