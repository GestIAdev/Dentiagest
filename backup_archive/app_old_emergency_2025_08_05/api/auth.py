# PLATFORM_EXTRACTABLE: Authentication API endpoints
"""
Authentication API routes for user login, registration, and token management.
This module is 100% extractable to PlatformGest core as authentication
is universal across all business verticals.
"""

from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..core.database import get_db
from ..core.config import get_settings
from ..core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_password_hash,
    decode_token,
    get_current_user,
    require_verification
)
from ..models.user import User, UserRole
from ..schemas.auth import (
    UserCreate,
    UserLogin,
    TokenResponse,
    UserResponse,
    PasswordReset,
    PasswordChange,
    RefreshTokenRequest
)

# PLATFORM_EXTRACTABLE: Router configuration (universal pattern)
router = APIRouter(prefix="/auth", tags=["authentication"])
settings = get_settings()

# PLATFORM_EXTRACTABLE: User registration endpoint
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Register a new user account.
    
    PLATFORM_PATTERN: Every vertical needs user registration:
    - DentiaGest: Dental practice staff registration
    - VetGest: Veterinary clinic staff registration  
    - MechaGest: Auto shop employee registration
    - RestaurantGest: Restaurant staff registration
    """
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        User.email == user_data.email.lower()
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Check if username is taken (if provided)
    if user_data.username:
        existing_username = db.query(User).filter(
            User.username == user_data.username.lower()
        ).first()
        
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    db_user = User(
        email=user_data.email.lower(),
        username=user_data.username.lower() if user_data.username else None,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        hashed_password=hashed_password,
        role=user_data.role or UserRole.USER,
        is_email_verified=False,  # Require email verification
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

# PLATFORM_EXTRACTABLE: Login endpoint with token generation
@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """
    User login with email/username and password.
    Returns access and refresh tokens.
    
    PLATFORM_CORE: Universal login flow for all verticals.
    """
    
    # Find user by email or username
    user = db.query(User).filter(
        and_(
            User.is_active == True,
            User.deleted_at.is_(None),
            (User.email == form_data.username.lower()) | 
            (User.username == form_data.username.lower())
        )
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if account is locked
    if user.is_locked:
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Account is locked. Please contact administrator."
        )
    
    # Update last login
    user.update_last_login()
    user.reset_failed_login_attempts()
    db.commit()
    
    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = create_access_token(
        data={"sub": str(user.id), "type": "access"},
        expires_delta=access_token_expires
    )
    
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "type": "refresh"},
        expires_delta=refresh_token_expires
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user
    }

# PLATFORM_EXTRACTABLE: Token refresh endpoint
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    token_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Refresh access token using refresh token.
    
    PLATFORM_CORE: Universal token refresh mechanism.
    """
    
    try:
        payload = decode_token(token_data.refresh_token)
        user_id = payload.get("sub")
        token_type = payload.get("type")
        
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Get user from database
    user = db.query(User).filter(
        and_(
            User.id == user_id,
            User.is_active == True,
            User.deleted_at.is_(None)
        )
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = create_access_token(
        data={"sub": str(user.id), "type": "access"},
        expires_delta=access_token_expires
    )
    
    new_refresh_token = create_refresh_token(
        data={"sub": str(user.id), "type": "refresh"},
        expires_delta=refresh_token_expires
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user
    }

# PLATFORM_EXTRACTABLE: Get current user profile
@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get current authenticated user profile.
    
    PLATFORM_CORE: Universal user profile endpoint.
    """
    return current_user

# PLATFORM_EXTRACTABLE: Update user profile
@router.put("/me", response_model=UserResponse)
async def update_profile(
    user_update: UserCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update current user profile information.
    
    PLATFORM_CORE: Universal profile update functionality.
    """
    
    # Update allowed fields
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    if user_update.username is not None:
        # Check if username is available
        existing = db.query(User).filter(
            and_(
                User.username == user_update.username.lower(),
                User.id != current_user.id
            )
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = user_update.username.lower()
    
    current_user.updated_at = current_user.get_current_time()
    db.commit()
    db.refresh(current_user)
    
    return current_user

# PLATFORM_EXTRACTABLE: Change password
@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Change user password with current password verification.
    
    PLATFORM_CORE: Universal password change functionality.
    """
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    current_user.password_changed_at = current_user.get_current_time()
    current_user.updated_at = current_user.get_current_time()
    
    db.commit()
    
    return {"message": "Password changed successfully"}

# PLATFORM_EXTRACTABLE: Logout endpoint (optional, for token blacklisting)
@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Logout user (client should discard tokens).
    
    PLATFORM_CORE: Universal logout endpoint.
    Note: In a stateless JWT system, logout is typically handled client-side.
    This endpoint is provided for completeness and potential token blacklisting.
    """
    
    # In a more advanced implementation, you might:
    # 1. Add token to blacklist/Redis
    # 2. Invalidate refresh tokens in database
    # 3. Log logout event for security auditing
    
    return {"message": "Logged out successfully"}

# PLATFORM_EXTRACTABLE: Account verification endpoints
@router.post("/verify-email")
async def verify_email(
    token: str,
    db: Session = Depends(get_db)
) -> Any:
    """
    Verify user email address using verification token.
    
    PLATFORM_CORE: Universal email verification.
    """
    
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        token_type = payload.get("type")
        
        if token_type != "email_verification":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type"
            )
            
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_email_verified = True
    user.email_verified_at = user.get_current_time()
    db.commit()
    
    return {"message": "Email verified successfully"}

# PLATFORM_EXTRACTABLE: Password reset request
@router.post("/reset-password-request")
async def request_password_reset(
    email: str,
    db: Session = Depends(get_db)
) -> Any:
    """
    Request password reset token via email.
    
    PLATFORM_CORE: Universal password reset functionality.
    """
    
    user = db.query(User).filter(User.email == email.lower()).first()
    
    # Don't reveal if email exists for security
    if user:
        # Create password reset token
        reset_token_expires = timedelta(hours=1)  # Short expiry for security
        reset_token = create_access_token(
            data={"sub": str(user.id), "type": "password_reset"},
            expires_delta=reset_token_expires
        )
        
        # In a real implementation, send email with reset token
        # For now, we'll just return success
        # email_service.send_password_reset_email(user.email, reset_token)
    
    return {"message": "If an account with this email exists, you will receive a password reset link"}

# PLATFORM_EXTRACTABLE: Password reset confirmation
@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db)
) -> Any:
    """
    Reset password using reset token.
    
    PLATFORM_CORE: Universal password reset completion.
    """
    
    try:
        payload = decode_token(reset_data.token)
        user_id = payload.get("sub")
        token_type = payload.get("type")
        
        if token_type != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type"
            )
            
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.hashed_password = get_password_hash(reset_data.new_password)
    user.password_changed_at = user.get_current_time()
    user.updated_at = user.get_current_time()
    
    # Reset any account locks
    user.is_locked = False
    user.failed_login_attempts = 0
    
    db.commit()
    
    return {"message": "Password reset successfully"}
