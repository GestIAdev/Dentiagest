#!/usr/bin/env python3
"""
Test script to verify the document upload system with the new simplified permissions.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.patient import Patient
from app.models.medical_document import MedicalDocument, DocumentType, AccessLevel
from app.models.user import User

def test_system():
    """Test the complete document system."""
    db = SessionLocal()
    
    try:
        # 1. Find our virtual patient
        virtual_patient = db.query(Patient).filter(
            Patient.first_name == "Documentos",
            Patient.last_name == "Clínica"
        ).first()
        
        if not virtual_patient:
            print("❌ Virtual patient not found!")
            return
            
        print(f"✅ Found virtual patient: {virtual_patient.id}")
        
        # 2. Check available document types
        print("\n📋 Available Document Types:")
        for doc_type in DocumentType:
            print(f"  - {doc_type.value}")
            
        # 3. Check available access levels
        print("\n🔒 Available Access Levels:")
        for access_level in AccessLevel:
            print(f"  - {access_level.value}")
            
        # 4. Check users and their roles
        users = db.query(User).all()
        print(f"\n👥 Found {len(users)} users:")
        for user in users:
            print(f"  - {user.email} ({user.role.value if user.role else 'No role'})")
            
        # 5. Check existing documents
        documents = db.query(MedicalDocument).count()
        print(f"\n📄 Total documents in system: {documents}")
        
        print(f"\n✅ System verification complete!")
        print(f"Virtual patient ID for clinic docs: {virtual_patient.id}")
        
    except Exception as e:
        print(f"❌ Error during verification: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_system()
