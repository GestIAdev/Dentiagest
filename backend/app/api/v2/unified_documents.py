"""
🚀 UNIFIED DOCUMENT TYPES API v2.0
By PunkClaude & Team Anarquista - Revolutionary API Architecture

🎯 PURPOSE:
- New API endpoints for unified document system
- AI-ready smart tags endpoints
- Backward compatibility with legacy system
- Enhanced search and filtering capabilities
"""

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from uuid import UUID
import json

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v2/documents", tags=["Documents v2.0"])

# �️ SYSTEM STATUS ENDPOINT

@router.get("/system-status", response_model=dict)
async def get_system_status():
    """
    🟢 Get unified document system status
    
    Returns current system status and migration information
    """
    return {
        "status": "operational",
        "version": "2.0",
        "features": {
            "unified_types": True,
            "smart_tags": True,
            "ai_analysis": True,
            "legacy_compatibility": True
        },
        "endpoints": {
            "upload": "/api/v2/documents/upload",
            "list": "/api/v2/documents/patient/{patient_id}",
            "types": "/api/v2/documents/unified-types",
            "categories": "/api/v2/documents/legal-categories"
        },
        "migration_status": "completed",
        "last_updated": "2025-08-15T00:00:00Z"
    }

# �🗂️ UNIFIED DOCUMENT ENDPOINTS

@router.get("/unified-types", response_model=List[Dict[str, str]])
async def get_unified_document_types():
    """
    📋 Get all unified document types
    
    Returns list of available unified document types with display names
    """
    types = []
    for doc_type in UnifiedDocumentType:
        types.append({
            "value": doc_type.value,
            "label": _get_type_display_name(doc_type),
            "category": _get_type_category(doc_type).value
        })
    
    return types

@router.get("/legal-categories", response_model=List[Dict[str, str]])
async def get_legal_categories():
    """
    ⚖️ Get all legal categories
    
    Returns list of legal categories with compliance info
    """
    categories = []
    for category in LegalCategory:
        categories.append({
            "value": category.value,
            "label": _get_category_display_name(category),
            "compliance": _get_compliance_info(category)
        })
    
    return categories

@router.get("/patient/{patient_id}", response_model=List[UnifiedDocumentResponse])
async def get_patient_documents(
    patient_id: UUID,
    unified_type: Optional[UnifiedDocumentType] = None,
    legal_category: Optional[LegalCategory] = None,
    has_ai_tags: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    📂 Get patient documents with unified filtering
    
    Advanced filtering by unified types, legal categories, and AI features
    """
    service = UnifiedDocumentService(db)
    
    documents = await service.get_patient_documents(
        patient_id=patient_id,
        unified_type=unified_type,
        legal_category=legal_category,
        has_ai_tags=has_ai_tags,
        user=current_user
    )
    
    return documents

@router.post("/upload", response_model=UnifiedDocumentResponse)
async def upload_document(
    patient_id: UUID,
    unified_type: UnifiedDocumentType,
    file: UploadFile = File(...),
    description: Optional[str] = None,
    auto_ai_analysis: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    📤 Upload document with unified type system
    
    Automatically determines legal category and optionally runs AI analysis
    """
    service = UnifiedDocumentService(db)
    ai_service = AIService()
    
    # Determine legal category from unified type
    legal_category = _determine_legal_category(unified_type)
    
    # Upload document
    document = await service.upload_document(
        patient_id=patient_id,
        unified_type=unified_type,
        legal_category=legal_category,
        file=file,
        description=description,
        uploaded_by=current_user.id
    )
    
    # Run AI analysis if requested and document type supports it
    if auto_ai_analysis and document.is_ai_ready():
        try:
            ai_result = await ai_service.analyze_document(document)
            await service.create_smart_tags_from_ai(document.id, ai_result, current_user.id)
        except Exception as e:
            # AI analysis failed, but document upload succeeded
            print(f"AI analysis failed: {e}")
    
    return document

# 🤖 SMART TAGS ENDPOINTS

@router.get("/{document_id}/smart-tags", response_model=SmartTagResponse)
async def get_document_smart_tags(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    🏷️ Get smart tags for a document
    
    Returns AI-generated and manual tags with confidence scores
    """
    service = UnifiedDocumentService(db)
    
    smart_tags = await service.get_document_smart_tags(document_id, current_user)
    if not smart_tags:
        raise HTTPException(status_code=404, detail="Smart tags not found")
    
    return smart_tags

@router.post("/{document_id}/smart-tags", response_model=SmartTagResponse)
async def create_smart_tags(
    document_id: UUID,
    tags_data: SmartTagCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    🏷️ Create or update smart tags for a document
    
    Allows manual tag creation and AI analysis triggering
    """
    service = UnifiedDocumentService(db)
    
    smart_tags = await service.create_or_update_smart_tags(
        document_id=document_id,
        tags_data=tags_data,
        user=current_user
    )
    
    return smart_tags

@router.post("/{document_id}/ai-analysis")
async def trigger_ai_analysis(
    document_id: UUID,
    analysis_types: List[str] = Query(default=["anatomy", "condition", "quality"]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    🤖 Trigger AI analysis for a document
    
    Runs specified AI analysis types and updates smart tags
    """
    service = UnifiedDocumentService(db)
    ai_service = AIService()
    
    document = await service.get_document(document_id, current_user)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not document.is_ai_ready():
        raise HTTPException(status_code=400, detail="Document type does not support AI analysis")
    
    # Run AI analysis
    ai_result = await ai_service.analyze_document(document, analysis_types)
    
    # Update smart tags with AI results
    smart_tags = await service.update_smart_tags_with_ai(
        document_id=document_id,
        ai_result=ai_result,
        user=current_user
    )
    
    return {
        "message": "AI analysis completed successfully",
        "analysis_types": analysis_types,
        "confidence": ai_result.get("confidence", 0.0),
        "smart_tags": smart_tags
    }

# 🔍 ENHANCED SEARCH ENDPOINTS

@router.post("/search", response_model=DocumentSearchResponse)
async def search_documents(
    search_request: DocumentSearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    🔍 Advanced document search with AI and smart tags
    
    Supports full-text search, AI tag filtering, and semantic search
    """
    service = UnifiedDocumentService(db)
    
    results = await service.advanced_search(search_request, current_user)
    
    return results

@router.get("/search/suggestions")
async def get_search_suggestions(
    query: str = Query(..., min_length=2),
    category: Optional[LegalCategory] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    💡 Get search suggestions based on AI tags and document content
    
    Returns autocomplete suggestions for advanced search
    """
    service = UnifiedDocumentService(db)
    
    suggestions = await service.get_search_suggestions(query, category, current_user)
    
    return {"suggestions": suggestions}

# 🔄 LEGACY COMPATIBILITY ENDPOINTS

@router.get("/legacy/types", response_model=List[Dict[str, str]])
async def get_legacy_document_types():
    """
    🔄 Get legacy document types for backward compatibility
    
    Returns mapping between legacy and unified types
    """
    mappings = []
    for legacy, unified in LegacyDocumentMapping.LEGACY_TO_UNIFIED.items():
        mappings.append({
            "legacy_type": legacy,
            "unified_type": unified.value,
            "unified_label": _get_type_display_name(unified),
            "legal_category": _determine_legal_category(unified).value
        })
    
    return mappings

@router.post("/legacy/migrate/{document_id}")
async def migrate_legacy_document(
    document_id: UUID,
    force_migration: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    🔄 Migrate a single legacy document to unified system
    
    Updates document with unified types and creates smart tags
    """
    service = UnifiedDocumentService(db)
    
    result = await service.migrate_legacy_document(
        document_id=document_id,
        force=force_migration,
        user=current_user
    )
    
    return result

# 📊 ANALYTICS ENDPOINTS

@router.get("/analytics/overview")
async def get_documents_analytics(
    patient_id: Optional[UUID] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    📊 Get document analytics and statistics
    
    Returns document counts by type, category, AI analysis status
    """
    service = UnifiedDocumentService(db)
    
    analytics = await service.get_analytics(
        patient_id=patient_id,
        date_from=date_from,
        date_to=date_to,
        user=current_user
    )
    
    return analytics

# 🛠️ UTILITY FUNCTIONS

def _get_type_display_name(doc_type: UnifiedDocumentType) -> str:
    """Get human-readable display name for document type"""
    type_names = {
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
    return type_names.get(doc_type, doc_type.value)

def _get_type_category(doc_type: UnifiedDocumentType) -> LegalCategory:
    """Get legal category for document type"""
    medical_types = {
        UnifiedDocumentType.XRAY, UnifiedDocumentType.PHOTO_CLINICAL,
        UnifiedDocumentType.VOICE_NOTE, UnifiedDocumentType.TREATMENT_PLAN,
        UnifiedDocumentType.LAB_REPORT, UnifiedDocumentType.PRESCRIPTION,
        UnifiedDocumentType.SCAN_3D
    }
    
    billing_types = {
        UnifiedDocumentType.INVOICE, UnifiedDocumentType.BUDGET,
        UnifiedDocumentType.PAYMENT_PROOF
    }
    
    legal_types = {
        UnifiedDocumentType.CONSENT_FORM, UnifiedDocumentType.REFERRAL_LETTER,
        UnifiedDocumentType.LEGAL_DOCUMENT
    }
    
    if doc_type in medical_types:
        return LegalCategory.MEDICAL
    elif doc_type in billing_types:
        return LegalCategory.BILLING
    elif doc_type in legal_types:
        return LegalCategory.LEGAL
    else:
        return LegalCategory.ADMINISTRATIVE

def _get_category_display_name(category: LegalCategory) -> str:
    """Get human-readable display name for legal category"""
    category_names = {
        LegalCategory.MEDICAL: "Médico - GDPR Art. 9",
        LegalCategory.ADMINISTRATIVE: "Administrativo",
        LegalCategory.BILLING: "Facturación",
        LegalCategory.LEGAL: "Legal"
    }
    return category_names.get(category, category.value)

def _get_compliance_info(category: LegalCategory) -> str:
    """Get compliance information for legal category"""
    compliance_info = {
        LegalCategory.MEDICAL: "Datos sensibles - GDPR Artículo 9 - Retención 10 años",
        LegalCategory.ADMINISTRATIVE: "Datos estándar - Retención 5 años",
        LegalCategory.BILLING: "Datos financieros - Retención 7 años",
        LegalCategory.LEGAL: "Documentos legales - Retención permanente"
    }
    return compliance_info.get(category, "Información no disponible")

def _determine_legal_category(unified_type: UnifiedDocumentType) -> LegalCategory:
    """Determine legal category from unified document type"""
    return _get_type_category(unified_type)
