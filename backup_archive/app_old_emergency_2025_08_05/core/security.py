# PLATFORM_EXTRACTABLE: Security utilities - 95% reusable across verticals
"""
Security utilities for password hashing, JWT tokens, and authentication.
Most of this module is universal and extractable to PlatformGest.
"""

from datetime import datetime, timedelta
from typing import Optional, Any, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
import secrets
import string

from .config import settings

# PLATFORM_CORE: Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# PLATFORM_CORE: JWT Configuration
ALGORITHM = settings.jwt_algorithm
SECRET_KEY = settings.jwt_secret_key

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
    def create_refresh_token(user_id: str) -> str:
        """Create a refresh token for user."""
        token_data = {
            "sub": user_id,
            "type": "refresh"
        }
        # Refresh tokens last longer
        expires_delta = timedelta(days=30)
        return create_access_token(data=token_data, expires_delta=expires_delta)
    
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

# Additional functions needed by auth.py
def create_refresh_token(user_id: str) -> str:
    """Create a refresh token for a user."""
    session_manager = SessionManager()
    return session_manager.create_refresh_token(user_id)

def decode_token(token: str) -> dict:
    """Decode and verify a JWT token."""
    return verify_token(token)

def get_current_user(token: str = None):
    """Get current user from token - placeholder implementation."""
    if not token:
        return None
    try:
        payload = decode_token(token)
        return payload.get("sub")
    except:
        return None

def require_verification(verified_only: bool = True):
    """Decorator or dependency for requiring verified users - placeholder."""
    def dependency():
        # Placeholder implementation
        return True
    return dependency

def require_permissions(*permissions):
    """Decorator or dependency for requiring specific permissions - placeholder."""
    def dependency():
        # Placeholder implementation
        return True
    return dependency
