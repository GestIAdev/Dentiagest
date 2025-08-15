#!/usr/bin/env python3
"""
Clean up all medical documents and uploaded files.
This will remove all documents from the database and delete the uploaded files.
"""

import sys
import os
import shutil
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.medical_document import MedicalDocument

def clean_documents():
    """Clean all documents and uploaded files."""
    db = SessionLocal()
    
    try:
        # 1. Get all documents
        documents = db.query(MedicalDocument).all()
        print(f"📄 Found {len(documents)} documents to clean")
        
        # 2. Delete files from filesystem
        uploads_dir = "uploads/medical_documents"
        if os.path.exists(uploads_dir):
            print(f"🗂️  Cleaning uploads directory: {uploads_dir}")
            for filename in os.listdir(uploads_dir):
                file_path = os.path.join(uploads_dir, filename)
                if os.path.isfile(file_path):
                    os.remove(file_path)
                    print(f"   ❌ Deleted: {filename}")
        
        # 3. Delete documents from database
        deleted_count = db.query(MedicalDocument).delete()
        db.commit()
        
        print(f"✅ Cleanup complete!")
        print(f"   - Files deleted from filesystem: {len(os.listdir(uploads_dir)) if os.path.exists(uploads_dir) else 0}")
        print(f"   - Documents removed from database: {deleted_count}")
        
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
    print("🧹 Starting document cleanup...")
    print("⚠️  This will delete ALL uploaded documents and files!")
    
    response = input("Are you sure? (yes/no): ")
    if response.lower() in ['yes', 'y', 'si', 's']:
        clean_documents()
    else:
        print("Cleanup cancelled.")
