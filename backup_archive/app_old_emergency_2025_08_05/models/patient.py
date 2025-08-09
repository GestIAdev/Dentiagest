# DENTAL_SPECIFIC: Patient model - Highly specialized for dental practices
"""
Patient model specifically designed for dental practices.
This model contains dental-specific fields and relationships that are NOT
extractable to PlatformGest core, demonstrating the contrast with universal models.
"""

from sqlalchemy import Column, String, Date, Text, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON
from sqlalchemy.orm import relationship
from datetime import datetime, date
import uuid
import enum

from ..core.database import Base

# DENTAL_SPECIFIC: Blood type enum for medical records
class BloodType(enum.Enum):
    """Blood types for medical records."""
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"
    UNKNOWN = "unknown"

# DENTAL_SPECIFIC: Gender enum
class Gender(enum.Enum):
    """Gender options for patient records."""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

# DENTAL_SPECIFIC: Insurance status
class InsuranceStatus(enum.Enum):
    """Insurance coverage status."""
    ACTIVE = "active"
    EXPIRED = "expired"
    PENDING = "pending"
    NO_INSURANCE = "no_insurance"

# DENTAL_SPECIFIC: Complete Patient model for dental practices
class Patient(Base):
    """
    Patient model specifically designed for dental practices.
    
    This model is NOT extractable to PlatformGest as it contains
    fields and relationships specific to dental care and medical records.
    
    PLATFORM_PATTERN: Other verticals will have similar "client" entities:
    - VetGest: Pet model (with species, breed, vaccination records)
    - MechaGest: Vehicle model (with make, model, mileage, service history)
    - RestaurantGest: Customer model (with dietary preferences, allergies)
    """
    __tablename__ = "patients"
    
    # PLATFORM_EXTRACTABLE: Basic identification (similar pattern across verticals)
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        comment="Unique identifier for the patient"
    )
    
    # PLATFORM_EXTRACTABLE: Basic personal info (adaptable to different entities)
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
    
    email = Column(
        String(255),
        nullable=True,
        index=True,
        comment="Patient's email address"
    )
    
    phone = Column(
        String(50),
        nullable=True,
        comment="Patient's primary phone number"
    )
    
    phone_secondary = Column(
        String(50),
        nullable=True,
        comment="Patient's secondary phone number"
    )
    
    # DENTAL_SPECIFIC: Medical and personal information
    date_of_birth = Column(
        Date,
        nullable=True,
        comment="Patient's date of birth"
    )
    
    gender = Column(
        "gender",
        String(20),
        nullable=True,
        comment="Patient's gender"
    )
    
    blood_type = Column(
        "blood_type", 
        String(10),
        nullable=True,
        comment="Patient's blood type for medical emergencies"
    )
    
    # DENTAL_SPECIFIC: Address information (more detailed for medical practices)
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
        default="Argentina",
        comment="Country"
    )
    
    # DENTAL_SPECIFIC: Emergency contact information
    emergency_contact_name = Column(
        String(255),
        nullable=True,
        comment="Emergency contact full name"
    )
    
    emergency_contact_phone = Column(
        String(50),
        nullable=True,
        comment="Emergency contact phone number"
    )
    
    emergency_contact_relationship = Column(
        String(100),
        nullable=True,
        comment="Relationship to patient"
    )
    
    # DENTAL_SPECIFIC: Medical history and allergies
    medical_conditions = Column(
        Text,
        nullable=True,
        comment="Current medical conditions and chronic illnesses"
    )
    
    medications_current = Column(
        Text,
        nullable=True,
        comment="Current medications being taken"
    )
    
    allergies = Column(
        Text,
        nullable=True,
        comment="Known allergies (medications, latex, etc.)"
    )
    
    dental_insurance_info = Column(
        JSON,
        nullable=True,
        comment="Dental insurance information in JSON format"
    )
    
    insurance_status = Column(
        "insurance_status",
        String(20),
        default="no_insurance",
        comment="Current insurance coverage status"
    )
    
    # DENTAL_SPECIFIC: Dental history and preferences
    previous_dentist = Column(
        String(255),
        nullable=True,
        comment="Previous dental care provider"
    )
    
    dental_anxiety_level = Column(
        Integer,
        default=1,
        comment="Anxiety level for dental procedures (1-10 scale)"
    )
    
    preferred_appointment_time = Column(
        String(50),
        nullable=True,
        comment="Patient's preferred appointment time (morning/afternoon/evening)"
    )
    
    communication_preferences = Column(
        JSON,
        nullable=True,
        comment="Preferred communication methods (email, SMS, call)"
    )
    
    # DENTAL_SPECIFIC: Consent and legal
    consent_treatment = Column(
        Boolean,
        default=False,
        comment="General treatment consent given"
    )
    
    consent_marketing = Column(
        Boolean,
        default=False,
        comment="Marketing communication consent"
    )
    
    consent_data_sharing = Column(
        Boolean,
        default=False,
        comment="Data sharing consent for insurance/referrals"
    )
    
    # PLATFORM_EXTRACTABLE: Status and tracking (universal pattern)
    is_active = Column(
        Boolean,
        default=True,
        comment="Whether patient is active in the system"
    )
    
    notes = Column(
        Text,
        nullable=True,
        comment="General notes about the patient"
    )
    
    # PLATFORM_EXTRACTABLE: Audit fields (universal across all verticals)
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
        nullable=False,
        comment="ID of user who created this patient record"
    )
    
    updated_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        comment="ID of user who last updated this record"
    )
    
    # PLATFORM_EXTRACTABLE: Soft deletion (universal pattern)
    deleted_at = Column(
        DateTime,
        nullable=True,
        comment="When the patient was soft deleted"
    )
    
    # DENTAL_SPECIFIC: Relationships to other dental entities
    # These relationships are specific to dental practice workflow
    appointments = relationship("Appointment", back_populates="patient")
    # treatments = relationship("Treatment", back_populates="patient")
    # dental_records = relationship("DentalRecord", back_populates="patient")
    # invoices = relationship("Invoice", back_populates="patient")
    # radiographs = relationship("Radiograph", back_populates="patient")
    
    # PLATFORM_EXTRACTABLE: Relationship to universal User model
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])
    
    def __repr__(self):
        return f"<Patient(id={self.id}, name={self.full_name})>"
    
    # PLATFORM_EXTRACTABLE: Universal properties (adaptable to any entity)
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
        address_parts = [
            self.address_street,
            self.address_city,
            self.address_state,
            self.address_postal_code,
            self.address_country
        ]
        return ", ".join(part for part in address_parts if part)
    
    # DENTAL_SPECIFIC: Dental practice specific methods
    @property
    def has_insurance(self) -> bool:
        """Check if patient has active dental insurance."""
        return self.insurance_status == "active"
    
    @property
    def requires_special_care(self) -> bool:
        """Check if patient requires special care due to medical conditions."""
        return bool(self.medical_conditions or self.allergies or self.dental_anxiety_level > 7)
    
    def get_emergency_contact_info(self) -> dict:
        """Get emergency contact information."""
        return {
            "name": self.emergency_contact_name,
            "phone": self.emergency_contact_phone,
            "relationship": self.emergency_contact_relationship
        }
    
    def update_insurance_info(self, insurance_data: dict):
        """Update dental insurance information."""
        self.dental_insurance_info = insurance_data
        self.insurance_status = "active" if insurance_data else "no_insurance"
