-- 🔥 FIX NOTIFICATIONS SCHEMA - Add missing columns to match Selene code

-- ========================================
-- 1. Add missing columns to notifications table
-- ========================================

-- Add 'channel' column (what communication channel: email, sms, push, in_app)
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS channel VARCHAR(50) NOT NULL DEFAULT 'in_app'
CHECK (channel IN ('email', 'sms', 'push', 'in_app'));

-- Add 'sent_at' column (when notification was sent)
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows to have sent_at = created_at
UPDATE notifications SET sent_at = created_at WHERE sent_at IS NULL;

COMMENT ON COLUMN notifications.channel IS 'Communication channel: email, sms, push, in_app';
COMMENT ON COLUMN notifications.sent_at IS 'Timestamp when notification was sent';


-- ========================================
-- 2. Add missing columns to notification_preferences table
-- ========================================

-- Remove old columns that don't match Selene code
ALTER TABLE notification_preferences
DROP COLUMN IF EXISTS appointment_notifications,
DROP COLUMN IF EXISTS payment_notifications,
DROP COLUMN IF EXISTS document_notifications,
DROP COLUMN IF EXISTS system_notifications,
DROP COLUMN IF EXISTS reminder_notifications,
DROP COLUMN IF EXISTS in_app_enabled,
DROP COLUMN IF EXISTS quiet_hours_enabled,
DROP COLUMN IF EXISTS quiet_hours_start,
DROP COLUMN IF EXISTS quiet_hours_end,
DROP COLUMN IF EXISTS digest_mode,
DROP COLUMN IF EXISTS digest_frequency;

-- Add columns that Selene code expects
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS appointment_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS billing_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS treatment_updates BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT false;

-- Add created_at if missing (needed for upsert query in Selene)
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add UNIQUE constraint on patient_id (needed for upsert ON CONFLICT)
ALTER TABLE notification_preferences
DROP CONSTRAINT IF EXISTS notification_preferences_patient_id_unique;

ALTER TABLE notification_preferences
ADD CONSTRAINT notification_preferences_patient_id_unique UNIQUE (patient_id);

COMMENT ON COLUMN notification_preferences.appointment_reminders IS 'Enable appointment reminders';
COMMENT ON COLUMN notification_preferences.billing_alerts IS 'Enable billing/payment alerts';
COMMENT ON COLUMN notification_preferences.treatment_updates IS 'Enable treatment plan updates';
COMMENT ON COLUMN notification_preferences.marketing_emails IS 'Enable marketing communications';


-- ========================================
-- 3. Update existing sample notifications
-- ========================================

-- Set channel for existing notifications (default to 'in_app')
UPDATE notifications SET channel = 'in_app' WHERE channel IS NULL;

-- Set sent_at for existing notifications
UPDATE notifications SET sent_at = created_at WHERE sent_at IS NULL;


-- ========================================
-- 4. Update existing preferences
-- ========================================

-- Set default values for new columns in existing preference rows
UPDATE notification_preferences
SET
  appointment_reminders = COALESCE(appointment_reminders, true),
  billing_alerts = COALESCE(billing_alerts, true),
  treatment_updates = COALESCE(treatment_updates, true),
  marketing_emails = COALESCE(marketing_emails, false),
  created_at = COALESCE(created_at, CURRENT_TIMESTAMP)
WHERE appointment_reminders IS NULL
   OR billing_alerts IS NULL
   OR treatment_updates IS NULL
   OR marketing_emails IS NULL
   OR created_at IS NULL;


-- ========================================
-- 5. Verification queries (commented out)
-- ========================================

-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'notifications'
-- ORDER BY ordinal_position;

-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'notification_preferences'
-- ORDER BY ordinal_position;

-- SELECT * FROM notifications LIMIT 5;
-- SELECT * FROM notification_preferences LIMIT 5;

COMMIT;
