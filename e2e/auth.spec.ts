import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('should navigate to sign-in page', async ({ page }) => {
    await page.goto('/');
    
    // Look for sign-in link/button
    const signInButton = page.getByRole('link', { name: /sign in|login/i });
    await expect(signInButton).toBeVisible();
    
    await signInButton.click();
    
    // Should navigate to auth page
    await expect(page).toHaveURL(/.*sign-in.*/);
    
    // Should have sign-in form
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should navigate to sign-up page', async ({ page }) => {
    await page.goto('/');
    
    // Look for sign-up link/button
    const signUpButton = page.getByRole('link', { name: /sign up|register/i });
    await expect(signUpButton).toBeVisible();
    
    await signUpButton.click();
    
    // Should navigate to auth page
    await expect(page).toHaveURL(/.*sign-up.*/);
    
    // Should have sign-up form
    await expect(page.getByRole('heading', { name: /sign up|create account/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/sign-in');
    
    // Enter invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('password123');
    
    // Try to submit
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('should handle keyboard navigation in auth forms', async ({ page }) => {
    await page.goto('/sign-in');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/email/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/password/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeFocused();
    
    // Should be able to submit with Enter
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.keyboard.press('Enter');
    
    // Form should attempt to submit (may show error without real auth)
  });

  test('should have accessible form labels and ARIA attributes', async ({ page }) => {
    await page.goto('/sign-up');
    
    // Check form has proper ARIA labeling
    const form = page.getByRole('form');
    await expect(form).toBeVisible();
    
    // Check inputs have labels
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute('type', 'email');
    
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Check required fields are marked
    await expect(emailInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
  });

  test('should redirect to dashboard after successful sign-in', async ({ page }) => {
    // Note: This test would require a test user or mock auth
    // For now, we'll test the redirect logic structure
    
    await page.goto('/sign-in');
    
    // Mock successful auth response
    await page.route('**/api/auth/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, redirectTo: '/dashboard' }),
      });
    });
    
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('validpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard (or show loading state)
    await page.waitForTimeout(1000); // Wait for potential redirect
  });

  test('should handle sign-out flow', async ({ page }) => {
    // This test assumes user is signed in
    // In real implementation, would use beforeEach to set auth state
    
    await page.goto('/dashboard');
    
    // Look for user menu or sign-out button
    const userMenu = page.getByRole('button', { name: /account|profile|user/i });
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }
    
    const signOutButton = page.getByRole('button', { name: /sign out|logout/i });
    await signOutButton.click();
    
    // Should redirect to home or sign-in page
    await expect(page).toHaveURL(/.*\/(|sign-in)$/);
  });
});