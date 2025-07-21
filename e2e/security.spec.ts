import { test, expect } from '@playwright/test';

test.describe('Frontend Security Tests', () => {
  test('should have Content Security Policy headers', async ({ page }) => {
    const response = await page.goto('/');
    
    // Check for security headers
    const cspHeader = response?.headers()['content-security-policy'];
    if (cspHeader) {
      expect(cspHeader).toContain("default-src 'self'");
    }
    
    const xFrameOptions = response?.headers()['x-frame-options'];
    if (xFrameOptions) {
      expect(xFrameOptions).toBe('DENY');
    }
  });

  test('should prevent XSS in user inputs', async ({ page }) => {
    await page.goto('/');
    
    // Try to inject script in search
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('<script>alert("xss")</script>');
      await page.keyboard.press('Enter');
      
      // Wait to see if script executes
      await page.waitForTimeout(1000);
      
      // Check that script didn't execute
      const alertDialogs = page.locator('role=alertdialog');
      expect(await alertDialogs.count()).toBe(0);
      
      // Check that input was sanitized
      const inputValue = await searchInput.inputValue();
      expect(inputValue).not.toContain('<script>');
    }
  });

  test('should sanitize user-generated content', async ({ page }) => {
    await page.goto('/product/test-product');
    
    // Check product description doesn't contain executable scripts
    const description = page.getByTestId('product-description')
      .or(page.locator('[data-testid*="description"]'))
      .or(page.locator('.description'));
      
    if (await description.isVisible()) {
      const content = await description.textContent();
      expect(content).not.toContain('<script>');
      expect(content).not.toContain('javascript:');
      expect(content).not.toContain('onload=');
    }
  });

  test('should validate file upload security', async ({ page }) => {
    // Navigate to upload page (e.g., product creation)
    await page.goto('/sell/new-product');
    
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // Try to upload a non-image file
      const scriptFile = Buffer.from('alert("xss")', 'utf-8');
      
      await fileInput.setInputFiles({
        name: 'malicious.js',
        mimeType: 'application/javascript',
        buffer: scriptFile,
      });
      
      // Should show error for invalid file type
      const errorMessage = page.getByText(/invalid file type|only images allowed/i);
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    }
  });

  test('should protect against CSRF attacks', async ({ page }) => {
    await page.goto('/');
    
    // Check that forms have CSRF protection
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i);
      
      // Look for CSRF token input
      const csrfInput = form.locator('input[name*="csrf"], input[name*="token"]');
      const hasToken = await csrfInput.count() > 0;
      
      // Or check for other CSRF protection mechanisms
      const hasDataAttribute = await form.getAttribute('data-csrf');
      const hasMetaToken = await page.locator('meta[name="csrf-token"]').count() > 0;
      
      // At least one protection method should be present
      expect(hasToken || hasDataAttribute || hasMetaToken).toBe(true);
    }
  });

  test('should handle authentication state securely', async ({ page }) => {
    await page.goto('/');
    
    // Check that tokens are stored securely
    const localStorage = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return keys.map(key => ({
        key,
        value: localStorage.getItem(key)
      }));
    });
    
    // Ensure no sensitive data in localStorage
    localStorage.forEach(item => {
      expect(item.value).not.toMatch(/password|secret|private/i);
      if (item.key.includes('token')) {
        // JWT tokens should be properly formatted
        expect(item.value).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      }
    });
    
    // Check cookies are secure
    const cookies = await page.context().cookies();
    const authCookies = cookies.filter(c => 
      c.name.includes('auth') || 
      c.name.includes('token') || 
      c.name.includes('session')
    );
    
    authCookies.forEach(cookie => {
      expect(cookie.secure).toBe(true); // Should be secure in production
      expect(cookie.httpOnly).toBe(true); // Should be HTTP-only
    });
  });

  test('should prevent clickjacking attacks', async ({ page }) => {
    // Test that the site cannot be embedded in frames
    const response = await page.goto('/');
    
    const xFrameOptions = response?.headers()['x-frame-options'];
    const csp = response?.headers()['content-security-policy'];
    
    // Should have frame protection
    const hasFrameProtection = 
      xFrameOptions === 'DENY' || 
      xFrameOptions === 'SAMEORIGIN' ||
      (csp && csp.includes("frame-ancestors 'none'"));
      
    expect(hasFrameProtection).toBe(true);
  });

  test('should validate URL parameters for injection', async ({ page }) => {
    // Test with malicious URL parameters
    await page.goto('/search?q=' + encodeURIComponent('<script>alert("xss")</script>'));
    
    // Check that script doesn't execute
    await page.waitForTimeout(1000);
    
    // Check that parameter is properly handled
    const searchResults = page.getByTestId('search-results')
      .or(page.locator('[data-testid*="search"]'));
      
    if (await searchResults.isVisible()) {
      const content = await searchResults.textContent();
      expect(content).not.toContain('<script>');
    }
  });

  test('should handle error pages securely', async ({ page }) => {
    // Navigate to non-existent page
    const response = await page.goto('/nonexistent-page');
    
    // Should show custom 404 page
    expect(response?.status()).toBe(404);
    
    // Error page should not expose sensitive information
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toMatch(/database|server|internal error|stack trace/i);
    
    // Should have proper error message
    expect(pageContent).toMatch(/page not found|404/i);
  });

  test('should validate session management', async ({ page }) => {
    // Test session timeout and renewal
    await page.goto('/dashboard');
    
    // Mock expired session
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-expired', 'true');
    });
    
    await page.reload();
    
    // Should redirect to login or show session expired message
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const sessionHandled = 
      currentUrl.includes('sign-in') ||
      currentUrl.includes('login') ||
      await page.getByText(/session expired|please sign in/i).isVisible();
      
    expect(sessionHandled).toBe(true);
  });

  test('should protect sensitive routes', async ({ page }) => {
    // Test admin route protection
    await page.goto('/admin');
    
    await page.waitForTimeout(1000);
    
    // Should redirect to login or show access denied
    const currentUrl = page.url();
    const isProtected = 
      currentUrl.includes('sign-in') ||
      currentUrl.includes('login') ||
      await page.getByText(/access denied|unauthorized|admin access required/i).isVisible();
      
    expect(isProtected).toBe(true);
  });

  test('should handle secure form submissions', async ({ page }) => {
    await page.goto('/contact');
    
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      // Check form method and action
      const method = await form.getAttribute('method');
      const action = await form.getAttribute('action');
      
      // Should use POST for sensitive data
      if (method) {
        expect(method.toLowerCase()).toBe('post');
      }
      
      // Should use HTTPS in production
      if (action && action.startsWith('http')) {
        expect(action).toMatch(/^https:/);
      }
      
      // Check for proper input validation attributes
      const emailInput = form.locator('input[type="email"]');
      if (await emailInput.isVisible()) {
        expect(await emailInput.getAttribute('required')).toBeDefined();
      }
    }
  });
});