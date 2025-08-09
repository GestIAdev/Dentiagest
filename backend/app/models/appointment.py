# DENTAL_SPECIFIC: Appointment model - specialized for dental practices
"""
Appointment model for dental practice scheduling and management.
This model contains dental-specific appointment types, statuses, and business logic.
"""

from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import uuid
import enum

from ..core.database import Base

# DENTAL_SPECIFIC: Appointment status enum
class AppointmentStatus(enum.Enum):
    """Status of dental appointments."""
    SCHEDULED = "scheduled"        # Appointment is scheduled
    CONFIRMED = "confirmed"        # Patient has confirmed attendance
    CHECKED_IN = "checked_in"      # Patient has arrived and checked in
    IN_PROGRESS = "in_progress"    # Treatment is currently happening
    COMPLETED = "completed"        # Appointment completed successfully
    CANCELLED = "cancelled"        # Appointment cancelled
    NO_SHOW = "no_show"           # Patient didn't show up
    RESCHEDULED = "rescheduled"   # Appointment has been rescheduled

# DENTAL_SPECIFIC: Appointment types for dental practice
class AppointmentType(enum.Enum):
    """Types of dental appointments."""
    CONSULTATION = "consultation"              # Initial consultation
    CLEANING = "cleaning"                     # Routine cleaning
    CHECKUP = "checkup"                       # Regular checkup
    FILLING = "filling"                       # Dental filling
    EXTRACTION = "extraction"                 # Tooth extraction
    ROOT_CANAL = "root_canal"                 # Root canal treatment
    CROWN = "crown"                          # Crown placement
    BRIDGE = "bridge"                        # Bridge work
    IMPLANT = "implant"                      # Dental implant
    ORTHODONTICS = "orthodontics"            # Braces/aligners
    WHITENING = "whitening"                  # Teeth whitening
    SURGERY = "surgery"                      # Oral surgery
    EMERGENCY = "emergency"                  # Emergency treatment
    FOLLOW_UP = "follow_up"                  # Follow-up appointment

# DENTAL_SPECIFIC: Appointment priority levels
class AppointmentPriority(enum.Enum):
    """Priority levels for appointments."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"
    EMERGENCY = "emergency"

# DENTAL_SPECIFIC: Appointment model
class Appointment(Base):
    """
    Appointment model specifically designed for dental practices.
    
    Handles complex scheduling with business rules, follow-up tracking,
    room assignments, and dental-specific appointment types.
    
    PLATFORM_ADAPTATION_NOTES:
    - For VetGest: Would adapt appointment types (vaccination, surgery, grooming)
    - For MechaGest: Would become Service/WorkOrder (inspection, repair, maintenance)
    - Core scheduling patterns and status management are reusable
    """
    __tablename__ = "appointments"
    
    # PLATFORM_CORE: Primary identification
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        comment="Unique identifier for the appointment"
    )
    
    # DENTAL_SPECIFIC: Foreign key relationships
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID of the patient for this appointment"
    )
    
    dentist_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        comment="ID of the dentist assigned to this appointment"
    )
    
    # PLATFORM_CORE: Scheduling information (universal pattern)
    scheduled_date = Column(
        DateTime,
        nullable=False,
        index=True,
        comment="Date and time when appointment is scheduled"
    )
    
    duration_minutes = Column(
        Integer,
        nullable=False,
        default=30,
        comment="Duration of appointment in minutes"
    )
    
    # DENTAL_SPECIFIC: Appointment classification
    appointment_type = Column(
        SQLEnum(AppointmentType),
        nullable=False,
        comment="Type of dental appointment"
    )
    
    status = Column(
        SQLEnum(AppointmentStatus),
        default=AppointmentStatus.SCHEDULED,
        nullable=False,
        comment="Current status of the appointment"
    )
    
    priority = Column(
        SQLEnum(AppointmentPriority),
        default=AppointmentPriority.NORMAL,
        nullable=False,
        comment="Priority level of the appointment"
    )
    
    # PLATFORM_CORE: Descriptions and notes (universal pattern)
    title = Column(
        String(255),
        nullable=True,
        comment="Brief title/description of the appointment"
    )
    
    description = Column(
        Text,
        nullable=True,
        comment="Detailed description of the appointment"
    )
    
    notes = Column(
        Text,
        nullable=True,
        comment="Additional notes about the appointment"
    )
    
    # DENTAL_SPECIFIC: Treatment and procedure information
    procedure_codes = Column(
        String(500),
        nullable=True,
        comment="Dental procedure codes (comma-separated)"
    )
    
    estimated_cost = Column(
        String(20),
        nullable=True,
        comment="Estimated cost of the treatment"
    )
    
    # PLATFORM_CORE: Room and resource management (universal pattern)
    room_number = Column(
        String(50),
        nullable=True,
        comment="Room/operatory number where appointment takes place"
    )
    
    equipment_needed = Column(
        String(500),
        nullable=True,
        comment="Special equipment needed for this appointment"
    )
    
    # DENTAL_SPECIFIC: Follow-up and recurring appointment support
    is_follow_up = Column(
        Boolean,
        default=False,
        comment="Whether this is a follow-up appointment"
    )
    
    parent_appointment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("appointments.id"),
        nullable=True,
        comment="ID of the original appointment if this is a follow-up"
    )
    
    next_appointment_suggested = Column(
        DateTime,
        nullable=True,
        comment="Suggested date for next appointment"
    )
    
    # PLATFORM_CORE: Confirmation and communication (universal pattern)
    confirmation_sent = Column(
        Boolean,
        default=False,
        comment="Whether confirmation was sent to patient"
    )
    
    confirmation_sent_at = Column(
        DateTime,
        nullable=True,
        comment="When confirmation was sent"
    )
    
    reminder_sent = Column(
        Boolean,
        default=False,
        comment="Whether reminder was sent to patient"
    )
    
    reminder_sent_at = Column(
        DateTime,
        nullable=True,
        comment="When reminder was sent"
    )
    
    # PLATFORM_CORE: Timing tracking (universal pattern)
    checked_in_at = Column(
        DateTime,
        nullable=True,
        comment="When patient checked in"
    )
    
    started_at = Column(
        DateTime,
        nullable=True,
        comment="When appointment/treatment started"
    )
    
    completed_at = Column(
        DateTime,
        nullable=True,
        comment="When appointment was completed"
    )
    
    # PLATFORM_CORE: Cancellation tracking (universal pattern)
    cancelled_at = Column(
        DateTime,
        nullable=True,
        comment="When appointment was cancelled"
    )
    
    cancellation_reason = Column(
        String(255),
        nullable=True,
        comment="Reason for cancellation"
    )
    
    cancelled_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        comment="ID of user who cancelled the appointment"
    )
    
    # PLATFORM_CORE: Audit fields (universal pattern)
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        comment="When the appointment was created"
    )
    
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        comment="When the appointment was last updated"
    )
    
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        comment="ID of user who created this appointment"
    )
    
    # DENTAL_SPECIFIC: Relationships
    # patient = relationship("Patient", back_populates="appointments")
    # dentist = relationship("User", foreign_keys=[dentist_id])
    # created_by_user = relationship("User", foreign_keys=[created_by])
    # cancelled_by_user = relationship("User", foreign_keys=[cancelled_by])
    
    # Self-referential relationship for follow-ups
    parent_appointment = relationship("Appointment", remote_side=[id], backref="follow_up_appointments")
    
    def __repr__(self):
        return f"<Appointment(id={self.id}, patient_id={self.patient_id}, date={self.scheduled_date})>"
    
    # PLATFORM_CORE: Universal appointment methods
    @property
    def end_time(self) -> datetime:
        """Calculate when the appointment ends."""
        return self.scheduled_date + timedelta(minutes=self.duration_minutes)
    
    @property
    def is_today(self) -> bool:
        """Check if appointment is scheduled for today."""
        return self.scheduled_date.date() == datetime.now().date()
    
    @property
    def is_upcoming(self) -> bool:
        """Check if appointment is in the future."""
        return self.scheduled_date > datetime.now()
    
    @property
    def is_past(self) -> bool:
        """Check if appointment is in the past."""
        return self.scheduled_date < datetime.now()
    
    @property
    def is_active(self) -> bool:
        """Check if appointment is active (not cancelled or completed)."""
        return self.status not in [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW]
    
    # DENTAL_SPECIFIC: Business logic methods
    @property
    def default_duration_for_type(self) -> int:
        """Get default duration based on appointment type."""
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
        return duration_map.get(self.appointment_type, 30)
    
    @property
    def priority_for_type(self) -> AppointmentPriority:
        """Get default priority based on appointment type."""
        priority_map = {
            AppointmentType.EMERGENCY: AppointmentPriority.EMERGENCY,
            AppointmentType.SURGERY: AppointmentPriority.HIGH,
            AppointmentType.EXTRACTION: AppointmentPriority.HIGH,
            AppointmentType.ROOT_CANAL: AppointmentPriority.HIGH,
            AppointmentType.CONSULTATION: AppointmentPriority.NORMAL,
            AppointmentType.FOLLOW_UP: AppointmentPriority.HIGH,
        }
        return priority_map.get(self.appointment_type, AppointmentPriority.NORMAL)
    
    def can_be_rescheduled(self) -> bool:
        """Check if appointment can be rescheduled."""
        return self.status in [
            AppointmentStatus.SCHEDULED,
            AppointmentStatus.CONFIRMED
        ] and self.is_upcoming
    
    def can_be_cancelled(self) -> bool:
        """Check if appointment can be cancelled."""
        return self.status not in [
            AppointmentStatus.CANCELLED,
            AppointmentStatus.COMPLETED,
            AppointmentStatus.NO_SHOW
        ]
    
    def get_time_slot(self) -> str:
        """Get formatted time slot for the appointment."""
        start_time = self.scheduled_date.strftime("%H:%M")
        end_time = self.end_time.strftime("%H:%M")
        return f"{start_time} - {end_time}"
    
    def conflicts_with(self, other_appointment) -> bool:
        """Check if this appointment conflicts with another appointment."""
        if not isinstance(other_appointment, Appointment):
            return False
            
        # Check if they're on the same date
        if self.scheduled_date.date() != other_appointment.scheduled_date.date():
            return False
            
        # Check if they're for the same dentist
        if self.dentist_id != other_appointment.dentist_id:
            return False
            
        # Check time overlap
        self_start = self.scheduled_date
        self_end = self.end_time
        other_start = other_appointment.scheduled_date
        other_end = other_appointment.end_time
        
        return not (self_end <= other_start or other_end <= self_start)
