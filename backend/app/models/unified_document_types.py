"""
🗂️ UNIFIED DOCUMENT TYPES SCHEMA v2.0
By PunkClaude & Team Anarquista - Revolutionary Backend Architecture

🎯 PURPOSE:
- Updates SQLAlchemy models for unified document types
- Integrates AI-ready smart tags system
- Maintains full legal compliance
- Zero-downtime backend migration
"""

from sqlalchemy import Column, String, DateTime, JSON, Numeric, ForeignKey, Index, Integer, Boolean
from sqlalchemy import Enum as sa_Enum
from sqlalchemy.dialects.postgresql import UUID, TSVECTOR
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum

# Create base class if not imported
Base = declarative_base()

# 🗂️ UNIFIED DOCUMENT TYPE ENUM
class UnifiedDocumentType(enum.Enum):
    """Unified document types - replaces the 23-type enum hell"""
    
    # 🏥 MEDICAL TYPES
    XRAY = "xray"                    # All X-ray types unified
    PHOTO_CLINICAL = "photo_clinical" # All clinical photos unified
    VOICE_NOTE = "voice_note"        # Voice recordings
    TREATMENT_PLAN = "treatment_plan" # Treatment plans
    LAB_REPORT = "lab_report"        # Laboratory reports
    PRESCRIPTION = "prescription"     # Prescriptions
    SCAN_3D = "scan_3d"             # STL files and 3D scans
    
    # 📋 ADMINISTRATIVE TYPES
    CONSENT_FORM = "consent_form"    # Patient consent forms
    INSURANCE_FORM = "insurance_form" # Insurance documents
    DOCUMENT_GENERAL = "document_general" # General documents
    
    # 💰 BILLING TYPES
    INVOICE = "invoice"              # Invoices and billing
    BUDGET = "budget"                # Treatment budgets
    PAYMENT_PROOF = "payment_proof"  # Payment proofs
    
    # ⚖️ LEGAL TYPES
    REFERRAL_LETTER = "referral_letter" # Medical referrals
    LEGAL_DOCUMENT = "legal_document"   # Legal documents

# 🏛️ LEGAL CATEGORY ENUM
class LegalCategory(enum.Enum):
    """Legal document categories for compliance"""
    MEDICAL = "medical"              # GDPR Article 9 - Special category
    ADMINISTRATIVE = "administrative" # Standard administrative
    BILLING = "billing"              # Financial records
    LEGAL = "legal"                  # Legal documents

# 🤖 SMART TAGS MODEL - AI-Ready Document Intelligence
class SmartTag(Base):
    """
    🤖 Smart Tags System v2.0
    
    Stores AI-generated and manual tags for documents
    Enables advanced search, categorization, and AI features
    """
    __tablename__ = 'smart_tags'
    
    # 🔑 PRIMARY FIELDS
    id = Column(UUID(as_uuid=True), primary_key=True, server_default='gen_random_uuid()')
    document_id = Column(UUID(as_uuid=True), ForeignKey('medical_documents.id', ondelete='CASCADE'), nullable=False)
    unified_type = Column(sa_Enum(UnifiedDocumentType), nullable=False)
    legal_category = Column(sa_Enum(LegalCategory), nullable=False)
    
    # 🤖 AI GENERATED TAGS
    ai_anatomy = Column(JSON, nullable=True)          # ['tooth_1', 'mandible', 'maxilla']
    ai_condition = Column(JSON, nullable=True)        # ['caries', 'crown_preparation']
    ai_treatment = Column(JSON, nullable=True)        # ['root_canal', 'implant']
    ai_quality = Column(JSON, nullable=True)          # ['excellent', 'diagnostic_quality']
    ai_urgency = Column(JSON, nullable=True)          # ['routine', 'urgent', 'emergency']
    ai_confidence = Column(Numeric(3,2), nullable=True) # 0.00 - 1.00 AI confidence
    
    # 👤 MANUAL TAGS
    manual_tags = Column(JSON, nullable=True)         # User-added tags
    manual_priority = Column(String(20), nullable=True) # User priority
    
    # 🔍 SEARCHABLE TAGS (combined AI + manual)
    searchable_tags = Column(JSON, nullable=True)     # All searchable terms
    search_vector = Column(TSVECTOR, nullable=True)   # Full-text search vector
    
    # 🚀 AI FEATURES DATA
    voice_tags = Column(JSON, nullable=True)          # Voice transcription data
    analysis_result = Column(JSON, nullable=True)     # AI analysis results
    aesthetic_data = Column(JSON, nullable=True)      # Aesthetic analysis
    prosthetic_data = Column(JSON, nullable=True)     # Prosthetic planning data
    
    # 📊 AUDIT FIELDS
    created_at = Column(DateTime, nullable=False, server_default='NOW()')
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    updated_at = Column(DateTime, nullable=True)
    
    # 🔗 RELATIONSHIPS
    document = relationship("MedicalDocument", back_populates="smart_tags")
    creator = relationship("User")
    
    # 📊 INDEXES FOR PERFORMANCE
    __table_args__ = (
        Index('idx_smart_tags_document_id', 'document_id'),
        Index('idx_smart_tags_unified_type', 'unified_type'),
        Index('idx_smart_tags_legal_category', 'legal_category'),
        Index('idx_smart_tags_search_vector', 'search_vector', postgresql_using='gin'),
    )

# 📝 UPDATED MEDICAL DOCUMENT MODEL
class MedicalDocument(Base):
    """
    📝 Enhanced Medical Document Model
    
    Now supports unified document types and legal categories
    Maintains backward compatibility while enabling new features
    """
    __tablename__ = 'medical_documents'
    
    # 🔑 PRIMARY FIELDS (existing)
    id = Column(UUID(as_uuid=True), primary_key=True, server_default='gen_random_uuid()')
    patient_id = Column(UUID(as_uuid=True), ForeignKey('patients.id'), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_path = Column(String(500), nullable=False)
    
    # 🆕 UNIFIED DOCUMENT TYPES (new fields)
    unified_type = Column(sa_Enum(UnifiedDocumentType), nullable=False)
    legal_category = Column(sa_Enum(LegalCategory), nullable=False)
    
    # 🔙 LEGACY COMPATIBILITY (deprecated but preserved)
    document_type = Column(String(50), nullable=True)  # Keep for backward compatibility
    access_level = Column(String(20), nullable=True)   # Keep for backward compatibility
    
    # 📊 METADATA
    description = Column(String(1000), nullable=True)
    notes = Column(String(2000), nullable=True)
    upload_date = Column(DateTime, nullable=False, server_default='NOW()')
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    # 🛡️ LEGAL PROTECTION
    is_protected = Column(Boolean, default=True, nullable=False)
    retention_until = Column(DateTime, nullable=True)
    deletion_requested = Column(Boolean, default=False, nullable=False)
    deletion_approved_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    
    # 🔗 RELATIONSHIPS
    patient = relationship("Patient", back_populates="medical_documents")
    uploader = relationship("User", foreign_keys=[uploaded_by])
    deletion_approver = relationship("User", foreign_keys=[deletion_approved_by])
    smart_tags = relationship("SmartTag", back_populates="document", cascade="all, delete-orphan")
    
    # 📊 INDEXES FOR PERFORMANCE
    __table_args__ = (
        Index('idx_medical_documents_patient_id', 'patient_id'),
        Index('idx_medical_documents_unified_type', 'unified_type'),
        Index('idx_medical_documents_legal_category', 'legal_category'),
        Index('idx_medical_documents_upload_date', 'upload_date'),
        Index('idx_medical_documents_is_protected', 'is_protected'),
    )
    
    # 🛠️ UTILITY METHODS
    def get_legal_category_display(self) -> str:
        """Get human-readable legal category"""
        category_map = {
            LegalCategory.MEDICAL: "Médico - GDPR Art. 9",
            LegalCategory.ADMINISTRATIVE: "Administrativo",
            LegalCategory.BILLING: "Facturación",
            LegalCategory.LEGAL: "Legal"
        }
        return category_map.get(self.legal_category, "Unknown")
    
    def get_unified_type_display(self) -> str:
        """Get human-readable document type"""
        type_map = {
            UnifiedDocumentType.XRAY: "Radiografía",
            UnifiedDocumentType.PHOTO_CLINICAL: "Fotografía Clínica",
            UnifiedDocumentType.VOICE_NOTE: "Nota de Voz",
            UnifiedDocumentType.TREATMENT_PLAN: "Plan de Tratamiento",
            UnifiedDocumentType.LAB_REPORT: "Reporte de Laboratorio",
            UnifiedDocumentType.PRESCRIPTION: "Prescripción",
            UnifiedDocumentType.SCAN_3D: "Escaneo 3D",
            UnifiedDocumentType.CONSENT_FORM: "Formulario de Consentimiento",
            UnifiedDocumentType.INSURANCE_FORM: "Formulario de Seguro",
            UnifiedDocumentType.DOCUMENT_GENERAL: "Documento General",
            UnifiedDocumentType.INVOICE: "Factura",
            UnifiedDocumentType.BUDGET: "Presupuesto",
            UnifiedDocumentType.PAYMENT_PROOF: "Comprobante de Pago",
            UnifiedDocumentType.REFERRAL_LETTER: "Carta de Derivación",
            UnifiedDocumentType.LEGAL_DOCUMENT: "Documento Legal"
        }
        return type_map.get(self.unified_type, "Unknown")
    
    def is_ai_ready(self) -> bool:
        """Check if document supports AI features"""
        ai_ready_types = {
            UnifiedDocumentType.XRAY,
            UnifiedDocumentType.PHOTO_CLINICAL,
            UnifiedDocumentType.VOICE_NOTE,
            UnifiedDocumentType.SCAN_3D
        }
        return self.unified_type in ai_ready_types
    
    def get_color_scheme(self) -> dict:
        """Get color scheme for visual cards (IAnarkalendar style)"""
        color_schemes = {
            LegalCategory.MEDICAL: {
                'bg': 'bg-red-50 dark:bg-red-900/20',
                'border': 'border-red-200 dark:border-red-800',
                'accent': 'text-red-600 dark:text-red-400',
                'badge': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
            },
            LegalCategory.ADMINISTRATIVE: {
                'bg': 'bg-blue-50 dark:bg-blue-900/20',
                'border': 'border-blue-200 dark:border-blue-800',
                'accent': 'text-blue-600 dark:text-blue-400',
                'badge': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
            },
            LegalCategory.BILLING: {
                'bg': 'bg-green-50 dark:bg-green-900/20',
                'border': 'border-green-200 dark:border-green-800',
                'accent': 'text-green-600 dark:text-green-400',
                'badge': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
            },
            LegalCategory.LEGAL: {
                'bg': 'bg-purple-50 dark:bg-purple-900/20',
                'border': 'border-purple-200 dark:border-purple-800',
                'accent': 'text-purple-600 dark:text-purple-400',
                'badge': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
            }
        }
        return color_schemes.get(self.legal_category, color_schemes[LegalCategory.ADMINISTRATIVE])

# 🔄 LEGACY MAPPING FUNCTIONS (for backward compatibility)
class LegacyDocumentMapping:
    """
    🔄 Legacy Document Type Mapping
    
    Provides backward compatibility with old enum system
    Enables gradual migration of frontend components
    """
    
    # 🗺️ LEGACY TO UNIFIED MAPPING
    LEGACY_TO_UNIFIED = {
        # 🏥 MEDICAL MAPPINGS
        'xray_bitewing': UnifiedDocumentType.XRAY,
        'xray_panoramic': UnifiedDocumentType.XRAY,
        'xray_periapical': UnifiedDocumentType.XRAY,
        'xray_cephalometric': UnifiedDocumentType.XRAY,
        'ct_scan': UnifiedDocumentType.XRAY,
        'cbct_scan': UnifiedDocumentType.XRAY,
        
        'intraoral_photo': UnifiedDocumentType.PHOTO_CLINICAL,
        'extraoral_photo': UnifiedDocumentType.PHOTO_CLINICAL,
        'clinical_photo': UnifiedDocumentType.PHOTO_CLINICAL,
        'progress_photo': UnifiedDocumentType.PHOTO_CLINICAL,
        'before_after_photo': UnifiedDocumentType.PHOTO_CLINICAL,
        
        'voice_note': UnifiedDocumentType.VOICE_NOTE,
        'treatment_plan': UnifiedDocumentType.TREATMENT_PLAN,
        'lab_report': UnifiedDocumentType.LAB_REPORT,
        'prescription': UnifiedDocumentType.PRESCRIPTION,
        'stl_file': UnifiedDocumentType.SCAN_3D,
        'scan_impression': UnifiedDocumentType.SCAN_3D,
        
        # 📋 ADMINISTRATIVE MAPPINGS
        'consent_form': UnifiedDocumentType.CONSENT_FORM,
        'insurance_form': UnifiedDocumentType.INSURANCE_FORM,
        'other_document': UnifiedDocumentType.DOCUMENT_GENERAL,
        
        # 💰 BILLING MAPPINGS
        'insurance_document': UnifiedDocumentType.INVOICE,
        
        # ⚖️ LEGAL MAPPINGS
        'referral_letter': UnifiedDocumentType.REFERRAL_LETTER
    }
    
    # 🔄 UNIFIED TO LEGACY MAPPING (for API compatibility)
    UNIFIED_TO_LEGACY = {v: k for k, v in LEGACY_TO_UNIFIED.items()}
    
    @classmethod
    def convert_legacy_to_unified(cls, legacy_type: str) -> UnifiedDocumentType:
        """Convert legacy document type to unified type"""
        return cls.LEGACY_TO_UNIFIED.get(legacy_type, UnifiedDocumentType.DOCUMENT_GENERAL)
    
    @classmethod
    def convert_unified_to_legacy(cls, unified_type: UnifiedDocumentType) -> str:
        """Convert unified type to legacy type (for backward compatibility)"""
        return cls.UNIFIED_TO_LEGACY.get(unified_type, 'other_document')
    
    @classmethod
    def get_legal_category_from_legacy(cls, legacy_type: str, access_level: str = None) -> LegalCategory:
        """Determine legal category from legacy type and access level"""
        if access_level == 'medical' or legacy_type in [
            'xray_bitewing', 'xray_panoramic', 'xray_periapical', 'xray_cephalometric',
            'ct_scan', 'cbct_scan', 'intraoral_photo', 'extraoral_photo', 
            'clinical_photo', 'progress_photo', 'before_after_photo',
            'voice_note', 'treatment_plan', 'lab_report', 'prescription',
            'stl_file', 'scan_impression'
        ]:
            return LegalCategory.MEDICAL
        elif legacy_type in ['insurance_document', 'invoice']:
            return LegalCategory.BILLING
        elif legacy_type in ['consent_form', 'referral_letter']:
            return LegalCategory.LEGAL
        else:
            return LegalCategory.ADMINISTRATIVE
