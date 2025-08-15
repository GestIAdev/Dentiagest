"""unified_document_types

Revision ID: 9e8fe222ce35
Revises: 76aada9ec7f3
Create Date: 2025-08-15 14:09:28.715366

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import enum

# revision identifiers, used by Alembic.
revision: str = '9e8fe222ce35'
down_revision: Union[str, Sequence[str], None] = '76aada9ec7f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Unified Document Types Enum
class UnifiedDocumentType(enum.Enum):
    XRAY = 'xray'
    PHOTO_CLINICAL = 'photo_clinical'
    VOICE_NOTE = 'voice_note'
    TREATMENT_PLAN = 'treatment_plan'
    LAB_REPORT = 'lab_report'
    PRESCRIPTION = 'prescription'
    SCAN_3D = 'scan_3d'
    CONSENT_FORM = 'consent_form'
    INSURANCE_FORM = 'insurance_form'
    DOCUMENT_GENERAL = 'document_general'
    INVOICE = 'invoice'
    BUDGET = 'budget'
    PAYMENT_PROOF = 'payment_proof'
    REFERRAL_LETTER = 'referral_letter'
    LEGAL_DOCUMENT = 'legal_document'

# Legal Category Enum  
class LegalCategory(enum.Enum):
    MEDICAL = 'medical'
    ADMINISTRATIVE = 'administrative'
    BILLING = 'billing'
    LEGAL = 'legal'


def upgrade() -> None:
    """Apply unified document types migration - SAFE VERSION"""
    
    # Create connection
    conn = op.get_bind()
    
    # 1. Create enums if they don't exist
    print("🎯 Creating unified document type enums...")
    
    # Check if UnifiedDocumentType enum exists
    result = conn.execute(sa.text("SELECT 1 FROM pg_type WHERE typname = 'unifieddocumenttype'"))
    if not result.fetchone():
        conn.execute(sa.text("""
            CREATE TYPE unifieddocumenttype AS ENUM (
                'xray', 'photo_clinical', 'voice_note', 'treatment_plan', 
                'lab_report', 'prescription', 'scan_3d', 'consent_form', 
                'insurance_form', 'document_general', 'invoice', 'budget', 
                'payment_proof', 'referral_letter', 'legal_document'
            )
        """))
        print("   ✅ UnifiedDocumentType enum created")
    else:
        print("   ℹ️ UnifiedDocumentType enum already exists")
    
    # Check if LegalCategory enum exists
    result = conn.execute(sa.text("SELECT 1 FROM pg_type WHERE typname = 'legalcategory'"))
    if not result.fetchone():
        conn.execute(sa.text("""
            CREATE TYPE legalcategory AS ENUM ('medical', 'administrative', 'billing', 'legal')
        """))
        print("   ✅ LegalCategory enum created")
    else:
        print("   ℹ️ LegalCategory enum already exists")
    
    # 2. Add columns if they don't exist
    print("🏗️ Adding unified columns...")
    
    # Check existing columns
    result = conn.execute(sa.text("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'medical_documents' 
        AND column_name IN ('unified_type', 'legal_category')
    """))
    existing_columns = [row[0] for row in result.fetchall()]
    
    if 'unified_type' not in existing_columns:
        op.add_column('medical_documents', 
            sa.Column('unified_type', sa.Enum(UnifiedDocumentType, name='unifieddocumenttype'), nullable=True))
        print("   ✅ unified_type column added")
    else:
        print("   ℹ️ unified_type column already exists")
    
    if 'legal_category' not in existing_columns:
        op.add_column('medical_documents', 
            sa.Column('legal_category', sa.Enum(LegalCategory, name='legalcategory'), nullable=True))
        print("   ✅ legal_category column added")
    else:
        print("   ℹ️ legal_category column already exists")
    
    print("🎉 Unified document types migration completed!")


def downgrade() -> None:
    """Downgrade schema - Remove unified columns and enums"""
    op.drop_column('medical_documents', 'legal_category')
    op.drop_column('medical_documents', 'unified_type')
    
    conn = op.get_bind()
    conn.execute(sa.text("DROP TYPE IF EXISTS legalcategory"))
    conn.execute(sa.text("DROP TYPE IF EXISTS unifieddocumenttype"))
