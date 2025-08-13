#!/usr/bin/env python3
"""
🩺 DIAGNOSIS - Patient 500 Error
Quick diagnostic to find exactly what's causing the 500 error
"""

import sys
import os
sys.path.append('/app')
sys.path.append('/backend')
sys.path.append('/backend/app')

try:
    print("🔍 Testing model imports...")
    
    # Test basic imports
    print("  ├─ Importing database...")
    from app.core.database import get_db
    
    print("  ├─ Importing models...")
    from app.models import Patient, MedicalRecord
    
    print("  ├─ Importing User...")
    from app.models.user import User
    
    print("  ├─ Testing SQLAlchemy session...")
    from app.core.database import SessionLocal
    
    print("  ├─ Creating test session...")
    db = SessionLocal()
    
    print("  ├─ Testing Patient query...")
    try:
        patients = db.query(Patient).limit(1).all()
        print(f"  ├─ ✅ Patient query successful: {len(patients)} patients found")
    except Exception as e:
        print(f"  ├─ ❌ Patient query failed: {e}")
        
    print("  ├─ Testing MedicalRecord query...")
    try:
        records = db.query(MedicalRecord).limit(1).all()
        print(f"  ├─ ✅ MedicalRecord query successful: {len(records)} records found")
    except Exception as e:
        print(f"  ├─ ❌ MedicalRecord query failed: {e}")
    
    db.close()
    print("✅ Model diagnostics complete!")
    
except Exception as e:
    print(f"❌ Import error: {e}")
    import traceback
    traceback.print_exc()
