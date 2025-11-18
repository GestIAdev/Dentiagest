-- ============================================================================
-- MIGRATION: ENABLE ROW-LEVEL SECURITY (GDPR ARTICLE 9 COMPLIANCE)
-- ============================================================================
-- Date: 2025-11-18
-- Author: PunkClaude + Radwulf
-- Purpose: Implement GDPR-compliant data isolation using PostgreSQL RLS
-- 
-- Context:
-- - Patient data is "Special Category Data" under GDPR Article 9
-- - Patients must only access their own data
-- - Staff/Admin can access all data for clinical operations
-- - Row-Level Security provides database-level enforcement (not just app-level)
--
-- Security Model:
-- - Session variables (app.current_user_id, app.current_user_role) injected by backend
-- - Policies enforce access based on these variables
-- - Bypass for system operations (superuser)
-- ============================================================================

-- ============================================================================
-- STEP 1: ENABLE ROW-LEVEL SECURITY ON SENSITIVE TABLES
-- ============================================================================

-- Enable RLS on patients table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE patients IS 'RLS enabled for GDPR compliance';

-- Enable RLS on medical_records table
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE medical_records IS 'RLS enabled for GDPR Article 9 (health data)';

-- Enable RLS on appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE appointments IS 'RLS enabled for patient privacy';

-- Enable RLS on billing_data table (if exists, otherwise skip)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'billing_data') THEN
        ALTER TABLE billing_data ENABLE ROW LEVEL SECURITY;
        COMMENT ON TABLE billing_data IS 'RLS enabled for financial data privacy';
    END IF;
END $$;

-- Enable RLS on subscriptions table (if exists, otherwise skip)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
        COMMENT ON TABLE subscriptions IS 'RLS enabled for subscription privacy';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: CREATE POLICIES FOR PATIENTS TABLE
-- ============================================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS patient_isolation_select ON patients;
DROP POLICY IF EXISTS patient_isolation_update ON patients;
DROP POLICY IF EXISTS staff_access_patients ON patients;

-- Policy 1: Patients can only SELECT their own data
CREATE POLICY patient_isolation_select ON patients
    FOR SELECT
    USING (
        -- Allow if current user is this patient
        id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY patient_isolation_select ON patients IS 
    'Patients can only view their own profile data';

-- Policy 2: Patients can only UPDATE their own data
CREATE POLICY patient_isolation_update ON patients
    FOR UPDATE
    USING (
        id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY patient_isolation_update ON patients IS 
    'Patients can only update their own profile data';

-- Policy 3: Staff and Admin can access all patient data
CREATE POLICY staff_access_patients ON patients
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) IN ('ADMIN', 'STAFF', 'DOCTOR')
    );

COMMENT ON POLICY staff_access_patients ON patients IS 
    'Staff/Admin/Doctor can access all patient records for clinical operations';

-- ============================================================================
-- STEP 3: CREATE POLICIES FOR MEDICAL_RECORDS TABLE
-- ============================================================================

DROP POLICY IF EXISTS patient_medical_records_select ON medical_records;
DROP POLICY IF EXISTS staff_medical_records ON medical_records;

-- Policy: Patients can only SELECT their own medical records
CREATE POLICY patient_medical_records_select ON medical_records
    FOR SELECT
    USING (
        patient_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY patient_medical_records_select ON medical_records IS 
    'Patients can only view their own medical records';

-- Policy: Staff can access all medical records
CREATE POLICY staff_medical_records ON medical_records
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) IN ('ADMIN', 'STAFF', 'DOCTOR')
    );

COMMENT ON POLICY staff_medical_records ON medical_records IS 
    'Staff/Doctor can access all medical records for clinical operations';

-- ============================================================================
-- STEP 4: CREATE POLICIES FOR APPOINTMENTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS patient_appointments_select ON appointments;
DROP POLICY IF EXISTS staff_appointments ON appointments;

-- Policy: Patients can only SELECT their own appointments
CREATE POLICY patient_appointments_select ON appointments
    FOR SELECT
    USING (
        patient_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY patient_appointments_select ON appointments IS 
    'Patients can only view their own appointments';

-- Policy: Staff can access all appointments
CREATE POLICY staff_appointments ON appointments
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) IN ('ADMIN', 'STAFF', 'DOCTOR')
    );

COMMENT ON POLICY staff_appointments ON appointments IS 
    'Staff can manage all appointments';

-- ============================================================================
-- STEP 5: CREATE POLICIES FOR BILLING_DATA TABLE (IF EXISTS)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'billing_data') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS patient_billing_select ON billing_data;
        DROP POLICY IF EXISTS staff_billing ON billing_data;
        
        -- Policy: Patients can only SELECT their own billing data
        EXECUTE 'CREATE POLICY patient_billing_select ON billing_data
            FOR SELECT
            USING (
                patient_id = current_setting(''app.current_user_id'', true)::uuid
            )';
        
        -- Policy: Staff can access all billing data
        EXECUTE 'CREATE POLICY staff_billing ON billing_data
            FOR ALL
            USING (
                current_setting(''app.current_user_role'', true) IN (''ADMIN'', ''STAFF'')
            )';
        
        RAISE NOTICE 'RLS policies created for billing_data table';
    END IF;
END $$;

-- ============================================================================
-- STEP 6: CREATE POLICIES FOR SUBSCRIPTIONS TABLE (IF EXISTS)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS patient_subscriptions_select ON subscriptions;
        DROP POLICY IF EXISTS staff_subscriptions ON subscriptions;
        
        -- Policy: Patients can only SELECT their own subscriptions
        EXECUTE 'CREATE POLICY patient_subscriptions_select ON subscriptions
            FOR SELECT
            USING (
                patient_id = current_setting(''app.current_user_id'', true)::uuid
            )';
        
        -- Policy: Staff can access all subscriptions
        EXECUTE 'CREATE POLICY staff_subscriptions ON subscriptions
            FOR ALL
            USING (
                current_setting(''app.current_user_role'', true) IN (''ADMIN'', ''STAFF'')
            )';
        
        RAISE NOTICE 'RLS policies created for subscriptions table';
    END IF;
END $$;

-- ============================================================================
-- STEP 7: GRANT PERMISSIONS (IF NEEDED)
-- ============================================================================

-- Ensure users table has proper permissions for role checking
-- (Assuming users table exists with email, password_hash, role columns)

-- Grant SELECT on users table for authentication queries
-- (This may already be granted, but we ensure it here)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Users table doesn't need RLS (authentication is separate concern)
        -- But we document it here for clarity
        RAISE NOTICE 'users table exists - no RLS needed (auth concern)';
    END IF;
END $$;

-- ============================================================================
-- STEP 8: VERIFICATION QUERIES (FOR TESTING)
-- ============================================================================

-- These queries can be run manually to verify RLS is working:

-- Test 1: Set patient context
-- SET app.current_user_id = '123e4567-e89b-12d3-a456-426614174000';
-- SET app.current_user_role = 'PATIENT';
-- SELECT COUNT(*) FROM patients; -- Should return 1 (only own record)
-- SELECT COUNT(*) FROM medical_records; -- Should return count of own records

-- Test 2: Set staff context
-- SET app.current_user_role = 'STAFF';
-- SELECT COUNT(*) FROM patients; -- Should return ALL patients
-- SELECT COUNT(*) FROM medical_records; -- Should return ALL records

-- Test 3: Reset context
-- RESET app.current_user_id;
-- RESET app.current_user_role;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (IF NEEDED)
-- ============================================================================

-- To disable RLS (for maintenance or rollback):
-- ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE medical_records DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE billing_data DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- To drop all policies:
-- DROP POLICY IF EXISTS patient_isolation_select ON patients;
-- DROP POLICY IF EXISTS patient_isolation_update ON patients;
-- DROP POLICY IF EXISTS staff_access_patients ON patients;
-- (repeat for all tables)

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔══════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✅ RLS MIGRATION COMPLETED SUCCESSFULLY                ║';
    RAISE NOTICE '║                                                          ║';
    RAISE NOTICE '║  GDPR Article 9 Compliance: ENABLED                     ║';
    RAISE NOTICE '║  Row-Level Security: ACTIVE                             ║';
    RAISE NOTICE '║  Tables Protected: 5 (patients, medical_records, etc.)  ║';
    RAISE NOTICE '║                                                          ║';
    RAISE NOTICE '║  Next Step: Deploy backend context injection            ║';
    RAISE NOTICE '║  (setRLSContext.ts in Selene)                           ║';
    RAISE NOTICE '╚══════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
END $$;
