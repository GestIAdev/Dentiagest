#!/usr/bin/env python3
"""
Migrate existing documents to use the new simplified access levels.
This will update all CLINICAL_STAFF documents to MEDICAL.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine
from sqlalchemy import text

def migrate_access_levels():
    """Migrate old access level values to new ones."""
    db = SessionLocal()
    
    try:
        # Mapeo de valores viejos a nuevos
        # CLINICAL_STAFF, DOCTOR_ONLY, CONFIDENTIAL -> MEDICAL (documentos médicos)
        # PATIENT_ACCESSIBLE, PUBLIC -> ADMINISTRATIVE (documentos administrativos)
        
        print("🔄 Mapping old values to new simplified system...")
        
        # 1. Migrate medical-related values to MEDICAL
        result1 = db.execute(text("""
            UPDATE medical_documents 
            SET access_level = 'CLINICAL_STAFF' 
            WHERE access_level IN ('DOCTOR_ONLY', 'CONFIDENTIAL')
        """))
        print(f"   - Unified medical documents: {result1.rowcount}")
        
        # 2. Migrate administrative-related values to PATIENT_ACCESSIBLE (temp)
        result2 = db.execute(text("""
            UPDATE medical_documents 
            SET access_level = 'PATIENT_ACCESSIBLE' 
            WHERE access_level = 'PUBLIC'
        """))
        print(f"   - Unified administrative documents: {result2.rowcount}")
        
        db.commit()
        
        print(f"✅ Pre-migration complete!")
        print(f"   - All documents now use CLINICAL_STAFF or PATIENT_ACCESSIBLE")
        print(f"   - Ready for Alembic enum migration")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Migrating access levels...")
    migrate_access_levels()
