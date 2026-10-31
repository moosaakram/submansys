"""
Authentication Endpoints: Signup, Login, Password Reset.
"""

import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    hash_password,
    validate_password_strength,
    verify_password,
)
from app.schemas.auth import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserLoginRequest,
    UserResponse,
    UserSignupRequest,
)
from database.models import Customer, User, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Customer Signup",
    description="Registers a new customer account with email uniqueness and strong password validation",
)
def signup(req: UserSignupRequest, db: Session = Depends(get_db)):
    # 1. Enforce password complexity
    is_valid_pw, pw_error = validate_password_strength(req.password)
    if not is_valid_pw:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=pw_error,
        )

    # 2. Enforce email uniqueness
    existing_user = db.query(User).filter(User.email == req.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # 3. Create or find Customer record
    customer = db.query(Customer).filter(Customer.email == req.email.lower()).first()
    if not customer:
        customer = Customer(
            full_name=req.full_name,
            email=req.email.lower(),
            phone=req.phone,
            company_name=req.company_name or req.full_name,
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # 4. Create User entity with Customer role
    new_user = User(
        email=req.email.lower(),
        full_name=req.full_name,
        hashed_password=hash_password(req.password),
        role=UserRole.CUSTOMER,
        is_active=True,
        customer_id=customer.id,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 5. Generate Access Token
    token = create_access_token({"sub": str(new_user.id), "role": new_user.role.value})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="User Login",
    description="Authenticates admin, staff, or customer and returns a JWT access token",
)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact an administrator.",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role.value})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Current User Profile",
    description="Returns profile information for the authenticated user",
)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.post(
    "/forgot-password",
    summary="Forgot Password",
    description="Generates password reset token and sends simulated reset link to registered email",
)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        # Avoid user enumeration: return success even if user not found
        return {
            "status": "success",
            "message": f"If an account exists for {req.email}, a password reset link has been dispatched.",
        }

    reset_token = str(uuid.uuid4())
    user.reset_token = reset_token
    user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(hours=2)
    db.commit()

    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
    return {
        "status": "success",
        "message": f"Password reset link dispatched to {req.email}",
        "reset_link": reset_link,
        "token": reset_token,
    }


@router.post(
    "/reset-password",
    summary="Reset Password",
    description="Resets user password using valid reset token and strong password validation",
)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    is_valid_pw, pw_error = validate_password_strength(req.new_password)
    if not is_valid_pw:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=pw_error,
        )

    now = datetime.now(timezone.utc)
    user = db.query(User).filter(User.reset_token == req.token).first()
    if not user or not user.reset_token_expiry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    # Check expiration
    expiry = user.reset_token_expiry
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)

    if now > expiry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired. Please request a new one.",
        )

    user.hashed_password = hash_password(req.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()

    return {
        "status": "success",
        "message": "Password has been successfully updated. You may now log in.",
    }
