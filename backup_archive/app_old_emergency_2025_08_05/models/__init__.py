# PLATFORM_EXTRACTABLE: Models package initialization
"""
Models package for DentiaGest.
This structure is designed to be reusable across business verticals.
"""

from .user import User, UserRole

# PLATFORM_CORE: Universal models that will be available in all verticals
__all__ = [
    "User",
    "UserRole",
    # DENTAL_SPECIFIC exports
    "Patient",
    "BloodType", 
    "Gender",
    "InsuranceStatus",
    "Appointment",
    "AppointmentStatus",
    "AppointmentType", 
    "AppointmentPriority",
]

# DENTAL_SPECIFIC: Dental models will be imported here
from .patient import Patient, BloodType, Gender, InsuranceStatus
from .appointment import (
    Appointment, 
    AppointmentStatus, 
    AppointmentType, 
    AppointmentPriority
)
# from .treatment import Treatment
# etc.

# PLATFORM_PATTERN: Each business vertical will have its own specific models
# but will always include the universal models from PLATFORM_CORE
