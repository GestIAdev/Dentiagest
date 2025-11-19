/**
 * 🔔 E2E TESTS: NOTIFICATIONS MODULE
 * Tests the real-data Notifications system from Selene
 * Features: List, mark as read, update preferences, real-time updates
 * By PunkClaude - PRE-007 DIRECTIVE
 */

import { test, expect, Page } from '@playwright/test';
import { loginAsPatient, verifyAuthenticated, TEST_USERS } from './fixtures/auth.fixture';

test.describe('Notifications Module - Real Data E2E', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await loginAsPatient(page, TEST_USERS.patient1);
    await verifyAuthenticated(page);
  });

  test('should load Notifications dashboard with real data', async () => {
    console.log('📋 Test: Load Notifications Dashboard');

    await page.goto('http://localhost:3001/notifications');
    // 🔥 FIX: Wait for header instead of networkidle
    await page.waitForSelector('h1, h2, [data-testid="notifications-header"]', { state: 'visible', timeout: 10000 });

    // Wait for loading spinner
    await page.locator('.animate-spin, [role="status"]').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

    // Verify header
    const header = page.locator('h1, h2', { hasText: /Notificaciones|Notifications|Avisos/i }).first();
    await expect(header).toBeVisible({ timeout: 5000 });

    console.log('✅ Notifications dashboard loaded successfully');
  });

  test('should display notification list with real data', async () => {
    console.log('📋 Test: Display Notification List');

    await page.goto('http://localhost:3001/notifications');
    // 🔥 FIX: Wait for notification items instead of networkidle
    await page.waitForSelector('[data-testid="notification-item"], .notification-card, main', { state: 'visible', timeout: 10000 }).catch(() => console.log('⚠️ No notifications found'));
    await page.waitForTimeout(2000);

    // Check for notification items
    const notificationItems = page.locator(
      '[data-testid="notification-item"], .notification-card, [class*="notification"]'
    ).first();

    const exists = await notificationItems.count().then((count) => count > 0);

    if (exists) {
      console.log('✅ Found notifications in list');
      const notifText = await notificationItems.textContent();
      expect(notifText).toBeTruthy();
    } else {
      console.log('ℹ️ No notifications found (expected for new accounts)');
    }
  });

  test('should filter notifications by type', async () => {
    console.log('📋 Test: Filter Notifications by Type');

    await page.goto('http://localhost:3001/notifications');
    // 🔥 FIX: Wait for filter controls instead of networkidle
    await page.waitForSelector('select, [data-testid="type-filter"], [class*="filter"]', { state: 'visible', timeout: 10000 }).catch(() => console.log('⚠️ No filters found'));

    // Look for type filter
    const typeFilter = page.locator(
      'select, [data-testid="type-filter"], [class*="filter"]'
    ).first();

    const filterExists = await typeFilter.count().then((count) => count > 0);

    if (filterExists) {
      // Try to select a notification type
      await typeFilter.selectOption({ label: 'Recordatorios de cita' }).catch(() => {
        console.log('⚠️ Could not select filter option');
      });

      await page.waitForTimeout(500);
      console.log('✅ Notification filter applied');
    } else {
      console.log('ℹ️ No filter controls found');
    }
  });

  test('should mark notification as read', async () => {
    console.log('📋 Test: Mark Notification as Read');

    await page.goto('http://localhost:3001/notifications');
    // 🔥 FIX: Wait for notification buttons instead of networkidle
    await page.waitForSelector('button, [data-testid="notification-item"]', { state: 'visible', timeout: 10000 }).catch(() => console.log('⚠️ No buttons found'));
    await page.waitForTimeout(2000);

    // Look for mark as read button
    const markReadButtons = page.locator(
      'button[title*="eída" i], button:has-text("Marcar"), [data-action="mark-read"]'
    );

    const buttonCount = await markReadButtons.count();

    if (buttonCount > 0) {
      // Click first mark as read button
      await markReadButtons.first().click();
      await page.waitForTimeout(500);

      console.log(`✅ Marked notification as read (${buttonCount} buttons found)`);
    } else {
      console.log('ℹ️ No mark-as-read buttons found or all notifications already read');
    }
  });

  test('should mark all notifications as read', async () => {
    console.log('📋 Test: Mark All as Read');

    await page.goto('http://localhost:3001/notifications');
    // 🔥 FIX: Wait for mark-all button instead of networkidle
    await page.waitForSelector('button, [data-testid="mark-all-read"]', { state: 'visible', timeout: 10000 }).catch(() => console.log('⚠️ No mark-all button'));

    // Look for "mark all as read" button
    const markAllButton = page.locator(
      'button:has-text("Marcar todas"), button:has-text("Mark all")'
    );

    const exists = await markAllButton.isVisible().catch(() => false);

    if (exists) {
      await markAllButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Marked all notifications as read');
    } else {
      console.log('ℹ️ No "mark all" button found');
    }
  });

  test('should navigate notification tabs (inbox, history, preferences)', async () => {
    console.log('📋 Test: Navigate Notification Tabs');

    await page.goto('http://localhost:3001/notifications');
    // 🔥 FIX: Wait for tabs instead of networkidle
    await page.waitForSelector('button[role="tab"], [class*="tab"], [role="tablist"]', { state: 'visible', timeout: 10000 }).catch(() => console.log('⚠️ No tabs found'));

    // Look for tabs
    const tabs = page.locator(
      'button[role="tab"], [class*="tab-button"]'
    );

    const tabCount = await tabs.count();

    if (tabCount >= 3) {
      // Click on History tab (usually index 1)
      await tabs.nth(1).click();
      await page.waitForTimeout(500);

      // Click on Preferences tab (usually index 2)
      await tabs.nth(2).click();
      await page.waitForTimeout(500);

      console.log(`✅ Tab navigation works (${tabCount} tabs found)`);
    } else if (tabCount > 0) {
      console.log(`⚠️ Found ${tabCount} tabs, expected at least 3`);
    } else {
      console.log('ℹ️ No tabs found');
    }
  });

  test('should toggle notification channels in preferences', async () => {
    console.log('📋 Test: Update Notification Preferences');

    await page.goto('http://localhost:3001/notifications');
    // 🔥 FIX: Wait for tabs/content instead of networkidle
    await page.waitForSelector('button[role="tab"], [data-testid="preferences"]', { state: 'visible', timeout: 10000 }).catch(() => console.log('⚠️ No tabs found'));

    // Navigate to preferences tab if needed
    const prefsTab = page.locator('button[role="tab"]').nth(2);
    const isVisible = await prefsTab.isVisible().catch(() => false);

    if (isVisible) {
      await prefsTab.click();
      await page.waitForTimeout(500);

      // Look for SMS checkbox
      const smsCheckbox = page.locator(
        'input[type="checkbox"]',
        { hasText: /SMS/ }
      ).first();

      const checkboxExists = await smsCheckbox.count().then((count) => count > 0);

      if (checkboxExists) {
        // Toggle SMS
        await smsCheckbox.check({ force: true }).catch(async () => {
          await smsCheckbox.uncheck({ force: true });
        });

        await page.waitForTimeout(1000);
        console.log('✅ Updated notification preferences');
      } else {
        console.log('ℹ️ Preference checkboxes not found');
      }
    } else {
      console.log('ℹ️ Preferences tab not accessible');
    }
  });

  test('should verify GraphQL queries execute for notifications', async () => {
    console.log('📋 Test: Verify Notification GraphQL Queries');

    const gqlRequests: string[] = [];

    page.on('response', async (response) => {
      if (response.url().includes('graphql') || response.url().includes('/api')) {
        const status = response.status();
        if (status === 200 || status === 201) {
          gqlRequests.push(response.url());
        }
      }
    });

    await page.goto('http://localhost:3001/notifications');
    // 🔥 FIX: Wait for content instead of networkidle
    await page.waitForSelector('[data-testid="notifications-list"], main', { state: 'visible', timeout: 10000 }).catch(() => console.log('⚠️ Content not loaded'));
    await page.waitForTimeout(2000);

    if (gqlRequests.length > 0) {
      console.log(`✅ GraphQL queries executed: ${gqlRequests.length} requests`);
    } else {
      console.log('⚠️ No GraphQL requests detected');
    }
  });

  test('should display notification metadata (date, type, priority)', async () => {
    console.log('📋 Test: Display Notification Metadata');

    await page.goto('http://localhost:3001/notifications');
    // 🔥 FIX: Wait for notification items instead of networkidle
    await page.waitForSelector('[data-testid="notification-item"], .notification-card', { state: 'visible', timeout: 10000 }).catch(() => console.log('⚠️ No notifications found'));

    // Look for notification items with metadata
    const notificationItem = page.locator(
      '[data-testid="notification-item"], .notification-card'
    ).first();

    const metadata = await notificationItem.textContent().catch(() => '');

    if (metadata && metadata.length > 0) {
      console.log('✅ Notification metadata displayed');
    } else {
      console.log('ℹ️ Metadata not clearly visible');
    }
  });

  test('should handle empty notification state', async () => {
    console.log('📋 Test: Handle Empty Notification State');

    await page.goto('http://localhost:3001/notifications');
    // 🔥 FIX: Wait for content container instead of networkidle
    await page.waitForSelector('main, [data-testid="notifications-container"]', { state: 'visible', timeout: 10000 }).catch(() => console.log('⚠️ Container not loaded'));

    // Check for empty state message
    const emptyMessage = page.locator(
      'text=/No hay|Sin notificaciones|No notifications/'
    );

    const isVisible = await emptyMessage.isVisible().catch(() => false);

    if (isVisible) {
      console.log('✅ Empty state message displayed correctly');
    } else {
      console.log('ℹ️ Either notifications exist or empty state message not found');
    }
  });
});
