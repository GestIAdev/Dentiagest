"""Fix enum values in database

Revision ID: fix_enum_values_manual
Revises: 0076890a9b06
Create Date: 2025-08-14 03:20:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'fix_enum_values_manual'
down_revision = '0076890a9b06'
branch_labels = None
depends_on = None

def upgrade():
    """Apply the enum changes to PostgreSQL."""
    
    # Step 1: Drop and recreate the enum with new values
    op.execute("ALTER TABLE medical_documents ALTER COLUMN access_level TYPE text")
    op.execute("DROP TYPE IF EXISTS accesslevel CASCADE")
    op.execute("CREATE TYPE accesslevel AS ENUM ('medical', 'administrative')")
    
    # Step 2: Update existing data to use new values
    op.execute("""
        UPDATE medical_documents 
        SET access_level = 'medical' 
        WHERE access_level = 'CLINICAL_STAFF'
    """)
    
    op.execute("""
        UPDATE medical_documents 
        SET access_level = 'administrative' 
        WHERE access_level = 'PATIENT_ACCESSIBLE'
    """)
    
    # Step 3: Convert column back to enum
    op.execute("""
        ALTER TABLE medical_documents 
        ALTER COLUMN access_level TYPE accesslevel 
        USING access_level::accesslevel
    """)

def downgrade():
    """Revert the enum changes."""
    
    # Recreate old enum
    op.execute("DROP TYPE IF EXISTS accesslevel CASCADE")
    op.execute("""
        CREATE TYPE accesslevel AS ENUM (
            'CLINICAL_STAFF', 'CONFIDENTIAL', 'DOCTOR_ONLY', 
            'PATIENT_ACCESSIBLE', 'PUBLIC'
        )
    """)
    
    # Update data back
    op.execute("""
        UPDATE medical_documents 
        SET access_level = 'CLINICAL_STAFF' 
        WHERE access_level = 'medical'
    """)
    
    op.execute("""
        UPDATE medical_documents 
        SET access_level = 'PATIENT_ACCESSIBLE' 
        WHERE access_level = 'administrative'
    """)
    
    # Recreate column
    op.execute("""
        ALTER TABLE medical_documents 
        ALTER COLUMN access_level TYPE accesslevel 
        USING access_level::text::accesslevel
    """)
