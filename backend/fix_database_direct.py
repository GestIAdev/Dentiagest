#!/usr/bin/env python3
"""
Direct database fix for enum values.
This bypasses Alembic and fixes the database directly.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from sqlalchemy import text

def fix_database_directly():
    """Fix the database enum values directly."""
    db = SessionLocal()
    
    try:
        print("🔧 Direct database fix starting...")
        
        # Step 1: Convert column to text temporarily
        print("   1. Converting access_level column to text...")
        db.execute(text("ALTER TABLE medical_documents ALTER COLUMN access_level TYPE text"))
        
        # Step 2: Update the data
        print("   2. Updating data values...")
        result1 = db.execute(text("""
            UPDATE medical_documents 
            SET access_level = 'medical' 
            WHERE access_level = 'CLINICAL_STAFF'
        """))
        print(f"      - Updated {result1.rowcount} documents to 'medical'")
        
        result2 = db.execute(text("""
            UPDATE medical_documents 
            SET access_level = 'administrative' 
            WHERE access_level = 'PATIENT_ACCESSIBLE'
        """))
        print(f"      - Updated {result2.rowcount} documents to 'administrative'")
        
        # Step 3: Drop old enum and create new one
        print("   3. Recreating enum type...")
        db.execute(text("DROP TYPE IF EXISTS accesslevel CASCADE"))
        db.execute(text("CREATE TYPE accesslevel AS ENUM ('medical', 'administrative')"))
        
        # Step 4: Convert column back to enum
        print("   4. Converting column back to enum...")
        db.execute(text("""
            ALTER TABLE medical_documents 
            ALTER COLUMN access_level TYPE accesslevel 
            USING access_level::accesslevel
        """))
        
        # Step 5: Set default value
        db.execute(text("""
            ALTER TABLE medical_documents 
            ALTER COLUMN access_level SET DEFAULT 'medical'
        """))
        
        db.commit()
        
        print("✅ Database fixed successfully!")
        print("   - AccessLevel enum now has: 'medical', 'administrative'")
        print("   - All existing documents migrated")
        
        return True
        
    except Exception as e:
        print(f"❌ Error fixing database: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    fix_database_directly()
