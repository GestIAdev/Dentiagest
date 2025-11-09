// 🔥 MIGRATED TO V3 - Complete rewrite using GraphQL V3
// Old file used REST API (apolloGraphQL wrapper) - now uses PatientManagementV3

import React from 'react';
import PatientManagementV3 from '../components/Patients/PatientManagementV3';

/**
 * Patients Page - Main entry point for patient management
 * Uses PatientManagementV3 which includes:
 * - Full CRUD with GraphQL V3
 * - Real-time updates via WebSocket subscriptions
 * - Veritas verification
 * - Better UI/UX with tabs
 */
const PatientsPage: React.FC = () => {
  return <PatientManagementV3 />;
};

export default PatientsPage;
