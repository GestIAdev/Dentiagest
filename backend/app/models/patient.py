# DENTAL_SPECIFIC: Patient model - specialized for dental clinics
"""
Patient model for dental practice management.
This model contains dental-specific fields and cannot be directly
used in other business verticals without modification.
"""

from sqlalchemy import Column, String, Text, Date, Boolean, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, date
import uuid
import enum

from ..core.database import Base

# DENTAL_SPECIFIC: Blood type enum
class BloodType(enum.Enum):
    """Blood type classification for medical records."""
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"
    UNKNOWN = "unknown"

# PLATFORM_EXTRACTABLE: Gender enum - reusable across all business types
class Gender(enum.Enum):
    """Gender classification."""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

# DENTAL_SPECIFIC: Patient anxiety levels
class AnxietyLevel(enum.Enum):
    """Patient anxiety level for dental procedures."""
    NONE = "none"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    SEVERE = "severe"

# DENTAL_SPECIFIC: Insurance status
class InsuranceStatus(enum.Enum):
    """Patient insurance status."""
    NO_INSURANCE = "no_insurance"
    PRIVATE = "private"
    PUBLIC = "public"
    MIXED = "mixed"
    UNKNOWN = "unknown"

# DENTAL_SPECIFIC: Patient model
class Patient(Base):
    """
    Patient model specifically designed for dental practices.
    
    Contains medical history, insurance information, emergency contacts,
    and dental-specific fields like anxiety levels and allergies.
    
    PLATFORM_ADAPTATION_NOTES:
    - For VetGest: Would become Pet/Animal model with species, breed, owner info
    - For MechaGest: Would become Vehicle model with make, model, year, owner info
    - Core contact/ID patterns are reusable across all verticals
    """
    __tablename__ = "patients"
    
    # PLATFORM_CORE: Primary identification
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        comment="Unique identifier for the patient"
    )
    
    # PLATFORM_CORE: Basic identification (universal pattern)
    first_name = Column(
        String(255), 
        nullable=False,
        comment="Patient's first name"
    )
    
    last_name = Column(
        String(255), 
        nullable=False,
        comment="Patient's last name"
    )
    
    date_of_birth = Column(
        Date,
        nullable=True,
        comment="Patient's date of birth"
    )
    
    gender = Column(
        SQLEnum(Gender),
        nullable=True,
        comment="Patient's gender"
    )
    
    # PLATFORM_CORE: Contact information (universal pattern)
    email = Column(
        String(255),
        nullable=True,
        comment="Patient's email address"
    )
    
    phone_primary = Column(
        String(50),
        nullable=True,
        comment="Primary phone number"
    )
    
    phone_secondary = Column(
        String(50),
        nullable=True,
        comment="Secondary phone number"
    )
    
    # PLATFORM_CORE: Address information (universal pattern)
    address_street = Column(
        String(500),
        nullable=True,
        comment="Street address"
    )
    
    address_city = Column(
        String(255),
        nullable=True,
        comment="City"
    )
    
    address_state = Column(
        String(255),
        nullable=True,
        comment="State/Province"
    )
    
    address_postal_code = Column(
        String(20),
        nullable=True,
        comment="Postal/ZIP code"
    )
    
    address_country = Column(
        String(255),
        default="México",
        comment="Country"
    )
    
    # DENTAL_SPECIFIC: Medical information
    blood_type = Column(
        SQLEnum(BloodType),
        nullable=True,
        comment="Patient's blood type"
    )
    
    allergies = Column(
        Text,
        nullable=True,
        comment="Known allergies and reactions"
    )
    
    medical_history = Column(
        Text,
        nullable=True,
        comment="Patient's medical history"
    )
    
    current_medications = Column(
        Text,
        nullable=True,
        comment="Current medications being taken"
    )
    
    # DENTAL_SPECIFIC: Dental anxiety and comfort
    anxiety_level = Column(
        SQLEnum(AnxietyLevel),
        default=AnxietyLevel.NONE,
        comment="Patient's anxiety level regarding dental procedures"
    )
    
    special_needs = Column(
        Text,
        nullable=True,
        comment="Special needs or accommodations required"
    )
    
    # DENTAL_SPECIFIC: Insurance information
    insurance_provider = Column(
        String(255),
        nullable=True,
        comment="Insurance company name"
    )
    
    insurance_policy_number = Column(
        String(255),
        nullable=True,
        comment="Insurance policy number"
    )
    
    insurance_group_number = Column(
        String(255),
        nullable=True,
        comment="Insurance group number"
    )
    
    # PLATFORM_CORE: Emergency contact (universal pattern)
    emergency_contact_name = Column(
        String(255),
        nullable=True,
        comment="Emergency contact name"
    )
    
    emergency_contact_phone = Column(
        String(50),
        nullable=True,
        comment="Emergency contact phone"
    )
    
    emergency_contact_relationship = Column(
        String(255),
        nullable=True,
        comment="Relationship to patient"
    )
    
    # DENTAL_SPECIFIC: Consent and preferences
    consent_to_treatment = Column(
        Boolean,
        default=False,
        comment="Patient has consented to treatment"
    )
    
    consent_to_contact = Column(
        Boolean,
        default=True,
        comment="Patient has consented to being contacted"
    )
    
    preferred_contact_method = Column(
        String(50),
        default="phone",
        comment="Preferred method of contact (phone, email, sms)"
    )
    
    # PLATFORM_CORE: Status and notes (universal pattern)
    is_active = Column(
        Boolean,
        default=True,
        comment="Whether patient is active"
    )
    
    notes = Column(
        Text,
        nullable=True,
        comment="General notes about the patient"
    )
    
    # PLATFORM_CORE: Audit fields (universal pattern)
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        comment="When the patient record was created"
    )
    
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        comment="When the patient record was last updated"
    )
    
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        comment="ID of user who created this patient record"
    )
    
    # PLATFORM_CORE: Soft deletion (universal pattern)
    deleted_at = Column(
        DateTime,
        nullable=True,
        comment="When the patient was soft deleted"
    )
    
    # DENTAL_SPECIFIC: Relationships to other dental entities
    # appointments = relationship("Appointment", back_populates="patient")
    # treatments = relationship("Treatment", back_populates="patient")
    # dental_records = relationship("DentalRecord", back_populates="patient")
    
    def __repr__(self):
        return f"<Patient(id={self.id}, name={self.full_name})>"
    
    # PLATFORM_CORE: Universal patient methods
    @property
    def full_name(self) -> str:
        """Get patient's full name."""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self) -> int:
        """Calculate patient's age."""
        if not self.date_of_birth:
            return 0
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    @property
    def full_address(self) -> str:
        """Get formatted full address."""
        parts = [
            self.address_street,
            self.address_city,
            self.address_state,
            self.address_postal_code,
            self.address_country
        ]
        return ", ".join([part for part in parts if part])
    
    # DENTAL_SPECIFIC: Dental-related methods
    @property
    def requires_special_attention(self) -> bool:
        """Check if patient requires special attention due to anxiety or special needs."""
        return (
            self.anxiety_level in [AnxietyLevel.HIGH, AnxietyLevel.SEVERE] or
            bool(self.special_needs)
        )
    
    @property
    def has_medical_alerts(self) -> bool:
        """Check if patient has medical conditions that require attention."""
        return bool(
            self.allergies or 
            self.medical_history or 
            self.current_medications or
            self.blood_type in [BloodType.UNKNOWN]
        )
    
    def get_contact_info(self) -> dict:
        """Get all contact information for the patient."""
        return {
            "email": self.email,
            "phone_primary": self.phone_primary,
            "phone_secondary": self.phone_secondary,
            "preferred_method": self.preferred_contact_method,
            "consent_to_contact": self.consent_to_contact
        }
