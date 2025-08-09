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
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, text
from datetime import date, datetime, timedelta
from uuid import UUID

from ..core.database import get_db
from ..core.security import get_current_user, require_permissions
from ..models.user import User
from ..models.patient import Patient
from ..models.appointment import Appointment, AppointmentStatus, AppointmentType, AppointmentPriority
from ..schemas.appointment_simple import (
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
from ..schemas.auth import MessageResponse

# PLATFORM_EXTRACTABLE: Router setup pattern
router = APIRouter(prefix="/appointments", tags=["appointments"])


# PLATFORM_EXTRACTABLE: Universal CRUD patterns
@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_data: AppointmentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
        User.role.in_(["professional", "admin"])
    ).first()
    if not dentist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dentist not found or invalid role"
        )
    
    # DENTAL_SPECIFIC: Check for scheduling conflicts
    end_time = appointment_data.start_time + timedelta(minutes=appointment_data.duration_minutes)
    
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
                    Appointment.start_time <= appointment_data.start_time,
                    Appointment.end_time > appointment_data.start_time
                ),
                # New appointment ends during existing appointment
                and_(
                    Appointment.start_time < end_time,
                    Appointment.end_time >= end_time
                ),
                # New appointment completely contains existing appointment
                and_(
                    Appointment.start_time >= appointment_data.start_time,
                    Appointment.end_time <= end_time
                )
            )
        )
    ).first()
    
    if existing_appointments:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Dentist has a conflicting appointment at {existing_appointments.start_time}"
        )
    
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
                        Appointment.start_time <= appointment_data.start_time,
                        Appointment.end_time > appointment_data.start_time
                    ),
                    and_(
                        Appointment.start_time < end_time,
                        Appointment.end_time >= end_time
                    )
                )
            )
        ).first()
        
        if room_conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Room {appointment_data.room_number} is occupied at that time"
            )
    
    # Create appointment
    appointment = Appointment(
        **appointment_data.dict(),
        end_time=end_time,
        created_by=current_user.id
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    # Load relationships for response
    appointment = db.query(Appointment).options(
        joinedload(Appointment.patient),
        joinedload(Appointment.dentist)
    ).filter(Appointment.id == appointment.id).first()
    
    # DENTAL_SPECIFIC: Schedule automatic reminder (background task)
    if appointment.priority != AppointmentPriority.URGENT:
        background_tasks.add_task(schedule_appointment_reminder, appointment.id)
    
    # Prepare response
    response = AppointmentResponse.from_orm(appointment)
    response.patient_name = appointment.patient.full_name if appointment.patient else None
    response.dentist_name = appointment.dentist.full_name if appointment.dentist else None
    
    return response


@router.get("/", response_model=AppointmentListResponse)
async def list_appointments(
    search_params: AppointmentSearchParams = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    List appointments with filtering and pagination.
    
    PLATFORM_EXTRACTABLE: Universal list pattern with filters
    """
    query = db.query(Appointment).options(
        joinedload(Appointment.patient),
        joinedload(Appointment.dentist)
    )
    
    # Apply filters
    if search_params.start_date:
        query = query.filter(Appointment.start_time >= search_params.start_date)
    
    if search_params.end_date:
        query = query.filter(Appointment.start_time <= search_params.end_date)
    
    if search_params.patient_id:
        query = query.filter(Appointment.patient_id == search_params.patient_id)
    
    if search_params.dentist_id:
        query = query.filter(Appointment.dentist_id == search_params.dentist_id)
    
    if search_params.status:
        query = query.filter(Appointment.status.in_(search_params.status))
    
    if search_params.appointment_type:
        query = query.filter(Appointment.appointment_type.in_(search_params.appointment_type))
    
    if search_params.priority:
        query = query.filter(Appointment.priority.in_(search_params.priority))
    
    if search_params.confirmed_only:
        query = query.filter(Appointment.confirmation_status == True)
    
    if search_params.room_number:
        query = query.filter(Appointment.room_number == search_params.room_number)
    
    # Count total
    total = query.count()
    
    # Apply pagination
    offset = (search_params.page - 1) * search_params.size
    appointments = query.offset(offset).limit(search_params.size).all()
    
    # Prepare response
    appointment_responses = []
    for appointment in appointments:
        response = AppointmentResponse.from_orm(appointment)
        response.patient_name = appointment.patient.full_name if appointment.patient else None
        response.dentist_name = appointment.dentist.full_name if appointment.dentist else None
        appointment_responses.append(response)
    
    pages = (total + search_params.size - 1) // search_params.size
    
    return AppointmentListResponse(
        appointments=appointment_responses,
        total=total,
        page=search_params.page,
        pages=pages,
        has_next=search_params.page < pages,
        has_prev=search_params.page > 1
    )


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get appointment by ID."""
    appointment = db.query(Appointment).options(
        joinedload(Appointment.patient),
        joinedload(Appointment.dentist)
    ).filter(Appointment.id == appointment_id).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    response = AppointmentResponse.from_orm(appointment)
    response.patient_name = appointment.patient.full_name if appointment.patient else None
    response.dentist_name = appointment.dentist.full_name if appointment.dentist else None
    
    return response


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: UUID,
    appointment_data: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
    if appointment.status in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]:
        if not any([appointment_data.treatment_notes, appointment_data.status]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot modify completed or cancelled appointments except for notes"
            )
    
    # Validate time changes for conflicts
    if appointment_data.start_time or appointment_data.duration_minutes:
        new_start = appointment_data.start_time or appointment.start_time
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
                    and_(Appointment.start_time <= new_start, Appointment.end_time > new_start),
                    and_(Appointment.start_time < new_end, Appointment.end_time >= new_end)
                )
            )
        ).first()
        
        if conflicts:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Schedule conflict with existing appointment"
            )
    
    # Update fields
    update_data = appointment_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appointment, field, value)
    
    # Update end_time if start_time or duration changed
    if appointment_data.start_time or appointment_data.duration_minutes:
        appointment.end_time = appointment.start_time + timedelta(minutes=appointment.duration_minutes)
    
    appointment.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(appointment)
    
    # Load relationships
    appointment = db.query(Appointment).options(
        joinedload(Appointment.patient),
        joinedload(Appointment.dentist)
    ).filter(Appointment.id == appointment_id).first()
    
    response = AppointmentResponse.from_orm(appointment)
    response.patient_name = appointment.patient.full_name if appointment.patient else None
    response.dentist_name = appointment.dentist.full_name if appointment.dentist else None
    
    return response


@router.delete("/{appointment_id}", response_model=MessageResponse)
async def delete_appointment(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Cancel/delete an appointment."""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # DENTAL_SPECIFIC: Soft delete by changing status instead of hard delete
    if appointment.status in [AppointmentStatus.COMPLETED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel completed appointments"
        )
    
    appointment.status = AppointmentStatus.CANCELLED
    appointment.updated_at = datetime.utcnow()
    
    db.commit()
    
    return MessageResponse(message="Appointment cancelled successfully")


# DENTAL_SPECIFIC: Availability checking endpoint
@router.post("/availability", response_model=AvailabilityResponse)
async def check_availability(
    availability_request: AvailabilityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Check appointment availability for a specific date.
    
    DENTAL_SPECIFIC: Implements dental practice scheduling rules
    """
    # Get duration for appointment type if not provided
    if not availability_request.duration_minutes:
        duration = Appointment.get_default_duration(availability_request.appointment_type)
    else:
        duration = availability_request.duration_minutes
    
    # Query for dentists
    dentist_query = db.query(User).filter(User.role.in_(["professional", "admin"]))
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
                func.date(Appointment.start_time) == availability_request.date,
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
                if (current_time < existing.end_time and slot_end > existing.start_time):
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get appointment statistics and metrics."""
    query = db.query(Appointment)
    
    if start_date:
        query = query.filter(Appointment.start_time >= start_date)
    if end_date:
        query = query.filter(Appointment.start_time <= end_date)
    
    appointments = query.all()
    
    # Calculate statistics
    total = len(appointments)
    
    # Group by status
    by_status = {}
    for status in AppointmentStatus:
        by_status[status] = len([a for a in appointments if a.status == status])
    
    # Group by type
    by_type = {}
    for app_type in AppointmentType:
        by_type[app_type] = len([a for a in appointments if a.appointment_type == app_type])
    
    # Group by priority
    by_priority = {}
    for priority in AppointmentPriority:
        by_priority[priority] = len([a for a in appointments if a.priority == priority])
    
    # Time-based stats
    today = date.today()
    today_appointments = len([a for a in appointments if a.start_time.date() == today])
    
    week_start = today - timedelta(days=today.weekday())
    this_week = len([a for a in appointments if a.start_time.date() >= week_start])
    
    month_start = today.replace(day=1)
    this_month = len([a for a in appointments if a.start_time.date() >= month_start])
    
    # Efficiency metrics
    completed_appointments = [a for a in appointments if a.status == AppointmentStatus.COMPLETED]
    no_shows = len([a for a in appointments if a.status == AppointmentStatus.NO_SHOW])
    cancelled = len([a for a in appointments if a.status == AppointmentStatus.CANCELLED])
    
    avg_duration = sum([a.duration_minutes for a in appointments]) / total if total > 0 else 0
    no_show_rate = (no_shows / total * 100) if total > 0 else 0
    cancellation_rate = (cancelled / total * 100) if total > 0 else 0
    
    # Revenue calculations
    total_estimated = sum([a.estimated_cost or 0 for a in appointments])
    completed_value = sum([a.estimated_cost or 0 for a in completed_appointments])
    
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
        total_estimated_revenue=total_estimated,
        completed_appointments_value=completed_value
    )


# DENTAL_SPECIFIC: Bulk operations
@router.post("/bulk/reschedule", response_model=BulkOperationResponse)
async def bulk_reschedule(
    reschedule_request: BulkRescheduleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Bulk reschedule appointments."""
    successful = []
    failed = []
    
    for appointment_id in reschedule_request.appointment_ids:
        try:
            appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
            if not appointment:
                failed.append({"appointment_id": appointment_id, "error": "Appointment not found"})
                continue
            
            if appointment.status not in [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]:
                failed.append({"appointment_id": appointment_id, "error": "Cannot reschedule this appointment"})
                continue
            
            # Calculate new time
            if reschedule_request.new_start_time:
                new_start = reschedule_request.new_start_time
            else:
                new_start = appointment.start_time + timedelta(minutes=reschedule_request.time_offset_minutes)
            
            # Check for conflicts
            new_end = new_start + timedelta(minutes=appointment.duration_minutes)
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
                        and_(Appointment.start_time <= new_start, Appointment.end_time > new_start),
                        and_(Appointment.start_time < new_end, Appointment.end_time >= new_end)
                    )
                )
            ).first()
            
            if conflicts:
                failed.append({"appointment_id": appointment_id, "error": "Schedule conflict"})
                continue
            
            # Update appointment
            appointment.start_time = new_start
            appointment.end_time = new_end
            appointment.status = AppointmentStatus.RESCHEDULED
            appointment.updated_at = datetime.utcnow()
            
            successful.append(appointment_id)
            
        except Exception as e:
            failed.append({"appointment_id": appointment_id, "error": str(e)})
    
    db.commit()
    
    return BulkOperationResponse(
        successful=successful,
        failed=failed,
        total_processed=len(reschedule_request.appointment_ids),
        success_count=len(successful),
        failure_count=len(failed)
    )


# PLATFORM_EXTRACTABLE: Background task pattern
async def schedule_appointment_reminder(appointment_id: UUID):
    """Background task to schedule appointment reminders."""
    # This would integrate with email/SMS service
    # For now, just a placeholder
    pass
