# PLATFORM_CORE: Central models package for DentiaGest
"""
Models package for the DentiaGest application.

This package contains all database models, including:
- Platform-extractable models (User) that can be reused across all business verticals
- Dental-specific models (Patient, Appointment) specialized for dental practices

PLATFORM_EXTRACTABLE vs DENTAL_SPECIFIC:
- User model: 100% reusable across verticals (dental, veterinary, automotive)
- Patient model: Dental-specific but follows universal patient patterns
- Appointment model: Dental-specific with scheduling patterns adaptable to other verticals
"""

# Import all models to make them available at package level
from .user import User, UserRole
from .patient import Patient, BloodType, Gender, AnxietyLevel  
from .appointment import Appointment, AppointmentStatus, AppointmentType, AppointmentPriority

# Export all models and enums for easy importing
__all__ = [
    # Models
    "User",
    "Patient", 
    "Appointment",
    
    # User enums
    "UserRole",
    
    # Patient enums
    "BloodType",
    "Gender", 
    "AnxietyLevel",
    
    # Appointment enums
    "AppointmentStatus",
    "AppointmentType",
    "AppointmentPriority",
]