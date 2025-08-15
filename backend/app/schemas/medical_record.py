# DENTAL_SPECIFIC: Pydantic schemas for medical records management
"""
Pydantic schemas for medical records and documents in dental practices.
These schemas handle validation, serialization, and API contracts.

PLATFORM_PATTERN: Each vertical will have similar "service record" schemas:
- VetGest: VeterinaryRecord schemas (treatments, vaccinations)
- MechaGest: ServiceRecord schemas (repairs, maintenance)
- RestaurantGest: ServiceRecord schemas (orders, special requests)
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, validator
from enum import Enum

# Import enums from models
from ..models.medical_record import TreatmentStatus, TreatmentPriority, ProcedureCategory
from ..models.medical_document import DocumentType, AccessLevel, ImageQuality
import enum

# 🔥 DOCUMENT CATEGORIES for UI filtering
class DocumentCategory(enum.Enum):
    """Document categories for UI filtering."""
    MEDICAL = "medical"
    ADMINISTRATIVE = "administrative"
    LEGAL = "legal"
    BILLING = "billing"

# PLATFORM_CORE: Patient info schemas (for embedding)
class PatientBasicInfo(BaseModel):
    """Basic patient information for embedding in records."""
    id: str = Field(..., description="Patient UUID")
    first_name: str = Field(..., description="Patient first name")
    last_name: str = Field(..., description="Patient last name")
    email: Optional[str] = Field(None, description="Patient email")
    phone: Optional[str] = Field(None, description="Patient phone")
    birth_date: Optional[date] = Field(None, description="Patient birth date")
    
    class Config:
        from_attributes = True

# DENTAL_SPECIFIC: Medical Record schemas
class MedicalRecordBase(BaseModel):
    """Base schema for medical records."""
    visit_date: date = Field(..., description="Date of the clinical visit")
    chief_complaint: Optional[str] = Field(None, max_length=1000, description="Patient's main concern")
    diagnosis: str = Field(..., max_length=2000, description="Clinical diagnosis and findings")
    treatment_plan: Optional[str] = Field(None, max_length=2000, description="Planned treatment approach")
    treatment_performed: Optional[str] = Field(None, max_length=2000, description="Treatment performed")
    clinical_notes: Optional[str] = Field(None, max_length=3000, description="Clinical observations")
    
    # Procedure information
    procedure_codes: Optional[List[str]] = Field(None, description="Dental procedure codes")
    procedure_category: Optional[ProcedureCategory] = Field(None, description="Procedure category")
    tooth_numbers: Optional[List[int]] = Field(None, description="Affected tooth numbers")
    surfaces_treated: Optional[Dict[str, List[str]]] = Field(None, description="Tooth surfaces treated")
    
    # Treatment status
    treatment_status: TreatmentStatus = Field(default=TreatmentStatus.PLANNED)
    priority: TreatmentPriority = Field(default=TreatmentPriority.MEDIUM)
    
    # Financial information
    estimated_cost: Optional[float] = Field(None, ge=0, description="Estimated treatment cost")
    actual_cost: Optional[float] = Field(None, ge=0, description="Actual cost charged")
    insurance_covered: bool = Field(default=False, description="Insurance coverage status")
    
    # Follow-up
    follow_up_required: bool = Field(default=False)
    follow_up_date: Optional[date] = Field(None, description="Scheduled follow-up date")
    follow_up_notes: Optional[str] = Field(None, max_length=1000)
    treatment_outcome: Optional[str] = Field(None, max_length=1000)
    patient_feedback: Optional[str] = Field(None, max_length=1000)
    
    # Status
    is_confidential: bool = Field(default=False)
    
    @validator('tooth_numbers')
    def validate_tooth_numbers(cls, v):
        """Validate tooth numbers are within valid range."""
        if v:
            for tooth in v:
                if not (1 <= tooth <= 52):  # Adult + primary teeth numbering
                    raise ValueError(f'Invalid tooth number: {tooth}. Must be between 1-52.')
        return v
    
    @validator('follow_up_date')
    def validate_follow_up_date(cls, v, values):
        """Ensure follow-up date is in the future if follow-up is required."""
        if values.get('follow_up_required') and v:
            if v <= values.get('visit_date', date.today()):
                raise ValueError('Follow-up date must be after visit date')
        return v
    
    @validator('actual_cost')
    def validate_actual_cost(cls, v, values):
        """Validate actual cost against estimated cost."""
        if v and values.get('estimated_cost'):
            if v > values['estimated_cost'] * 2:  # More than 200% of estimate
                raise ValueError('Actual cost significantly exceeds estimate. Please verify.')
        return v

class MedicalRecordCreate(MedicalRecordBase):
    """Schema for creating new medical records."""
    patient_id: str = Field(..., description="Patient UUID")
    appointment_id: Optional[str] = Field(None, description="Appointment UUID")

class MedicalRecordUpdate(BaseModel):
    """Schema for updating medical records. All fields optional."""
    visit_date: Optional[date] = None
    chief_complaint: Optional[str] = Field(None, max_length=1000)
    diagnosis: Optional[str] = Field(None, max_length=2000)
    treatment_plan: Optional[str] = Field(None, max_length=2000)
    treatment_performed: Optional[str] = Field(None, max_length=2000)
    clinical_notes: Optional[str] = Field(None, max_length=3000)
    
    procedure_codes: Optional[List[str]] = None
    procedure_category: Optional[ProcedureCategory] = None
    tooth_numbers: Optional[List[int]] = None
    surfaces_treated: Optional[Dict[str, List[str]]] = None
    
    treatment_status: Optional[TreatmentStatus] = None
    priority: Optional[TreatmentPriority] = None
    
    estimated_cost: Optional[float] = Field(None, ge=0)
    actual_cost: Optional[float] = Field(None, ge=0)
    insurance_covered: Optional[bool] = None
    
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[date] = None
    follow_up_notes: Optional[str] = Field(None, max_length=1000)
    treatment_outcome: Optional[str] = Field(None, max_length=1000)
    patient_feedback: Optional[str] = Field(None, max_length=1000)
    
    is_confidential: Optional[bool] = None

class MedicalRecordResponse(MedicalRecordBase):
    """Schema for medical record responses."""
    id: str = Field(..., description="Record UUID")
    patient_id: str = Field(..., description="Patient UUID")
    appointment_id: Optional[str] = None
    
    # 👤 PATIENT INFO - NUEVO!
    patient: Optional[PatientBasicInfo] = Field(None, description="Patient basic information")
    
    # AI fields
    ai_transcribed: bool = Field(default=False)
    ai_confidence_score: Optional[float] = None
    
    # Audit fields
    created_at: datetime
    updated_at: datetime
    created_by: str
    updated_by: Optional[str] = None
    
    # Computed properties
    age_days: int = Field(..., description="Age of record in days")
    is_recent: bool = Field(..., description="Is from recent visit")
    requires_attention: bool = Field(..., description="Requires immediate attention")
    total_teeth_affected: int = Field(..., description="Number of teeth affected")
    is_major_treatment: bool = Field(..., description="Is major treatment")
    treatment_summary: str = Field(..., description="Brief treatment summary")
    
    class Config:
        from_attributes = True

# DENTAL_SPECIFIC: Medical Document schemas
class MedicalDocumentBase(BaseModel):
    """Base schema for medical documents."""
    title: str = Field(..., max_length=255, description="Document title")
    description: Optional[str] = Field(None, max_length=1000, description="Document description")
    document_type: DocumentType = Field(..., description="Type of medical document")
    
    # Clinical metadata
    tooth_numbers: Optional[List[int]] = Field(None, description="Relevant tooth numbers")
    anatomical_region: Optional[str] = Field(None, max_length=100, description="Anatomical region")
    clinical_notes: Optional[str] = Field(None, max_length=1000, description="Clinical notes")
    
    # Document dates
    document_date: Optional[datetime] = Field(None, description="When document was taken")
    expiry_date: Optional[datetime] = Field(None, description="Document expiry date")
    
    # Access control
    access_level: AccessLevel = Field(default=AccessLevel.MEDICAL)
    is_confidential: bool = Field(default=False)
    
    # Image quality (for images)
    image_quality: Optional[ImageQuality] = Field(None, description="Image quality assessment")
    
    @validator('tooth_numbers')
    def validate_tooth_numbers(cls, v):
        """Validate tooth numbers are within valid range."""
        if v:
            for tooth in v:
                if not (1 <= tooth <= 52):
                    raise ValueError(f'Invalid tooth number: {tooth}')
        return v
    
    @validator('expiry_date')
    def validate_expiry_date(cls, v, values):
        """Ensure expiry date is after document date."""
        if v and values.get('document_date'):
            if v <= values['document_date']:
                raise ValueError('Expiry date must be after document date')
        return v

class MedicalDocumentCreate(MedicalDocumentBase):
    """Schema for creating new medical documents."""
    patient_id: str = Field(..., description="Patient UUID")
    medical_record_id: Optional[str] = Field(None, description="Medical record UUID")
    appointment_id: Optional[str] = Field(None, description="Appointment UUID")

class MedicalDocumentUpdate(BaseModel):
    """Schema for updating medical documents. All fields optional."""
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    document_type: Optional[DocumentType] = None
    
    tooth_numbers: Optional[List[int]] = None
    anatomical_region: Optional[str] = Field(None, max_length=100)
    clinical_notes: Optional[str] = Field(None, max_length=1000)
    
    document_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    
    access_level: Optional[AccessLevel] = None
    is_confidential: Optional[bool] = None
    image_quality: Optional[ImageQuality] = None

class MedicalDocumentResponse(MedicalDocumentBase):
    """Schema for medical document responses."""
    id: str = Field(..., description="Document UUID")
    patient_id: str = Field(..., description="Patient UUID")
    medical_record_id: Optional[str] = None
    appointment_id: Optional[str] = None
    
    # File information
    file_name: str = Field(..., description="Original file name")
    file_size: int = Field(..., description="File size in bytes")
    file_size_mb: float = Field(..., description="File size in MB")
    mime_type: str = Field(..., description="MIME type")
    file_extension: str = Field(..., description="File extension")
    
    # Image metadata
    image_width: Optional[int] = None
    image_height: Optional[int] = None
    
    # Audio metadata
    audio_duration_seconds: Optional[int] = None
    audio_transcription: Optional[str] = None
    
    # AI analysis
    ai_analyzed: bool = Field(default=False)
    ai_analysis_results: Optional[Dict[str, Any]] = None
    ai_confidence_scores: Optional[Dict[str, Any]] = None
    ocr_extracted_text: Optional[str] = None
    ai_tags: Optional[List[str]] = None
    
    # Status
    is_active: bool = Field(default=True)
    is_archived: bool = Field(default=False)
    version: str = Field(default="1.0")
    
    # Audit fields
    created_at: datetime
    updated_at: datetime
    created_by: str
    updated_by: Optional[str] = None
    
    # Computed properties
    age_days: int = Field(..., description="Age of document in days")
    is_image: bool = Field(..., description="Is image file")
    is_xray: bool = Field(..., description="Is X-ray image")
    is_voice_note: bool = Field(..., description="Is voice note")
    is_expired: bool = Field(..., description="Is expired")
    total_teeth_shown: int = Field(..., description="Number of teeth shown")
    is_full_mouth: bool = Field(..., description="Shows full mouth")
    requires_ai_analysis: bool = Field(..., description="Should be analyzed by AI")
    
    # URLs
    download_url: str = Field(..., description="Download URL")
    thumbnail_url: Optional[str] = Field(None, description="Thumbnail URL")
    
    class Config:
        from_attributes = True

# DENTAL_SPECIFIC: Search and filter schemas
class MedicalRecordSearchParams(BaseModel):
    """Search parameters for medical records."""
    patient_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    procedure_category: Optional[ProcedureCategory] = None
    treatment_status: Optional[TreatmentStatus] = None
    priority: Optional[TreatmentPriority] = None
    tooth_number: Optional[int] = None
    requires_follow_up: Optional[bool] = None
    is_confidential: Optional[bool] = None
    search: Optional[str] = Field(None, max_length=100, description="Text search in diagnosis/notes")
    
    # Pagination
    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)
    
    # Sorting
    sort_by: str = Field(default="visit_date", description="Field to sort by")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")

class MedicalDocumentSearchParams(BaseModel):
    """Search parameters for medical documents."""
    patient_id: Optional[str] = None
    medical_record_id: Optional[str] = None
    document_type: Optional[DocumentType] = None
    category: Optional[DocumentCategory] = None  # 🔥 NEW: Category filter
    access_level: Optional[AccessLevel] = None
    tooth_number: Optional[int] = None
    anatomical_region: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_image: Optional[bool] = None
    is_xray: Optional[bool] = None
    ai_analyzed: Optional[bool] = None
    is_expired: Optional[bool] = None
    search: Optional[str] = Field(None, max_length=100, description="Text search in title/description")
    
    # Pagination
    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)
    
    # Sorting
    sort_by: str = Field(default="created_at", description="Field to sort by")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")

# PLATFORM_EXTRACTABLE: Pagination response (universal pattern)
class PaginatedMedicalRecordsResponse(BaseModel):
    """Paginated medical records response."""
    items: List[MedicalRecordResponse]
    total: int
    page: int
    size: int
    pages: int

class PaginatedMedicalDocumentsResponse(BaseModel):
    """Paginated medical documents response."""
    items: List[MedicalDocumentResponse]
    total: int
    page: int
    size: int
    pages: int

# DENTAL_SPECIFIC: Statistical schemas
class MedicalRecordsStatistics(BaseModel):
    """Statistics for medical records."""
    total_records: int
    records_by_category: Dict[str, int] = Field(description="Count by procedure category")
    records_by_status: Dict[str, int] = Field(description="Count by treatment status")
    records_by_priority: Dict[str, int] = Field(description="Count by priority")
    pending_follow_ups: int
    records_this_month: int
    average_cost: Optional[float] = None
    total_revenue: Optional[float] = None

class MedicalDocumentsStatistics(BaseModel):
    """Statistics for medical documents."""
    total_documents: int
    documents_by_type: Dict[str, int] = Field(description="Count by document type")
    total_storage_mb: float = Field(description="Total storage used in MB")
    documents_this_month: int
    ai_analyzed_count: int
    pending_ai_analysis: int
    expired_documents: int

# DENTAL_SPECIFIC: Bulk operation schemas
class BulkMedicalRecordUpdate(BaseModel):
    """Schema for bulk updating medical records."""
    record_ids: List[str] = Field(..., min_items=1, max_items=100)
    updates: MedicalRecordUpdate
    
class BulkMedicalDocumentUpdate(BaseModel):
    """Schema for bulk updating medical documents."""
    document_ids: List[str] = Field(..., min_items=1, max_items=50)
    updates: MedicalDocumentUpdate

class BulkOperationResponse(BaseModel):
    """Response for bulk operations."""
    success_count: int
    failed_count: int
    failed_ids: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)

# DENTAL_SPECIFIC: File upload schemas
class FileUploadResponse(BaseModel):
    """Response for file upload operations."""
    document_id: str
    file_name: str
    file_size: int
    file_size_mb: float
    mime_type: str
    upload_success: bool
    message: str
    
class MultipleFileUploadResponse(BaseModel):
    """Response for multiple file uploads."""
    successful_uploads: List[FileUploadResponse]
    failed_uploads: List[Dict[str, str]] = Field(default_factory=list)
    total_uploaded: int
    total_failed: int
