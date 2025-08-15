# UNIFIED_DOCUMENT_TYPES_MIGRATION: Backend Database Migration
"""
Unified Document Types Migration v2.0
By PunkClaude & Team Anarquista - Revolutionary Document Management

🎯 MIGRATION STRATEGY:
- Preserves ALL existing data
- Maps legacy types to unified types
- Maintains legal framework compliance
- Adds AI-ready fields
- Zero downtime migration

🏛️ LEGAL COMPLIANCE:
- Respects Argentina Ley 25.326
- Maintains GDPR Article 9 compliance
- Preserves all audit trails
- Never deletes medical documents
"""

revision = '2025_08_15_unified_document_types'
down_revision = '76aada9ec7f3'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import enum

# 🗂️ NEW UNIFIED DOCUMENT TYPE ENUM
class UnifiedDocumentType(enum.Enum):
    # 🏥 MEDICAL TYPES
    XRAY = "xray"
    PHOTO_CLINICAL = "photo_clinical"
    VOICE_NOTE = "voice_note"
    TREATMENT_PLAN = "treatment_plan"
    LAB_REPORT = "lab_report"
    PRESCRIPTION = "prescription"
    SCAN_3D = "scan_3d"
    
    # 📋 ADMINISTRATIVE TYPES
    CONSENT_FORM = "consent_form"
    INSURANCE_FORM = "insurance_form"
    DOCUMENT_GENERAL = "document_general"
    
    # 💰 BILLING TYPES
    INVOICE = "invoice"
    BUDGET = "budget"
    PAYMENT_PROOF = "payment_proof"
    
    # ⚖️ LEGAL TYPES
    REFERRAL_LETTER = "referral_letter"
    LEGAL_DOCUMENT = "legal_document"

# 🏛️ LEGAL CATEGORY ENUM
class LegalCategory(enum.Enum):
    MEDICAL = "medical"
    ADMINISTRATIVE = "administrative"
    BILLING = "billing"
    LEGAL = "legal"

# 🗺️ LEGACY TO UNIFIED MAPPING
LEGACY_TO_UNIFIED_MAPPING = {
    # 🏥 MEDICAL MAPPINGS
    'xray_bitewing': 'xray',
    'xray_panoramic': 'xray',
    'xray_periapical': 'xray',
    'xray_cephalometric': 'xray',
    'ct_scan': 'xray',
    'cbct_scan': 'xray',
    
    'intraoral_photo': 'photo_clinical',
    'extraoral_photo': 'photo_clinical',
    'clinical_photo': 'photo_clinical',
    'progress_photo': 'photo_clinical',
    'before_after_photo': 'photo_clinical',
    
    'voice_note': 'voice_note',
    'treatment_plan': 'treatment_plan',
    'lab_report': 'lab_report',
    'prescription': 'prescription',
    'stl_file': 'scan_3d',
    'scan_impression': 'scan_3d',
    
    # 📋 ADMINISTRATIVE MAPPINGS
    'consent_form': 'consent_form',
    'insurance_form': 'insurance_form',
    'other_document': 'document_general',
    
    # 💰 BILLING MAPPINGS
    'insurance_document': 'invoice',
    
    # ⚖️ LEGAL MAPPINGS
    'referral_letter': 'referral_letter'
}

# 🗂️ LEGACY TO LEGAL CATEGORY MAPPING
LEGACY_TO_CATEGORY_MAPPING = {
    'medical': 'medical',
    'administrative': 'administrative',
    'billing': 'billing',
    'legal': 'legal'
}

def upgrade():
    """Apply unified document types migration"""
    
    # 1️⃣ CREATE NEW ENUMS (SAFE - CHECK IF EXISTS)
    print("🎯 Creating unified document type enums...")
    
    # Check if enum already exists before creating
    conn = op.get_bind()
    result = conn.execute(sa.text("SELECT 1 FROM pg_type WHERE typname = 'unifieddocumenttype'"))
    if not result.fetchone():
        unified_document_type_enum = sa.Enum(UnifiedDocumentType, name='unifieddocumenttype')
        unified_document_type_enum.create(conn)
        print("   ✅ UnifiedDocumentType enum created")
    else:
        print("   ℹ️ UnifiedDocumentType enum already exists, skipping")
    
    result = conn.execute(sa.text("SELECT 1 FROM pg_type WHERE typname = 'legalcategory'"))
    if not result.fetchone():
        legal_category_enum = sa.Enum(LegalCategory, name='legalcategory')
        legal_category_enum.create(conn)
        print("   ✅ LegalCategory enum created")
    else:
        print("   ℹ️ LegalCategory enum already exists, skipping")
    
    # 2️⃣ ADD NEW COLUMNS TO MEDICAL_DOCUMENTS (SAFE - CHECK IF EXISTS)
    print("🏗️ Adding new unified columns...")
    
    # Check if columns already exist
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
        print("   ℹ️ unified_type column already exists, skipping")
    
    if 'legal_category' not in existing_columns:
        op.add_column('medical_documents', 
            sa.Column('legal_category', sa.Enum(LegalCategory, name='legalcategory'), nullable=True))
        print("   ✅ legal_category column added")
    else:
        print("   ℹ️ legal_category column already exists, skipping")
    
    # 3️⃣ CREATE SMART_TAGS TABLE (AI-ready) - SAFE
    print("🤖 Creating smart tags table...")
    
    # Check if table already exists
    result = conn.execute(sa.text("SELECT 1 FROM pg_tables WHERE tablename = 'smart_tags'"))
    if not result.fetchone():
        op.create_table('smart_tags',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('document_id', sa.UUID(), nullable=False),
        sa.Column('unified_type', sa.Enum(UnifiedDocumentType, name='unifieddocumenttype'), nullable=False),
        sa.Column('legal_category', sa.Enum(LegalCategory, name='legalcategory'), nullable=False),
        
        # 🤖 AI GENERATED TAGS
        sa.Column('ai_anatomy', sa.JSON(), nullable=True),
        sa.Column('ai_condition', sa.JSON(), nullable=True),
        sa.Column('ai_treatment', sa.JSON(), nullable=True),
        sa.Column('ai_quality', sa.JSON(), nullable=True),
        sa.Column('ai_urgency', sa.JSON(), nullable=True),
        sa.Column('ai_confidence', sa.Numeric(3,2), nullable=True),
        
        # 👤 MANUAL TAGS
        sa.Column('manual_tags', sa.JSON(), nullable=True),
        sa.Column('manual_priority', sa.String(20), nullable=True),
        
        # 📊 SEARCHABLE TAGS
        sa.Column('searchable_tags', sa.JSON(), nullable=True),
        sa.Column('search_vector', postgresql.TSVECTOR(), nullable=True),
        
        # 🚀 AI FEATURES DATA
        sa.Column('voice_tags', sa.JSON(), nullable=True),
        sa.Column('analysis_result', sa.JSON(), nullable=True),
        sa.Column('aesthetic_data', sa.JSON(), nullable=True),
        sa.Column('prosthetic_data', sa.JSON(), nullable=True),
        
        # AUDIT FIELDS
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('created_by', sa.UUID(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['document_id'], ['medical_documents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'])
    )
        print("   ✅ smart_tags table created")
    else:
        print("   ℹ️ smart_tags table already exists, skipping")
    
    # 4️⃣ MIGRATE EXISTING DATA
    print("🔄 Migrating existing document data...")
    
    # Get database connection
    connection = op.get_bind()
    
    # Fetch all existing documents
    result = connection.execute(
        sa.text("SELECT id, document_type, access_level FROM medical_documents")
    )
    
    # Update each document with unified types
    for row in result:
        document_id = row[0]
        legacy_type = row[1]
        access_level = row[2]
        
        # Map to unified type
        unified_type = LEGACY_TO_UNIFIED_MAPPING.get(legacy_type, 'document_general')
        
        # Determine legal category from access_level
        if access_level == 'medical':
            legal_category = 'medical'
        elif legacy_type in ['insurance_document', 'invoice']:
            legal_category = 'billing'
        elif legacy_type in ['consent_form', 'referral_letter']:
            legal_category = 'legal'
        else:
            legal_category = 'administrative'
        
        # Update document with new types
        connection.execute(
            sa.text("""
                UPDATE medical_documents 
                SET unified_type = :unified_type, legal_category = :legal_category 
                WHERE id = :document_id
            """),
            {
                'unified_type': unified_type,
                'legal_category': legal_category,
                'document_id': document_id
            }
        )
        
        # Create basic smart tag entry
        connection.execute(
            sa.text("""
                INSERT INTO smart_tags 
                (id, document_id, unified_type, legal_category, searchable_tags, created_at, created_by)
                VALUES 
                (gen_random_uuid(), :document_id, :unified_type, :legal_category, '[]', NOW(), 
                 (SELECT id FROM users WHERE role = 'admin' LIMIT 1))
            """),
            {
                'document_id': document_id,
                'unified_type': unified_type,
                'legal_category': legal_category
            }
        )
    
    # 5️⃣ MAKE NEW COLUMNS NOT NULL (after data migration)
    print("🔒 Enforcing NOT NULL constraints...")
    
    op.alter_column('medical_documents', 'unified_type', nullable=False)
    op.alter_column('medical_documents', 'legal_category', nullable=False)
    
    # 6️⃣ CREATE INDEXES FOR PERFORMANCE
    print("⚡ Creating performance indexes...")
    
    op.create_index('idx_medical_documents_unified_type', 'medical_documents', ['unified_type'])
    op.create_index('idx_medical_documents_legal_category', 'medical_documents', ['legal_category'])
    op.create_index('idx_smart_tags_document_id', 'smart_tags', ['document_id'])
    op.create_index('idx_smart_tags_unified_type', 'smart_tags', ['unified_type'])
    op.create_index('idx_smart_tags_legal_category', 'smart_tags', ['legal_category'])
    
    # Create full-text search index
    op.create_index('idx_smart_tags_search_vector', 'smart_tags', ['search_vector'], 
                   postgresql_using='gin')
    
    # 7️⃣ CREATE TRIGGERS FOR SEARCH VECTOR UPDATE
    print("🔍 Creating search triggers...")
    
    connection.execute(sa.text("""
        CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
        BEGIN
            NEW.search_vector := to_tsvector('spanish', 
                COALESCE(array_to_string(NEW.searchable_tags, ' '), '') || ' ' ||
                COALESCE(array_to_string(NEW.ai_anatomy, ' '), '') || ' ' ||
                COALESCE(array_to_string(NEW.ai_condition, ' '), '') || ' ' ||
                COALESCE(array_to_string(NEW.ai_treatment, ' '), '') || ' ' ||
                COALESCE(array_to_string(NEW.manual_tags, ' '), '')
            );
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """))
    
    connection.execute(sa.text("""
        CREATE TRIGGER trigger_update_search_vector
        BEFORE INSERT OR UPDATE ON smart_tags
        FOR EACH ROW EXECUTE FUNCTION update_search_vector();
    """))
    
    print("✅ Unified document types migration completed successfully!")

def downgrade():
    """Rollback unified document types migration"""
    
    print("⚠️ Rolling back unified document types migration...")
    
    # Drop triggers
    op.execute(sa.text("DROP TRIGGER IF EXISTS trigger_update_search_vector ON smart_tags"))
    op.execute(sa.text("DROP FUNCTION IF EXISTS update_search_vector()"))
    
    # Drop indexes
    op.drop_index('idx_smart_tags_search_vector', 'smart_tags')
    op.drop_index('idx_smart_tags_legal_category', 'smart_tags')
    op.drop_index('idx_smart_tags_unified_type', 'smart_tags')
    op.drop_index('idx_smart_tags_document_id', 'smart_tags')
    op.drop_index('idx_medical_documents_legal_category', 'medical_documents')
    op.drop_index('idx_medical_documents_unified_type', 'medical_documents')
    
    # Drop tables
    op.drop_table('smart_tags')
    
    # Drop columns
    op.drop_column('medical_documents', 'legal_category')
    op.drop_column('medical_documents', 'unified_type')
    
    # Drop enums
    op.execute(sa.text("DROP TYPE IF EXISTS legalcategory"))
    op.execute(sa.text("DROP TYPE IF EXISTS unifieddocumenttype"))
    
    print("✅ Rollback completed!")
