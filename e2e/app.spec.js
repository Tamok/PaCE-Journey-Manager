// e2e/app.spec.js
import { test, expect } from '@playwright/test';

test.describe('PaCE Journey Manager', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('PaCE Goals Manager');
    await expect(page.locator('h1')).toContainText('PaCE Journey Manager');
  });

  test('should show "No goals found" message initially', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=No goals found')).toBeVisible();
  });

  test('should display UCSB logo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('img[alt="UCSB Logo"]')).toBeVisible();
  });

  test('should handle navigation to UCSB website', async ({ page }) => {
    await page.goto('/');
    const ucsb_link = page.locator('a[href="https://www.ucsb.edu"]');
    await expect(ucsb_link).toBeVisible();
    
    // Check that the link has correct attributes
    await expect(ucsb_link).toHaveAttribute('href', 'https://www.ucsb.edu');
  });

  test('should not have any console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out Firebase config warnings which are expected
    const criticalErrors = errors.filter(error => 
      !error.includes('Firebase') && 
      !error.includes('auth') &&
      !error.includes('firestore')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('img[alt="UCSB Logo"]')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('href', 'https://www.ucsb.edu');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for alt text on images
    await expect(page.locator('img[alt="UCSB Logo"]')).toBeVisible();
    
    // Check for proper link attributes
    const ucsbLink = page.locator('a[href="https://www.ucsb.edu"]');
    await expect(ucsbLink).toBeVisible();
  });
});