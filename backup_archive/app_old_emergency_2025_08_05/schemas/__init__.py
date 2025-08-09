# PLATFORM_EXTRACTABLE: Schemas package initialization
"""
Schemas package for DentiaGest API validation.
Contains Pydantic schemas for request/response validation.

PLATFORM_PATTERN: This structure demonstrates the extractability pattern:
- auth.py: Universal schemas (100% extractable to PlatformGest)
- patient.py: Dental-specific schemas (0% extractable, but pattern reusable)
"""

# PLATFORM_EXTRACTABLE: Universal schemas (available in all verticals)
from .auth import (
    # User schemas
    UserBase,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    UserSearchParams,
    
    # Authentication schemas
    TokenResponse,
    RefreshTokenRequest,
    PasswordChange,
    PasswordReset,
    
    # MFA schemas
    MFASetupRequest,
    MFASetupResponse,
    MFAVerifyRequest,
    MFAVerifyResponse,
    
    # Generic schemas
    MessageResponse,
    ErrorResponse,
    PaginationParams,
    PaginatedResponse,
    ActivityLogEntry,
    ActivityLogParams
)

# DENTAL_SPECIFIC: Dental practice schemas
from .patient import (
    # Patient schemas
    PatientBase,
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientWithMedicalHistory,
    PatientSearchParams,
    PatientStatistics,
    
    # Insurance schemas
    InsuranceUpdateRequest,
    
    # Medical history schemas
    MedicalHistoryUpdate,
    
    # Consent schemas
    ConsentUpdate,
    
    # Appointment preferences
    AppointmentPreferences
)

from .appointment_simple import (
    # Appointment schemas
    AppointmentBase,
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentListResponse,
    AppointmentSearchParams,
    
    # Availability schemas
    TimeSlot,
    AvailabilityRequest,
    AvailabilityResponse,
    
    # Statistics schemas
    AppointmentStats,
    
    # Bulk operations
    BulkRescheduleRequest,
    BulkOperationResponse
)

# PLATFORM_CORE: Universal exports (will be available in all PlatformGest verticals)
__all__ = [
    # Universal user management
    "UserBase",
    "UserCreate", 
    "UserLogin",
    "UserResponse",
    "UserUpdate",
    "UserSearchParams",
    
    # Universal authentication
    "TokenResponse",
    "RefreshTokenRequest", 
    "PasswordChange",
    "PasswordReset",
    
    # Universal MFA
    "MFASetupRequest",
    "MFASetupResponse", 
    "MFAVerifyRequest",
    "MFAVerifyResponse",
    
    # Universal utilities
    "MessageResponse",
    "ErrorResponse",
    "PaginationParams", 
    "PaginatedResponse",
    "ActivityLogEntry",
    "ActivityLogParams",
    
    # DENTAL_SPECIFIC: Business vertical schemas
    "PatientBase",
    "PatientCreate",
    "PatientUpdate", 
    "PatientResponse",
    "PatientWithMedicalHistory",
    "PatientSearchParams",
    "PatientStatistics",
    "InsuranceUpdateRequest",
    "MedicalHistoryUpdate",
    "ConsentUpdate",
    "AppointmentPreferences",
    
    # Appointment schemas
    "AppointmentBase",
    "AppointmentCreate",
    "AppointmentUpdate",
    "AppointmentResponse", 
    "AppointmentListResponse",
    "AppointmentSearchParams",
    "TimeSlot",
    "AvailabilityRequest",
    "AvailabilityResponse",
    "AppointmentStats",
    "BulkRescheduleRequest",
    "BulkOperationResponse",
]

# PLATFORM_PATTERN: Future vertical schemas will follow this pattern:
# 
# VetGest schemas would include:
# - PetBase, PetCreate, PetUpdate, PetResponse
# - VaccinationRecord, MedicalTreatment
# - SpeciesEnum, BreedEnum
#
# MechaGest schemas would include:
# - VehicleBase, VehicleCreate, VehicleUpdate, VehicleResponse  
# - ServiceRecord, MaintenanceSchedule
# - MakeEnum, ModelEnum
#
# RestaurantGest schemas would include:
# - CustomerBase, CustomerCreate, CustomerUpdate, CustomerResponse
# - DietaryPreferences, AllergyInformation
# - VisitFrequency, TablePreferences
