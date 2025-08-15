#!/usr/bin/env python3
"""
Create virtual patient for clinic administrative documents.
This patient will receive all global/administrative documents not tied to real patients.

USAGE: python create_clinic_virtual_patient.py
"""

import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.patient import Patient

# Predefined UUID for clinic virtual patient
CLINIC_PATIENT_ID = "00000000-0000-0000-0000-000000000001"

def create_clinic_virtual_patient():
    """Create the virtual patient for clinic administrative documents."""
    
    db = next(get_db())
    
    try:
        # Check if virtual patient already exists
        existing = db.query(Patient).filter(Patient.id == CLINIC_PATIENT_ID).first()
        if existing:
            print(f"✅ Virtual patient already exists: {existing.first_name} {existing.last_name}")
            return existing
        
        # Create virtual patient
        virtual_patient = Patient(
            id=CLINIC_PATIENT_ID,
            first_name="Documentos",
            last_name="Clínica",
            document_number="ADMIN-GLOBAL-DOCS",
            email="admin@clinic.internal",
            phone="000-000-000",
            birth_date=datetime(1900, 1, 1).date(),  # Obviously fake
            gender="other",
            address="Sistema Interno",
            city="Virtual",
            postal_code="00000",
            emergency_contact_name="Sistema",
            emergency_contact_phone="000-000-000",
            # Special flags (if we add them to model later)
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(virtual_patient)
        db.commit()
        db.refresh(virtual_patient)
        
        print(f"🎉 Virtual patient created successfully!")
        print(f"   ID: {virtual_patient.id}")
        print(f"   Name: {virtual_patient.first_name} {virtual_patient.last_name}")
        print(f"   Document: {virtual_patient.document_number}")
        
        return virtual_patient
        
    except Exception as e:
        print(f"❌ Error creating virtual patient: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_clinic_virtual_patient()
