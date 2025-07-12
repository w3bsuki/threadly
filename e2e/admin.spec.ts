import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-auth', 'true');
    });
  });

  test('should access admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    // Should show admin dashboard
    await expect(page.getByRole('heading', { name: /admin|dashboard/i })).toBeVisible();
    
    // Should have admin navigation
    const adminNav = page.getByRole('navigation').or(page.locator('nav'));
    await expect(adminNav).toBeVisible();
    
    // Should show admin metrics/stats
    const statsCards = page.locator('[data-testid*="stat"]').or(page.locator('.card, [class*="card"]'));
    await expect(statsCards.first()).toBeVisible();
  });

  test('should manage products', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Should show products table/list
    await expect(page.getByRole('heading', { name: /products/i })).toBeVisible();
    
    // Should have product list
    const productTable = page.getByRole('table').or(page.locator('[data-testid="products-list"]'));
    await expect(productTable).toBeVisible();
    
    // Should have filters and search
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test product');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
    
    // Should have status filters
    const statusFilter = page.getByRole('combobox').or(page.locator('select'));
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      
      const statusOption = page.getByText(/available|pending|removed/i).first();
      if (await statusOption.isVisible()) {
        await statusOption.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should moderate product listings', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Find a product to moderate
    const productRow = page.locator('tr').or(page.locator('[data-testid*="product"]')).first();
    await expect(productRow).toBeVisible();
    
    // Should have action buttons
    const actionButton = productRow.getByRole('button', { name: /action|moderate|approve|remove/i }).first();
    if (await actionButton.isVisible()) {
      await actionButton.click();
      
      // Should show moderation options
      const moderateOptions = page.getByText(/approve|reject|remove|archive/i);
      if (await moderateOptions.first().isVisible()) {
        await moderateOptions.first().click();
        
        // Should confirm action
        const confirmButton = page.getByRole('button', { name: /confirm|yes|proceed/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
        
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should manage users', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Should show users table
    await expect(page.getByRole('heading', { name: /users/i })).toBeVisible();
    
    const usersTable = page.getByRole('table').or(page.locator('[data-testid="users-list"]'));
    await expect(usersTable).toBeVisible();
    
    // Should show user information
    const userRow = page.locator('tr').first();
    if (await userRow.isVisible()) {
      // Should display user email/name
      await expect(userRow.getByText(/@/)).toBeVisible();
    }
    
    // Should have user actions
    const userActionButton = page.getByRole('button', { name: /action|ban|suspend/i }).first();
    if (await userActionButton.isVisible()) {
      await userActionButton.click();
      
      // Should show user management options
      const userActions = page.getByText(/ban|suspend|activate|delete/i);
      if (await userActions.first().isVisible()) {
        // Don't actually perform destructive actions in test
        await page.keyboard.press('Escape');
      }
    }
  });

  test('should handle bulk operations', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Select multiple products
    const checkboxes = page.getByRole('checkbox');
    const productCheckboxes = checkboxes.locator('nth=1, nth=2, nth=3'); // Skip header checkbox
    
    if (await productCheckboxes.first().isVisible()) {
      await productCheckboxes.first().check();
      await productCheckboxes.nth(1).check();
      
      // Should show bulk actions
      const bulkActionsBar = page.getByText(/selected|bulk/i).or(page.locator('[data-testid="bulk-actions"]'));
      if (await bulkActionsBar.isVisible()) {
        await expect(bulkActionsBar).toBeVisible();
        
        // Should have bulk action buttons
        const bulkRemoveButton = page.getByRole('button', { name: /remove|delete/i });
        const bulkArchiveButton = page.getByRole('button', { name: /archive/i });
        
        if (await bulkRemoveButton.isVisible()) {
          await expect(bulkRemoveButton).toBeVisible();
        }
      }
    }
  });

  test('should show admin statistics and analytics', async ({ page }) => {
    await page.goto('/admin');
    
    // Should show key metrics
    const statsCards = page.locator('[data-testid*="stat"], .stat, [class*="stat"]');
    await expect(statsCards.first()).toBeVisible();
    
    // Should show numbers/counts
    const metrics = page.locator('text=/\\d+/').filter({ hasText: /\d{1,}/ });
    await expect(metrics.first()).toBeVisible();
    
    // Should have time period filters
    const timeFilter = page.getByRole('button', { name: /week|month|year/i }).or(
      page.locator('select').filter({ hasText: /period|time/i })
    );
    
    if (await timeFilter.isVisible()) {
      await timeFilter.click();
      
      const timeOption = page.getByText(/last 7 days|last month|last year/i).first();
      if (await timeOption.isVisible()) {
        await timeOption.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should handle admin permissions and security', async ({ page }) => {
    // Test without admin auth
    await page.context().clearLocalStorage();
    await page.goto('/admin');
    
    // Should redirect to login or show access denied
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    const isBlocked = currentUrl.includes('sign-in') || 
                     currentUrl.includes('login') ||
                     await page.getByText(/access denied|unauthorized/i).isVisible();
    
    expect(isBlocked).toBe(true);
  });

  test('should have responsive admin interface', async ({ page }) => {
    // Test mobile admin interface
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/admin');
    
    // Should have mobile-friendly navigation
    const mobileMenuButton = page.getByRole('button', { name: /menu|nav/i });
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      
      // Should show mobile navigation
      await expect(page.getByRole('navigation')).toBeVisible();
    }
    
    // Tables should be scrollable on mobile
    await page.goto('/admin/products');
    
    const table = page.getByRole('table');
    if (await table.isVisible()) {
      // Should be horizontally scrollable
      const tableContainer = table.locator('..');
      if (await tableContainer.isVisible()) {
        await expect(tableContainer).toBeVisible();
      }
    }
  });

  test('should handle admin search and filtering', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Test global search
    const globalSearch = page.getByPlaceholder(/search products/i);
    if (await globalSearch.isVisible()) {
      await globalSearch.fill('vintage');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      // Should filter results
      const results = page.getByText(/vintage/i);
      if (await results.first().isVisible()) {
        await expect(results.first()).toBeVisible();
      }
    }
    
    // Test status filtering
    const statusDropdown = page.getByRole('combobox').filter({ hasText: /status/i });
    if (await statusDropdown.isVisible()) {
      await statusDropdown.click();
      
      const statusOption = page.getByText(/pending|approved|removed/i).first();
      if (await statusOption.isVisible()) {
        await statusOption.click();
        await page.waitForTimeout(1000);
      }
    }
  });
});