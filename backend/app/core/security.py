# PLATFORM_EXTRACTABLE: Security utilities - 95% reusable across verticals
"""
Security utilities for password hashing, JWT tokens, and authentication.
Most of this module is universal and extractable to PlatformGest.
"""

from datetime import datetime, timedelta
from typing import Optional, Any, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import secrets
import string
import pyotp
import qrcode
import io
import base64

from .config import get_settings
from .database import get_db

# Get settings
settings = get_settings()

# PLATFORM_CORE: Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# PLATFORM_CORE: JWT Configuration
ALGORITHM = settings.jwt_algorithm
SECRET_KEY = settings.jwt_secret_key

# OAuth2 scheme for dependency injection
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    scheme_name="BearerAuth"
)

# PLATFORM_CORE: Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate password hash."""
    return pwd_context.hash(password)

def generate_random_password(length: int = 12) -> str:
    """Generate a random secure password."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

# PLATFORM_CORE: JWT Token utilities
def create_access_token(
    data: dict, 
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: The data to encode in the token
        expires_delta: Token expiration time
    
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.jwt_expiration_hours)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def create_refresh_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT refresh token.
    
    Args:
        data: The data to encode in the token
        expires_delta: Token expiration time
    
    Returns:
        Encoded JWT refresh token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=30)  # Refresh tokens last longer
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def verify_token(token: str) -> dict:
    """
    Verify and decode a JWT token.
    
    Args:
        token: The JWT token to verify
    
    Returns:
        Decoded token payload
    
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def decode_token(token: str) -> dict:
    """Decode and verify a JWT token - alias for verify_token."""
    return verify_token(token)

def extract_user_id_from_token(token: str) -> str:
    """
    Extract user ID from JWT token.
    
    Args:
        token: JWT token
    
    Returns:
        User ID from token
    """
    payload = verify_token(token)
    user_id: str = payload.get("sub")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    return user_id

# PLATFORM_CORE: Current user dependency
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user from JWT token.
    This function is used as a dependency in FastAPI endpoints.
    """
    # Import here to avoid circular imports
    from ..models.user import User
    
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user

# PLATFORM_CORE: Two-Factor Authentication utilities
def generate_mfa_secret() -> str:
    """Generate a random secret for MFA."""
    return secrets.token_urlsafe(32)

def generate_mfa_backup_codes(count: int = 10) -> list[str]:
    """Generate backup codes for MFA."""
    return [secrets.token_hex(4).upper() for _ in range(count)]

# PLATFORM_CONFIGURABLE: Session management
class SessionManager:
    """
    Session management for user authentication.
    Can be extended per business vertical for specific requirements.
    """
    
    @staticmethod
    def create_session_token(user_id: str, user_role: str) -> str:
        """Create a session token for user."""
        token_data = {
            "sub": user_id,
            "role": user_role,
            "type": "access"
        }
        return create_access_token(data=token_data)
    
    @staticmethod
    def create_refresh_token_for_user(user_id: str) -> str:
        """Create a refresh token for user."""
        token_data = {
            "sub": user_id,
            "type": "refresh"
        }
        # Refresh tokens last longer
        expires_delta = timedelta(days=30)
        return create_refresh_token(data=token_data, expires_delta=expires_delta)
    
    @staticmethod
    def validate_session(token: str) -> dict:
        """Validate user session token."""
        payload = verify_token(token)
        
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
        
        return payload

# PLATFORM_CORE: Security headers and CORS
def get_security_headers() -> dict:
    """Get security headers for HTTP responses."""
    return {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": "default-src 'self'",
    }

# PLATFORM_CORE: Permission dependencies
def require_verification(verified_only: bool = True):
    """Dependency for requiring verified users."""
    def dependency(current_user = Depends(get_current_user)):
        # TODO: Add email verification field to User model
        # if verified_only and not current_user.is_email_verified:
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="Email verification required"
        #     )
        return current_user
    return dependency

def require_permissions(*permissions):
    """Dependency for requiring specific permissions."""
    def dependency(current_user = Depends(get_current_user)):
        # Basic permission check - can be extended per vertical
        for permission in permissions:
            if not current_user.has_permission(permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission required: {permission}"
                )
        return current_user
    return dependency

# PLATFORM_CORE: Two-Factor Authentication utilities
def generate_totp_secret() -> str:
    """Generate a new TOTP secret for 2FA."""
    return pyotp.random_base32()

def generate_qr_code(user_email: str, secret: str, issuer_name: str = "DentiaGest") -> str:
    """
    Generate QR code for 2FA setup.
    Returns base64 encoded PNG image.
    """
    # Create TOTP URI
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user_email,
        issuer_name=issuer_name
    )
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(totp_uri)
    qr.make(fit=True)
    
    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='PNG')
    img_str = base64.b64encode(img_buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

def verify_totp_code(secret: str, code: str, window: int = 1) -> bool:
    """
    Verify TOTP code against secret.
    Window allows for time drift (default: ±30 seconds).
    """
    if not secret or not code:
        return False
    
    try:
        totp = pyotp.TOTP(secret)
        return totp.verify(code, valid_window=window)
    except Exception:
        return False

def get_current_totp_code(secret: str) -> str:
    """Get current TOTP code for testing purposes."""
    totp = pyotp.TOTP(secret)
    return totp.now()

# PLATFORM_CORE: MFA validation dependency
def verify_mfa_if_enabled(user, mfa_code: Optional[str] = None) -> bool:
    """
    Verify MFA code if user has MFA enabled.
    Returns True if MFA is disabled or code is valid.
    """
    if not user.is_mfa_enabled or not user.mfa_secret:
        return True
    
    if not mfa_code:
        return False
    
    return verify_totp_code(user.mfa_secret, mfa_code)
