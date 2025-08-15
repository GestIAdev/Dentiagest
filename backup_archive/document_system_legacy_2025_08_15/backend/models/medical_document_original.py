# DENTAL_SPECIFIC: Medical Document model - Digital asset management for dental practices
"""
Medical Document model for storing and managing digital medical assets.
Supports images, documents, voice recordings, and other multimedia files.

PLATFORM_PATTERN: Other verticals will have similar "media/document" models:
- VetGest: VetDocument (X-rays, photos, vaccination certificates)
- MechaGest: ServiceDocument (photos, repair manuals, invoices)
- RestaurantGest: OrderDocument (photos, receipts, supplier documents)

AI-READY: Designed for future image analysis, OCR, and voice transcription.
"""

from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum as SQLEnum, ForeignKey, BigInteger, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
import os

from ..core.database import Base

# DENTAL_SPECIFIC: Document type enum
class DocumentType(enum.Enum):
    """Types of medical documents."""
    XRAY_BITEWING = "xray_bitewing"
    XRAY_PANORAMIC = "xray_panoramic"
    XRAY_PERIAPICAL = "xray_periapical"
    XRAY_CEPHALOMETRIC = "xray_cephalometric"
    CT_SCAN = "ct_scan"
    CBCT_SCAN = "cbct_scan"
    INTRAORAL_PHOTO = "intraoral_photo"
    EXTRAORAL_PHOTO = "extraoral_photo"
    CLINICAL_PHOTO = "clinical_photo"
    PROGRESS_PHOTO = "progress_photo"
    BEFORE_AFTER_PHOTO = "before_after_photo"
    TREATMENT_PLAN = "treatment_plan"
    CONSENT_FORM = "consent_form"
    INSURANCE_FORM = "insurance_form"
    LAB_REPORT = "lab_report"
    REFERRAL_LETTER = "referral_letter"
    PRESCRIPTION = "prescription"
    VOICE_NOTE = "voice_note"
    SCAN_IMPRESSION = "scan_impression"
    STL_FILE = "stl_file"
    OTHER_DOCUMENT = "other_document"

# DENTAL_SPECIFIC: Document access level - LEGAL COMPLIANCE
class AccessLevel(enum.Enum):
    """
    Access levels for medical documents - SIMPLIFIED FOR LEGAL COMPLIANCE.
    
    SPANISH MEDICAL DATA LAW:
    - MEDICAL: Only medical professionals can access (doctors + qualified assistants)  
    - ADMINISTRATIVE: Non-medical staff can access (receptionists + admins + doctors)
    """
    MEDICAL = "medical"                    # Medical professionals only
    ADMINISTRATIVE = "administrative"     # All staff can access

# DENTAL_SPECIFIC: Image quality enum
class ImageQuality(enum.Enum):
    """Quality rating for medical images."""
    EXCELLENT = "excellent"
    GOOD = "good"
    ACCEPTABLE = "acceptable"
    POOR = "poor"
    RETAKE_REQUIRED = "retake_required"

# DENTAL_SPECIFIC: Medical Document model
class MedicalDocument(Base):
    """
    Medical Document model for comprehensive digital asset management.
    
    Stores all types of medical documents, images, and multimedia files
    with extensive metadata for organization and AI analysis.
    
    AI-READY: Designed to support image analysis, OCR, and voice transcription.
    """
    __tablename__ = "medical_documents"
    
    # PLATFORM_CORE: Primary identification
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        comment="Unique identifier for the document"
    )
    
    # PLATFORM_CORE: Foreign key relationships
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=True,  # 🌍 GLOBAL MODE: Allow NULL for administrative/global documents
        index=True,
        comment="Reference to the patient (NULL for global/administrative documents)"
    )
    
    medical_record_id = Column(
        UUID(as_uuid=True),
        ForeignKey("medical_records.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Reference to the medical record"
    )
    
    appointment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Reference to the appointment"
    )
    
    # DENTAL_SPECIFIC: Document classification
    document_type = Column(
        SQLEnum(DocumentType),
        nullable=False,
        index=True,
        comment="Type of medical document"
    )
    
    title = Column(
        String(255),
        nullable=False,
        comment="Document title or name"
    )
    
    description = Column(
        Text,
        nullable=True,
        comment="Document description and notes"
    )
    
    # PLATFORM_CORE: File information
    file_name = Column(
        String(255),
        nullable=False,
        comment="Original file name"
    )
    
    file_path = Column(
        String(500),
        nullable=False,
        comment="File storage path"
    )
    
    file_size = Column(
        BigInteger,
        nullable=False,
        comment="File size in bytes"
    )
    
    mime_type = Column(
        String(100),
        nullable=False,
        comment="MIME type of the file"
    )
    
    file_extension = Column(
        String(10),
        nullable=False,
        comment="File extension (e.g., .jpg, .pdf)"
    )
    
    # DENTAL_SPECIFIC: Image metadata (for image files)
    image_width = Column(
        BigInteger,
        nullable=True,
        comment="Image width in pixels"
    )
    
    image_height = Column(
        BigInteger,
        nullable=True,
        comment="Image height in pixels"
    )
    
    image_quality = Column(
        SQLEnum(ImageQuality),
        nullable=True,
        comment="Assessed quality of medical image"
    )
    
    # DENTAL_SPECIFIC: Clinical metadata
    tooth_numbers = Column(
        JSONB,
        nullable=True,
        comment="Teeth visible/relevant in the document as JSON array"
    )
    
    anatomical_region = Column(
        String(100),
        nullable=True,
        comment="Anatomical region covered (e.g., 'maxilla', 'mandible', 'full_mouth')"
    )
    
    clinical_notes = Column(
        Text,
        nullable=True,
        comment="Clinical notes about the document"
    )
    
    # DENTAL_SPECIFIC: Document dates
    document_date = Column(
        DateTime,
        nullable=True,
        comment="Date when document/image was taken"
    )
    
    expiry_date = Column(
        DateTime,
        nullable=True,
        comment="Document expiry date (for forms, consents)"
    )
    
    # PLATFORM_CORE: Access and security
    access_level = Column(
        SQLEnum(AccessLevel),
        default=AccessLevel.ADMINISTRATIVE,  # 🔧 FIX: Use new simplified access level
        comment="Access level for the document"
    )
    
    is_confidential = Column(
        Boolean,
        default=False,
        comment="Whether document contains confidential information"
    )
    
    password_protected = Column(
        Boolean,
        default=False,
        comment="Whether document is password protected"
    )
    
    # AI-READY: AI analysis fields
    ai_analyzed = Column(
        Boolean,
        default=False,
        comment="Whether document has been analyzed by AI"
    )
    
    ai_analysis_results = Column(
        JSONB,
        nullable=True,
        comment="AI analysis results and findings"
    )
    
    ai_confidence_scores = Column(
        JSONB,
        nullable=True,
        comment="AI confidence scores for various analyses"
    )
    
    ocr_extracted_text = Column(
        Text,
        nullable=True,
        comment="Text extracted via OCR"
    )
    
    ai_tags = Column(
        JSONB,
        nullable=True,
        comment="AI-generated tags and classifications"
    )
    
    ai_anomalies_detected = Column(
        JSONB,
        nullable=True,
        comment="AI-detected anomalies or areas of interest"
    )
    
    # AI-READY: Image embeddings for similarity search
    image_embeddings = Column(
        JSONB,
        nullable=True,
        comment="AI-generated image embeddings for similarity search"
    )
    
    # DENTAL_SPECIFIC: Voice/audio metadata (for voice notes)
    audio_duration_seconds = Column(
        BigInteger,
        nullable=True,
        comment="Duration of audio file in seconds"
    )
    
    audio_transcription = Column(
        Text,
        nullable=True,
        comment="Transcription of audio content"
    )
    
    speaker_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        comment="ID of person speaking (for voice notes)"
    )
    
    # DENTAL_SPECIFIC: DICOM metadata (for medical imaging)
    dicom_metadata = Column(
        JSONB,
        nullable=True,
        comment="DICOM metadata for medical imaging files"
    )
    
    # PLATFORM_CORE: Versioning
    version = Column(
        String(10),
        default="1.0",
        comment="Document version"
    )
    
    parent_document_id = Column(
        UUID(as_uuid=True),
        ForeignKey("medical_documents.id"),
        nullable=True,
        comment="Reference to parent document (for versions)"
    )
    
    # PLATFORM_CORE: Status
    is_active = Column(
        Boolean,
        default=True,
        comment="Whether document is active"
    )
    
    is_archived = Column(
        Boolean,
        default=False,
        comment="Whether document is archived"
    )
    
    # PLATFORM_CORE: Audit fields (universal pattern)
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        comment="When the document was uploaded"
    )
    
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        comment="When the document was last updated"
    )
    
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        comment="ID of user who uploaded this document"
    )
    
    updated_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        comment="ID of user who last updated this document"
    )
    
    # PLATFORM_CORE: Soft deletion (universal pattern)
    deleted_at = Column(
        DateTime,
        nullable=True,
        comment="When the document was soft deleted"
    )
    
    deleted_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        comment="ID of user who deleted this document"
    )
    
    # DENTAL_SPECIFIC: Relationships
    patient = relationship("Patient", back_populates="documents")
    medical_record = relationship("MedicalRecord", back_populates="documents")
    # appointment = relationship("Appointment", back_populates="documents")
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])
    speaker = relationship("User", foreign_keys=[speaker_id])
    
    # Versioning relationship
    parent_document = relationship("MedicalDocument", remote_side=[id])
    
    def __repr__(self):
        return f"<MedicalDocument(id={self.id}, type={self.document_type.value}, patient_id={self.patient_id})>"
    
    # PLATFORM_CORE: Universal document methods
    @property
    def file_size_mb(self) -> float:
        """Get file size in megabytes."""
        return round(self.file_size / (1024 * 1024), 2)
    
    @property
    def age_days(self) -> int:
        """Calculate age of document in days."""
        return (datetime.now() - self.created_at).days
    
    @property
    def is_image(self) -> bool:
        """Check if document is an image."""
        image_types = [
            DocumentType.XRAY_BITEWING, DocumentType.XRAY_PANORAMIC,
            DocumentType.XRAY_PERIAPICAL, DocumentType.XRAY_CEPHALOMETRIC,
            DocumentType.CT_SCAN, DocumentType.CBCT_SCAN,
            DocumentType.INTRAORAL_PHOTO, DocumentType.EXTRAORAL_PHOTO,
            DocumentType.CLINICAL_PHOTO, DocumentType.PROGRESS_PHOTO,
            DocumentType.BEFORE_AFTER_PHOTO
        ]
        return self.document_type in image_types
    
    @property
    def is_xray(self) -> bool:
        """Check if document is an X-ray."""
        xray_types = [
            DocumentType.XRAY_BITEWING, DocumentType.XRAY_PANORAMIC,
            DocumentType.XRAY_PERIAPICAL, DocumentType.XRAY_CEPHALOMETRIC
        ]
        return self.document_type in xray_types
    
    @property
    def is_voice_note(self) -> bool:
        """Check if document is a voice note."""
        return self.document_type == DocumentType.VOICE_NOTE
    
    @property
    def is_expired(self) -> bool:
        """Check if document is expired."""
        if not self.expiry_date:
            return False
        return datetime.now() > self.expiry_date
    
    # DENTAL_SPECIFIC: Dental-related methods
    @property
    def total_teeth_shown(self) -> int:
        """Count total number of teeth shown in the document."""
        if not self.tooth_numbers:
            return 0
        return len(self.tooth_numbers) if isinstance(self.tooth_numbers, list) else 0
    
    @property
    def is_full_mouth(self) -> bool:
        """Check if document shows full mouth."""
        return self.anatomical_region == "full_mouth" or self.total_teeth_shown >= 20
    
    @property
    def requires_ai_analysis(self) -> bool:
        """Check if document should be analyzed by AI."""
        return (
            self.is_image and 
            not self.ai_analyzed and
            self.document_type in [
                DocumentType.XRAY_BITEWING, DocumentType.XRAY_PANORAMIC,
                DocumentType.XRAY_PERIAPICAL, DocumentType.CT_SCAN,
                DocumentType.CBCT_SCAN, DocumentType.INTRAORAL_PHOTO
            ]
        )
    
    def get_file_info(self) -> dict:
        """Get comprehensive file information."""
        return {
            "file_name": self.file_name,
            "file_size_mb": self.file_size_mb,
            "mime_type": self.mime_type,
            "extension": self.file_extension,
            "is_image": self.is_image,
            "is_voice": self.is_voice_note,
            "age_days": self.age_days
        }
    
    def get_clinical_info(self) -> dict:
        """Get clinical information about the document."""
        return {
            "document_type": self.document_type.value,
            "anatomical_region": self.anatomical_region,
            "teeth_shown": self.tooth_numbers,
            "total_teeth": self.total_teeth_shown,
            "is_full_mouth": self.is_full_mouth,
            "image_quality": self.image_quality.value if self.image_quality else None,
            "clinical_notes": self.clinical_notes
        }
    
    def get_ai_analysis(self) -> dict:
        """Get AI analysis results."""
        return {
            "analyzed": self.ai_analyzed,
            "results": self.ai_analysis_results,
            "confidence_scores": self.ai_confidence_scores,
            "anomalies": self.ai_anomalies_detected,
            "tags": self.ai_tags,
            "ocr_text": self.ocr_extracted_text,
            "requires_analysis": self.requires_ai_analysis
        }
    
    def get_access_info(self) -> dict:
        """Get access and security information."""
        return {
            "access_level": self.access_level.value,
            "is_confidential": self.is_confidential,
            "password_protected": self.password_protected,
            "is_expired": self.is_expired,
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None
        }
    
    def get_download_url(self, base_url: str = "") -> str:
        """Generate download URL for the document."""
        return f"{base_url}/api/v1/medical-records/documents/{self.id}/download"
    
    def get_thumbnail_url(self, base_url: str = "") -> str:
        """Generate thumbnail URL for image documents."""
        if not self.is_image:
            return None
        return f"{base_url}/api/v1/medical-records/documents/{self.id}/thumbnail"
