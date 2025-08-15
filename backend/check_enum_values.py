#!/usr/bin/env python3
"""
Check what enum values are actually defined in the database.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from sqlalchemy import text

def check_enum_values():
    """Check what enum values are defined in PostgreSQL."""
    db = SessionLocal()
    
    try:
        # Check AccessLevel enum values
        result = db.execute(text("""
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = (
                SELECT oid 
                FROM pg_type 
                WHERE typname = 'accesslevel'
            )
            ORDER BY enumlabel;
        """))
        
        access_levels = [row[0] for row in result.fetchall()]
        print(f"🔍 AccessLevel enum values in database: {access_levels}")
        
        # Check what values are actually used in documents
        result = db.execute(text("""
            SELECT access_level, COUNT(*) 
            FROM medical_documents 
            GROUP BY access_level;
        """))
        
        usage = [(row[0], row[1]) for row in result.fetchall()]
        print(f"📊 Current usage in documents: {usage}")
        
        return access_levels, usage
        
    except Exception as e:
        print(f"❌ Error checking enum values: {e}")
        import traceback
        traceback.print_exc()
        return [], []
    finally:
        db.close()

if __name__ == "__main__":
    check_enum_values()
