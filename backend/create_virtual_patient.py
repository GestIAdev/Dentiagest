#!/usr/bin/env python3
"""
Create virtual patient for clinical administrative documents.
This patient will be used for documents that belong to the clinic itself
rather than specific patients (policies, certificates, etc.)
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.patient import Patient

def create_virtual_patient():
    """Create the virtual patient for clinic documents."""
    db = SessionLocal()
    
    try:
        # Check if virtual patient already exists
        existing = db.query(Patient).filter(
            Patient.first_name == "Documentos",
            Patient.last_name == "Clínica"
        ).first()
        
        if existing:
            print(f"Virtual patient already exists with ID: {existing.id}")
            return existing.id
        
        # Create virtual patient
        virtual_patient = Patient(
            first_name="Documentos",
            last_name="Clínica"
        )
        
        db.add(virtual_patient)
        db.commit()
        db.refresh(virtual_patient)
        
        print(f"✅ Virtual patient created successfully!")
        print(f"Patient ID: {virtual_patient.id}")
        print(f"Name: {virtual_patient.first_name} {virtual_patient.last_name}")
        
        return virtual_patient.id
        
    except Exception as e:
        print(f"❌ Error creating virtual patient: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    create_virtual_patient()
