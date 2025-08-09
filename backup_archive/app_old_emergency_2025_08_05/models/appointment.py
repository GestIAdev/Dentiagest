# DENTAL_SPECIFIC: Appointment management model
"""
Appointment model specifically for dental practices.
This module is NOT extractable to PlatformGest core as it contains
dental-specific appointment logic and business rules.

PLATFORM_PATTERN: Other verticals will have similar "appointment" concepts:
- VetGest: Veterinary appointments with species-specific durations
- MechaGest: Service appointments with vehicle diagnostic slots  
- RestaurantGest: Table reservations with party size management
"""

from typing import Optional
from sqlalchemy import Column, String, DateTime, Integer, Text, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import uuid
import enum

from ..core.database import Base


class AppointmentStatus(enum.Enum):
    """Status of dental appointments."""
    # DENTAL_SPECIFIC: Dental appointment statuses
    SCHEDULED = "scheduled"      # Cita programada
    CONFIRMED = "confirmed"      # Paciente confirmó asistencia  
    IN_PROGRESS = "in_progress"  # Consulta en curso
    COMPLETED = "completed"      # Consulta finalizada
    CANCELLED = "cancelled"      # Cancelada por paciente/clínica
    NO_SHOW = "no_show"         # Paciente no se presentó
    RESCHEDULED = "rescheduled"  # Reprogramada


class AppointmentType(enum.Enum):
    """Types of dental appointments."""
    # DENTAL_SPECIFIC: Types specific to dental practice
    CONSULTATION = "consultation"        # Primera consulta
    CLEANING = "cleaning"               # Limpieza dental
    CHECKUP = "checkup"                 # Revisión rutinaria  
    FILLING = "filling"                 # Empaste/obturación
    EXTRACTION = "extraction"           # Extracción
    ROOT_CANAL = "root_canal"          # Endodoncia
    CROWN = "crown"                    # Corona dental
    ORTHODONTICS = "orthodontics"      # Ortodoncia
    SURGERY = "surgery"                # Cirugía oral
    EMERGENCY = "emergency"            # Urgencia dental
    FOLLOW_UP = "follow_up"           # Seguimiento


class AppointmentPriority(enum.Enum):
    """Priority levels for appointments."""
    # PLATFORM_EXTRACTABLE: Priority system universal across verticals
    LOW = "low"
    NORMAL = "normal"  
    HIGH = "high"
    URGENT = "urgent"


class Appointment(Base):
    """
    Appointment model for dental practice scheduling.
    
    DENTAL_SPECIFIC: Contains dental-specific fields and business logic
    that are not applicable to other business verticals.
    
    PLATFORM_PATTERN: Structure is replicable for other verticals:
    - VetGest: pet_id, veterinarian_id, appointment_type (vaccination, surgery)
    - MechaGest: vehicle_id, mechanic_id, service_type (oil_change, repair)
    """
    __tablename__ = "appointments"

    # PLATFORM_EXTRACTABLE: Universal appointment fields
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    dentist_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Scheduling information
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=30)
    
    # Appointment details
    appointment_type = Column(SQLEnum(AppointmentType), nullable=False)
    status = Column(SQLEnum(AppointmentStatus), nullable=False, default=AppointmentStatus.SCHEDULED)
    priority = Column(SQLEnum(AppointmentPriority), nullable=False, default=AppointmentPriority.NORMAL)
    
    # DENTAL_SPECIFIC: Dental practice specific fields
    chief_complaint = Column(Text, comment="Patient's main concern or reason for visit")
    treatment_notes = Column(Text, comment="Notes about treatment performed")
    tooth_numbers = Column(String(255), comment="Specific teeth involved in treatment")
    
    # Administrative fields
    confirmation_status = Column(Boolean, default=False, comment="Patient confirmed attendance")
    reminder_sent = Column(Boolean, default=False, comment="Reminder sent to patient")
    insurance_pre_auth = Column(String(100), comment="Insurance pre-authorization number")
    estimated_cost = Column(Integer, comment="Estimated cost in cents")
    
    # Room/Equipment assignment  
    room_number = Column(String(10), comment="Assigned treatment room")
    equipment_needed = Column(String(255), comment="Special equipment requirements")
    
    # Follow-up management
    is_follow_up = Column(Boolean, default=False)
    parent_appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=True)
    next_appointment_recommended = Column(Boolean, default=False)
    
    # Audit trail - PLATFORM_EXTRACTABLE
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    dentist = relationship("User", foreign_keys=[dentist_id])
    created_by_user = relationship("User", foreign_keys=[created_by])
    
    # Self-referential relationship for follow-ups
    parent_appointment = relationship("Appointment", remote_side=[id], backref="follow_up_appointments")

    def __repr__(self):
        return f"<Appointment {self.id}: {self.patient.full_name if self.patient else 'Unknown'} - {self.appointment_type.value} at {self.start_time}>"

    @property
    def duration_hours(self) -> float:
        """Calculate appointment duration in hours."""
        return self.duration_minutes / 60.0

    @property  
    def is_today(self) -> bool:
        """Check if appointment is scheduled for today."""
        return self.start_time.date() == datetime.now().date()

    @property
    def is_past_due(self) -> bool:
        """Check if appointment time has passed."""
        return self.start_time < datetime.now()

    @property
    def can_be_cancelled(self) -> bool:
        """Check if appointment can still be cancelled."""
        return self.status in [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]

    def calculate_end_time(self) -> datetime:
        """Calculate end time based on start time and duration."""
        return self.start_time + timedelta(minutes=self.duration_minutes)

    def update_status(self, new_status: AppointmentStatus) -> None:
        """Update appointment status with business logic."""
        self.status = new_status
        self.updated_at = datetime.utcnow()
        
        # DENTAL_SPECIFIC: Business rules for status changes
        if new_status == AppointmentStatus.CONFIRMED:
            self.confirmation_status = True
        elif new_status == AppointmentStatus.COMPLETED:
            # Trigger follow-up logic if needed
            if self.appointment_type in [AppointmentType.SURGERY, AppointmentType.ROOT_CANAL]:
                self.next_appointment_recommended = True

    # PLATFORM_EXTRACTABLE: Universal appointment patterns
    @classmethod
    def get_default_duration(cls, appointment_type: AppointmentType) -> int:
        """Get default duration in minutes for appointment type."""
        # DENTAL_SPECIFIC: Dental appointment durations
        duration_map = {
            AppointmentType.CONSULTATION: 45,
            AppointmentType.CLEANING: 60,
            AppointmentType.CHECKUP: 30,
            AppointmentType.FILLING: 60,
            AppointmentType.EXTRACTION: 90,
            AppointmentType.ROOT_CANAL: 120,
            AppointmentType.CROWN: 90,
            AppointmentType.ORTHODONTICS: 45,
            AppointmentType.SURGERY: 180,
            AppointmentType.EMERGENCY: 30,
            AppointmentType.FOLLOW_UP: 20,
        }
        return duration_map.get(appointment_type, 30)

    @classmethod
    def get_recommended_priority(cls, appointment_type: AppointmentType) -> AppointmentPriority:
        """Get recommended priority for appointment type.""" 
        # DENTAL_SPECIFIC: Dental priority mapping
        if appointment_type == AppointmentType.EMERGENCY:
            return AppointmentPriority.URGENT
        elif appointment_type in [AppointmentType.SURGERY, AppointmentType.ROOT_CANAL]:
            return AppointmentPriority.HIGH
        elif appointment_type in [AppointmentType.EXTRACTION, AppointmentType.CROWN]:
            return AppointmentPriority.HIGH  
        else:
            return AppointmentPriority.NORMAL
