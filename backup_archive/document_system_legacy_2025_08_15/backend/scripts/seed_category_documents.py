#!/usr/bin/env python3
"""
ADD CATEGORY DOCUMENTS: Añadir documentos de diferentes categorías para probar filtros
"""

import sys
import os
sys.path.append('.')

from app.core.database import get_db
from app.models.medical_document import MedicalDocument, DocumentType, AccessLevel
from app.models.patient import Patient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid

def add_category_documents():
    """Add test documents for different categories."""
    db = next(get_db())
    
    try:
        # Get existing patients
        patients = db.query(Patient).limit(3).all()
        if len(patients) < 3:
            print("❌ Need at least 3 patients. Run create_demo_users.py first")
            return
            
        # Get a valid user for created_by
        from app.models.user import User
        user = db.query(User).first()
        if not user:
            print("❌ Need at least 1 user. Run create_demo_users.py first")
            return
            
        print(f"🎯 Adding documents for {len(patients)} patients...")
        print(f"🔧 Using user {user.email} as creator")
        
        # ADMINISTRATIVE DOCUMENTS
        admin_docs = [
            {
                'title': 'Plan de Tratamiento - Ortodoncia Completa',
                'description': 'Plan detallado de tratamiento ortodóntico con brackets metálicos',
                'document_type': DocumentType.TREATMENT_PLAN,
                'file_name': 'plan_ortodoncia_completa.pdf',
                'mime_type': 'application/pdf',
                'file_size': 512000,  # 512KB
                'access_level': AccessLevel.DOCTOR_ONLY
            },
            {
                'title': 'Carta de Derivación - Endodoncia Especializada',
                'description': 'Derivación a endodoncista para tratamiento de conducto complejo',
                'document_type': DocumentType.REFERRAL_LETTER,
                'file_name': 'derivacion_endodoncia.pdf',
                'mime_type': 'application/pdf',
                'file_size': 256000,  # 256KB
                'access_level': AccessLevel.PATIENT_ACCESSIBLE
            },
            {
                'title': 'Receta Médica - Antibióticos Post-Cirugía',
                'description': 'Prescripción de Amoxicilina 500mg tras exodoncia',
                'document_type': DocumentType.PRESCRIPTION,
                'file_name': 'receta_antibioticos.pdf',
                'mime_type': 'application/pdf',
                'file_size': 128000,  # 128KB
                'access_level': AccessLevel.PATIENT_ACCESSIBLE
            }
        ]
        
        # BILLING DOCUMENTS
        billing_docs = [
            {
                'title': 'Formulario Seguro - Cobertura Ortodoncia',
                'description': 'Solicitud de cobertura para tratamiento ortodóntico',
                'document_type': DocumentType.INSURANCE_FORM,
                'file_name': 'seguro_ortodoncia.pdf',
                'mime_type': 'application/pdf',
                'file_size': 384000,  # 384KB
                'access_level': AccessLevel.CLINICAL_STAFF
            },
            {
                'title': 'Formulario Seguro - Endodoncia Molar',
                'description': 'Formulario para cobertura de endodoncia pieza 36',
                'document_type': DocumentType.INSURANCE_FORM,
                'file_name': 'seguro_endodoncia_36.pdf',
                'mime_type': 'application/pdf',
                'file_size': 256000,  # 256KB
                'access_level': AccessLevel.CLINICAL_STAFF
            }
        ]
        
        # Add administrative documents
        for i, doc_data in enumerate(admin_docs):
            patient = patients[i % len(patients)]
            
            doc = MedicalDocument(
                id=str(uuid.uuid4()),
                patient_id=patient.id,
                medical_record_id=None,  # Will be set by medical record association
                **doc_data,
                file_path=f'/uploads/medical_documents/{doc_data["file_name"]}',
                file_extension=doc_data['file_name'].split('.')[-1],
                document_date=datetime.now() - timedelta(days=i*5),
                is_confidential=False,
                ai_analyzed=False,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                created_by=user.id,
                updated_by=user.id
            )
            
            db.add(doc)
            print(f"✅ Added ADMINISTRATIVE: {doc.title}")
        
        # Add billing documents
        for i, doc_data in enumerate(billing_docs):
            patient = patients[i % len(patients)]
            
            doc = MedicalDocument(
                id=str(uuid.uuid4()),
                patient_id=patient.id,
                medical_record_id=None,
                **doc_data,
                file_path=f'/uploads/medical_documents/{doc_data["file_name"]}',
                file_extension=doc_data['file_name'].split('.')[-1],
                document_date=datetime.now() - timedelta(days=i*3),
                is_confidential=False,
                ai_analyzed=False,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                created_by=user.id,
                updated_by=user.id
            )
            
            db.add(doc)
            print(f"✅ Added BILLING: {doc.title}")
        
        # Commit all changes
        db.commit()
        
        # Summary
        total_docs = db.query(MedicalDocument).count()
        print(f"\n🎉 SUCCESS! Total documents in database: {total_docs}")
        
        # Check distribution
        medical_count = db.query(MedicalDocument).filter(
            MedicalDocument.document_type.in_([
                DocumentType.XRAY_PERIAPICAL, DocumentType.CLINICAL_PHOTO, DocumentType.VOICE_NOTE
            ])
        ).count()
        
        legal_count = db.query(MedicalDocument).filter(
            MedicalDocument.document_type == DocumentType.CONSENT_FORM
        ).count()
        
        admin_count = db.query(MedicalDocument).filter(
            MedicalDocument.document_type.in_([
                DocumentType.TREATMENT_PLAN, DocumentType.REFERRAL_LETTER, DocumentType.PRESCRIPTION
            ])
        ).count()
        
        billing_count = db.query(MedicalDocument).filter(
            DocumentType.INSURANCE_FORM == MedicalDocument.document_type
        ).count()
        
        print(f"\n📊 CATEGORY DISTRIBUTION:")
        print(f"  🩺 Médicos: {medical_count}")
        print(f"  📋 Administrativos: {admin_count}")
        print(f"  ⚖️ Legales: {legal_count}")
        print(f"  💰 Facturación: {billing_count}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_category_documents()
