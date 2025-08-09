# DENTAL_SPECIFIC: Patient management API endpoints
"""
Patient management API routes specifically for dental practices.
This module is NOT extractable to PlatformGest core as it contains
dental-specific functionality and business logic.

PLATFORM_PATTERN: Other verticals will have similar "client" management:
- VetGest: Pet management APIs (species, breeds, vaccinations)
- MechaGest: Vehicle management APIs (make, model, service history)
- RestaurantGest: Customer management APIs (dietary preferences, allergies)
"""

from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import date, datetime

from ..core.database import get_db
from ..core.security import get_current_user, require_permissions
from ..models.user import User
from ..models.patient import Patient, BloodType, Gender, InsuranceStatus
from ..schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientSearchParams,
    PatientWithMedicalHistory,
    PaginatedResponse
)

# DENTAL_SPECIFIC: Router for dental patient management
router = APIRouter(prefix="/patients", tags=["patient-management"])

# DENTAL_SPECIFIC: Create new patient
@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_data: PatientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Create a new patient record for the dental practice.
    
    DENTAL_SPECIFIC: Contains medical history, dental insurance, allergies.
    Required permissions: patients:create
    """
    
    # Check permissions
    if not current_user.has_permission("patients:create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create patient records"
        )
    
    # Check if patient already exists (by email if provided)
    if patient_data.email:
        existing_patient = db.query(Patient).filter(
            and_(
                Patient.email == patient_data.email.lower(),
                Patient.deleted_at.is_(None)
            )
        ).first()
        
        if existing_patient:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Patient with this email already exists"
            )
    
    # Create patient record
    db_patient = Patient(
        first_name=patient_data.first_name,
        last_name=patient_data.last_name,
        email=patient_data.email.lower() if patient_data.email else None,
        phone=patient_data.phone,
        phone_secondary=patient_data.phone_secondary,
        date_of_birth=patient_data.date_of_birth,
        gender=patient_data.gender,
        blood_type=patient_data.blood_type,
        address_street=patient_data.address_street,
        address_city=patient_data.address_city,
        address_state=patient_data.address_state,
        address_postal_code=patient_data.address_postal_code,
        address_country=patient_data.address_country,
        emergency_contact_name=patient_data.emergency_contact_name,
        emergency_contact_phone=patient_data.emergency_contact_phone,
        emergency_contact_relationship=patient_data.emergency_contact_relationship,
        medical_conditions=patient_data.medical_conditions,
        medications_current=patient_data.medications_current,
        allergies=patient_data.allergies,
        dental_insurance_info=patient_data.dental_insurance_info,
        insurance_status=patient_data.insurance_status,
        previous_dentist=patient_data.previous_dentist,
        dental_anxiety_level=patient_data.dental_anxiety_level,
        preferred_appointment_time=patient_data.preferred_appointment_time,
        communication_preferences=patient_data.communication_preferences,
        consent_treatment=patient_data.consent_treatment,
        consent_marketing=patient_data.consent_marketing,
        consent_data_sharing=patient_data.consent_data_sharing,
        notes=patient_data.notes,
        created_by=current_user.id
    )
    
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    
    return db_patient

# DENTAL_SPECIFIC: List patients with dental-specific filtering
@router.get("/", response_model=PaginatedResponse)
async def list_patients(
    search_params: PatientSearchParams = Depends(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    List patients with dental-specific search and filtering.
    
    DENTAL_SPECIFIC: Filters by insurance status, medical conditions, age ranges.
    Required permissions: patients:read
    """
    
    # Check permissions
    if not current_user.has_permission("patients:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to list patients"
        )
    
    # Build query
    query = db.query(Patient).filter(Patient.deleted_at.is_(None))
    
    # Apply search filters
    if search_params.search:
        search_term = f"%{search_params.search}%"
        query = query.filter(
            or_(
                Patient.first_name.ilike(search_term),
                Patient.last_name.ilike(search_term),
                Patient.email.ilike(search_term),
                Patient.phone.ilike(search_term)
            )
        )
    
    # DENTAL_SPECIFIC: Insurance status filter
    if search_params.insurance_status:
        query = query.filter(Patient.insurance_status == search_params.insurance_status)
    
    # DENTAL_SPECIFIC: Age range filters
    if search_params.age_min or search_params.age_max:
        today = date.today()
        
        if search_params.age_max:
            min_birth_date = date(today.year - search_params.age_max - 1, today.month, today.day)
            query = query.filter(Patient.date_of_birth >= min_birth_date)
        
        if search_params.age_min:
            max_birth_date = date(today.year - search_params.age_min, today.month, today.day)
            query = query.filter(Patient.date_of_birth <= max_birth_date)
    
    # DENTAL_SPECIFIC: Medical condition filters
    if search_params.has_medical_conditions is not None:
        if search_params.has_medical_conditions:
            query = query.filter(Patient.medical_conditions.isnot(None))
        else:
            query = query.filter(Patient.medical_conditions.is_(None))
    
    if search_params.has_allergies is not None:
        if search_params.has_allergies:
            query = query.filter(Patient.allergies.isnot(None))
        else:
            query = query.filter(Patient.allergies.is_(None))
    
    # DENTAL_SPECIFIC: Anxiety level filter
    if search_params.high_anxiety_only:
        query = query.filter(Patient.dental_anxiety_level >= 7)
    
    # Date filters
    if search_params.created_after:
        query = query.filter(Patient.created_at >= search_params.created_after)
    
    if search_params.created_before:
        query = query.filter(Patient.created_at <= search_params.created_before)
    
    # Apply sorting
    if search_params.sort_by:
        sort_column = getattr(Patient, search_params.sort_by, None)
        if sort_column:
            if search_params.sort_order == "desc":
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(Patient.last_name.asc(), Patient.first_name.asc())
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (search_params.page - 1) * search_params.size
    patients = query.offset(offset).limit(search_params.size).all()
    
    # Calculate pagination info
    pages = (total + search_params.size - 1) // search_params.size
    
    return {
        "items": patients,
        "total": total,
        "page": search_params.page,
        "size": search_params.size,
        "pages": pages
    }

# DENTAL_SPECIFIC: Get patient by ID with medical history
@router.get("/{patient_id}", response_model=PatientWithMedicalHistory)
async def get_patient(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get patient details including full medical and dental history.
    
    DENTAL_SPECIFIC: Returns comprehensive medical information.
    Required permissions: patients:read
    """
    
    # Check permissions
    if not current_user.has_permission("patients:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view patient details"
        )
    
    patient = db.query(Patient).filter(
        and_(
            Patient.id == patient_id,
            Patient.deleted_at.is_(None)
        )
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return patient

# DENTAL_SPECIFIC: Update patient information
@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: str,
    patient_update: PatientUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update patient information including medical history.
    
    DENTAL_SPECIFIC: Updates dental-specific fields.
    Required permissions: patients:update
    """
    
    # Check permissions
    if not current_user.has_permission("patients:update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update patient records"
        )
    
    patient = db.query(Patient).filter(
        and_(
            Patient.id == patient_id,
            Patient.deleted_at.is_(None)
        )
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Update fields (only non-null values from update request)
    update_data = patient_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(patient, field):
            setattr(patient, field, value)
    
    patient.updated_at = patient.get_current_time()
    patient.updated_by = current_user.id
    
    db.commit()
    db.refresh(patient)
    
    return patient

# DENTAL_SPECIFIC: Archive patient (soft delete)
@router.delete("/{patient_id}")
async def archive_patient(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Archive patient record (soft delete).
    
    DENTAL_SPECIFIC: Maintains dental records for legal requirements.
    Required permissions: patients:delete
    """
    
    # Check permissions
    if not current_user.has_permission("patients:delete"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to archive patient records"
        )
    
    patient = db.query(Patient).filter(
        and_(
            Patient.id == patient_id,
            Patient.deleted_at.is_(None)
        )
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Soft delete (archive)
    patient.is_active = False
    patient.deleted_at = patient.get_current_time()
    patient.updated_by = current_user.id
    
    db.commit()
    
    return {"message": "Patient record archived successfully"}

# DENTAL_SPECIFIC: Get patient statistics for dental practice
@router.get("/stats/overview")
async def get_patient_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get patient statistics specific to dental practice management.
    
    DENTAL_SPECIFIC: Analytics for dental practice insights.
    Required permissions: patients:read
    """
    
    # Check permissions
    if not current_user.has_permission("patients:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view patient statistics"
        )
    
    # Basic patient counts
    total_patients = db.query(func.count(Patient.id)).filter(Patient.deleted_at.is_(None)).scalar()
    active_patients = db.query(func.count(Patient.id)).filter(
        and_(Patient.deleted_at.is_(None), Patient.is_active == True)
    ).scalar()
    
    # DENTAL_SPECIFIC: Insurance statistics
    insured_patients = db.query(func.count(Patient.id)).filter(
        and_(Patient.deleted_at.is_(None), Patient.insurance_status == "active")
    ).scalar()
    
    # DENTAL_SPECIFIC: Medical risk statistics
    patients_with_conditions = db.query(func.count(Patient.id)).filter(
        and_(Patient.deleted_at.is_(None), Patient.medical_conditions.isnot(None))
    ).scalar()
    
    patients_with_allergies = db.query(func.count(Patient.id)).filter(
        and_(Patient.deleted_at.is_(None), Patient.allergies.isnot(None))
    ).scalar()
    
    high_anxiety_patients = db.query(func.count(Patient.id)).filter(
        and_(Patient.deleted_at.is_(None), Patient.dental_anxiety_level >= 7)
    ).scalar()
    
    # DENTAL_SPECIFIC: Age distribution
    today = date.today()
    age_groups = [
        ("0-17", 0, 17),
        ("18-35", 18, 35),
        ("36-55", 36, 55),
        ("56-75", 56, 75),
        ("76+", 76, 150)
    ]
    
    age_distribution = {}
    for group_name, min_age, max_age in age_groups:
        min_birth = date(today.year - max_age - 1, 1, 1)
        max_birth = date(today.year - min_age, 12, 31)
        
        count = db.query(func.count(Patient.id)).filter(
            and_(
                Patient.deleted_at.is_(None),
                Patient.date_of_birth.between(min_birth, max_birth)
            )
        ).scalar()
        
        age_distribution[group_name] = count
    
    return {
        "total_patients": total_patients,
        "active_patients": active_patients,
        "archived_patients": total_patients - active_patients,
        "insurance_coverage": {
            "insured": insured_patients,
            "uninsured": total_patients - insured_patients,
            "percentage_insured": round((insured_patients / total_patients * 100) if total_patients > 0 else 0, 1)
        },
        "medical_risk_factors": {
            "patients_with_conditions": patients_with_conditions,
            "patients_with_allergies": patients_with_allergies,
            "high_anxiety_patients": high_anxiety_patients
        },
        "age_distribution": age_distribution
    }

# DENTAL_SPECIFIC: Update insurance information
@router.post("/{patient_id}/insurance")
async def update_patient_insurance(
    patient_id: str,
    insurance_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update patient's dental insurance information.
    
    DENTAL_SPECIFIC: Manages dental insurance details and coverage.
    Required permissions: patients:update
    """
    
    # Check permissions
    if not current_user.has_permission("patients:update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update patient insurance"
        )
    
    patient = db.query(Patient).filter(
        and_(
            Patient.id == patient_id,
            Patient.deleted_at.is_(None)
        )
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Update insurance information
    patient.update_insurance_info(insurance_data)
    patient.updated_at = patient.get_current_time()
    patient.updated_by = current_user.id
    
    db.commit()
    
    return {
        "message": "Insurance information updated successfully",
        "insurance_status": patient.insurance_status
    }
