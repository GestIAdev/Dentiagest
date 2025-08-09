# PLATFORM_CORE: Central schemas package for DentiaGest
"""
Schemas package for the DentiaGest application.

This package contains all Pydantic validation schemas, including:
- Platform-extractable schemas (auth, user) that can be reused across all business verticals
- Dental-specific schemas (patient, appointment) specialized for dental practices

PLATFORM_EXTRACTABLE vs DENTAL_SPECIFIC:
- Auth schemas: 100% reusable across verticals
- User schemas: 100% reusable across verticals
- Patient schemas: Dental-specific but follow universal patient patterns
- Appointment schemas: Dental-specific with scheduling patterns adaptable to other verticals
"""

# Import appointment schemas
from .appointment import (
    AppointmentBase,
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentListResponse,
    AppointmentSearchParams,
    TimeSlot,
    AvailabilityRequest,
    AvailabilityResponse,
    AppointmentStats,
    BulkRescheduleRequest,
    BulkOperationResponse
)

# Export schemas for easy importing
__all__ = [
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
