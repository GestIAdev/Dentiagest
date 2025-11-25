/**
 * 🎭 PLAYWRIGHT CONFIGURATION - E2E AUTOMATION
 * PRE-007 DIRECTIVE - Patient Portal End-to-End Testing
 * Targets: Appointments, Documents, Notifications modules
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2, // 🎸 PUNK MODE: 2 workers for balance (stability + speed)
  outputDir: 'test-results/artifacts',
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // 🎸 FIREFOX DISABLED: Browser-specific race conditions detected
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],
  // ⚡ GOLDEN THREAD MODE: Servers managed externally (Selene:8005 + VitalPass:3001)
  // webServer: {
  //   command: 'npm run start --workspace=patient-portal',
  //   url: 'http://localhost:3001',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
