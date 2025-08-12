# DENTAL_SPECIFIC: Medical Record model - Core of dental practice documentation
"""
Medical Record model for comprehensive dental practice documentation.
This model stores individual medical entries, treatments, and clinical notes.

PLATFORM_PATTERN: Other verticals will have similar "service record" models:
- VetGest: VeterinaryRecord (vaccinations, treatments, health checkups)
- MechaGest: ServiceRecord (repairs, maintenance, inspections)
- RestaurantGest: ServiceRecord (orders, special requests, dietary notes)

UNIVERSAL_PATTERN: The documentation, timeline, and audit patterns ARE extractable.
"""

from sqlalchemy import Column, String, Text, Date, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, date
import uuid
import enum

from ..core.database import Base

# DENTAL_SPECIFIC: Treatment status enum
class TreatmentStatus(enum.Enum):
    """Status of medical treatment."""
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"
    FOLLOW_UP_REQUIRED = "follow_up_required"

# DENTAL_SPECIFIC: Treatment priority levels
class TreatmentPriority(enum.Enum):
    """Priority level for treatments."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"
    EMERGENCY = "emergency"

# DENTAL_SPECIFIC: Dental procedure categories
class ProcedureCategory(enum.Enum):
    """Categories of dental procedures."""
    PREVENTIVE = "preventive"          # Cleanings, exams, X-rays
    RESTORATIVE = "restorative"        # Fillings, crowns, bridges
    COSMETIC = "cosmetic"              # Whitening, veneers
    ORTHODONTIC = "orthodontic"        # Braces, aligners
    PERIODONTAL = "periodontal"        # Gum treatment
    ENDODONTIC = "endodontic"          # Root canals
    ORAL_SURGERY = "oral_surgery"      # Extractions, implants
    PROSTHODONTIC = "prosthodontic"    # Dentures, prosthetics
    EMERGENCY = "emergency"            # Pain management, trauma
    CONSULTATION = "consultation"      # Diagnosis, planning

# DENTAL_SPECIFIC: Medical Record model
class MedicalRecord(Base):
    """
    Medical Record model for dental practice documentation.
    
    Each record represents a single clinical entry, treatment, or observation.
    Records form a timeline of patient care and clinical decision-making.
    
    AI-READY: Designed to support future AI analysis and voice-to-text integration.
    """
    __tablename__ = "medical_records"
    
    # PLATFORM_CORE: Primary identification
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        comment="Unique identifier for the medical record"
    )
    
    # PLATFORM_CORE: Foreign key relationships
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Reference to the patient"
    )
    
    appointment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Reference to the appointment when record was created"
    )
    
    # DENTAL_SPECIFIC: Clinical information
    visit_date = Column(
        Date,
        nullable=False,
        index=True,
        comment="Date of the clinical visit"
    )
    
    chief_complaint = Column(
        Text,
        nullable=True,
        comment="Patient's main concern or reason for visit"
    )
    
    diagnosis = Column(
        Text,
        nullable=False,
        comment="Clinical diagnosis and findings"
    )
    
    treatment_plan = Column(
        Text,
        nullable=True,
        comment="Planned treatment approach"
    )
    
    treatment_performed = Column(
        Text,
        nullable=True,
        comment="Treatment actually performed during visit"
    )
    
    clinical_notes = Column(
        Text,
        nullable=True,
        comment="Additional clinical observations and notes"
    )
    
    # DENTAL_SPECIFIC: Procedure information
    procedure_codes = Column(
        JSONB,
        nullable=True,
        comment="Dental procedure codes (ADA/CDT codes) as JSON array"
    )
    
    procedure_category = Column(
        SQLEnum(ProcedureCategory),
        nullable=True,
        comment="Category of dental procedure"
    )
    
    tooth_numbers = Column(
        JSONB,
        nullable=True,
        comment="Affected tooth numbers as JSON array (e.g., [1, 2, 16, 32])"
    )
    
    surfaces_treated = Column(
        JSONB,
        nullable=True,
        comment="Tooth surfaces treated as JSON (e.g., {'1': ['mesial', 'distal']})"
    )
    
    # DENTAL_SPECIFIC: Treatment status and priority
    treatment_status = Column(
        SQLEnum(TreatmentStatus),
        default=TreatmentStatus.PLANNED,
        comment="Current status of the treatment"
    )
    
    priority = Column(
        SQLEnum(TreatmentPriority),
        default=TreatmentPriority.MEDIUM,
        comment="Treatment priority level"
    )
    
    # DENTAL_SPECIFIC: Financial information
    estimated_cost = Column(
        Numeric(10, 2),
        nullable=True,
        comment="Estimated cost of treatment"
    )
    
    actual_cost = Column(
        Numeric(10, 2),
        nullable=True,
        comment="Actual cost charged"
    )
    
    insurance_covered = Column(
        Boolean,
        default=False,
        comment="Whether treatment is covered by insurance"
    )
    
    # DENTAL_SPECIFIC: Follow-up and outcomes
    follow_up_required = Column(
        Boolean,
        default=False,
        comment="Whether follow-up is required"
    )
    
    follow_up_date = Column(
        Date,
        nullable=True,
        comment="Scheduled follow-up date"
    )
    
    follow_up_notes = Column(
        Text,
        nullable=True,
        comment="Follow-up instructions and notes"
    )
    
    treatment_outcome = Column(
        Text,
        nullable=True,
        comment="Outcome and results of treatment"
    )
    
    patient_feedback = Column(
        Text,
        nullable=True,
        comment="Patient feedback and satisfaction notes"
    )
    
    # AI-READY: Voice and automation fields
    voice_note_path = Column(
        String(500),
        nullable=True,
        comment="Path to voice recording file (for future AI transcription)"
    )
    
    ai_transcribed = Column(
        Boolean,
        default=False,
        comment="Whether this record was created via AI voice transcription"
    )
    
    ai_confidence_score = Column(
        Numeric(3, 2),
        nullable=True,
        comment="AI confidence score for transcribed content (0.0-1.0)"
    )
    
    ai_metadata = Column(
        JSONB,
        nullable=True,
        comment="AI-generated metadata and analysis results"
    )
    
    # PLATFORM_CORE: Status and visibility
    is_active = Column(
        Boolean,
        default=True,
        comment="Whether record is active"
    )
    
    is_confidential = Column(
        Boolean,
        default=False,
        comment="Whether record contains confidential information"
    )
    
    # PLATFORM_CORE: Audit fields (universal pattern)
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        comment="When the record was created"
    )
    
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        comment="When the record was last updated"
    )
    
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        comment="ID of user who created this record"
    )
    
    updated_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        comment="ID of user who last updated this record"
    )
    
    # PLATFORM_CORE: Soft deletion (universal pattern)
    deleted_at = Column(
        DateTime,
        nullable=True,
        comment="When the record was soft deleted"
    )
    
    deleted_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        comment="ID of user who deleted this record"
    )
    
    # DENTAL_SPECIFIC: Relationships
    patient = relationship("Patient", back_populates="medical_records")
    # appointment = relationship("Appointment", back_populates="medical_records")
    documents = relationship("MedicalDocument", back_populates="medical_record", cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])
    
    def __repr__(self):
        return f"<MedicalRecord(id={self.id}, patient_id={self.patient_id}, date={self.visit_date})>"
    
    # PLATFORM_CORE: Universal record methods
    @property
    def age_days(self) -> int:
        """Calculate age of record in days."""
        return (datetime.now().date() - self.visit_date).days
    
    @property
    def is_recent(self) -> bool:
        """Check if record is from recent visit (within 30 days)."""
        return self.age_days <= 30
    
    @property
    def requires_attention(self) -> bool:
        """Check if record requires immediate attention."""
        return (
            self.priority in [TreatmentPriority.URGENT, TreatmentPriority.EMERGENCY] or
            self.treatment_status == TreatmentStatus.FOLLOW_UP_REQUIRED or
            (self.follow_up_required and self.follow_up_date and 
             self.follow_up_date <= datetime.now().date())
        )
    
    # DENTAL_SPECIFIC: Dental-related methods
    @property
    def total_teeth_affected(self) -> int:
        """Count total number of teeth affected."""
        if not self.tooth_numbers:
            return 0
        return len(self.tooth_numbers) if isinstance(self.tooth_numbers, list) else 0
    
    @property
    def is_major_treatment(self) -> bool:
        """Check if this is considered a major dental treatment."""
        major_categories = [
            ProcedureCategory.ORAL_SURGERY,
            ProcedureCategory.PROSTHODONTIC,
            ProcedureCategory.ORTHODONTIC,
            ProcedureCategory.ENDODONTIC
        ]
        return self.procedure_category in major_categories
    
    @property
    def treatment_summary(self) -> str:
        """Generate a brief treatment summary."""
        category = self.procedure_category.value if self.procedure_category else "General"
        status = self.treatment_status.value if self.treatment_status else "Unknown"
        return f"{category.title()} treatment - {status.replace('_', ' ').title()}"
    
    def get_procedure_info(self) -> dict:
        """Get comprehensive procedure information."""
        return {
            "category": self.procedure_category.value if self.procedure_category else None,
            "codes": self.procedure_codes,
            "teeth_affected": self.tooth_numbers,
            "surfaces": self.surfaces_treated,
            "status": self.treatment_status.value if self.treatment_status else None,
            "priority": self.priority.value if self.priority else None
        }
    
    def get_financial_summary(self) -> dict:
        """Get financial information for the record."""
        return {
            "estimated_cost": float(self.estimated_cost) if self.estimated_cost else None,
            "actual_cost": float(self.actual_cost) if self.actual_cost else None,
            "insurance_covered": self.insurance_covered,
            "patient_cost": float(self.actual_cost or self.estimated_cost or 0) if not self.insurance_covered else 0
        }
