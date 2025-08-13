#!/usr/bin/env python3
"""
🏴‍☠️ CYBERBAKUNIN DATABASE REVOLUTION 🏴‍☠️
"La propiedad es un robo, y los datos inconsistentes también!" 

Script para destruir la inconsistencia de datos entre patients y medical_records.
Modo anarquista: fix hardcore, sin parches de barbie.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.patient import Patient
from app.models.medical_record import MedicalRecord

def cyberbakunin_database_revolution():
    """Destruir la inconsistencia de datos como corresponde."""
    db: Session = SessionLocal()
    
    try:
        print("🏴‍☠️ CYBERBAKUNIN DATABASE REVOLUTION INICIADA")
        print("=" * 60)
        
        # 1. INVESTIGAR: Encontrar Raul Robles (paciente actual)
        print("\n🔍 INVESTIGANDO: Buscando Raul Robles...")
        raul_robles = db.query(Patient).filter(
            Patient.first_name.ilike('%raul%'),
            Patient.last_name.ilike('%robles%'),
            Patient.deleted_at.is_(None)
        ).first()
        
        if raul_robles:
            print(f"✅ ENCONTRADO: Raul Robles - ID: {raul_robles.id}")
            print(f"   Nombre completo: {raul_robles.first_name} {raul_robles.last_name}")
            print(f"   Email: {raul_robles.email}")
        else:
            print("❌ NO ENCONTRADO: Raul Robles")
            return
            
        # 2. INVESTIGAR: Buscar medical records huérfanos
        print("\n🔍 INVESTIGANDO: Medical records huérfanos...")
        orphaned_records = db.query(MedicalRecord).filter(
            MedicalRecord.deleted_at.is_(None)
        ).all()
        
        orphaned_count = 0
        for record in orphaned_records:
            # Verificar si el paciente existe
            patient_exists = db.query(Patient).filter(
                Patient.id == record.patient_id,
                Patient.deleted_at.is_(None)
            ).first()
            
            if not patient_exists:
                print(f"👻 HUÉRFANO DETECTADO: Medical Record {record.id}")
                print(f"   Patient ID fantasma: {record.patient_id}")
                print(f"   Fecha visita: {record.visit_date}")
                print(f"   Diagnóstico: {record.diagnosis[:50]}..." if record.diagnosis else "   Sin diagnóstico")
                orphaned_count += 1
                
        print(f"\n📊 RESUMEN: {orphaned_count} medical records huérfanos detectados")
        
        # 3. REVOLUCIÓN: Arreglar datos inconsistentes
        if orphaned_count > 0:
            print(f"\n🔥 INICIANDO REVOLUCIÓN: Asignando {orphaned_count} records a Raul Robles")
            
            updated_count = 0
            for record in orphaned_records:
                patient_exists = db.query(Patient).filter(
                    Patient.id == record.patient_id,
                    Patient.deleted_at.is_(None)
                ).first()
                
                if not patient_exists:
                    print(f"🔧 FIXING: Medical Record {record.id} -> Raul Robles")
                    record.patient_id = raul_robles.id
                    updated_count += 1
                    
            # COMMIT LA REVOLUCIÓN
            db.commit()
            print(f"✅ REVOLUCIÓN COMPLETADA: {updated_count} records actualizados")
            
        # 4. VERIFICACIÓN: Confirmar que todo está arreglado
        print("\n🔍 VERIFICACIÓN POST-REVOLUCIÓN:")
        remaining_orphans = 0
        for record in orphaned_records:
            patient_exists = db.query(Patient).filter(
                Patient.id == record.patient_id,
                Patient.deleted_at.is_(None)
            ).first()
            
            if not patient_exists:
                remaining_orphans += 1
                
        print(f"📊 HUÉRFANOS RESTANTES: {remaining_orphans}")
        
        if remaining_orphans == 0:
            print("🎉 ¡VICTORIA! Todos los datos están sincronizados")
            print("🏴‍☠️ CyberBakunin aprueba esta revolución")
        else:
            print("⚠️  Aún hay trabajo por hacer, camarada")
            
    except Exception as e:
        print(f"💥 ERROR EN LA REVOLUCIÓN: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🏴‍☠️ CyberBakunin dice: 'Ni dios, ni estado, ni datos inconsistentes!'")
    cyberbakunin_database_revolution()
