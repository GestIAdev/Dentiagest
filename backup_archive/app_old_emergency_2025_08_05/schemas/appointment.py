# DENTAL_SPECIFIC: Appointment schemas for dental practice management
"""
Pydantic schemas for appointment management in dental practices.
This module is NOT extractable to PlatformGest core as it contains
dental-specific validation rules and business logic.

PLATFORM_PATTERN: Other verticals will have similar "appointment" schemas:
- VetGest: Veterinary appointment schemas with species-specific validations
- MechaGest: Service appointment schemas with vehicle diagnostic rules
- RestaurantGest: Reservation schemas with party size and dietary restrictions
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime, date, time, timedelta
from uuid import UUID

from ..models.appointment import AppointmentStatus, AppointmentType, AppointmentPriority


# PLATFORM_EXTRACTABLE: Base appointment schemas for any business vertical
class AppointmentBase(BaseModel):
    """Base appointment schema with universal fields."""
    
    patient_id: UUID = Field(..., description="Patient ID")
    dentist_id: UUID = Field(..., description="Assigned dentist ID")
    start_time: datetime = Field(..., description="Appointment start time")
    duration_minutes: int = Field(30, ge=15, le=480, description="Duration in minutes")
    appointment_type: AppointmentType = Field(..., description="Type of appointment")
    priority: AppointmentPriority = Field(AppointmentPriority.NORMAL, description="Appointment priority")
    
    # DENTAL_SPECIFIC fields
    chief_complaint: Optional[str] = Field(None, max_length=500, description="Patient's main concern")
    tooth_numbers: Optional[str] = Field(None, max_length=255, description="Affected teeth numbers")
    room_number: Optional[str] = Field(None, max_length=10, description="Treatment room")
    equipment_needed: Optional[str] = Field(None, max_length=255, description="Special equipment")
    
    # Administrative fields
    insurance_pre_auth: Optional[str] = Field(None, max_length=100, description="Pre-authorization number")
    estimated_cost: Optional[int] = Field(None, ge=0, description="Estimated cost in cents")
    
    # Follow-up management
    is_follow_up: bool = Field(False, description="Is this a follow-up appointment")
    parent_appointment_id: Optional[UUID] = Field(None, description="Parent appointment for follow-ups")
    
    @field_validator('start_time')
    @classmethod
    def validate_start_time(cls, v):
        """Validate start time is in the future and during business hours."""
        if v <= datetime.now():
            raise ValueError('Appointment must be scheduled in the future')
        
        # DENTAL_SPECIFIC: Business hours validation (8:00 AM - 6:00 PM)
        if v.hour < 8 or v.hour >= 18:
            raise ValueError('Appointments must be scheduled between 8:00 AM and 6:00 PM')
        
        # No appointments on weekends (can be configurable later)
        if v.weekday() >= 5:  # Saturday = 5, Sunday = 6
            raise ValueError('Appointments cannot be scheduled on weekends')
        
        return v
    
    @field_validator('duration_minutes')
    @classmethod
    def validate_duration(cls, v, values):
        """Validate duration is appropriate for appointment type."""
        if 'appointment_type' in values:
            appointment_type = values['appointment_type']
            min_duration = {
                AppointmentType.EMERGENCY: 15,
                AppointmentType.FOLLOW_UP: 15,
                AppointmentType.CHECKUP: 30,
                AppointmentType.CONSULTATION: 30,
                AppointmentType.CLEANING: 45,
                AppointmentType.FILLING: 45,
                AppointmentType.EXTRACTION: 60,
                AppointmentType.CROWN: 60,
                AppointmentType.ORTHODONTICS: 45,
                AppointmentType.ROOT_CANAL: 90,
                AppointmentType.SURGERY: 120,
            }
            
            min_required = min_duration.get(appointment_type, 30)
            if v < min_required:
                raise ValueError(f'{appointment_type.value} appointments require at least {min_required} minutes')
        
        return v
    
    @validator('tooth_numbers')
    def validate_tooth_numbers(cls, v):
        """Validate tooth numbers format."""
        if v:
            # DENTAL_SPECIFIC: Tooth numbering validation (1-32 for adults)
            teeth = [t.strip() for t in v.split(',')]
            for tooth in teeth:
                try:
                    tooth_num = int(tooth)
                    if tooth_num < 1 or tooth_num > 32:
                        raise ValueError(f'Invalid tooth number: {tooth_num}. Must be between 1-32')
                except ValueError:
                    raise ValueError(f'Invalid tooth number format: {tooth}')
        return v

    class Config:
        from_attributes = True


class AppointmentCreate(AppointmentBase):
    """Schema for creating new appointments."""
    
    # Automatically calculate end_time and set defaults
    @root_validator
    def set_defaults_and_validations(cls, values):
        """Set default values and perform cross-field validations."""
        
        # Auto-set duration based on appointment type if not provided
        if 'duration_minutes' not in values or not values['duration_minutes']:
            appointment_type = values.get('appointment_type')
            if appointment_type:
                from ..models.appointment import Appointment
                values['duration_minutes'] = Appointment.get_default_duration(appointment_type)
        
        # Auto-set priority based on appointment type if not provided
        if 'priority' not in values or values['priority'] == AppointmentPriority.NORMAL:
            appointment_type = values.get('appointment_type')
            if appointment_type:
                from ..models.appointment import Appointment
                values['priority'] = Appointment.get_recommended_priority(appointment_type)
        
        return values


class AppointmentUpdate(BaseModel):
    """Schema for updating existing appointments."""
    
    start_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=480)
    appointment_type: Optional[AppointmentType] = None
    priority: Optional[AppointmentPriority] = None
    status: Optional[AppointmentStatus] = None
    
    # DENTAL_SPECIFIC fields
    chief_complaint: Optional[str] = Field(None, max_length=500)
    treatment_notes: Optional[str] = Field(None, max_length=2000)
    tooth_numbers: Optional[str] = Field(None, max_length=255)
    room_number: Optional[str] = Field(None, max_length=10)
    equipment_needed: Optional[str] = Field(None, max_length=255)
    
    # Administrative updates
    confirmation_status: Optional[bool] = None
    reminder_sent: Optional[bool] = None
    insurance_pre_auth: Optional[str] = Field(None, max_length=100)
    estimated_cost: Optional[int] = Field(None, ge=0)
    
    @validator('start_time')
    def validate_start_time_update(cls, v):
        """Validate start time for updates (allow past times for completed appointments)."""
        if v and v <= datetime.now():
            # Allow past times only for administrative corrections
            pass
        return v

    class Config:
        from_attributes = True


# DENTAL_SPECIFIC: Response schemas with dental practice information
class AppointmentResponse(AppointmentBase):
    """Schema for appointment responses."""
    
    id: UUID
    end_time: datetime
    status: AppointmentStatus
    confirmation_status: bool
    reminder_sent: bool
    treatment_notes: Optional[str] = None
    next_appointment_recommended: bool
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    created_by: UUID
    
    # Nested patient and dentist info (basic)
    patient_name: Optional[str] = None
    dentist_name: Optional[str] = None

    class Config:
        from_attributes = True


class AppointmentListResponse(BaseModel):
    """Schema for appointment list with pagination."""
    
    appointments: List[AppointmentResponse]
    total: int
    page: int
    pages: int
    has_next: bool
    has_prev: bool

    class Config:
        from_attributes = True


# PLATFORM_EXTRACTABLE: Search and filter schemas
class AppointmentSearchParams(BaseModel):
    """Search parameters for appointments."""
    
    # Date filtering
    start_date: Optional[date] = Field(None, description="Filter from this date")
    end_date: Optional[date] = Field(None, description="Filter until this date")
    
    # Entity filtering
    patient_id: Optional[UUID] = Field(None, description="Filter by patient")
    dentist_id: Optional[UUID] = Field(None, description="Filter by dentist")
    
    # Status filtering
    status: Optional[List[AppointmentStatus]] = Field(None, description="Filter by status")
    appointment_type: Optional[List[AppointmentType]] = Field(None, description="Filter by type")
    priority: Optional[List[AppointmentPriority]] = Field(None, description="Filter by priority")
    
    # Administrative filters
    confirmed_only: Optional[bool] = Field(None, description="Show only confirmed appointments")
    room_number: Optional[str] = Field(None, description="Filter by room")
    
    # Pagination
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(50, ge=1, le=100, description="Page size")
    
    @validator('end_date')
    def validate_date_range(cls, v, values):
        """Validate end_date is after start_date."""
        if v and 'start_date' in values and values['start_date']:
            if v < values['start_date']:
                raise ValueError('end_date must be after start_date')
        return v


# DENTAL_SPECIFIC: Appointment availability schemas
class TimeSlot(BaseModel):
    """Available time slot for appointments."""
    
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    is_available: bool
    dentist_id: UUID
    room_number: Optional[str] = None

    class Config:
        from_attributes = True


class AvailabilityRequest(BaseModel):
    """Request schema for checking appointment availability."""
    
    date: date = Field(..., description="Date to check availability")
    dentist_id: Optional[UUID] = Field(None, description="Specific dentist (optional)")
    appointment_type: AppointmentType = Field(..., description="Type of appointment needed")
    duration_minutes: Optional[int] = Field(None, description="Required duration (auto-calculated if not provided)")
    
    @validator('date')
    def validate_availability_date(cls, v):
        """Validate date is not in the past."""
        if v < date.today():
            raise ValueError('Cannot check availability for past dates')
        return v


class AvailabilityResponse(BaseModel):
    """Response schema for appointment availability."""
    
    date: date
    available_slots: List[TimeSlot]
    total_slots: int
    dentist_schedules: Dict[str, List[TimeSlot]]  # dentist_id -> available slots

    class Config:
        from_attributes = True


# DENTAL_SPECIFIC: Statistics and reporting schemas
class AppointmentStats(BaseModel):
    """Appointment statistics for reporting."""
    
    total_appointments: int
    by_status: Dict[AppointmentStatus, int]
    by_type: Dict[AppointmentType, int] 
    by_priority: Dict[AppointmentPriority, int]
    
    # Time-based stats
    today_appointments: int
    this_week_appointments: int 
    this_month_appointments: int
    
    # Efficiency metrics
    average_duration: float
    no_show_rate: float
    cancellation_rate: float
    
    # Revenue-related
    total_estimated_revenue: int  # in cents
    completed_appointments_value: int  # in cents

    class Config:
        from_attributes = True


# DENTAL_SPECIFIC: Bulk operations schemas
class BulkRescheduleRequest(BaseModel):
    """Schema for bulk rescheduling appointments."""
    
    appointment_ids: List[UUID] = Field(..., min_items=1, max_items=50)
    new_start_time: Optional[datetime] = None
    time_offset_minutes: Optional[int] = None  # Alternative: shift by X minutes
    reason: str = Field(..., max_length=500, description="Reason for rescheduling")
    
    @root_validator
    def validate_reschedule_method(cls, values):
        """Ensure either new_start_time or time_offset_minutes is provided."""
        new_time = values.get('new_start_time')
        offset = values.get('time_offset_minutes')
        
        if not new_time and not offset:
            raise ValueError('Either new_start_time or time_offset_minutes must be provided')
        
        if new_time and offset:
            raise ValueError('Provide either new_start_time or time_offset_minutes, not both')
        
        return values


class BulkOperationResponse(BaseModel):
    """Response for bulk operations."""
    
    successful: List[UUID]
    failed: List[Dict[str, Any]]  # {appointment_id: UUID, error: str}
    total_processed: int
    success_count: int
    failure_count: int

    class Config:
        from_attributes = True
