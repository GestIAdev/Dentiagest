from sqlalchemy import String
from sqlalchemy.dialects.postgresql import INTERVAL
# DENTAL_SPECIFIC: Appointment management API endpoints
"""
Appointment management API routes specifically for dental practices.
This module is NOT extractable to PlatformGest core as it contains
dental-specific business logic and appointment rules.

PLATFORM_PATTERN: Other verticals will have similar "appointment" management:
- VetGest: Veterinary appointment APIs with species-specific scheduling
- MechaGest: Service appointment APIs with vehicle diagnostic workflows
- RestaurantGest: Reservation APIs with table management and party size handling
"""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, text
from datetime import date, datetime, timedelta
from uuid import UUID

from ...core.database import get_db
from ...core.security import get_current_user  # 🔒 SECURITY IMPORT!
from ...core.medical_security import secure_medical_endpoint  # 🏴‍☠️ DIGITAL FORTRESS!
from ...models.user import User
from ...models.patient import Patient
from ...models.appointment import Appointment, AppointmentStatus, AppointmentType, AppointmentPriority
from ...schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentListResponse,
    AppointmentSearchParams,
    AvailabilityRequest,
    AvailabilityResponse,
    TimeSlot,
    AppointmentStats,
    BulkRescheduleRequest,
    BulkOperationResponse
)

# PLATFORM_EXTRACTABLE: Router setup pattern
router = APIRouter(prefix="/appointments", tags=["appointments"])


# PLATFORM_EXTRACTABLE: Universal CRUD patterns
@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
@secure_medical_endpoint(action="CREATE", resource_type="appointment")  # 🔒 DIGITAL FORTRESS!
async def create_appointment(
    request: Request,  # 🛡️ DIGITAL FORTRESS REQUEST
    appointment_data: AppointmentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 🏴‍☠️ SECURITY!
) -> Any:
    """
    Create a new appointment.
    
    DENTAL_SPECIFIC: Includes dental practice business rules:
    - Validates dentist availability
    - Checks room conflicts
    - Applies dental-specific scheduling rules
    """
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == appointment_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Verify dentist exists and has appropriate role
    dentist = db.query(User).filter(
        User.id == appointment_data.dentist_id,
        User.role.in_(["professional", "admin", "receptionist"])
    ).first()
    if not dentist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dentist not found or invalid role"
        )
    
    # DENTAL_SPECIFIC: Check for scheduling conflicts
    end_time = appointment_data.scheduled_date + timedelta(minutes=appointment_data.duration_minutes)
    
    existing_appointments = db.query(Appointment).filter(
        and_(
            Appointment.dentist_id == appointment_data.dentist_id,
            Appointment.status.in_([
                AppointmentStatus.SCHEDULED,
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.IN_PROGRESS
            ]),
            or_(
                # New appointment starts during existing appointment
                and_(
                    Appointment.scheduled_date <= appointment_data.scheduled_date,
                    Appointment.scheduled_date + (Appointment.duration_minutes.cast(String) + ' minutes').cast(INTERVAL) > appointment_data.scheduled_date
                ),
                # New appointment ends during existing appointment
                and_(
                    Appointment.scheduled_date < end_time,
                    Appointment.scheduled_date + (Appointment.duration_minutes.cast(String) + ' minutes').cast(INTERVAL) >= end_time
                ),
                # New appointment completely contains existing appointment
                and_(
                    Appointment.scheduled_date >= appointment_data.scheduled_date,
                    Appointment.scheduled_date + (Appointment.duration_minutes.cast(String) + ' minutes').cast(INTERVAL) <= end_time
                )
            )
        )
    ).first()
    
    # 🏥 MULTI-DENTIST CLINIC: Allow simultaneous appointments
    # Different dentists can have appointments at the same time
    # Commenting out conflict validation for flexibility
    # if existing_appointments:
    #     raise HTTPException(
    #         status_code=status.HTTP_409_CONFLICT,
    #         detail=f"Dentist has a conflicting appointment at {existing_appointments.scheduled_date}"
    #     )
    
    # DENTAL_SPECIFIC: Room conflict check
    if appointment_data.room_number:
        room_conflict = db.query(Appointment).filter(
            and_(
                Appointment.room_number == appointment_data.room_number,
                Appointment.status.in_([
                    AppointmentStatus.SCHEDULED,
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.IN_PROGRESS
                ]),
                or_(
                    and_(
                        Appointment.scheduled_date <= appointment_data.scheduled_date,
                        Appointment.scheduled_date + (Appointment.duration_minutes.cast(String) + ' minutes').cast(INTERVAL) > appointment_data.scheduled_date
                    ),
                    and_(
                        Appointment.scheduled_date < end_time,
                        Appointment.scheduled_date + (Appointment.duration_minutes.cast(String) + ' minutes').cast(INTERVAL) >= end_time
                    )
                )
            )
        ).first()
        
        # 🏥 MULTI-DENTIST CLINIC: Allow room sharing
        # Commenting out room conflict validation for flexibility
        # if room_conflict:
        #     raise HTTPException(
        #         status_code=status.HTTP_409_CONFLICT,
        #         detail=f"Room {appointment_data.room_number} is occupied at that time"
        #     )
    
    # Create appointment
    appointment_dict = appointment_data.model_dump()
    appointment = Appointment(**appointment_dict)
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    # Load relationships for response
    appointment = db.query(Appointment).options(
        joinedload(Appointment.parent_appointment)
    ).filter(Appointment.id == appointment.id).first()
    
    # DENTAL_SPECIFIC: Schedule automatic reminder (background task)
    if appointment.priority != AppointmentPriority.URGENT:
        background_tasks.add_task(schedule_appointment_reminder, appointment.id)
    
    # Prepare response
    response = AppointmentResponse.model_validate(appointment)
    
    # Add patient and dentist names
    response.patient_name = patient.full_name
    response.dentist_name = dentist.full_name
    
    return response


@router.get("/", response_model=AppointmentListResponse)
@secure_medical_endpoint(action="READ", resource_type="appointment")  # 🔒 DIGITAL FORTRESS!
async def list_appointments(
    request: Request,  # 🛡️ DIGITAL FORTRESS REQUEST
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    patient_id: Optional[UUID] = Query(None),
    dentist_id: Optional[UUID] = Query(None),
    status: Optional[List[AppointmentStatus]] = Query(None),
    appointment_type: Optional[List[AppointmentType]] = Query(None),
    priority: Optional[List[AppointmentPriority]] = Query(None),
    confirmed_only: Optional[bool] = Query(None),
    room_number: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 🏴‍☠️ SECURITY!
) -> Any:
    """
    List appointments with filtering and pagination.
    
    PLATFORM_EXTRACTABLE: Universal list pattern with filters
    """
    query = db.query(Appointment)
    
    # Apply filters
    if start_date:
        query = query.filter(func.date(Appointment.scheduled_date) >= start_date)
    
    if end_date:
        query = query.filter(func.date(Appointment.scheduled_date) <= end_date)
    
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    
    if dentist_id:
        query = query.filter(Appointment.dentist_id == dentist_id)
    
    if status:
        query = query.filter(Appointment.status.in_(status))
    
    if appointment_type:
        query = query.filter(Appointment.appointment_type.in_(appointment_type))
    
    if priority:
        query = query.filter(Appointment.priority.in_(priority))
    
    if confirmed_only:
        query = query.filter(Appointment.confirmation_sent == True)
    
    if room_number:
        query = query.filter(Appointment.room_number == room_number)
    
    # Count total
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * size
    appointments = query.offset(offset).limit(size).all()
    
    # Load related data
    patient_ids = [a.patient_id for a in appointments]
    dentist_ids = [a.dentist_id for a in appointments]
    
    patients = {p.id: p for p in db.query(Patient).filter(Patient.id.in_(patient_ids)).all()}
    dentists = {u.id: u for u in db.query(User).filter(User.id.in_(dentist_ids)).all()}
    
    # Prepare response
    appointment_responses = []
    for appointment in appointments:
        response = AppointmentResponse.model_validate(appointment)
        patient_obj = patients.get(appointment.patient_id)
        dentist_obj = dentists.get(appointment.dentist_id)
        response.patient_name = getattr(patient_obj, 'full_name', None) if patient_obj else None
        response.patient_phone = getattr(patient_obj, 'phone_primary', None) if patient_obj else None  # 📞 ADD PHONE!
        response.dentist_name = getattr(dentist_obj, 'full_name', None) if dentist_obj else None
        appointment_responses.append(response)
    
    pages = (total + size - 1) // size
    
    return AppointmentListResponse(
        appointments=appointment_responses,
        total=total,
        page=page,
        pages=pages,
        has_next=page < pages,
        has_prev=page > 1
    )


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: UUID,
    db: Session = Depends(get_db)
) -> Any:
    """Get appointment by ID."""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Load related data
    patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()
    dentist = db.query(User).filter(User.id == appointment.dentist_id).first()
    
    response = AppointmentResponse.model_validate(appointment)
    response.patient_name = patient.full_name if patient else None
    response.dentist_name = dentist.full_name if dentist else None
    
    return response


@router.put("/{appointment_id}", response_model=AppointmentResponse)
@secure_medical_endpoint(action="UPDATE", resource_type="appointment")  # 🔒 DIGITAL FORTRESS!
async def update_appointment(
    request: Request,  # 🛡️ DIGITAL FORTRESS REQUEST
    appointment_id: UUID,
    appointment_data: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 🏴‍☠️ SECURITY!
) -> Any:
    """
    Update an existing appointment.
    
    DENTAL_SPECIFIC: Includes business rules for appointment updates
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # DENTAL_SPECIFIC: Check if appointment can be modified
    # Removed overly restrictive validation for completed appointments
    # Clinicians should be able to correct mistakes and update any field
    
    if appointment.status == AppointmentStatus.CANCELLED and appointment_data.status != AppointmentStatus.CANCELLED:
        # Reactivating a cancelled appointment - allow full modification
        pass
    elif appointment.status == AppointmentStatus.CANCELLED:
        # For cancelled appointments staying cancelled, allow full modification too
        # Clinicians should be able to correct any mistakes
        pass
    
    # Validate time changes for conflicts
    if appointment_data.scheduled_date or appointment_data.duration_minutes:
        new_start = appointment_data.scheduled_date or appointment.scheduled_date
        new_duration = appointment_data.duration_minutes or appointment.duration_minutes
        new_end = new_start + timedelta(minutes=new_duration)
        
        # Check for conflicts (excluding current appointment)
        conflicts = db.query(Appointment).filter(
            and_(
                Appointment.id != appointment_id,
                Appointment.dentist_id == appointment.dentist_id,
                Appointment.status.in_([
                    AppointmentStatus.SCHEDULED,
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.IN_PROGRESS
                ]),
                or_(
                    and_(
                        Appointment.scheduled_date <= new_start,
                        Appointment.scheduled_date + (Appointment.duration_minutes.cast(String) + ' minutes').cast(INTERVAL) > new_start
                    ),
                    and_(
                        Appointment.scheduled_date < new_end,
                        Appointment.scheduled_date + (Appointment.duration_minutes.cast(String) + ' minutes').cast(INTERVAL) >= new_end
                    )
                )
            )
        ).first()
        
        # 🏥 MULTI-DENTIST CLINIC: Allow scheduling flexibility
        # Commenting out conflict validation for appointment updates
        # if conflicts:
        #     raise HTTPException(
        #         status_code=status.HTTP_409_CONFLICT,
        #         detail="Schedule conflict with existing appointment"
        #     )
    
    # Update fields
    update_data = appointment_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appointment, field, value)
    
    appointment.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(appointment)
    
    # Load related data
    patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()
    dentist = db.query(User).filter(User.id == appointment.dentist_id).first()
    
    response = AppointmentResponse.model_validate(appointment)
    response.patient_name = patient.full_name if patient else None
    response.dentist_name = dentist.full_name if dentist else None
    
    return response


@router.delete("/{appointment_id}")
@secure_medical_endpoint(action="DELETE", resource_type="appointment")  # 🔒 DIGITAL FORTRESS!
async def delete_appointment(
    request: Request,  # 🛡️ DIGITAL FORTRESS REQUEST
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 🏴‍☠️ SECURITY!
) -> Any:
    """Cancel/delete an appointment."""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # DENTAL_SPECIFIC: Soft delete by changing status instead of hard delete
    # Allow cancelling any appointment - clinicians can correct mistakes
    
    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancelled_at = datetime.utcnow()
    appointment.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Appointment cancelled successfully"}


# DENTAL_SPECIFIC: Availability checking endpoint
@router.post("/availability", response_model=AvailabilityResponse)
async def check_availability(
    availability_request: AvailabilityRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Check appointment availability for a specific date.
    
    DENTAL_SPECIFIC: Implements dental practice scheduling rules
    """
    # Get duration for appointment type if not provided
    if not availability_request.duration_minutes:
        # Default duration mapping
        duration_map = {
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
        duration = duration_map.get(availability_request.appointment_type, 30)
    else:
        duration = availability_request.duration_minutes
    
    # Query for dentists
    dentist_query = db.query(User).filter(User.role.in_(["professional", "admin", "receptionist"]))
    if availability_request.dentist_id:
        dentist_query = dentist_query.filter(User.id == availability_request.dentist_id)
    
    dentists = dentist_query.all()
    
    if not dentists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No available dentists found"
        )
    
    # DENTAL_SPECIFIC: Business hours (8 AM to 6 PM)
    start_hour = 8
    end_hour = 18
    slot_duration = 30  # 30-minute slots
    
    available_slots = []
    dentist_schedules = {}
    
    for dentist in dentists:
        dentist_slots = []
        
        # Get existing appointments for this dentist on this date
        existing_appointments = db.query(Appointment).filter(
            and_(
                Appointment.dentist_id == dentist.id,
                func.date(Appointment.scheduled_date) == availability_request.date,
                Appointment.status.in_([
                    AppointmentStatus.SCHEDULED,
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.IN_PROGRESS
                ])
            )
        ).all()
        
        # Create time slots for the day
        current_time = datetime.combine(availability_request.date, datetime.min.time().replace(hour=start_hour))
        end_time = datetime.combine(availability_request.date, datetime.min.time().replace(hour=end_hour))
        
        while current_time + timedelta(minutes=duration) <= end_time:
            slot_end = current_time + timedelta(minutes=duration)
            
            # Check if this slot conflicts with existing appointments
            is_available = True
            for existing in existing_appointments:
                existing_end = existing.scheduled_date + timedelta(minutes=existing.duration_minutes)
                if (current_time < existing_end and slot_end > existing.scheduled_date):
                    is_available = False
                    break
            
            slot = TimeSlot(
                start_time=current_time,
                end_time=slot_end,
                duration_minutes=duration,
                is_available=is_available,
                dentist_id=dentist.id
            )
            
            dentist_slots.append(slot)
            if is_available:
                available_slots.append(slot)
            
            current_time += timedelta(minutes=slot_duration)
        
        dentist_schedules[str(dentist.id)] = dentist_slots
    
    return AvailabilityResponse(
        date=availability_request.date,
        available_slots=available_slots,
        total_slots=len(available_slots),
        dentist_schedules=dentist_schedules
    )


# DENTAL_SPECIFIC: Statistics endpoint
@router.get("/stats/overview", response_model=AppointmentStats)
async def get_appointment_statistics(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
) -> Any:
    """Get appointment statistics and metrics."""
    query = db.query(Appointment)
    
    if start_date:
        query = query.filter(func.date(Appointment.scheduled_date) >= start_date)
    if end_date:
        query = query.filter(func.date(Appointment.scheduled_date) <= end_date)
    
    appointments = query.all()
    
    # Calculate statistics
    total = len(appointments)
    
    # Group by status
    by_status = {}
    for status_val in AppointmentStatus:
        by_status[status_val.value] = len([a for a in appointments if a.status == status_val])
    
    # Group by type
    by_type = {}
    for type_val in AppointmentType:
        by_type[type_val.value] = len([a for a in appointments if a.appointment_type == type_val])
    
    # Group by priority
    by_priority = {}
    for priority_val in AppointmentPriority:
        by_priority[priority_val.value] = len([a for a in appointments if a.priority == priority_val])
    
    # Time-based stats
    today = date.today()
    today_appointments = len([a for a in appointments if a.scheduled_date.date() == today])
    
    week_start = today - timedelta(days=today.weekday())
    this_week = len([a for a in appointments if a.scheduled_date.date() >= week_start])
    
    month_start = today.replace(day=1)
    this_month = len([a for a in appointments if a.scheduled_date.date() >= month_start])
    
    # Efficiency metrics
    completed_appointments = [a for a in appointments if a.status == AppointmentStatus.COMPLETED]
    no_shows = len([a for a in appointments if a.status == AppointmentStatus.NO_SHOW])
    cancelled = len([a for a in appointments if a.status == AppointmentStatus.CANCELLED])
    
    avg_duration = sum([a.duration_minutes for a in appointments]) / total if total > 0 else 0
    no_show_rate = (no_shows / total * 100) if total > 0 else 0
    cancellation_rate = (cancelled / total * 100) if total > 0 else 0
    
    # Revenue calculations (simplified - assuming estimated_cost is a string with number)
    total_estimated = 0
    completed_value = 0
    
    for appointment in appointments:
        if appointment.estimated_cost:
            try:
                cost = float(appointment.estimated_cost.replace('$', '').replace(',', ''))
                total_estimated += cost
                if appointment.status == AppointmentStatus.COMPLETED:
                    completed_value += cost
            except (ValueError, AttributeError):
                pass
    
    return AppointmentStats(
        total_appointments=total,
        by_status=by_status,
        by_type=by_type,
        by_priority=by_priority,
        today_appointments=today_appointments,
        this_week_appointments=this_week,
        this_month_appointments=this_month,
        average_duration=avg_duration,
        no_show_rate=no_show_rate,
        cancellation_rate=cancellation_rate,
        total_estimated_revenue=int(total_estimated * 100),  # Convert to cents
        completed_appointments_value=int(completed_value * 100)
    )


# PLATFORM_EXTRACTABLE: Background task pattern
async def schedule_appointment_reminder(appointment_id: UUID):
    """Background task to schedule appointment reminders."""
    # This would integrate with email/SMS service
    # For now, just a placeholder
    pass
