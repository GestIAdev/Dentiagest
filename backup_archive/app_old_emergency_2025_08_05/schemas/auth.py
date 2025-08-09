# PLATFORM_EXTRACTABLE: Pydantic schemas for authentication and user management
"""
Pydantic schemas for API request/response validation.
These schemas are designed to be reusable across business verticals
with minimal modifications.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator
from enum import Enum

from ..models.user import UserRole

# PLATFORM_EXTRACTABLE: Base user schemas (universal across verticals)
class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=255)
    last_name: str = Field(..., min_length=1, max_length=255)
    
    @validator('username')
    def username_alphanumeric(cls, v):
        if v and not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username must be alphanumeric (with _ or - allowed)')
        return v

class UserCreate(UserBase):
    """Schema for user creation."""
    password: str = Field(..., min_length=8, max_length=128)
    role: Optional[UserRole] = UserRole.RECEPTIONIST
    
    @validator('password')
    def validate_password(cls, v):
        """
        PLATFORM_CORE: Universal password validation.
        Can be customized per vertical while maintaining security standards.
        """
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v

class UserLogin(BaseModel):
    """Schema for user login."""
    username: str  # Can be email or username
    password: str

class UserResponse(UserBase):
    """Schema for user response (excludes sensitive data)."""
    id: str
    role: UserRole
    is_active: bool
    is_email_verified: bool
    is_mfa_enabled: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    """Schema for user profile updates."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=255)
    last_name: Optional[str] = Field(None, min_length=1, max_length=255)
    username: Optional[str] = Field(None, min_length=3, max_length=50)

# PLATFORM_EXTRACTABLE: Authentication schemas (universal)
class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    """Schema for token refresh request."""
    refresh_token: str

class PasswordChange(BaseModel):
    """Schema for password change request."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @validator('new_password')
    def validate_password(cls, v):
        """Same validation as UserCreate password."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v

class PasswordReset(BaseModel):
    """Schema for password reset with token."""
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @validator('new_password')
    def validate_password(cls, v):
        """Same validation as UserCreate password."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v

# PLATFORM_EXTRACTABLE: MFA schemas (universal security feature)
class MFASetupRequest(BaseModel):
    """Schema for MFA setup initiation."""
    method: str = Field(..., pattern="^(totp|sms)$")

class MFASetupResponse(BaseModel):
    """Schema for MFA setup response."""
    secret_key: Optional[str] = None  # For TOTP
    qr_code_url: Optional[str] = None  # For TOTP
    backup_codes: list[str] = []

class MFAVerifyRequest(BaseModel):
    """Schema for MFA verification."""
    code: str = Field(..., min_length=6, max_length=6)

class MFAVerifyResponse(BaseModel):
    """Schema for MFA verification response."""
    verified: bool
    message: str

# PLATFORM_EXTRACTABLE: Generic API response schemas
class MessageResponse(BaseModel):
    """Generic message response schema."""
    message: str

class ErrorResponse(BaseModel):
    """Error response schema."""
    detail: str
    error_code: Optional[str] = None

# PLATFORM_EXTRACTABLE: Pagination schemas (universal for lists)
class PaginationParams(BaseModel):
    """Parameters for pagination."""
    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)
    sort_by: Optional[str] = None
    sort_order: str = Field(default="asc", pattern="^(asc|desc)$")

class PaginatedResponse(BaseModel):
    """Generic paginated response."""
    items: list
    total: int
    page: int
    size: int
    pages: int

# PLATFORM_EXTRACTABLE: Search and filter schemas
class UserSearchParams(PaginationParams):
    """
    Search parameters for users.
    
    PLATFORM_PATTERN: Each vertical will have similar search schemas:
    - DentiaGest: PatientSearchParams, AppointmentSearchParams
    - VetGest: PetSearchParams, VisitSearchParams
    - MechaGest: VehicleSearchParams, ServiceSearchParams
    """
    search: Optional[str] = None  # Search in name, email, username
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None

# DENTAL_SPECIFIC: Example of vertical-specific extension
class DentalUserResponse(UserResponse):
    """
    Extended user response for dental practices.
    
    PLATFORM_PATTERN: Each vertical extends base schemas:
    - VetGest: VetUserResponse (with veterinary license info)
    - MechaGest: MechanicUserResponse (with certifications)
    - RestaurantGest: StaffUserResponse (with food safety certifications)
    """
    # Dental-specific fields could be added here
    # dental_license_number: Optional[str] = None
    # dental_specialization: Optional[str] = None
    # years_experience: Optional[int] = None
    pass

# PLATFORM_EXTRACTABLE: Audit and activity schemas
class ActivityLogEntry(BaseModel):
    """Schema for activity log entries."""
    id: str
    user_id: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True

class ActivityLogParams(PaginationParams):
    """Parameters for activity log queries."""
    user_id: Optional[str] = None
    action: Optional[str] = None
    resource_type: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
