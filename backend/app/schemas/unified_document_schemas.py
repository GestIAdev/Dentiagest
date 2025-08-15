"""
📋 UNIFIED DOCUMENT SCHEMAS v2.0
By PunkClaude & Team Anarquista - Revolutionary Pydantic Schemas

🎯 PURPOSE:
- Pydantic schemas for unified document system
- Request/Response models for API endpoints
- Data validation and serialization
- Type safety for frontend integration
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from uuid import UUID
import enum

# 🗂️ ENUMS FOR SCHEMAS

class UnifiedDocumentTypeSchema(str, enum.Enum):
    """Unified document types for API schemas"""
    
    # 🏥 MEDICAL TYPES
    XRAY = "xray"
    PHOTO_CLINICAL = "photo_clinical"
    VOICE_NOTE = "voice_note"
    TREATMENT_PLAN = "treatment_plan"
    LAB_REPORT = "lab_report"
    PRESCRIPTION = "prescription"
    SCAN_3D = "scan_3d"
    
    # 📋 ADMINISTRATIVE TYPES
    CONSENT_FORM = "consent_form"
    INSURANCE_FORM = "insurance_form"
    DOCUMENT_GENERAL = "document_general"
    
    # 💰 BILLING TYPES
    INVOICE = "invoice"
    BUDGET = "budget"
    PAYMENT_PROOF = "payment_proof"
    
    # ⚖️ LEGAL TYPES
    REFERRAL_LETTER = "referral_letter"
    LEGAL_DOCUMENT = "legal_document"

class LegalCategorySchema(str, enum.Enum):
    """Legal categories for API schemas"""
    MEDICAL = "medical"
    ADMINISTRATIVE = "administrative"
    BILLING = "billing"
    LEGAL = "legal"

# 🏷️ SMART TAGS SCHEMAS

class AITagsSchema(BaseModel):
    """AI-generated tags schema"""
    anatomy: Optional[List[str]] = Field(default=[], description="Anatomical structures identified")
    condition: Optional[List[str]] = Field(default=[], description="Medical conditions detected")
    treatment: Optional[List[str]] = Field(default=[], description="Treatment recommendations")
    quality: Optional[List[str]] = Field(default=[], description="Image/document quality assessment")
    urgency: Optional[List[str]] = Field(default=[], description="Urgency indicators")

class VoiceTagsSchema(BaseModel):
    """Voice analysis tags schema"""
    transcription: Optional[str] = Field(None, description="Voice transcription text")
    language: Optional[str] = Field(None, description="Detected language")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Transcription confidence")
    keywords: Optional[List[str]] = Field(default=[], description="Extracted keywords")
    sentiment: Optional[str] = Field(None, description="Sentiment analysis")

class AIAnalysisResultSchema(BaseModel):
    """Complete AI analysis result schema"""
    analysis_type: str = Field(..., description="Type of analysis performed")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Overall confidence score")
    results: Dict[str, Any] = Field(..., description="Analysis results")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")
    model_version: Optional[str] = Field(None, description="AI model version used")

class AestheticTagsSchema(BaseModel):
    """Aesthetic analysis tags schema"""
    smile_analysis: Optional[Dict[str, Any]] = Field(None, description="Smile analysis results")
    tooth_shade: Optional[List[str]] = Field(default=[], description="Tooth shade analysis")
    symmetry_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Facial symmetry score")
    recommendations: Optional[List[str]] = Field(default=[], description="Aesthetic recommendations")

class ProstheticTagsSchema(BaseModel):
    """Prosthetic planning tags schema"""
    measurements: Optional[Dict[str, float]] = Field(None, description="Prosthetic measurements")
    material_suggestions: Optional[List[str]] = Field(default=[], description="Material recommendations")
    workflow_steps: Optional[List[str]] = Field(default=[], description="Recommended workflow")
    complexity_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Procedure complexity")

class SmartTagCreateRequest(BaseModel):
    """Request schema for creating smart tags"""
    manual_tags: Optional[List[str]] = Field(default=[], description="User-added tags")
    manual_priority: Optional[str] = Field(None, description="User-defined priority")
    trigger_ai_analysis: bool = Field(False, description="Whether to trigger AI analysis")
    ai_analysis_types: Optional[List[str]] = Field(default=[], description="Types of AI analysis to run")

class SmartTagUpdateRequest(BaseModel):
    """Request schema for updating smart tags"""
    manual_tags: Optional[List[str]] = Field(None, description="Updated manual tags")
    manual_priority: Optional[str] = Field(None, description="Updated priority")
    searchable_tags: Optional[List[str]] = Field(None, description="Updated searchable tags")

class SmartTagResponse(BaseModel):
    """Response schema for smart tags"""
    id: UUID
    document_id: UUID
    unified_type: UnifiedDocumentTypeSchema
    legal_category: LegalCategorySchema
    
    # 🤖 AI TAGS
    ai_anatomy: Optional[List[str]] = None
    ai_condition: Optional[List[str]] = None
    ai_treatment: Optional[List[str]] = None
    ai_quality: Optional[List[str]] = None
    ai_urgency: Optional[List[str]] = None
    ai_confidence: Optional[float] = None
    
    # 👤 MANUAL TAGS
    manual_tags: Optional[List[str]] = None
    manual_priority: Optional[str] = None
    
    # 🔍 SEARCHABLE TAGS
    searchable_tags: Optional[List[str]] = None
    
    # 🚀 AI FEATURES
    voice_tags: Optional[VoiceTagsSchema] = None
    analysis_result: Optional[AIAnalysisResultSchema] = None
    aesthetic_data: Optional[AestheticTagsSchema] = None
    prosthetic_data: Optional[ProstheticTagsSchema] = None
    
    # 📊 METADATA
    created_at: datetime
    created_by: UUID
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# 📄 DOCUMENT SCHEMAS

class DocumentUploadRequest(BaseModel):
    """Request schema for document upload"""
    patient_id: UUID
    unified_type: UnifiedDocumentTypeSchema
    description: Optional[str] = Field(None, max_length=1000, description="Document description")
    auto_ai_analysis: bool = Field(True, description="Automatically run AI analysis")
    manual_tags: Optional[List[str]] = Field(default=[], description="Initial manual tags")
    
    @validator('description')
    def validate_description(cls, v):
        if v and len(v.strip()) == 0:
            return None
        return v

class UnifiedDocumentResponse(BaseModel):
    """Response schema for unified documents"""
    id: UUID
    patient_id: UUID
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    
    # 🆕 UNIFIED TYPES
    unified_type: UnifiedDocumentTypeSchema
    legal_category: LegalCategorySchema
    
    # 📊 METADATA
    description: Optional[str] = None
    notes: Optional[str] = None
    upload_date: datetime
    uploaded_by: UUID
    
    # 🛡️ LEGAL PROTECTION
    is_protected: bool = True
    retention_until: Optional[datetime] = None
    deletion_requested: bool = False
    
    # 🤖 AI FEATURES
    is_ai_ready: bool = Field(..., description="Whether document supports AI analysis")
    has_smart_tags: bool = Field(..., description="Whether document has smart tags")
    smart_tags: Optional[SmartTagResponse] = None
    
    # 🎨 VISUAL PROPERTIES
    color_scheme: Dict[str, str] = Field(..., description="Color scheme for visual cards")
    type_display_name: str = Field(..., description="Human-readable type name")
    category_display_name: str = Field(..., description="Human-readable category name")
    
    class Config:
        from_attributes = True

class DocumentListResponse(BaseModel):
    """Response schema for document lists"""
    documents: List[UnifiedDocumentResponse]
    total_count: int
    page: int = 1
    page_size: int = 50
    has_next: bool = False
    has_previous: bool = False

# 🔍 SEARCH SCHEMAS

class DocumentSearchFilters(BaseModel):
    """Search filters for document queries"""
    unified_types: Optional[List[UnifiedDocumentTypeSchema]] = None
    legal_categories: Optional[List[LegalCategorySchema]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    has_ai_tags: Optional[bool] = None
    ai_confidence_min: Optional[float] = Field(None, ge=0.0, le=1.0)
    manual_priority: Optional[str] = None
    uploaded_by: Optional[UUID] = None

class DocumentSearchRequest(BaseModel):
    """Request schema for document search"""
    patient_id: Optional[UUID] = None
    query: Optional[str] = Field(None, min_length=1, max_length=500, description="Search query")
    filters: Optional[DocumentSearchFilters] = None
    search_type: str = Field("standard", description="Search type: standard, semantic, or advanced")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(50, ge=1, le=100, description="Page size")
    sort_by: str = Field("upload_date", description="Sort field")
    sort_order: str = Field("desc", description="Sort order: asc or desc")

class DocumentSearchResult(BaseModel):
    """Single search result"""
    document: UnifiedDocumentResponse
    relevance_score: Optional[float] = Field(None, description="Search relevance score")
    matched_tags: Optional[List[str]] = Field(None, description="Tags that matched the search")
    snippet: Optional[str] = Field(None, description="Text snippet showing match context")

class DocumentSearchResponse(BaseModel):
    """Response schema for document search"""
    results: List[DocumentSearchResult]
    total_count: int
    page: int
    page_size: int
    has_next: bool
    has_previous: bool
    search_time: float = Field(..., description="Search execution time in seconds")
    query: Optional[str] = None
    filters_applied: Optional[DocumentSearchFilters] = None

# 📊 ANALYTICS SCHEMAS

class DocumentTypeStats(BaseModel):
    """Statistics for document types"""
    unified_type: UnifiedDocumentTypeSchema
    count: int
    percentage: float
    ai_analyzed_count: int
    recent_uploads: int

class LegalCategoryStats(BaseModel):
    """Statistics for legal categories"""
    legal_category: LegalCategorySchema
    count: int
    percentage: float
    protected_count: int
    retention_pending: int

class AIAnalysisStats(BaseModel):
    """Statistics for AI analysis"""
    total_analyzed: int
    average_confidence: float
    analysis_types: Dict[str, int]
    recent_analysis_count: int

class DocumentAnalyticsResponse(BaseModel):
    """Response schema for document analytics"""
    total_documents: int
    type_distribution: List[DocumentTypeStats]
    category_distribution: List[LegalCategoryStats]
    ai_analysis_stats: AIAnalysisStats
    upload_trends: Dict[str, int]  # Date -> count mapping
    storage_usage: Dict[str, Any]  # Storage statistics
    compliance_status: Dict[str, Any]  # Legal compliance metrics

# 🔄 LEGACY COMPATIBILITY SCHEMAS

class LegacyDocumentMapping(BaseModel):
    """Legacy to unified document type mapping"""
    legacy_type: str
    unified_type: UnifiedDocumentTypeSchema
    unified_label: str
    legal_category: LegalCategorySchema
    migration_notes: Optional[str] = None

class LegacyMigrationRequest(BaseModel):
    """Request schema for legacy document migration"""
    document_ids: Optional[List[UUID]] = None
    patient_id: Optional[UUID] = None
    legacy_type: Optional[str] = None
    force_migration: bool = False
    preserve_metadata: bool = True

class LegacyMigrationResponse(BaseModel):
    """Response schema for legacy migration"""
    migrated_count: int
    failed_count: int
    skipped_count: int
    migrated_documents: List[UUID]
    errors: List[Dict[str, str]]
    migration_summary: Dict[str, Any]

# 🛠️ UTILITY SCHEMAS

class DocumentTypeInfo(BaseModel):
    """Document type information schema"""
    value: str
    label: str
    category: LegalCategorySchema
    supports_ai: bool
    icon: Optional[str] = None
    description: Optional[str] = None

class LegalCategoryInfo(BaseModel):
    """Legal category information schema"""
    value: str
    label: str
    compliance: str
    retention_period: Optional[str] = None
    protection_level: str
    color_scheme: Dict[str, str]

class SystemStatusResponse(BaseModel):
    """System status for unified document system"""
    unified_system_active: bool
    migration_progress: float  # 0.0 to 1.0
    legacy_documents_remaining: int
    ai_services_available: List[str]
    storage_health: str
    last_migration_run: Optional[datetime] = None
