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
from datetime import datetime, date as date_type, time, timedelta
from uuid import UUID

from ..models.appointment import AppointmentStatus, AppointmentType, AppointmentPriority


# PLATFORM_EXTRACTABLE: Base appointment schemas for any business vertical
class AppointmentBase(BaseModel):
    """Base appointment schema with universal fields."""
    
    patient_id: UUID = Field(..., description="Patient ID")
    dentist_id: UUID = Field(..., description="Assigned dentist ID")
    scheduled_date: datetime = Field(..., description="Appointment start time")
    duration_minutes: int = Field(30, ge=15, le=480, description="Duration in minutes")
    appointment_type: AppointmentType = Field(..., description="Type of appointment")
    priority: AppointmentPriority = Field(AppointmentPriority.NORMAL, description="Appointment priority")
    
    # PLATFORM_CORE: Universal fields
    title: Optional[str] = Field(None, max_length=255, description="Brief title/description")
    description: Optional[str] = Field(None, max_length=1000, description="Detailed description")
    notes: Optional[str] = Field(None, max_length=2000, description="Additional notes")
    
    # DENTAL_SPECIFIC fields
    procedure_codes: Optional[str] = Field(None, max_length=500, description="Dental procedure codes")
    estimated_cost: Optional[str] = Field(None, max_length=20, description="Estimated cost")
    
    # PLATFORM_CORE: Room and resource management
    room_number: Optional[str] = Field(None, max_length=50, description="Treatment room")
    equipment_needed: Optional[str] = Field(None, max_length=500, description="Special equipment")
    
    # DENTAL_SPECIFIC: Follow-up management
    is_follow_up: bool = Field(False, description="Is this a follow-up appointment")
    parent_appointment_id: Optional[UUID] = Field(None, description="Parent appointment for follow-ups")
    next_appointment_suggested: Optional[datetime] = Field(None, description="Suggested next appointment")
    
    @field_validator('scheduled_date')
    @classmethod
    def validate_scheduled_date(cls, v):
        """Validate start time is in the future and during business hours."""
        from datetime import timezone
        now = datetime.now(timezone.utc)
        # Si v no tiene tzinfo, lo convertimos a UTC
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v <= now:
            raise ValueError('Appointment must be scheduled in the future')
        # DENTAL_SPECIFIC: Business hours validation (TEMPORARILY RELAXED)
        # TODO: Fix timezone handling in frontend
        # if v.hour < 8 or v.hour >= 18:
        #     raise ValueError('Appointments must be scheduled between 8:00 AM and 6:00 PM')
        # Allow any hour for now until timezone is fixed
        # No appointments on weekends (can be configurable later)
        if v.weekday() >= 5:  # Saturday = 5, Sunday = 6
            raise ValueError('Appointments cannot be scheduled on weekends')
        return v
    
    @field_validator('duration_minutes')
    @classmethod
    def validate_duration(cls, v, info):
        """Validate duration is appropriate for appointment type."""
        # Get appointment_type from the current validation context
        data = info.data if hasattr(info, 'data') else {}
        appointment_type = data.get('appointment_type')
        
        if appointment_type:
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

    class Config:
        from_attributes = True


class AppointmentCreate(AppointmentBase):
    """Schema for creating new appointments."""
    
    @model_validator(mode='before')
    @classmethod
    def set_defaults_and_validations(cls, values):
        """Set default values and perform cross-field validations."""
        
        # Auto-set duration based on appointment type if not provided
        if 'duration_minutes' not in values or not values['duration_minutes']:
            appointment_type = values.get('appointment_type')
            if appointment_type:
                # Import here to avoid circular imports
                default_durations = {
                    AppointmentType.CONSULTATION: 45,
                    AppointmentType.CLEANING: 60,
                    AppointmentType.CHECKUP: 30,
                    AppointmentType.FILLING: 60,
                    AppointmentType.EXTRACTION: 90,
                    AppointmentType.ROOT_CANAL: 120,
                    AppointmentType.CROWN: 90,
                    AppointmentType.BRIDGE: 120,
                    AppointmentType.IMPLANT: 180,
                    AppointmentType.ORTHODONTICS: 45,
                    AppointmentType.WHITENING: 90,
                    AppointmentType.SURGERY: 180,
                    AppointmentType.EMERGENCY: 60,
                    AppointmentType.FOLLOW_UP: 30,
                }
                values['duration_minutes'] = default_durations.get(appointment_type, 30)
        
        # Auto-set priority based on appointment type if not provided
        if 'priority' not in values or values['priority'] == AppointmentPriority.NORMAL:
            appointment_type = values.get('appointment_type')
            if appointment_type:
                priority_map = {
                    AppointmentType.EMERGENCY: AppointmentPriority.EMERGENCY,
                    AppointmentType.SURGERY: AppointmentPriority.HIGH,
                    AppointmentType.EXTRACTION: AppointmentPriority.HIGH,
                    AppointmentType.ROOT_CANAL: AppointmentPriority.HIGH,
                    AppointmentType.CONSULTATION: AppointmentPriority.NORMAL,
                    AppointmentType.FOLLOW_UP: AppointmentPriority.HIGH,
                }
                values['priority'] = priority_map.get(appointment_type, AppointmentPriority.NORMAL)
        
        return values


class AppointmentUpdate(BaseModel):
    """Schema for updating existing appointments."""
    
    scheduled_date: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=480)
    appointment_type: Optional[AppointmentType] = None
    priority: Optional[AppointmentPriority] = None
    status: Optional[AppointmentStatus] = None
    
    # PLATFORM_CORE: Universal fields
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    notes: Optional[str] = Field(None, max_length=2000)
    
    # DENTAL_SPECIFIC fields
    procedure_codes: Optional[str] = Field(None, max_length=500)
    estimated_cost: Optional[str] = Field(None, max_length=20)
    room_number: Optional[str] = Field(None, max_length=50)
    equipment_needed: Optional[str] = Field(None, max_length=500)
    
    # PLATFORM_CORE: Communication tracking
    confirmation_sent: Optional[bool] = None
    reminder_sent: Optional[bool] = None
    
    @field_validator('scheduled_date')
    @classmethod
    def validate_scheduled_date_update(cls, v):
        """Validate start time for updates (allow past times for completed appointments)."""
        from datetime import timezone
        if v:
            now = datetime.now(timezone.utc)
            if v.tzinfo is None:
                v = v.replace(tzinfo=timezone.utc)
            if v <= now:
                # Allow past times only for administrative corrections
                pass
        return v

    class Config:
        from_attributes = True


# DENTAL_SPECIFIC: Response schemas with dental practice information
class AppointmentResponse(AppointmentBase):
    """Schema for appointment responses."""
    
    id: UUID
    status: AppointmentStatus
    
    # PLATFORM_CORE: Communication tracking
    confirmation_sent: bool
    confirmation_sent_at: Optional[datetime] = None
    reminder_sent: bool
    reminder_sent_at: Optional[datetime] = None
    
    # PLATFORM_CORE: Timing tracking
    checked_in_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # PLATFORM_CORE: Cancellation tracking
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    cancelled_by: Optional[UUID] = None
    
    # PLATFORM_CORE: Audit fields
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID] = None
    
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
    start_date: Optional[date_type] = Field(None, description="Filter from this date")
    end_date: Optional[date_type] = Field(None, description="Filter until this date")
    
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
    
    @field_validator('end_date')
    @classmethod
    def validate_date_range(cls, v, info):
        """Validate end_date is after start_date."""
        data = info.data if hasattr(info, 'data') else {}
        start_date = data.get('start_date')
        
        if v and start_date:
            if v < start_date:
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
    
    date: date_type = Field(..., description="Date to check availability")
    dentist_id: Optional[UUID] = Field(None, description="Specific dentist (optional)")
    appointment_type: AppointmentType = Field(..., description="Type of appointment needed")
    duration_minutes: Optional[int] = Field(None, description="Required duration (auto-calculated if not provided)")
    
    @field_validator('date')
    @classmethod
    def validate_availability_date(cls, v):
        """Validate date is not in the past."""
        if v < date_type.today():
            raise ValueError('Cannot check availability for past dates')
        return v


class AvailabilityResponse(BaseModel):
    """Response schema for appointment availability."""
    
    date: date_type
    available_slots: List[TimeSlot]
    total_slots: int
    dentist_schedules: Dict[str, List[TimeSlot]]  # dentist_id -> available slots

    class Config:
        from_attributes = True


# DENTAL_SPECIFIC: Statistics and reporting schemas
class AppointmentStats(BaseModel):
    """Appointment statistics for reporting."""
    
    total_appointments: int
    by_status: Dict[str, int]  # Using string keys for JSON serialization
    by_type: Dict[str, int] 
    by_priority: Dict[str, int]
    
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
    
    appointment_ids: List[UUID] = Field(..., min_length=1, max_length=50)
    new_start_time: Optional[datetime] = None
    time_offset_minutes: Optional[int] = None  # Alternative: shift by X minutes
    reason: str = Field(..., max_length=500, description="Reason for rescheduling")
    
    @model_validator(mode='after')
    def validate_reschedule_method(self):
        """Ensure either new_start_time or time_offset_minutes is provided."""
        new_time = self.new_start_time
        offset = self.time_offset_minutes
        
        if not new_time and not offset:
            raise ValueError('Either new_start_time or time_offset_minutes must be provided')
        
        if new_time and offset:
            raise ValueError('Provide either new_start_time or time_offset_minutes, not both')
        
        return self


class BulkOperationResponse(BaseModel):
    """Response for bulk operations."""
    
    successful: List[UUID]
    failed: List[Dict[str, Any]]  # {appointment_id: UUID, error: str}
    total_processed: int
    success_count: int
    failure_count: int

    class Config:
        from_attributes = True
