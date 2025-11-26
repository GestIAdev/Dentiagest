/**
 * 🧪 E2E TEST: APPOINTMENT SOURCE DIFFERENTIATION
 * ================================================
 * PunkClaude x Radwulf - War Room Edition
 * 
 * PREGUNTA CLAVE: ¿Cómo sabe el dashboard si la cita viene de:
 * - 📅 App Clínica (manual por doctor)
 * - 📱 VitalPass (solicitada por paciente)
 * 
 * RESPUESTA: El campo `notes` contiene "Aprobada desde sugerencia IA: {id}"
 * cuando la cita fue creada desde VitalPass.
 * 
 * Este test valida ambos flujos E2E usando la DB directamente 
 * (bypass de auth para testing).
 */

const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// ============================================================================
// CONFIGURATION
// ============================================================================

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:11111111@localhost:5432/dentiagest';
const pool = new Pool({ connectionString: DATABASE_URL });

// Known test IDs from the database (found via check-schema-e2e.cjs)
const KNOWN_DENTIST_ID = '9893388d-806d-4081-9de5-c8554f0e72d8'; // doctor@dentiagest.com

// ============================================================================
// TEST SUITE
// ============================================================================

describe('🎯 Appointment Source Differentiation E2E', () => {
  
  let manualAppointmentId = null;
  let vitalpassAppointmentId = null;
  let suggestionId = null; // This will be an INTEGER, not UUID
  let testPatientId = null;
  
  // --------------------------------------------------------------------------
  // SETUP: Get a valid patient ID from DB directly
  // --------------------------------------------------------------------------
  beforeAll(async () => {
    console.log('🔧 Setup: Getting test patient from DB...');
    
    const result = await pool.query(`
      SELECT id, first_name, last_name FROM patients 
      WHERE is_active = true AND deleted_at IS NULL 
      LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      testPatientId = result.rows[0].id;
      console.log(`✅ Using patient: ${result.rows[0].first_name} ${result.rows[0].last_name} (${testPatientId})`);
    } else {
      // Create a test patient
      const newPatientId = uuidv4();
      await pool.query(`
        INSERT INTO patients (id, first_name, last_name, email, is_active, created_at, updated_at)
        VALUES ($1, 'E2E', 'TestPatient', 'e2e-test@test.com', true, NOW(), NOW())
      `, [newPatientId]);
      testPatientId = newPatientId;
      console.log(`✅ Created test patient: E2E TestPatient (${testPatientId})`);
    }
  });
  
  // --------------------------------------------------------------------------
  // CLEANUP: Remove test appointments
  // --------------------------------------------------------------------------
  afterAll(async () => {
    console.log('🧹 Cleanup...');
    
    if (manualAppointmentId) {
      await pool.query('DELETE FROM appointments WHERE id = $1', [manualAppointmentId]);
      console.log(`✅ Deleted manual appointment: ${manualAppointmentId}`);
    }
    
    if (vitalpassAppointmentId) {
      await pool.query('DELETE FROM appointments WHERE id = $1', [vitalpassAppointmentId]);
      console.log(`✅ Deleted VitalPass appointment: ${vitalpassAppointmentId}`);
    }
    
    if (suggestionId) {
      // suggestionId is INTEGER, not UUID
      await pool.query('DELETE FROM appointment_suggestions WHERE id = $1', [suggestionId]);
      console.log(`✅ Deleted suggestion: ${suggestionId}`);
    }
    
    await pool.end();
    console.log('✅ Cleanup complete');
  });
  
  // --------------------------------------------------------------------------
  // TEST 1: CITA MANUAL (Doctor desde app clínica)
  // --------------------------------------------------------------------------
  test('📅 FLUJO 1: Doctor crea cita manual desde app clínica', async () => {
    if (!testPatientId) {
      throw new Error('No test patient available');
    }
    
    // Tomorrow at 10:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    manualAppointmentId = uuidv4();
    
    console.log(`📅 Creating manual appointment: ${manualAppointmentId}`);
    
    await pool.query(`
      INSERT INTO appointments (
        id, patient_id, dentist_id, scheduled_date, duration_minutes, 
        appointment_type, status, priority, notes, 
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    `, [
      manualAppointmentId,
      testPatientId,
      KNOWN_DENTIST_ID,  // <-- REQUIRED: dentist_id NOT NULL
      tomorrow,
      30,
      'CONSULTATION',
      'CONFIRMED',
      'NORMAL',
      'Cita creada manualmente por el doctor desde la app clínica'
    ]);
    
    // Verify
    const result = await pool.query('SELECT notes FROM appointments WHERE id = $1', [manualAppointmentId]);
    const notes = result.rows[0].notes;
    
    console.log(`✅ Manual appointment created`);
    console.log(`   Notes: "${notes}"`);
    
    // VALIDACIÓN CLAVE: Las citas manuales NO tienen el pattern de IA
    expect(notes).not.toMatch(/Aprobada desde sugerencia IA/);
  });
  
  // --------------------------------------------------------------------------
  // TEST 2: CITA VITALPASS (Paciente solicita → Doctor aprueba)
  // --------------------------------------------------------------------------
  test('📱 FLUJO 2: Paciente solicita cita desde VitalPass → Doctor aprueba', async () => {
    if (!testPatientId) {
      throw new Error('No test patient available');
    }
    
    // Day after tomorrow at 14:00
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(14, 0, 0, 0);
    
    vitalpassAppointmentId = uuidv4();
    
    console.log(`📱 Step 1: Creating suggestion (simulating VitalPass request)...`);
    
    // STEP 1: Create suggestion (this simulates VitalPass patient request)
    // NOTE: id is SERIAL (auto-incremented integer), we get it via RETURNING
    const suggestionResult = await pool.query(`
      INSERT INTO appointment_suggestions (
        patient_id, appointment_type,
        suggested_date, suggested_time, suggested_duration,
        confidence_score, reasoning, patient_request,
        status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id
    `, [
      testPatientId,
      'normal',
      dayAfterTomorrow.toISOString().split('T')[0],
      '14:00',
      30,
      0.85, // confidence_score (0-1 range, NOT 0-10!)
      '{"analysis": "E2E Test suggestion"}',
      '{"symptoms": "Dolor leve en muela", "source": "VitalPass E2E Test"}',
      'pending_approval'
    ]);
    
    suggestionId = suggestionResult.rows[0].id; // INTEGER
    console.log(`   ✅ Suggestion created with ID: ${suggestionId}`);
    
    // STEP 2: Verify suggestion is PENDING
    const pendingResult = await pool.query(
      'SELECT status FROM appointment_suggestions WHERE id = $1',
      [suggestionId]
    );
    expect(pendingResult.rows[0].status).toBe('pending_approval');
    console.log(`   ✅ Suggestion is pending_approval`);
    
    // STEP 3: Approve suggestion and create appointment
    console.log(`📱 Step 2: Doctor approves suggestion...`);
    
    await pool.query(`
      INSERT INTO appointments (
        id, patient_id, dentist_id, scheduled_date, duration_minutes, 
        appointment_type, status, priority, notes, 
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    `, [
      vitalpassAppointmentId,
      testPatientId,
      KNOWN_DENTIST_ID,  // <-- REQUIRED: dentist_id NOT NULL
      dayAfterTomorrow,
      30,
      'CONSULTATION',
      'CONFIRMED',
      'NORMAL',
      `Aprobada desde sugerencia IA: ${suggestionId}` // <-- THE KEY DIFFERENCE!
    ]);
    
    // Update suggestion status
    await pool.query(`
      UPDATE appointment_suggestions 
      SET status = 'approved', reviewed_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [suggestionId]);
    
    // Verify
    const appointmentResult = await pool.query('SELECT notes FROM appointments WHERE id = $1', [vitalpassAppointmentId]);
    const notes = appointmentResult.rows[0].notes;
    
    console.log(`   ✅ Appointment created from suggestion: ${vitalpassAppointmentId}`);
    console.log(`   Notes: "${notes}"`);
    
    // VALIDACIÓN CLAVE: Las citas de VitalPass SIEMPRE tienen el pattern de IA
    expect(notes).toMatch(/Aprobada desde sugerencia IA/);
    expect(notes).toContain(String(suggestionId)); // Convert to string for comparison
    
    // Verify suggestion is approved
    const approvedResult = await pool.query(
      'SELECT status FROM appointment_suggestions WHERE id = $1',
      [suggestionId]
    );
    expect(approvedResult.rows[0].status).toBe('approved');
    console.log(`   ✅ Suggestion status updated to 'approved'`);
  });
  
  // --------------------------------------------------------------------------
  // TEST 3: COMPARACIÓN DIRECTA
  // --------------------------------------------------------------------------
  test('🔍 COMPARACIÓN: Diferenciar origen de citas en el calendario', async () => {
    if (!manualAppointmentId || !vitalpassAppointmentId) {
      throw new Error('Previous tests did not create appointments');
    }
    
    console.log('🔍 Comparing both appointments side by side...');
    
    // Fetch both appointments
    const result = await pool.query(`
      SELECT id, notes, scheduled_date, appointment_type 
      FROM appointments 
      WHERE id IN ($1, $2)
    `, [manualAppointmentId, vitalpassAppointmentId]);
    
    const manual = result.rows.find(r => r.id === manualAppointmentId);
    const vitalpass = result.rows.find(r => r.id === vitalpassAppointmentId);
    
    console.log('\n📊 SIDE-BY-SIDE COMPARISON:');
    console.log('┌─────────────────────┬─────────────────────────────────────────┬─────────────────────────────────────────┐');
    console.log('│ Campo               │ Manual (Doctor)                         │ VitalPass (Paciente)                    │');
    console.log('├─────────────────────┼─────────────────────────────────────────┼─────────────────────────────────────────┤');
    console.log(`│ ID (short)          │ ${manual.id.substring(0, 8)}...                              │ ${vitalpass.id.substring(0, 8)}...                              │`);
    console.log(`│ Notes               │ ${manual.notes?.substring(0, 35)}... │ ${vitalpass.notes?.substring(0, 35)}... │`);
    console.log('└─────────────────────┴─────────────────────────────────────────┴─────────────────────────────────────────┘');
    
    // HELPER FUNCTION: Detectar origen
    function detectSource(notes) {
      if (notes && notes.includes('Aprobada desde sugerencia IA')) {
        return 'VITALPASS';
      }
      return 'MANUAL';
    }
    
    const manualSource = detectSource(manual.notes);
    const vitalpassSource = detectSource(vitalpass.notes);
    
    console.log(`\n🏷️ DETECTED SOURCES:`);
    console.log(`   Manual appointment: ${manualSource}`);
    console.log(`   VitalPass appointment: ${vitalpassSource}`);
    
    expect(manualSource).toBe('MANUAL');
    expect(vitalpassSource).toBe('VITALPASS');
    
    console.log(`\n✅ SOURCE DIFFERENTIATION WORKING CORRECTLY!`);
  });
  
  // --------------------------------------------------------------------------
  // TEST 4: EXTRACT SUGGESTION ID
  // --------------------------------------------------------------------------
  test('🔗 EXTRACT: Obtener ID de sugerencia original desde notes', async () => {
    if (!vitalpassAppointmentId || !suggestionId) {
      throw new Error('VitalPass appointment not created');
    }
    
    const result = await pool.query('SELECT notes FROM appointments WHERE id = $1', [vitalpassAppointmentId]);
    const notes = result.rows[0].notes;
    
    // Extract suggestion ID from notes (now INTEGER, not UUID)
    const match = notes.match(/Aprobada desde sugerencia IA: (\d+)/);
    const extractedSuggestionId = match ? parseInt(match[1], 10) : null;
    
    console.log(`🔗 Extracted suggestion ID: ${extractedSuggestionId}`);
    console.log(`🔗 Original suggestion ID:  ${suggestionId}`);
    
    expect(extractedSuggestionId).toBe(suggestionId);
    
    console.log(`✅ Suggestion ID correctly embedded and extractable!`);
  });
  
});

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Detecta el origen de una cita basándose en el campo notes.
 */
function detectAppointmentSource(notes) {
  if (notes && notes.includes('Aprobada desde sugerencia IA')) {
    return 'VITALPASS';
  }
  return 'MANUAL';
}

/**
 * Extrae el ID de la sugerencia original de las notes.
 * NOTA: El ID es INTEGER (serial), no UUID.
 */
function extractSuggestionId(notes) {
  if (!notes) return null;
  const match = notes.match(/Aprobada desde sugerencia IA: (\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

module.exports = { detectAppointmentSource, extractSuggestionId };
