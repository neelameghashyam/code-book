import { test, expect } from '@playwright/test';

test.describe('Service Provider Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the service provider page before each test
    await page.goto('/service-provider');
  });

  test('should load the page successfully', async ({ page }) => {
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Service Provider/);
    
    // Check if the main component is loaded
    await expect(page.locator('app-service-provider')).toBeVisible();
    
    // Check if the component header is present
    await expect(page.locator('h1, .heading')).toContainText(/Service Provider/i);
  });

  test('should be able to interact with form elements', async ({ page }) => {
    // Find and interact with form inputs
    const nameInput = page.locator('#providerName');
    const emailInput = page.locator('#providerEmail');
    
    // Enter test data
    await nameInput.fill('Test Provider');
    await emailInput.fill('test@provider.com');
    
    // Verify the values were applied
    await expect(nameInput).toHaveValue('Test Provider');
    await expect(emailInput).toHaveValue('test@provider.com');
  });

  test('should be able to attempt form submission', async ({ page }) => {
    // Fill out the required form fields
    await page.locator('#providerName').fill('Test Provider');
    await page.locator('#providerEmail').fill('test@provider.com');
    
    // Try to select a service type if dropdown exists
    const serviceTypeDropdown = page.locator('#serviceType');
    if (await serviceTypeDropdown.isVisible()) {
      await serviceTypeDropdown.selectOption({ index: 1 });
    }
    
    // Find and click the submit button
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Check for success message or form validation
    await expect(
      page.locator('.success-message, .notification, .alert-success')
    ).toBeVisible();
  });

  test('should have buttons on the page', async ({ page }) => {
    // Check for primary action buttons
    const buttons = page.locator('button');
    await expect(buttons).toHaveCount(await buttons.count());
    
    // Check for submit button specifically
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    // Check for cancel/reset button
    const cancelButton = page.locator('button').filter({ hasText: /cancel|reset/i });
    await expect(cancelButton).toBeVisible();
  });

  test('should show data binding working properly', async ({ page }) => {
    // Get the name input and a preview element that should show the entered value
    const nameInput = page.locator('#providerName');
    const namePreview = page.locator('.provider-preview');
    
    // Enter a value
    await nameInput.fill('Dynamic Test');
    
    // Check if the preview is updated through data binding
    await expect(namePreview).toContainText('Dynamic Test');
  });

  test('should have consistent visual elements', async ({ page }) => {
    // Check for styled elements like cards or panels
    await expect(page.locator('.card, mat-card, .panel')).toBeVisible();
    
    // Check for consistent styling (colors, borders, etc.)
    const card = page.locator('.card, mat-card, .panel').first();
    
    // Check if it has proper styling using evaluations
    const hasBorder = await card.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.border !== 'none' || style.boxShadow !== 'none';
    });
    
    expect(hasBorder).toBeTruthy();
  });

  test('should have accessible form elements', async ({ page }) => {
    // Check for labels on form inputs
    const nameInput = page.locator('#providerName');
    const nameLabel = page.locator('label[for="providerName"]');
    
    await expect(nameLabel).toBeVisible();
    
    // Check for aria attributes
    await expect(nameInput).toHaveAttribute('aria-required', 'true');
  });

  test('should adapt to different viewport sizes', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.service-provider-container')).not.toHaveClass(/mobile/);
    
    // Test mobile layout
    await page.setViewportSize({ width: 414, height: 896 });
    await expect(page.locator('.service-provider-container')).toHaveClass(/mobile/);
    
    // Check if layout adjusts properly (stack instead of row)
    const formLayout = await page.locator('form').evaluate(el => {
      return window.getComputedStyle(el).flexDirection;
    });
    
    expect(formLayout).toBe('column');
  });
});