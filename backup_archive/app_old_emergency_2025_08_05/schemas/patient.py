# DENTAL_SPECIFIC: Pydantic schemas for patient management
"""
Pydantic schemas specifically designed for dental patient management.
These schemas are NOT extractable to PlatformGest core as they contain
dental-specific fields and validation rules.

PLATFORM_PATTERN: Each vertical will have similar "client" schemas:
- VetGest: Pet schemas (species, breed, vaccination_records)
- MechaGest: Vehicle schemas (make, model, mileage, service_history)
- RestaurantGest: Customer schemas (dietary_preferences, allergies)
"""

from datetime import datetime, date
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, EmailStr, Field, validator
from enum import Enum

from ..models.patient import BloodType, Gender, InsuranceStatus

# DENTAL_SPECIFIC: Base patient schema with medical fields
class PatientBase(BaseModel):
    """
    Base patient schema with dental-specific fields.
    
    PLATFORM_PATTERN: Each vertical has different base fields:
    - VetGest: species, breed, microchip_number
    - MechaGest: make, model, year, vin_number
    - RestaurantGest: dietary_preferences, visit_frequency
    """
    first_name: str = Field(..., min_length=1, max_length=255)
    last_name: str = Field(..., min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    phone_secondary: Optional[str] = Field(None, max_length=50)
    
    # DENTAL_SPECIFIC: Medical and personal information
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    blood_type: Optional[BloodType] = None
    
    # DENTAL_SPECIFIC: Address information (detailed for medical practices)
    address_street: Optional[str] = Field(None, max_length=500)
    address_city: Optional[str] = Field(None, max_length=255)
    address_state: Optional[str] = Field(None, max_length=255)
    address_postal_code: Optional[str] = Field(None, max_length=20)
    address_country: str = Field(default="Argentina", max_length=255)
    
    # DENTAL_SPECIFIC: Emergency contact information
    emergency_contact_name: Optional[str] = Field(None, max_length=255)
    emergency_contact_phone: Optional[str] = Field(None, max_length=50)
    emergency_contact_relationship: Optional[str] = Field(None, max_length=100)
    
    @validator('phone', 'phone_secondary', 'emergency_contact_phone')
    def validate_phone_format(cls, v):
        """
        DENTAL_SPECIFIC: Phone validation for medical emergencies.
        More strict than general business contacts.
        """
        if v:
            # Remove spaces and special characters for validation
            clean_phone = ''.join(filter(str.isdigit, v))
            if len(clean_phone) < 8 or len(clean_phone) > 15:
                raise ValueError('Phone number must be between 8 and 15 digits')
        return v
    
    @validator('date_of_birth')
    def validate_birth_date(cls, v):
        """DENTAL_SPECIFIC: Validate reasonable birth date for patients."""
        if v:
            today = date.today()
            if v > today:
                raise ValueError('Birth date cannot be in the future')
            if v < date(1900, 1, 1):
                raise ValueError('Birth date cannot be before 1900')
        return v

class PatientCreate(PatientBase):
    """
    Schema for creating new patients with dental-specific medical fields.
    
    DENTAL_SPECIFIC: Contains comprehensive medical history collection.
    """
    
    # DENTAL_SPECIFIC: Medical history and conditions
    medical_conditions: Optional[str] = Field(
        None, 
        max_length=2000,
        description="Current medical conditions and chronic illnesses"
    )
    
    medications_current: Optional[str] = Field(
        None, 
        max_length=2000,
        description="Current medications being taken"
    )
    
    allergies: Optional[str] = Field(
        None, 
        max_length=1000,
        description="Known allergies (medications, latex, foods, etc.)"
    )
    
    # DENTAL_SPECIFIC: Insurance information
    dental_insurance_info: Optional[Dict[str, Any]] = Field(
        None,
        description="Dental insurance information in structured format"
    )
    
    insurance_status: InsuranceStatus = Field(
        default=InsuranceStatus.NO_INSURANCE,
        description="Current insurance coverage status"
    )
    
    # DENTAL_SPECIFIC: Dental history and preferences
    previous_dentist: Optional[str] = Field(
        None, 
        max_length=255,
        description="Previous dental care provider"
    )
    
    dental_anxiety_level: int = Field(
        default=1,
        ge=1,
        le=10,
        description="Anxiety level for dental procedures (1-10 scale)"
    )
    
    preferred_appointment_time: Optional[str] = Field(
        None,
        max_length=50,
        description="Preferred appointment time (morning/afternoon/evening)"
    )
    
    communication_preferences: Optional[Dict[str, Any]] = Field(
        None,
        description="Preferred communication methods and settings"
    )
    
    # DENTAL_SPECIFIC: Consent and legal requirements
    consent_treatment: bool = Field(
        default=False,
        description="General treatment consent given"
    )
    
    consent_marketing: bool = Field(
        default=False,
        description="Marketing communication consent"
    )
    
    consent_data_sharing: bool = Field(
        default=False,
        description="Data sharing consent for insurance/referrals"
    )
    
    notes: Optional[str] = Field(
        None,
        max_length=2000,
        description="General notes about the patient"
    )
    
    @validator('dental_insurance_info')
    def validate_insurance_info(cls, v):
        """DENTAL_SPECIFIC: Validate insurance information structure."""
        if v:
            required_fields = ['provider_name', 'policy_number']
            for field in required_fields:
                if field not in v:
                    raise ValueError(f'Insurance info must contain {field}')
        return v
    
    @validator('communication_preferences')
    def validate_communication_prefs(cls, v):
        """DENTAL_SPECIFIC: Validate communication preferences structure."""
        if v:
            valid_methods = ['email', 'sms', 'phone', 'mail']
            if 'methods' in v:
                for method in v['methods']:
                    if method not in valid_methods:
                        raise ValueError(f'Invalid communication method: {method}')
        return v

class PatientUpdate(BaseModel):
    """
    Schema for updating patient information.
    All fields are optional for partial updates.
    """
    first_name: Optional[str] = Field(None, min_length=1, max_length=255)
    last_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    phone_secondary: Optional[str] = Field(None, max_length=50)
    
    # Medical information updates
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    blood_type: Optional[BloodType] = None
    
    # Address updates
    address_street: Optional[str] = Field(None, max_length=500)
    address_city: Optional[str] = Field(None, max_length=255)
    address_state: Optional[str] = Field(None, max_length=255)
    address_postal_code: Optional[str] = Field(None, max_length=20)
    address_country: Optional[str] = Field(None, max_length=255)
    
    # Emergency contact updates
    emergency_contact_name: Optional[str] = Field(None, max_length=255)
    emergency_contact_phone: Optional[str] = Field(None, max_length=50)
    emergency_contact_relationship: Optional[str] = Field(None, max_length=100)
    
    # Medical history updates
    medical_conditions: Optional[str] = Field(None, max_length=2000)
    medications_current: Optional[str] = Field(None, max_length=2000)
    allergies: Optional[str] = Field(None, max_length=1000)
    
    # Insurance updates
    dental_insurance_info: Optional[Dict[str, Any]] = None
    insurance_status: Optional[InsuranceStatus] = None
    
    # Dental preferences updates
    previous_dentist: Optional[str] = Field(None, max_length=255)
    dental_anxiety_level: Optional[int] = Field(None, ge=1, le=10)
    preferred_appointment_time: Optional[str] = Field(None, max_length=50)
    communication_preferences: Optional[Dict[str, Any]] = None
    
    # Consent updates
    consent_treatment: Optional[bool] = None
    consent_marketing: Optional[bool] = None
    consent_data_sharing: Optional[bool] = None
    
    notes: Optional[str] = Field(None, max_length=2000)

class PatientResponse(PatientBase):
    """
    Schema for patient response data.
    
    DENTAL_SPECIFIC: Includes calculated fields and dental-specific information.
    """
    id: str
    insurance_status: InsuranceStatus
    dental_anxiety_level: int
    consent_treatment: bool
    consent_marketing: bool
    consent_data_sharing: bool
    is_active: bool
    
    # PLATFORM_EXTRACTABLE: Universal audit fields
    created_at: datetime
    updated_at: datetime
    created_by: str
    updated_by: Optional[str] = None
    
    # DENTAL_SPECIFIC: Calculated properties
    age: Optional[int] = None
    full_address: Optional[str] = None
    has_insurance: bool = False
    requires_special_care: bool = False
    
    class Config:
        from_attributes = True

class PatientWithMedicalHistory(PatientResponse):
    """
    Extended patient schema including full medical history.
    
    DENTAL_SPECIFIC: Contains sensitive medical information.
    Used for detailed patient views.
    """
    
    # DENTAL_SPECIFIC: Full medical information
    medical_conditions: Optional[str] = None
    medications_current: Optional[str] = None
    allergies: Optional[str] = None
    dental_insurance_info: Optional[Dict[str, Any]] = None
    previous_dentist: Optional[str] = None
    preferred_appointment_time: Optional[str] = None
    communication_preferences: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    
    # DENTAL_SPECIFIC: Emergency contact information
    emergency_contact: Optional[Dict[str, str]] = None

# DENTAL_SPECIFIC: Search and filter schemas for dental practices
class PatientSearchParams(BaseModel):
    """
    Search parameters specifically designed for dental patient management.
    
    PLATFORM_PATTERN: Each vertical has specialized search criteria:
    - VetGest: PetSearchParams (by species, breed, vaccination_status)
    - MechaGest: VehicleSearchParams (by make, model, service_due)
    - RestaurantGest: CustomerSearchParams (by dietary_preferences, visit_frequency)
    """
    
    # PLATFORM_EXTRACTABLE: Universal pagination and sorting
    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)
    sort_by: Optional[str] = Field(
        default="last_name",
        description="Field to sort by"
    )
    sort_order: str = Field(
        default="asc", 
        pattern="^(asc|desc)$",
        description="Sort order"
    )
    
    # PLATFORM_EXTRACTABLE: Basic search (adaptable pattern)
    search: Optional[str] = Field(
        None,
        description="Search in name, email, phone"
    )
    
    # DENTAL_SPECIFIC: Medical and insurance filters
    insurance_status: Optional[InsuranceStatus] = None
    age_min: Optional[int] = Field(None, ge=0, le=150)
    age_max: Optional[int] = Field(None, ge=0, le=150)
    has_medical_conditions: Optional[bool] = None
    has_allergies: Optional[bool] = None
    high_anxiety_only: bool = Field(
        default=False,
        description="Filter patients with high dental anxiety (7+ level)"
    )
    
    # PLATFORM_EXTRACTABLE: Date filters (universal pattern)
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
    
    @validator('age_min', 'age_max')
    def validate_age_range(cls, v, values):
        """Validate age range makes sense."""
        if 'age_min' in values and values['age_min'] and v:
            if v < values['age_min']:
                raise ValueError('age_max must be greater than age_min')
        return v

# DENTAL_SPECIFIC: Insurance management schemas
class InsuranceUpdateRequest(BaseModel):
    """Schema for updating patient insurance information."""
    
    provider_name: str = Field(..., min_length=1, max_length=255)
    policy_number: str = Field(..., min_length=1, max_length=100)
    group_number: Optional[str] = Field(None, max_length=100)
    subscriber_name: Optional[str] = Field(None, max_length=255)
    relationship_to_subscriber: Optional[str] = Field(None, max_length=50)
    effective_date: Optional[date] = None
    expiration_date: Optional[date] = None
    copay_amount: Optional[float] = Field(None, ge=0)
    deductible_amount: Optional[float] = Field(None, ge=0)
    annual_maximum: Optional[float] = Field(None, ge=0)
    coverage_details: Optional[Dict[str, Any]] = None
    
    @validator('expiration_date')
    def validate_expiration_date(cls, v, values):
        """Ensure expiration date is after effective date."""
        if v and 'effective_date' in values and values['effective_date']:
            if v <= values['effective_date']:
                raise ValueError('Expiration date must be after effective date')
        return v

# DENTAL_SPECIFIC: Medical history schemas
class MedicalHistoryUpdate(BaseModel):
    """Schema for updating patient medical history."""
    
    medical_conditions: Optional[str] = Field(None, max_length=2000)
    medications_current: Optional[str] = Field(None, max_length=2000)
    allergies: Optional[str] = Field(None, max_length=1000)
    blood_type: Optional[BloodType] = None
    emergency_contact_name: Optional[str] = Field(None, max_length=255)
    emergency_contact_phone: Optional[str] = Field(None, max_length=50)
    emergency_contact_relationship: Optional[str] = Field(None, max_length=100)

# DENTAL_SPECIFIC: Consent management schemas
class ConsentUpdate(BaseModel):
    """Schema for updating patient consent preferences."""
    
    consent_treatment: Optional[bool] = None
    consent_marketing: Optional[bool] = None
    consent_data_sharing: Optional[bool] = None
    consent_date: datetime = Field(default_factory=datetime.utcnow)
    consent_method: str = Field(
        default="in_person",
        description="How consent was obtained (in_person, electronic, phone)"
    )

# PLATFORM_EXTRACTABLE: Pagination response (universal pattern)
class PaginatedResponse(BaseModel):
    """Generic paginated response for patient lists."""
    items: List[PatientResponse]
    total: int
    page: int
    size: int
    pages: int

# DENTAL_SPECIFIC: Patient statistics schemas
class PatientStatistics(BaseModel):
    """
    Patient statistics specific to dental practice management.
    
    DENTAL_SPECIFIC: Metrics relevant to dental practice operations.
    """
    
    total_patients: int
    active_patients: int
    archived_patients: int
    
    insurance_coverage: Dict[str, Any] = Field(
        description="Insurance coverage statistics"
    )
    
    medical_risk_factors: Dict[str, int] = Field(
        description="Count of patients with various medical risk factors"
    )
    
    age_distribution: Dict[str, int] = Field(
        description="Patient count by age groups"
    )
    
    dental_anxiety_stats: Dict[str, int] = Field(
        default_factory=dict,
        description="Distribution of dental anxiety levels"
    )

# DENTAL_SPECIFIC: Appointment preference schemas
class AppointmentPreferences(BaseModel):
    """Schema for patient appointment preferences."""
    
    preferred_time: Optional[str] = Field(
        None,
        pattern="^(morning|afternoon|evening|flexible)$"
    )
    preferred_days: Optional[List[str]] = Field(
        None,
        description="Preferred days of week"
    )
    advance_notice_days: int = Field(
        default=7,
        ge=1,
        le=365,
        description="How many days advance notice needed"
    )
    reminder_preferences: Dict[str, bool] = Field(
        default_factory=lambda: {
            "email": True,
            "sms": False,
            "phone": False
        }
    )
    
    @validator('preferred_days')
    def validate_preferred_days(cls, v):
        """Validate day names."""
        if v:
            valid_days = [
                'monday', 'tuesday', 'wednesday', 'thursday', 
                'friday', 'saturday', 'sunday'
            ]
            for day in v:
                if day.lower() not in valid_days:
                    raise ValueError(f'Invalid day: {day}')
        return v
