# DENTAL_SPECIFIC: Patient management API endpoints
"""
Patient management API routes specifically for dental practices.
This module is NOT extractable to PlatformGest core as it contains
dental-specific functionality and business logic.

PLATFORM_PATTERN: Other verticals will have similar "client" management:
- VetGest: Pet management APIs (species, breeds, vaccinations)
- MechaGest: Vehicle management APIs (make, model, service history)  
- RestaurantGest: Customer management APIs (dietary preferences, allergies)

UNIVERSAL_PATTERN: The CRUD structure, permission system, search/pagination 
patterns ARE extractable across all verticals.
"""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import date, datetime
from uuid import UUID

from ...core.database import get_db
from ...core.security import get_current_user, require_permissions
from ...models.user import User
from ...models.patient import Patient, AnxietyLevel, BloodType, Gender, AnxietyLevel, InsuranceStatus
from ...schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientSearchParams,
    PatientWithMedicalHistory,
    PaginatedResponse
)

# DENTAL_SPECIFIC: Router for dental patient management
router = APIRouter(prefix="/patients", tags=["patient-management"])

# PLATFORM_EXTRACTABLE: Create client/customer/patient pattern
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_data: PatientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Create a new patient record for the dental practice.
    
    DENTAL_SPECIFIC: Contains medical history, dental insurance, allergies.
    Required permissions: patients:create
    
    PLATFORM_PATTERN: Every vertical needs client creation:
    - VetGest: create_pet() with veterinary-specific fields
    - MechaGest: create_vehicle() with automotive-specific fields
    - RestaurantGest: create_customer() with dining-specific fields
    
    UNIVERSAL_STRUCTURE: Permission check → Duplicate check → Create → Audit
    """
    
    # PLATFORM_EXTRACTABLE: Permission checking pattern
    if not current_user.has_permission("patients:create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create patient records"
        )
    
    # PLATFORM_EXTRACTABLE: Duplicate email check pattern
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
    
    # DENTAL_SPECIFIC: Patient creation with medical fields - Fixed column mappings
    db_patient = Patient(
        created_by=current_user.id,  # ✅ Corrected: user_id -> created_by
        first_name=patient_data.first_name,
        last_name=patient_data.last_name,
        email=patient_data.email.lower() if patient_data.email else None,
        phone_primary=patient_data.phone,  # ✅ phone -> phone_primary
        phone_secondary=getattr(patient_data, 'phone_secondary', None),
        date_of_birth=patient_data.date_of_birth,
        gender=patient_data.gender,
        # Address fields mapped correctly
        address_street=getattr(patient_data, 'address', None),
        address_city=getattr(patient_data, 'city', None),
        address_state=getattr(patient_data, 'state', None),
        address_postal_code=getattr(patient_data, 'postal_code', None),
        address_country=getattr(patient_data, 'country', None),
        # Emergency contact
        emergency_contact_name=getattr(patient_data, 'emergency_contact_name', None),
        emergency_contact_phone=getattr(patient_data, 'emergency_contact_phone', None),
        emergency_contact_relationship=getattr(patient_data, 'emergency_contact_relationship', None),
        # Medical fields mapped correctly
        medical_history=getattr(patient_data, 'medical_conditions', None),  # medical_conditions -> medical_history
        current_medications=getattr(patient_data, 'medications_current', None),  # medications_current -> current_medications
        allergies=getattr(patient_data, 'allergies', None),
        anxiety_level=getattr(patient_data, 'anxiety_level', None),  # dental_anxiety_level -> anxiety_level
        special_needs=getattr(patient_data, 'special_needs', None),
        # Insurance fields
        insurance_provider=getattr(patient_data, 'insurance_provider', None),
        insurance_policy_number=getattr(patient_data, 'insurance_policy_number', None),
        insurance_group_number=getattr(patient_data, 'insurance_group_number', None),
        # Consent fields
        consent_to_treatment=getattr(patient_data, 'consent_to_treatment', False),
        consent_to_contact=getattr(patient_data, 'consent_to_contact', True),
        preferred_contact_method=getattr(patient_data, 'preferred_contact_method', 'phone'),
        notes=getattr(patient_data, 'notes', None)
    )
    
    # PLATFORM_EXTRACTABLE: Database commit pattern
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    
    # Convert UUIDs to strings for JSON serialization
    response_data = {
        "id": str(db_patient.id),
        "first_name": db_patient.first_name,
        "last_name": db_patient.last_name,
        "email": db_patient.email,
        "phone": db_patient.phone_primary,
        "phone_secondary": db_patient.phone_secondary,
        "date_of_birth": db_patient.date_of_birth,
        "gender": db_patient.gender,
        "address_street": db_patient.address_street,
        "address_city": db_patient.address_city,
        "address_state": db_patient.address_state,
        "address_postal_code": db_patient.address_postal_code,
        "address_country": db_patient.address_country,
        "emergency_contact_name": db_patient.emergency_contact_name,
        "emergency_contact_phone": db_patient.emergency_contact_phone,
        "emergency_contact_relationship": db_patient.emergency_contact_relationship,
        "anxiety_level": db_patient.anxiety_level,
        "consent_to_treatment": db_patient.consent_to_treatment,
        "consent_to_contact": db_patient.consent_to_contact,
        "is_active": db_patient.is_active,
        "created_at": db_patient.created_at,
        "updated_at": db_patient.updated_at,
        "created_by": str(db_patient.created_by),
        "age": None,  # Calculated field
        "full_address": None,  # Calculated field
        "has_insurance": bool(db_patient.insurance_provider),
        "requires_special_care": bool(db_patient.special_needs)
    }
    
    return response_data

# PLATFORM_EXTRACTABLE: List clients/customers/patients with search and pagination
@router.get("/")
async def list_patients(
    search_params: PatientSearchParams = Depends(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    List patients with search, filtering, and pagination.
    
    DENTAL_SPECIFIC: Includes medical and insurance filtering.
    Required permissions: patients:read
    
    PLATFORM_PATTERN: Universal client listing structure:
    - VetGest: list_pets() with species/breed filters
    - MechaGest: list_vehicles() with make/model filters
    - RestaurantGest: list_customers() with preference filters
    
    UNIVERSAL_STRUCTURE: Permission → Query building → Search → Pagination
    """
    
    # PLATFORM_EXTRACTABLE: Permission check
    if not current_user.has_permission("patients:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to list patients"
        )
    
    # PLATFORM_EXTRACTABLE: Base query with soft delete filter
    query = db.query(Patient).filter(Patient.deleted_at.is_(None))
    
    # PLATFORM_EXTRACTABLE: Text search across main fields
    if search_params.search:
        search_term = f"%{search_params.search.lower()}%"
        query = query.filter(
            or_(
                func.lower(Patient.first_name).like(search_term),
                func.lower(Patient.last_name).like(search_term),
                func.lower(Patient.email).like(search_term),
                Patient.phone_primary.like(search_term)
            )
        )
    
    # DENTAL_SPECIFIC: Medical and insurance filters - using correct field names
    if search_params.has_medical_conditions is not None:
        if search_params.has_medical_conditions:
            query = query.filter(Patient.medical_history.isnot(None))
        else:
            query = query.filter(Patient.medical_history.is_(None))
    
    if search_params.has_allergies is not None:
        if search_params.has_allergies:
            query = query.filter(Patient.allergies.isnot(None))
        else:
            query = query.filter(Patient.allergies.is_(None))
            
    if search_params.high_anxiety_only:
        # Note: anxiety_level is an enum, not an integer
        query = query.filter(Patient.anxiety_level.in_([AnxietyLevel.HIGH, AnxietyLevel.SEVERE]))
    
    # DENTAL_SPECIFIC: Age filtering (calculated from birth date)
    if search_params.age_min or search_params.age_max:
        today = date.today()
        if search_params.age_min:
            birth_year_max = today.year - search_params.age_min
            query = query.filter(Patient.date_of_birth <= date(birth_year_max, today.month, today.day))
        if search_params.age_max:
            birth_year_min = today.year - search_params.age_max
            query = query.filter(Patient.date_of_birth >= date(birth_year_min, today.month, today.day))
    
    # PLATFORM_EXTRACTABLE: Date range filtering
    if search_params.created_after:
        query = query.filter(Patient.created_at >= search_params.created_after)
    if search_params.created_before:
        query = query.filter(Patient.created_at <= search_params.created_before)
    
    # PLATFORM_EXTRACTABLE: Sorting
    if search_params.sort_by:
        if search_params.sort_order == "desc":
            query = query.order_by(getattr(Patient, search_params.sort_by).desc())
        else:
            query = query.order_by(getattr(Patient, search_params.sort_by))
    else:
        query = query.order_by(Patient.last_name, Patient.first_name)
    
    # PLATFORM_EXTRACTABLE: Pagination
    total = query.count()
    skip = (search_params.page - 1) * search_params.size
    patients = query.offset(skip).limit(search_params.size).all()
    
    # Convert patients to JSON-serializable format
    patient_items = []
    for patient in patients:
        patient_data = {
            "id": str(patient.id),
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "email": patient.email,
            "phone": patient.phone_primary,
            "phone_secondary": patient.phone_secondary,
            "date_of_birth": patient.date_of_birth.isoformat() if patient.date_of_birth else None,
            "gender": patient.gender.value if patient.gender else None,
            "address_street": patient.address_street,
            "address_city": patient.address_city,
            "address_state": patient.address_state,
            "address_postal_code": patient.address_postal_code,
            "address_country": patient.address_country,
            "emergency_contact_name": patient.emergency_contact_name,
            "emergency_contact_phone": patient.emergency_contact_phone,
            "emergency_contact_relationship": patient.emergency_contact_relationship,
            "anxiety_level": patient.anxiety_level.value if patient.anxiety_level else None,
            "consent_to_treatment": patient.consent_to_treatment,
            "consent_to_contact": patient.consent_to_contact,
            "is_active": patient.is_active,
            "created_at": patient.created_at.isoformat(),
            "updated_at": patient.updated_at.isoformat(),
            "created_by": str(patient.created_by),
            "age": None,  # Calculated field
            "full_address": None,  # Calculated field
            "has_insurance": bool(patient.insurance_provider),
            "requires_special_care": bool(patient.special_needs)
        }
        patient_items.append(patient_data)
    
    return {
        "items": patient_items,
        "total": total,
        "page": search_params.page,
        "size": search_params.size,
        "pages": (total + search_params.size - 1) // search_params.size
    }

# PLATFORM_EXTRACTABLE: Get single client/customer/patient by ID
@router.get("/{patient_id}", response_model=PatientWithMedicalHistory)
async def get_patient(
    patient_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific patient by ID with full medical history.
    
    DENTAL_SPECIFIC: Returns sensitive medical information.
    Required permissions: patients:read
    
    PLATFORM_PATTERN: Universal single client retrieval:
    - VetGest: get_pet() with veterinary records
    - MechaGest: get_vehicle() with service history
    - RestaurantGest: get_customer() with dining history
    """
    
    # PLATFORM_EXTRACTABLE: Permission check
    if not current_user.has_permission("patients:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view patient details"
        )
    
    # PLATFORM_EXTRACTABLE: Entity lookup with soft delete check
    patient = db.query(Patient).filter(
        and_(Patient.id == patient_id, Patient.deleted_at.is_(None))
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return PatientWithMedicalHistory.from_orm(patient)

# PLATFORM_EXTRACTABLE: Update client/customer/patient
@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: UUID,
    patient_data: PatientUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update an existing patient record.
    
    DENTAL_SPECIFIC: Updates medical history and insurance information.
    Required permissions: patients:update
    
    PLATFORM_PATTERN: Universal client update structure:
    - VetGest: update_pet() with veterinary-specific fields
    - MechaGest: update_vehicle() with automotive-specific fields
    - RestaurantGest: update_customer() with dining-specific fields
    """
    
    # PLATFORM_EXTRACTABLE: Permission check
    if not current_user.has_permission("patients:update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update patient records"
        )
    
    # PLATFORM_EXTRACTABLE: Entity lookup
    patient = db.query(Patient).filter(
        and_(Patient.id == patient_id, Patient.deleted_at.is_(None))
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # PLATFORM_EXTRACTABLE: Email uniqueness check (if email is being updated)
    if patient_data.email and patient_data.email.lower() != patient.email:
        existing_patient = db.query(Patient).filter(
            and_(
                Patient.email == patient_data.email.lower(),
                Patient.id != patient_id,
                Patient.deleted_at.is_(None)
            )
        ).first()
        
        if existing_patient:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Patient with this email already exists"
            )
    
    # PLATFORM_EXTRACTABLE: Update fields
    update_data = patient_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "email" and value:
            setattr(patient, field, value.lower())
        else:
            setattr(patient, field, value)
    
    # PLATFORM_EXTRACTABLE: Audit trail
    patient.updated_by = current_user.id
    
    db.commit()
    db.refresh(patient)
    
    return PatientResponse.from_orm(patient)

# PLATFORM_EXTRACTABLE: Soft delete client/customer/patient
@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> None:
    """
    Soft delete a patient (mark as deleted without removing from database).
    
    DENTAL_SPECIFIC: Preserves medical records for legal compliance.
    Required permissions: patients:delete
    
    PLATFORM_PATTERN: Universal soft deletion for data integrity:
    - Preserve audit trails and relationships
    - Enable potential restoration
    - Comply with data retention policies
    """
    
    # PLATFORM_EXTRACTABLE: Permission check
    if not current_user.has_permission("patients:delete"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to delete patient records"
        )
    
    # PLATFORM_EXTRACTABLE: Entity lookup
    patient = db.query(Patient).filter(
        and_(Patient.id == patient_id, Patient.deleted_at.is_(None))
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # PLATFORM_EXTRACTABLE: Soft deletion with audit
    patient.deleted_at = datetime.utcnow()
    patient.deleted_by = current_user.id
    patient.is_active = False
    
    db.commit()

# DENTAL_SPECIFIC: Activate/deactivate patient
@router.post("/{patient_id}/activate", response_model=PatientResponse)
async def activate_patient(
    patient_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Activate a patient account (allow appointments and services).
    
    DENTAL_SPECIFIC: Manages patient treatment eligibility.
    Required permissions: patients:update
    
    PLATFORM_PATTERN: Most verticals need activation/deactivation:
    - VetGest: activate_pet() for treatment eligibility
    - MechaGest: activate_vehicle() for service eligibility
    - RestaurantGest: activate_customer() for reservation eligibility
    """
    
    # PLATFORM_EXTRACTABLE: Permission check
    if not current_user.has_permission("patients:update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to activate patient"
        )
    
    # PLATFORM_EXTRACTABLE: Entity lookup and activation
    patient = db.query(Patient).filter(
        and_(Patient.id == patient_id, Patient.deleted_at.is_(None))
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    patient.is_active = True
    patient.updated_by = current_user.id
    
    db.commit()
    db.refresh(patient)
    
    return PatientResponse.from_orm(patient)

@router.post("/{patient_id}/deactivate", response_model=PatientResponse)
async def deactivate_patient(
    patient_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Deactivate a patient account (prevent new appointments).
    
    DENTAL_SPECIFIC: Temporarily suspend patient services.
    Required permissions: patients:update
    """
    
    # PLATFORM_EXTRACTABLE: Permission check
    if not current_user.has_permission("patients:update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to deactivate patient"
        )
    
    # PLATFORM_EXTRACTABLE: Entity lookup and deactivation
    patient = db.query(Patient).filter(
        and_(Patient.id == patient_id, Patient.deleted_at.is_(None))
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    patient.is_active = False
    patient.updated_by = current_user.id
    
    db.commit()
    db.refresh(patient)
    
    return PatientResponse.from_orm(patient)

# DENTAL_SPECIFIC: Medical history endpoints
@router.get("/{patient_id}/medical-history")
async def get_patient_medical_history(
    patient_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get comprehensive medical history for a patient.
    
    DENTAL_SPECIFIC: Returns detailed medical information for treatment planning.
    Required permissions: patients:read_medical
    
    VERTICAL_SPECIFIC: Each vertical has different "history" patterns:
    - VetGest: get_pet_medical_history() → vaccinations, treatments, surgeries
    - MechaGest: get_vehicle_service_history() → repairs, maintenance, inspections
    - RestaurantGest: get_customer_dining_history() → orders, preferences, allergies
    """
    
    # PLATFORM_EXTRACTABLE: Enhanced permission check
    if not current_user.has_permission("patients:read_medical"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view medical history"
        )
    
    # PLATFORM_EXTRACTABLE: Entity lookup
    patient = db.query(Patient).filter(
        and_(Patient.id == patient_id, Patient.deleted_at.is_(None))
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # DENTAL_SPECIFIC: Comprehensive medical history compilation
    medical_history = {
        "patient_id": str(patient.id),
        "basic_info": {
            "name": f"{patient.first_name} {patient.last_name}",
            "date_of_birth": patient.date_of_birth,
            "age": patient.age if hasattr(patient, 'age') else None,
            "gender": patient.gender,
            "blood_type": patient.blood_type
        },
        "medical_conditions": patient.medical_conditions,
        "current_medications": patient.medications_current,
        "allergies": patient.allergies,
        "emergency_contact": {
            "name": patient.emergency_contact_name,
            "phone": patient.emergency_contact_phone,
            "relationship": patient.emergency_contact_relationship
        },
        "dental_specific": {
            "previous_dentist": patient.previous_dentist,
            "anxiety_level": patient.dental_anxiety_level,
            "insurance_info": patient.dental_insurance_info,
            "insurance_status": patient.insurance_status
        },
        "consent_status": {
            "treatment": patient.consent_treatment,
            "marketing": patient.consent_marketing,
            "data_sharing": patient.consent_data_sharing
        },
        "preferences": {
            "appointment_time": patient.preferred_appointment_time,
            "communication": patient.communication_preferences
        }
    }
    
    return medical_history

# DENTAL_SPECIFIC: Insurance management
@router.put("/{patient_id}/insurance")
async def update_patient_insurance(
    patient_id: UUID,
    insurance_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update patient insurance information.
    
    DENTAL_SPECIFIC: Manages dental insurance details for billing.
    Required permissions: patients:update_insurance
    
    VERTICAL_ADAPTATION: Insurance concept varies by vertical:
    - VetGest: Pet insurance for veterinary care
    - MechaGest: Vehicle insurance for service liability
    - RestaurantGest: No insurance typically, but could be loyalty programs
    """
    
    # PLATFORM_EXTRACTABLE: Permission check
    if not current_user.has_permission("patients:update_insurance"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update insurance information"
        )
    
    # PLATFORM_EXTRACTABLE: Entity lookup
    patient = db.query(Patient).filter(
        and_(Patient.id == patient_id, Patient.deleted_at.is_(None))
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # DENTAL_SPECIFIC: Insurance information update
    patient.dental_insurance_info = insurance_data
    patient.insurance_status = insurance_data.get("status", InsuranceStatus.NO_INSURANCE)
    patient.updated_by = current_user.id
    
    db.commit()
    db.refresh(patient)
    
    return PatientResponse.from_orm(patient)

# PLATFORM_EXTRACTABLE: Search suggestions (universal pattern)
@router.get("/search/suggestions")
async def get_patient_search_suggestions(
    query: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[dict]:
    """
    Get patient search suggestions for autocomplete.
    
    DENTAL_SPECIFIC: Searches patient names and basic info.
    Required permissions: patients:read
    
    PLATFORM_PATTERN: Universal search suggestions across verticals:
    - VetGest: Pet name and owner suggestions
    - MechaGest: Vehicle and owner suggestions  
    - RestaurantGest: Customer name and contact suggestions
    """
    
    # PLATFORM_EXTRACTABLE: Permission check
    if not current_user.has_permission("patients:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to search patients"
        )
    
    # PLATFORM_EXTRACTABLE: Search query building
    search_term = f"%{query.lower()}%"
    patients = db.query(Patient).filter(
        and_(
            Patient.deleted_at.is_(None),
            or_(
                func.lower(Patient.first_name).like(search_term),
                func.lower(Patient.last_name).like(search_term),
                func.lower(Patient.email).like(search_term)
            )
        )
    ).limit(limit).all()
    
    # PLATFORM_EXTRACTABLE: Suggestion response format
    suggestions = []
    for patient in patients:
        suggestions.append({
            "id": str(patient.id),
            "name": f"{patient.first_name} {patient.last_name}",
            "email": patient.email if patient.email else "",
            "phone": patient.phone if hasattr(patient, "phone") and patient.phone else "",
            "type": "patient"  # Adaptable: "pet", "vehicle", "customer"
        })
    
    return suggestions
