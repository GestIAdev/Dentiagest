# DENTAL_SPECIFIC: Medical Records API endpoints
"""
API endpoints for medical records management in dental practices.
This module provides comprehensive CRUD operations for medical records
and documents with AI-ready architecture.

PLATFORM_PATTERN: Other verticals will have similar "service records" APIs:
- VetGest: Veterinary records (treatments, vaccinations, health checks)
- MechaGest: Service records (repairs, maintenance, inspections)
- RestaurantGest: Service records (orders, dietary notes, special requests)
"""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc, asc
from datetime import date, datetime
from uuid import UUID
import os
import shutil
from pathlib import Path

from ...core.database import get_db
from ...core.security import get_current_user
from ...core.medical_security import (
    require_medical_read, 
    require_medical_write, 
    require_medical_delete,
    require_export_permission
)
from ...models.user import User
from ...models.patient import Patient
from ...models.medical_record import MedicalRecord, TreatmentStatus, TreatmentPriority, ProcedureCategory
from ...models.medical_document import MedicalDocument, DocumentType, AccessLevel, ImageQuality
from ...schemas.medical_record import (
    MedicalRecordCreate,
    MedicalRecordUpdate,
    MedicalRecordResponse,
    MedicalRecordSearchParams,
    PaginatedMedicalRecordsResponse,
    MedicalDocumentCreate,
    MedicalDocumentUpdate,
    MedicalDocumentResponse,
    MedicalDocumentSearchParams,
    PaginatedMedicalDocumentsResponse,
    MedicalRecordsStatistics,
    MedicalDocumentsStatistics,
    BulkMedicalRecordUpdate,
    BulkMedicalDocumentUpdate,
    BulkOperationResponse,
    DocumentCategory,  # 🔥 NEW: Import category enum
    PatientBasicInfo,  # 🚀 FOR ENTERPRISE JOIN OPTIMIZATION
    FileUploadResponse,
    MultipleFileUploadResponse
)

# PLATFORM_EXTRACTABLE: Router setup pattern
router = APIRouter(prefix="/medical-records", tags=["medical-records"])

# Configuration for file uploads
UPLOAD_DIR = Path("uploads/medical_documents")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.mp3', '.wav', '.dcm', '.stl'}
ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/png', 'application/pdf', 
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg', 'audio/wav', 'application/dicom', 'model/stl'
}

# ======= MEDICAL RECORDS ENDPOINTS =======

# PLATFORM_EXTRACTABLE: Create service record pattern
@router.post("/", response_model=MedicalRecordResponse, status_code=status.HTTP_201_CREATED)
@require_medical_write("medical_record")
async def create_medical_record(
    record_data: MedicalRecordCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    security_metadata: dict = None
) -> Any:
    """Create a new medical record."""
    
    # Verify patient exists
    patient = db.query(Patient).filter(
        and_(Patient.id == record_data.patient_id, Patient.deleted_at.is_(None))
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Create medical record
    db_record = MedicalRecord(
        patient_id=UUID(record_data.patient_id),
        appointment_id=UUID(record_data.appointment_id) if record_data.appointment_id else None,
        visit_date=record_data.visit_date,
        chief_complaint=record_data.chief_complaint,
        diagnosis=record_data.diagnosis,
        treatment_plan=record_data.treatment_plan,
        treatment_performed=record_data.treatment_performed,
        clinical_notes=record_data.clinical_notes,
        procedure_codes=record_data.procedure_codes,
        procedure_category=record_data.procedure_category,
        tooth_numbers=record_data.tooth_numbers,
        surfaces_treated=record_data.surfaces_treated,
        treatment_status=record_data.treatment_status,
        priority=record_data.priority,
        estimated_cost=record_data.estimated_cost,
        actual_cost=record_data.actual_cost,
        insurance_covered=record_data.insurance_covered,
        follow_up_required=record_data.follow_up_required,
        follow_up_date=record_data.follow_up_date,
        follow_up_notes=record_data.follow_up_notes,
        treatment_outcome=record_data.treatment_outcome,
        patient_feedback=record_data.patient_feedback,
        is_confidential=record_data.is_confidential,
        created_by=current_user.id
    )
    
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    
    # Convert to response format
    return _convert_record_to_response(db_record)

# PLATFORM_EXTRACTABLE: List service records with search and pagination
@router.get("/", response_model=PaginatedMedicalRecordsResponse)
@require_medical_read("medical_record")
async def list_medical_records(
    request: Request,
    search_params: MedicalRecordSearchParams = Depends(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    security_metadata: dict = None
) -> Any:
    """List medical records with search and filtering."""
    
    # 🚀 ENTERPRISE-GRADE SINGLE JOIN QUERY (GPT LEVEL OPTIMIZATION)
    # This query scales to MILLIONS of records with ONE SQL call
    # LEFT JOIN to handle orphaned medical records (mock data compatibility)
    query = db.query(
        MedicalRecord,
        Patient.first_name.label('patient_first_name'),
        Patient.last_name.label('patient_last_name'), 
        Patient.email.label('patient_email'),
        Patient.phone_primary.label('patient_phone'),  # 🔧 FIXED: phone_primary not phone
        Patient.date_of_birth.label('patient_birth_date')  # 🔧 FIXED: date_of_birth not birth_date
    ).outerjoin(  # 🔧 CHANGED: outerjoin instead of join for mock data compatibility
        Patient, MedicalRecord.patient_id == Patient.id
    ).filter(
        MedicalRecord.deleted_at.is_(None)
        # Removed Patient.deleted_at filter since patient might not exist (mock data)
    )
    
    # Apply filters
    if search_params.patient_id:
        query = query.filter(MedicalRecord.patient_id == search_params.patient_id)
    
    if search_params.start_date:
        query = query.filter(MedicalRecord.visit_date >= search_params.start_date)
    
    if search_params.end_date:
        query = query.filter(MedicalRecord.visit_date <= search_params.end_date)
    
    if search_params.procedure_category:
        query = query.filter(MedicalRecord.procedure_category == search_params.procedure_category)
    
    if search_params.treatment_status:
        query = query.filter(MedicalRecord.treatment_status == search_params.treatment_status)
    
    if search_params.priority:
        query = query.filter(MedicalRecord.priority == search_params.priority)
    
    if search_params.tooth_number:
        query = query.filter(func.jsonb_contains(MedicalRecord.tooth_numbers, [search_params.tooth_number]))
    
    if search_params.requires_follow_up is not None:
        query = query.filter(MedicalRecord.follow_up_required == search_params.requires_follow_up)
    
    if search_params.is_confidential is not None:
        query = query.filter(MedicalRecord.is_confidential == search_params.is_confidential)
    
    if search_params.search:
        search_term = f"%{search_params.search}%"
        query = query.filter(
            or_(
                # 🔍 BÚSQUEDA POR NOMBRE DEL PACIENTE (FIXED BY RAUL!)
                Patient.first_name.ilike(search_term),
                Patient.last_name.ilike(search_term),
                func.concat(Patient.first_name, ' ', Patient.last_name).ilike(search_term),
                # 🩺 BÚSQUEDA POR CONTENIDO MÉDICO (ORIGINAL)
                MedicalRecord.diagnosis.ilike(search_term),
                MedicalRecord.clinical_notes.ilike(search_term),
                MedicalRecord.treatment_performed.ilike(search_term),
                MedicalRecord.chief_complaint.ilike(search_term)
            )
        )
    
    # Get total count with same JOIN (for accurate pagination)
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(MedicalRecord, search_params.sort_by, MedicalRecord.visit_date)
    if search_params.sort_order == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))
    
    # Apply pagination
    offset = (search_params.page - 1) * search_params.size
    records = query.offset(offset).limit(search_params.size).all()
    
    # 🚀 ENTERPRISE JOIN CONVERSION (GPT LEVEL)
    # records is now [(MedicalRecord, patient_first_name, patient_last_name, ...)]
    # Handle mock data where patient might not exist (LEFT JOIN results)
    record_responses = []
    for row in records:
        medical_record = row[0]  # First element is the MedicalRecord
        
        # 🔧 HANDLE MOCK DATA: Patient might be None if record is orphaned
        if row[1] is not None:  # If patient exists
            patient_data = {
                'first_name': row[1],    # patient_first_name
                'last_name': row[2],     # patient_last_name  
                'email': row[3],         # patient_email
                'phone': row[4],         # patient_phone
                'birth_date': row[5]     # patient_birth_date
            }
            record_responses.append(_convert_record_to_response_with_patient(medical_record, patient_data))
        else:
            # Fallback for orphaned records (mock data compatibility)
            record_responses.append(_convert_record_to_response(medical_record))
    
    return PaginatedMedicalRecordsResponse(
        items=record_responses,
        total=total,
        page=search_params.page,
        size=search_params.size,
        pages=(total + search_params.size - 1) // search_params.size
    )

# ======= MEDICAL DOCUMENTS ENDPOINTS (MOVED UP for routing precedence) =======

@router.get("/documents", response_model=PaginatedMedicalDocumentsResponse)
async def list_medical_documents(
    search_params: MedicalDocumentSearchParams = Depends(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """List medical documents with search and filtering."""
    
    print(f"🔍 DEBUG: Received search params: {search_params}")
    print(f"🏷️ DEBUG: Category filter: {search_params.category}")
    
    # Build query
    query = db.query(MedicalDocument).filter(MedicalDocument.deleted_at.is_(None))
    
    # Apply filters
    if search_params.patient_id:
        query = query.filter(MedicalDocument.patient_id == search_params.patient_id)
    
    if search_params.medical_record_id:
        query = query.filter(MedicalDocument.medical_record_id == search_params.medical_record_id)
    
    if search_params.document_type:
        query = query.filter(MedicalDocument.document_type == search_params.document_type)
    
    # 🔥 NEW: Category filter - maps UI categories to document types
    if search_params.category:
        print(f"🎯 DEBUG: Applying category filter: {search_params.category}")
        category_mappings = {
            DocumentCategory.MEDICAL: [
                DocumentType.XRAY_BITEWING, DocumentType.XRAY_PANORAMIC, 
                DocumentType.XRAY_PERIAPICAL, DocumentType.XRAY_CEPHALOMETRIC,
                DocumentType.CT_SCAN, DocumentType.CBCT_SCAN, DocumentType.INTRAORAL_PHOTO, 
                DocumentType.EXTRAORAL_PHOTO, DocumentType.CLINICAL_PHOTO,
                DocumentType.PROGRESS_PHOTO, DocumentType.BEFORE_AFTER_PHOTO, 
                DocumentType.LAB_REPORT, DocumentType.VOICE_NOTE, DocumentType.SCAN_IMPRESSION, 
                DocumentType.STL_FILE
            ],
            DocumentCategory.ADMINISTRATIVE: [
                DocumentType.TREATMENT_PLAN, DocumentType.REFERRAL_LETTER, 
                DocumentType.PRESCRIPTION, DocumentType.OTHER_DOCUMENT
            ],
            DocumentCategory.LEGAL: [
                DocumentType.CONSENT_FORM
            ],
            DocumentCategory.BILLING: [
                DocumentType.INSURANCE_FORM
            ]
        }
        
        allowed_types = category_mappings.get(search_params.category, [])
        print(f"🎯 DEBUG: Allowed types for {search_params.category}: {allowed_types}")
        if allowed_types:
            query = query.filter(MedicalDocument.document_type.in_(allowed_types))
            print(f"🎯 DEBUG: Applied filter for types: {allowed_types}")
        else:
            print(f"❌ DEBUG: No allowed types found for category: {search_params.category}")
    else:
        print("🔍 DEBUG: No category filter provided")
    
    if search_params.access_level:
        query = query.filter(MedicalDocument.access_level == search_params.access_level)
    
    if search_params.tooth_number:
        query = query.filter(func.jsonb_contains(MedicalDocument.tooth_numbers, [search_params.tooth_number]))
    
    if search_params.anatomical_region:
        query = query.filter(MedicalDocument.anatomical_region == search_params.anatomical_region)
    
    if search_params.start_date:
        query = query.filter(MedicalDocument.document_date >= search_params.start_date)
    
    if search_params.end_date:
        query = query.filter(MedicalDocument.document_date <= search_params.end_date)
    
    if search_params.is_image is not None:
        # Filter by image document types
        if search_params.is_image:
            image_types = [
                DocumentType.XRAY_BITEWING, DocumentType.XRAY_PANORAMIC,
                DocumentType.XRAY_PERIAPICAL, DocumentType.INTRAORAL_PHOTO,
                DocumentType.CLINICAL_PHOTO, DocumentType.PROGRESS_PHOTO
            ]
            query = query.filter(MedicalDocument.document_type.in_(image_types))
        else:
            non_image_types = [DocumentType.VOICE_NOTE, DocumentType.TREATMENT_PLAN, 
                             DocumentType.CONSENT_FORM, DocumentType.PRESCRIPTION]
            query = query.filter(MedicalDocument.document_type.in_(non_image_types))
    
    if search_params.ai_analyzed is not None:
        query = query.filter(MedicalDocument.ai_analyzed == search_params.ai_analyzed)
    
    if search_params.search:
        search_term = f"%{search_params.search}%"
        query = query.filter(
            or_(
                MedicalDocument.title.ilike(search_term),
                MedicalDocument.description.ilike(search_term),
                MedicalDocument.clinical_notes.ilike(search_term)
            )
        )
    
    # Get total count
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(MedicalDocument, search_params.sort_by, MedicalDocument.created_at)
    if search_params.sort_order == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))
    
    # Apply pagination
    offset = (search_params.page - 1) * search_params.size
    documents = query.offset(offset).limit(search_params.size).all()
    
    # Convert to response format
    document_responses = [_convert_document_to_response(doc) for doc in documents]
    
    return PaginatedMedicalDocumentsResponse(
        items=document_responses,
        total=total,
        page=search_params.page,
        size=search_params.size,
        pages=(total + search_params.size - 1) // search_params.size
    )

# PLATFORM_EXTRACTABLE: Get single service record by ID
@router.get("/{record_id}", response_model=MedicalRecordResponse)
@require_medical_read("medical_record")
async def get_medical_record(
    request: Request,  # 🔧 MOVED: request first for security middleware
    record_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    security_metadata: dict = None
) -> Any:
    """Get a specific medical record by ID."""
    
    record = db.query(MedicalRecord).filter(
        and_(MedicalRecord.id == record_id, MedicalRecord.deleted_at.is_(None))
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    return _convert_record_to_response(record)

# PLATFORM_EXTRACTABLE: Update service record
@router.put("/{record_id}", response_model=MedicalRecordResponse)
@require_medical_write("medical_record")
async def update_medical_record(
    request: Request,  # 🔧 MOVED: request first for security middleware
    record_id: UUID,
    record_update: MedicalRecordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    security_metadata: dict = None
) -> Any:
    """Update a medical record."""
    
    record = db.query(MedicalRecord).filter(
        and_(MedicalRecord.id == record_id, MedicalRecord.deleted_at.is_(None))
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    # Update fields
    update_data = record_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)
    
    # Update audit fields
    record.updated_by = current_user.id
    
    db.commit()
    db.refresh(record)
    
    return _convert_record_to_response(record)

# PLATFORM_EXTRACTABLE: Soft delete service record
@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
@require_medical_delete("medical_record")
async def delete_medical_record(
    request: Request,  # 🔧 MOVED: request first for security middleware
    record_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    security_metadata: dict = None
) -> None:
    """Soft delete a medical record."""
    
    record = db.query(MedicalRecord).filter(
        and_(MedicalRecord.id == record_id, MedicalRecord.deleted_at.is_(None))
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    # Soft delete
    record.deleted_at = datetime.utcnow()
    record.deleted_by = current_user.id
    
    db.commit()

# ======= MEDICAL DOCUMENTS ENDPOINTS =======

@router.post("/documents/upload", response_model=FileUploadResponse)
@require_medical_write("medical_document")
async def upload_medical_document(
    request: Request,
    patient_id: str = Form(...),
    title: str = Form(...),
    document_type: DocumentType = Form(...),
    description: Optional[str] = Form(None),
    medical_record_id: Optional[str] = Form(None),
    appointment_id: Optional[str] = Form(None),
    access_level: AccessLevel = Form(default=AccessLevel.CLINICAL_STAFF),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    security_metadata: dict = None
) -> Any:
    """Upload a medical document."""
    
    # Validate file
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)} MB"
        )
    
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"MIME type not allowed: {file.content_type}"
        )
    
    # Verify patient exists
    patient = db.query(Patient).filter(
        and_(Patient.id == patient_id, Patient.deleted_at.is_(None))
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{patient_id}_{timestamp}_{file.filename}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Create document record
    db_document = MedicalDocument(
        patient_id=UUID(patient_id),
        medical_record_id=UUID(medical_record_id) if medical_record_id else None,
        appointment_id=UUID(appointment_id) if appointment_id else None,
        document_type=document_type,
        title=title,
        description=description,
        file_name=file.filename,
        file_path=str(file_path),
        file_size=file.size,
        mime_type=file.content_type,
        file_extension=file_extension,
        access_level=access_level,
        document_date=datetime.utcnow(),
        created_by=current_user.id
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    return FileUploadResponse(
        document_id=str(db_document.id),
        file_name=file.filename,
        file_size=file.size,
        file_size_mb=round(file.size / (1024 * 1024), 2),
        mime_type=file.content_type,
        upload_success=True,
        message="File uploaded successfully"
    )

# MOVED TO BEFORE /{record_id} - See line 247

# ======= STATISTICS ENDPOINTS =======

@router.get("/statistics", response_model=MedicalRecordsStatistics)
@require_export_permission()
async def get_medical_records_statistics(
    request: Request,
    patient_id: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    security_metadata: dict = None
) -> Any:
    """Get medical records statistics."""
    
    # Base query
    query = db.query(MedicalRecord).filter(MedicalRecord.deleted_at.is_(None))
    
    if patient_id:
        query = query.filter(MedicalRecord.patient_id == patient_id)
    
    if start_date:
        query = query.filter(MedicalRecord.visit_date >= start_date)
    
    if end_date:
        query = query.filter(MedicalRecord.visit_date <= end_date)
    
    records = query.all()
    
    # Calculate statistics
    total_records = len(records)
    
    # Group by category
    records_by_category = {}
    for category in ProcedureCategory:
        count = sum(1 for r in records if r.procedure_category == category)
        if count > 0:
            records_by_category[category.value] = count
    
    # Group by status
    records_by_status = {}
    for status_val in TreatmentStatus:
        count = sum(1 for r in records if r.treatment_status == status_val)
        if count > 0:
            records_by_status[status_val.value] = count
    
    # Group by priority
    records_by_priority = {}
    for priority in TreatmentPriority:
        count = sum(1 for r in records if r.priority == priority)
        if count > 0:
            records_by_priority[priority.value] = count
    
    # Other statistics
    pending_follow_ups = sum(1 for r in records if r.follow_up_required and 
                           r.follow_up_date and r.follow_up_date <= datetime.now().date())
    
    current_month = datetime.now().replace(day=1).date()
    records_this_month = sum(1 for r in records if r.visit_date >= current_month)
    
    # Financial statistics
    costs = [float(r.actual_cost or r.estimated_cost or 0) for r in records]
    average_cost = sum(costs) / len(costs) if costs else None
    total_revenue = sum(costs) if costs else None
    
    return MedicalRecordsStatistics(
        total_records=total_records,
        records_by_category=records_by_category,
        records_by_status=records_by_status,
        records_by_priority=records_by_priority,
        pending_follow_ups=pending_follow_ups,
        records_this_month=records_this_month,
        average_cost=average_cost,
        total_revenue=total_revenue
    )

# ======= HELPER FUNCTIONS =======

def _convert_record_to_response(record: MedicalRecord, patient: Patient = None) -> MedicalRecordResponse:
    """Convert MedicalRecord model to response schema."""
    return MedicalRecordResponse(
        id=str(record.id),
        patient_id=str(record.patient_id),
        appointment_id=str(record.appointment_id) if record.appointment_id else None,
        visit_date=record.visit_date,
        chief_complaint=record.chief_complaint,
        diagnosis=record.diagnosis,
        treatment_plan=record.treatment_plan,
        treatment_performed=record.treatment_performed,
        clinical_notes=record.clinical_notes,
        procedure_codes=record.procedure_codes,
        procedure_category=record.procedure_category,
        tooth_numbers=record.tooth_numbers,
        surfaces_treated=record.surfaces_treated,
        treatment_status=record.treatment_status,
        priority=record.priority,
        estimated_cost=float(record.estimated_cost) if record.estimated_cost else None,
        actual_cost=float(record.actual_cost) if record.actual_cost else None,
        insurance_covered=record.insurance_covered,
        follow_up_required=record.follow_up_required,
        follow_up_date=record.follow_up_date,
        follow_up_notes=record.follow_up_notes,
        treatment_outcome=record.treatment_outcome,
        patient_feedback=record.patient_feedback,
        is_confidential=record.is_confidential,
        ai_transcribed=record.ai_transcribed,
        ai_confidence_score=float(record.ai_confidence_score) if record.ai_confidence_score else None,
        created_at=record.created_at,
        updated_at=record.updated_at,
        created_by=str(record.created_by),
        updated_by=str(record.updated_by) if record.updated_by else None,
        age_days=record.age_days,
        is_recent=record.is_recent,
        requires_attention=record.requires_attention,
        total_teeth_affected=record.total_teeth_affected,
        is_major_treatment=record.is_major_treatment,
        treatment_summary=record.treatment_summary,
        # 👤 PATIENT DATA - DISABLED UNTIL WE FIX JOIN
        patient=None  # Temporalmente None - backend funciona sin esto
    )

def _convert_record_to_response_with_patient(record: MedicalRecord, patient_data: dict) -> MedicalRecordResponse:
    """Convert MedicalRecord with JOIN patient data to response schema - ENTERPRISE OPTIMIZED."""
    # 👤 CREATE PATIENT RESPONSE FROM JOIN DATA
    patient_response = None
    if patient_data:
        patient_response = PatientBasicInfo(
            id=str(record.patient_id),  # We have this from the record
            first_name=patient_data.get('first_name', ''),
            last_name=patient_data.get('last_name', ''),
            email=patient_data.get('email', ''),
            phone=patient_data.get('phone', ''),
            birth_date=patient_data.get('birth_date')
        )
    
    return MedicalRecordResponse(
        id=str(record.id),
        patient_id=str(record.patient_id),
        appointment_id=str(record.appointment_id) if record.appointment_id else None,
        visit_date=record.visit_date,
        chief_complaint=record.chief_complaint,
        diagnosis=record.diagnosis,
        treatment_plan=record.treatment_plan,
        treatment_performed=record.treatment_performed,
        clinical_notes=record.clinical_notes,
        procedure_codes=record.procedure_codes,
        procedure_category=record.procedure_category,
        tooth_numbers=record.tooth_numbers,
        surfaces_treated=record.surfaces_treated,
        treatment_status=record.treatment_status,
        priority=record.priority,
        estimated_cost=float(record.estimated_cost) if record.estimated_cost else None,
        actual_cost=float(record.actual_cost) if record.actual_cost else None,
        insurance_covered=record.insurance_covered,
        follow_up_required=record.follow_up_required,
        follow_up_date=record.follow_up_date,
        follow_up_notes=record.follow_up_notes,
        treatment_outcome=record.treatment_outcome,
        patient_feedback=record.patient_feedback,
        is_confidential=record.is_confidential,
        ai_transcribed=record.ai_transcribed,
        ai_confidence_score=float(record.ai_confidence_score) if record.ai_confidence_score else None,
        created_at=record.created_at,
        updated_at=record.updated_at,
        created_by=str(record.created_by),
        updated_by=str(record.updated_by) if record.updated_by else None,
        age_days=record.age_days,
        is_recent=record.is_recent,
        requires_attention=record.requires_attention,
        total_teeth_affected=record.total_teeth_affected,
        is_major_treatment=record.is_major_treatment,
        treatment_summary=record.treatment_summary,
        # 🚀 ENTERPRISE PATIENT DATA FROM JOIN
        patient=patient_response
    )

def _convert_document_to_response(doc: MedicalDocument) -> MedicalDocumentResponse:
    """Convert MedicalDocument model to response schema."""
    return MedicalDocumentResponse(
        id=str(doc.id),
        patient_id=str(doc.patient_id),
        medical_record_id=str(doc.medical_record_id) if doc.medical_record_id else None,
        appointment_id=str(doc.appointment_id) if doc.appointment_id else None,
        document_type=doc.document_type,
        title=doc.title,
        description=doc.description,
        tooth_numbers=doc.tooth_numbers,
        anatomical_region=doc.anatomical_region,
        clinical_notes=doc.clinical_notes,
        document_date=doc.document_date,
        expiry_date=doc.expiry_date,
        access_level=doc.access_level,
        is_confidential=doc.is_confidential,
        image_quality=doc.image_quality,
        file_name=doc.file_name,
        file_size=doc.file_size,
        file_size_mb=doc.file_size_mb,
        mime_type=doc.mime_type,
        file_extension=doc.file_extension,
        image_width=doc.image_width,
        image_height=doc.image_height,
        audio_duration_seconds=doc.audio_duration_seconds,
        audio_transcription=doc.audio_transcription,
        ai_analyzed=doc.ai_analyzed,
        ai_analysis_results=doc.ai_analysis_results,
        ai_confidence_scores=doc.ai_confidence_scores,
        ocr_extracted_text=doc.ocr_extracted_text,
        ai_tags=doc.ai_tags,
        is_active=doc.is_active,
        is_archived=doc.is_archived,
        version=doc.version,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        created_by=str(doc.created_by),
        updated_by=str(doc.updated_by) if doc.updated_by else None,
        age_days=doc.age_days,
        is_image=doc.is_image,
        is_xray=doc.is_xray,
        is_voice_note=doc.is_voice_note,
        is_expired=doc.is_expired,
        total_teeth_shown=doc.total_teeth_shown,
        is_full_mouth=doc.is_full_mouth,
        requires_ai_analysis=doc.requires_ai_analysis,
        download_url=doc.get_download_url(),
        thumbnail_url=doc.get_thumbnail_url()
    )
