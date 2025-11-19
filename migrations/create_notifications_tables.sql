-- ============================================================================
-- NOTIFICATIONS MODULE SCHEMA - PRE-007 FINAL
-- ============================================================================
-- Creates tables for notification system used by PatientPortal NotificationManagementV3
-- Fixes: ERROR: no existe la relación «notifications»

-- ============================================================================
-- TABLE: notifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('appointment', 'payment', 'document', 'system', 'reminder')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    read_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    action_url VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Indexes
    CONSTRAINT notifications_patient_id_idx FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_patient_id ON notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- ============================================================================
-- TABLE: notification_preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE UNIQUE,
    
    -- Channel preferences
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    push_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    
    -- Category preferences
    appointment_notifications BOOLEAN DEFAULT true,
    payment_notifications BOOLEAN DEFAULT true,
    document_notifications BOOLEAN DEFAULT true,
    system_notifications BOOLEAN DEFAULT true,
    reminder_notifications BOOLEAN DEFAULT true,
    
    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    
    -- Frequency settings
    digest_mode BOOLEAN DEFAULT false,
    digest_frequency VARCHAR(20) DEFAULT 'daily' CHECK (digest_frequency IN ('realtime', 'hourly', 'daily', 'weekly')),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT notification_preferences_patient_id_unique UNIQUE (patient_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_patient_id ON notification_preferences(patient_id);

-- ============================================================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

CREATE TRIGGER trigger_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- ============================================================================
-- DEFAULT PREFERENCES: Insert default preferences for existing patients
-- ============================================================================
INSERT INTO notification_preferences (patient_id)
SELECT id FROM patients
WHERE id NOT IN (SELECT patient_id FROM notification_preferences)
ON CONFLICT (patient_id) DO NOTHING;

-- ============================================================================
-- SAMPLE DATA: Create test notifications for patient1@dentiagest.test
-- ============================================================================
DO $$
DECLARE
    test_patient_id UUID;
BEGIN
    -- Get patient1 ID
    SELECT id INTO test_patient_id FROM patients WHERE email = 'patient1@dentiagest.test' LIMIT 1;
    
    IF test_patient_id IS NOT NULL THEN
        -- Insert sample notifications
        INSERT INTO notifications (patient_id, title, message, type, priority, status) VALUES
        (test_patient_id, 'Cita confirmada', 'Tu cita del 25 de noviembre a las 10:00 ha sido confirmada', 'appointment', 'normal', 'unread'),
        (test_patient_id, 'Documento disponible', 'Tu radiografía dental está lista para descargar', 'document', 'normal', 'unread'),
        (test_patient_id, 'Recordatorio de pago', 'Tienes un pago pendiente de €50', 'payment', 'high', 'unread'),
        (test_patient_id, 'Actualización del sistema', 'Nueva funcionalidad disponible en el portal', 'system', 'low', 'read')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================================================
-- PUNK COMMENT
-- ============================================================================
COMMENT ON TABLE notifications IS '🔔 Notification system for patient portal - Real-time alerts and messages';
COMMENT ON TABLE notification_preferences IS '⚙️ User preferences for notification channels and categories';
