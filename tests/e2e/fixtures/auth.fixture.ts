/**
 * 🔐 AUTHENTICATION FIXTURE - E2E Tests
 * Provides reusable authentication helper for all test suites
 */

import { Page, expect } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  patientId: string;
  name: string;
}

// Test users (should match database)
export const TEST_USERS = {
  patient1: {
    email: 'patient1@dentiagest.test',
    password: 'Test@12345',
    patientId: 'patient-1',
    name: 'Juan García López',
  },
  patient2: {
    email: 'patient2@dentiagest.test',
    password: 'Test@12345',
    patientId: 'patient-2',
    name: 'María Rodríguez Pérez',
  },
};

/**
 * Login helper - Use in beforeEach or test
 * @param page Playwright page context
 * @param user Test user credentials
 */
export async function loginAsPatient(page: Page, user: TestUser = TEST_USERS.patient1) {
  console.log(`🔐 Logging in as ${user.email}...`);

  // Navigate to login
  await page.goto('http://localhost:3001/login');
  await page.waitForLoadState('networkidle');

  // Fill credentials
  await page.fill('input[type="email"], input[name="email"]', user.email);
  await page.fill('input[type="password"], input[name="password"]', user.password);

  // Submit login form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('http://localhost:3001/', { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  console.log(`✅ Logged in as ${user.email}`);
}

/**
 * Verify user is authenticated (check for navigation menu)
 */
export async function verifyAuthenticated(page: Page) {
  // Check for presence of navigation or authenticated elements
  const navMenu = page.locator('[data-testid="patient-nav"], nav, [role="navigation"]').first();
  await expect(navMenu).toBeVisible({ timeout: 5000 });
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  console.log('🚪 Logging out...');

  // Find and click logout button (adjust selector as needed)
  await page.click('button:has-text("Cerrar sesión"), button:has-text("Logout"), [data-testid="logout-btn"]');

  // Wait for redirect to login
  await page.waitForURL('**/login', { timeout: 10000 });

  console.log('✅ Logged out');
}
