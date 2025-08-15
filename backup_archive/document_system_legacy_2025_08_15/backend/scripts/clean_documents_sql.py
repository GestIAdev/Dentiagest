#!/usr/bin/env python3
"""
Clean up documents using direct SQL to avoid enum cache issues.
"""

import sys
import os
import shutil
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from sqlalchemy import text

def clean_documents_sql():
    """Clean all documents using raw SQL."""
    db = SessionLocal()
    
    try:
        # 1. Count documents first
        result = db.execute(text("SELECT COUNT(*) FROM medical_documents"))
        count = result.scalar()
        print(f"📄 Found {count} documents to clean")
        
        # 2. Delete files from filesystem
        uploads_dir = "uploads/medical_documents"
        deleted_files = 0
        if os.path.exists(uploads_dir):
            print(f"🗂️  Cleaning uploads directory: {uploads_dir}")
            for filename in os.listdir(uploads_dir):
                file_path = os.path.join(uploads_dir, filename)
                if os.path.isfile(file_path):
                    os.remove(file_path)
                    deleted_files += 1
                    print(f"   ❌ Deleted: {filename}")
        
        # 3. Delete documents from database using raw SQL
        result = db.execute(text("DELETE FROM medical_documents"))
        db.commit()
        
        print(f"✅ Cleanup complete!")
        print(f"   - Files deleted from filesystem: {deleted_files}")
        print(f"   - Documents removed from database: {count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("🧹 Starting document cleanup (SQL method)...")
    print("⚠️  This will delete ALL uploaded documents and files!")
    
    response = input("Are you sure? (yes/no): ")
    if response.lower() in ['yes', 'y', 'si', 's']:
        clean_documents_sql()
    else:
        print("Cleanup cancelled.")
