# PLATFORM_EXTRACTABLE: User model - 100% reusable across all business verticals
"""
User model for authentication and role management.
This model is designed to be universal and can be used across
dental, veterinary, mechanic, and any other business vertical.
"""

from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base

# PLATFORM_CORE: User roles enum - configurable per business vertical
class UserRole(enum.Enum):
    """
    User roles in the system - SIMPLIFIED FOR LEGAL COMPLIANCE.
    
    DENTAL LEGAL FRAMEWORK:
    - PROFESSIONAL: Has medical data access (doctors, qualified assistants)
    - ADMIN: System administrator (clinic owner/manager) 
    - RECEPTIONIST: Front desk, administrative documents only
    
    NOTE: If assistant has medical data access by law, they get PROFESSIONAL role.
    """
    admin = "admin"                    # System administrator
    professional = "professional"     # Medical professionals (dentist + qualified assistants)
    receptionist = "receptionist"     # Front desk/reception (admin docs only)
    
    # REMOVED: assistant (merged into professional if has medical access)
    # VETERINARY_SPECIFIC roles could be: vet_tech, groomer
    # MECHANIC_SPECIFIC roles could be: diagnostician, parts_manager

# PLATFORM_EXTRACTABLE: Complete User model
class User(Base):
    """
    Universal User model for all business verticals.
    
    This model contains all the essential fields needed for user management
    across different business types. No sector-specific fields are included,
    making it 100% reusable in PlatformGest.
    """
    __tablename__ = "users"
    
    # PLATFORM_CORE: Primary identification
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        comment="Unique identifier for the user"
    )
    
    # PLATFORM_CORE: Authentication fields
    username = Column(
        String(255), 
        unique=True, 
        nullable=False,
        index=True,
        comment="Unique username for login"
    )
    
    email = Column(
        String(255), 
        unique=True, 
        nullable=False,
        index=True,
        comment="User email address"
    )
    
    password_hash = Column(
        String(255), 
        nullable=False,
        comment="Hashed password using bcrypt"
    )
    
    # PLATFORM_CORE: User status and permissions
    is_active = Column(
        Boolean, 
        default=True, 
        nullable=False,
        comment="Whether the user account is active"
    )
    
    is_admin = Column(
        Boolean, 
        default=False, 
        nullable=False,
        comment="Whether user has admin privileges"
    )
    
    role = Column(
        SQLEnum(UserRole),
        nullable=False,
        default=UserRole.receptionist,
        comment="User role in the system"
    )
    
    # PLATFORM_CORE: Multi-Factor Authentication
    is_mfa_enabled = Column(
        Boolean, 
        default=False, 
        nullable=False,
        comment="Whether MFA is enabled for this user"
    )
    
    mfa_secret = Column(
        String(255),
        nullable=True,
        comment="Secret key for MFA (TOTP)"
    )
    
    # PLATFORM_CORE: Personal information
    first_name = Column(
        String(255),
        nullable=True,
        comment="User's first name"
    )
    
    last_name = Column(
        String(255),
        nullable=True,
        comment="User's last name"
    )
    
    phone = Column(
        String(50),
        nullable=True,
        comment="User's phone number"
    )
    
    # PLATFORM_CORE: Session and security tracking
    last_login = Column(
        DateTime,
        nullable=True,
        comment="Timestamp of last successful login"
    )
    
    login_attempts = Column(
        "login_attempts",
        String(10),
        default="0",
        comment="Number of failed login attempts"
    )
    
    is_locked = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether the account is locked due to failed login attempts"
    )
    
    password_changed_at = Column(
        DateTime,
        default=datetime.utcnow,
        comment="When password was last changed"
    )
    
    # PLATFORM_CORE: Audit fields - essential for all business types
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        comment="When the user was created"
    )
    
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        comment="When the user was last updated"
    )
    
    created_by = Column(
        UUID(as_uuid=True),
        nullable=True,
        comment="ID of user who created this account"
    )
    
    # PLATFORM_CORE: Soft deletion
    deleted_at = Column(
        DateTime,
        nullable=True,
        comment="When the user was soft deleted"
    )
    
    # PLATFORM_CONFIGURABLE: Relationships will vary per business vertical
    # These will be defined in sector-specific models:
    # - DentiaGest: patients, appointments, treatments
    # - VetGest: pets, appointments, medical_records  
    # - MechaGest: vehicles, work_orders, estimates
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, role={self.role})>"
    
    # PLATFORM_CORE: Universal user methods
    @property
    def full_name(self) -> str:
        """Get user's full name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        else:
            return self.username
    
    @property
    def is_professional(self) -> bool:
        """Check if user is a main professional (dentist/vet/mechanic)."""
        return self.role == UserRole.professional
    
    @property
    def can_manage_users(self) -> bool:
        """Check if user can manage other users."""
        return self.is_admin or self.role == UserRole.admin
    
    def has_permission(self, permission: str) -> bool:
        """
        Check if user has specific permission.
        This method can be extended per business vertical.
        """
        # PLATFORM_CONFIGURABLE: Permission logic per sector
        if self.is_admin:
            return True
            
        # Basic role-based permissions
        role_permissions = {
            UserRole.admin: ["*"],  # All permissions
            UserRole.professional: ["read_patients", "write_patients", "read_appointments", "write_appointments"],
            UserRole.assistant: ["read_patients", "read_appointments", "write_appointments"],
            UserRole.receptionist: ["read_patients", "write_patients", "read_appointments", "write_appointments"]
        }
        
        user_permissions = role_permissions.get(self.role, [])
        return "*" in user_permissions or permission in user_permissions
    
    # PLATFORM_CORE: Authentication utility methods
    def get_current_time(self) -> datetime:
        """Get current UTC time."""
        return datetime.utcnow()
    
    def update_last_login(self) -> None:
        """Update the last login timestamp."""
        self.last_login = self.get_current_time()
    
    def reset_failed_login_attempts(self) -> None:
        """Reset failed login attempts counter."""
        self.login_attempts = "0"
    
    @property
    def failed_login_attempts(self) -> int:
        """Get failed login attempts as integer."""
        try:
            return int(self.login_attempts or "0")
        except (ValueError, TypeError):
            return 0
    
    @failed_login_attempts.setter  
    def failed_login_attempts(self, value: int) -> None:
        """Set failed login attempts from integer."""
        self.login_attempts = str(value)
    
    @property
    def last_login_at(self) -> datetime:
        """Alias for last_login to match auth API expectations."""
        return self.last_login
    
    @last_login_at.setter
    def last_login_at(self, value: datetime) -> None:
        """Set last_login via alias."""
        self.last_login = value
