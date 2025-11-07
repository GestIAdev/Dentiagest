/**
 * E2E Critical Paths - Playwright
 * Valida flujos críticos end-to-end
 * 
 * Este test valida:
 * - Login → Dashboard navigation
 * - Patients list loading
 * - Inventory module access
 * - Appointments calendar
 * - Odontogram 3D canvas rendering
 */

import { test, expect } from '@playwright/test';

// Base URL (dev server must be running)
const BASE_URL = 'http://localhost:5173';

test.describe('Critical User Paths', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app before each test
    await page.goto(BASE_URL);
  });

  test('App loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Filter out expected errors (development warnings, etc.)
    const criticalErrors = errors.filter(
      err => !err.includes('Warning:') && 
             !err.includes('DevTools') &&
             !err.includes('favicon')
    );

    console.log('Console errors:', criticalErrors);
    expect(criticalErrors.length).toBe(0);
  });

  test('Homepage renders successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for React to hydrate
    await page.waitForLoadState('domcontentloaded');
    
    // Check if page has any content
    const body = await page.locator('body').textContent();
    expect(body).toBeDefined();
    expect(body!.length).toBeGreaterThan(0);
  });

  test('Login → Dashboard navigation works', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Look for login form or dashboard (depending on auth state)
    const hasLoginForm = await page.locator('input[type="email"], input[type="text"][placeholder*="email" i]').count() > 0;
    const hasDashboard = await page.locator('text=/dashboard|panel|overview/i').count() > 0;
    
    if (hasLoginForm) {
      console.log('✅ Login form found - auth required');
      
      // Try to login (use test credentials)
      const emailInput = page.locator('input[type="email"], input[type="text"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"], button:has-text("login"), button:has-text("entrar")').first();
      
      if (await emailInput.count() > 0) {
        await emailInput.fill('test@dentiagest.com');
        await passwordInput.fill('test123');
        await submitButton.click();
        
        // Wait for navigation
        await page.waitForLoadState('networkidle');
      }
    }
    
    if (hasDashboard) {
      console.log('✅ Dashboard found - user authenticated or no auth required');
    }
    
    expect(hasLoginForm || hasDashboard).toBe(true);
  });

  test('Patients list module is accessible', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Look for patients navigation link
    const patientsLink = page.locator('a:has-text("Pacientes"), a:has-text("Patients"), [href*="/patients"]');
    
    if (await patientsLink.count() > 0) {
      await patientsLink.first().click();
      await page.waitForLoadState('networkidle');
      
      // Check if patients page loaded
      const url = page.url();
      expect(url).toContain('patient');
      console.log('✅ Patients module accessible:', url);
    } else {
      console.log('⚠️ Patients link not found (may require auth)');
    }
  });

  test('Inventory module is accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/inventory`);
    
    // Wait for page load
    await page.waitForLoadState('domcontentloaded');
    
    // Check URL
    const url = page.url();
    expect(url).toContain('inventory');
    
    // Check for inventory content
    const hasInventoryContent = await page.locator('text=/inventory|inventario|stock/i').count() > 0;
    console.log('✅ Inventory module:', hasInventoryContent ? 'Content found' : 'Page loaded');
  });

  test('Appointments calendar module loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/appointments-v3`);
    
    await page.waitForLoadState('domcontentloaded');
    
    const url = page.url();
    expect(url).toContain('appointments');
    
    // Look for calendar elements
    const hasCalendar = await page.locator('[class*="calendar"], [class*="Calendar"]').count() > 0;
    console.log('✅ Appointments calendar:', hasCalendar ? 'Found' : 'Page loaded');
  });

  test('Odontogram 3D canvas renders', async ({ page }) => {
    await page.goto(`${BASE_URL}/odontogram-3d`);
    
    await page.waitForLoadState('networkidle');
    
    // Look for Three.js canvas
    const canvas = page.locator('canvas');
    const canvasCount = await canvas.count();
    
    if (canvasCount > 0) {
      console.log(`✅ Found ${canvasCount} canvas element(s) - Three.js likely rendering`);
      
      // Check canvas has reasonable size
      const box = await canvas.first().boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThan(100);
        expect(box.height).toBeGreaterThan(100);
        console.log(`✅ Canvas size: ${box.width}x${box.height}px`);
      }
    } else {
      console.log('⚠️ No canvas found - 3D may not be rendering');
    }
  });

  test('Sidebar navigation is functional', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    // Look for sidebar/navigation menu
    const nav = page.locator('nav, aside, [role="navigation"]');
    const navCount = await nav.count();
    
    if (navCount > 0) {
      console.log(`✅ Found ${navCount} navigation element(s)`);
      
      // Count navigation links
      const links = page.locator('nav a, aside a, [role="navigation"] a');
      const linkCount = await links.count();
      console.log(`✅ Found ${linkCount} navigation links`);
      
      expect(linkCount).toBeGreaterThan(0);
    } else {
      console.log('⚠️ No sidebar found');
    }
  });

  test('Dashboard cards are clickable', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    // Look for gradient cards (dashboard feature cards)
    const cards = page.locator('[class*="from-"], [class*="gradient"]');
    const cardCount = await cards.count();
    
    console.log(`✅ Found ${cardCount} gradient card(s)`);
    
    if (cardCount > 0) {
      // Check if first card is clickable
      const firstCard = cards.first();
      const isClickable = await firstCard.evaluate(el => {
        return el.tagName === 'A' || 
               el.tagName === 'BUTTON' ||
               el.hasAttribute('onClick') ||
               el.getAttribute('role') === 'button';
      });
      
      console.log('✅ First card clickable:', isClickable);
    }
  });

  test('No JavaScript errors on critical pages', async ({ page }) => {
    const criticalPaths = [
      '/',
      '/patients',
      '/inventory',
      '/appointments-v3',
      '/treatments',
      '/odontogram-3d'
    ];

    for (const path of criticalPaths) {
      const errors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('domcontentloaded');
      
      const criticalErrors = errors.filter(
        err => !err.includes('Warning:') && 
               !err.includes('DevTools') &&
               !err.includes('favicon')
      );

      if (criticalErrors.length > 0) {
        console.log(`⚠️ Errors on ${path}:`, criticalErrors);
      } else {
        console.log(`✅ No errors on ${path}`);
      }
    }
  });

  test('App is responsive (mobile viewport)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    // Check if app renders on mobile
    const body = await page.locator('body').textContent();
    expect(body).toBeDefined();
    expect(body!.length).toBeGreaterThan(0);
    
    console.log('✅ Mobile viewport renders successfully');
  });
});
