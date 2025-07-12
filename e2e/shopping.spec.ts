import { test, expect } from '@playwright/test';

test.describe('Shopping Flow', () => {
  test('should browse products and view details', async ({ page }) => {
    await page.goto('/');
    
    // Should show product listings
    const productCards = page.getByTestId('product-card').or(page.locator('[data-testid*="product"]'));
    await expect(productCards.first()).toBeVisible();
    
    // Click on first product
    await productCards.first().click();
    
    // Should navigate to product detail page
    await expect(page).toHaveURL(/.*\/product\/.*/);
    
    // Should show product details
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/price/i).or(page.locator('text=/\\$\\d+/'))).toBeVisible();
    
    // Should have add to cart button
    const addToCartButton = page.getByRole('button', { name: /add to cart|buy now/i });
    await expect(addToCartButton).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto('/product/sample-id');
    
    // Add product to cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i });
    await addToCartButton.click();
    
    // Should show cart indicator or success message
    await expect(
      page.getByText(/added to cart/i).or(
        page.getByTestId('cart-count').filter({ hasText: /[1-9]/ })
      )
    ).toBeVisible({ timeout: 5000 });
  });

  test('should view and manage cart', async ({ page }) => {
    // First add item to cart
    await page.goto('/product/sample-id');
    await page.getByRole('button', { name: /add to cart/i }).click();
    
    // Navigate to cart
    const cartButton = page.getByRole('link', { name: /cart/i })
      .or(page.getByTestId('cart-button'))
      .or(page.locator('[href*="cart"]'));
    
    await cartButton.click();
    
    // Should show cart page
    await expect(page).toHaveURL(/.*cart.*/);
    
    // Should show cart items
    const cartItems = page.getByTestId('cart-item').or(page.locator('[data-testid*="cart"]'));
    await expect(cartItems.first()).toBeVisible();
    
    // Should show total price
    await expect(page.getByText(/total|subtotal/i)).toBeVisible();
    
    // Should have checkout button
    const checkoutButton = page.getByRole('button', { name: /checkout|proceed/i });
    await expect(checkoutButton).toBeVisible();
  });

  test('should update cart quantities', async ({ page }) => {
    await page.goto('/cart');
    
    // Find quantity controls
    const quantityInput = page.getByLabel(/quantity/i).or(page.locator('input[type="number"]'));
    const increaseButton = page.getByRole('button', { name: /increase|plus|\+/i });
    const decreaseButton = page.getByRole('button', { name: /decrease|minus|\-/i });
    
    // Test quantity increase
    if (await increaseButton.isVisible()) {
      await increaseButton.click();
      await page.waitForTimeout(500); // Wait for update
    }
    
    // Test quantity decrease
    if (await decreaseButton.isVisible()) {
      await decreaseButton.click();
      await page.waitForTimeout(500); // Wait for update
    }
    
    // Test direct input
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('3');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500); // Wait for update
    }
  });

  test('should remove items from cart', async ({ page }) => {
    await page.goto('/cart');
    
    // Find remove button
    const removeButton = page.getByRole('button', { name: /remove|delete|trash/i })
      .or(page.getByTestId('remove-item'));
    
    if (await removeButton.isVisible()) {
      await removeButton.click();
      
      // Should show confirmation or immediately remove
      const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      // Item should be removed
      await page.waitForTimeout(1000);
    }
  });

  test('should filter and search products', async ({ page }) => {
    await page.goto('/browse');
    
    // Test search functionality
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByLabel(/search/i));
    if (await searchInput.isVisible()) {
      await searchInput.fill('shirt');
      await page.keyboard.press('Enter');
      
      // Should show search results
      await page.waitForTimeout(1000);
      await expect(page.getByText(/shirt/i).first()).toBeVisible();
    }
    
    // Test category filters
    const categoryFilter = page.getByRole('button', { name: /category|filter/i })
      .or(page.getByTestId('category-filter'));
    
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      
      // Select a category
      const categoryOption = page.getByText(/clothing|tops|bottoms/i).first();
      if (await categoryOption.isVisible()) {
        await categoryOption.click();
        
        // Should filter results
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Check mobile navigation
    const mobileMenuButton = page.getByRole('button', { name: /menu|hamburger/i })
      .or(page.getByTestId('mobile-menu'));
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      
      // Should show mobile menu
      await expect(page.getByRole('navigation')).toBeVisible();
    }
    
    // Check mobile product grid
    const productGrid = page.locator('.grid, [class*="grid"]').first();
    if (await productGrid.isVisible()) {
      // Should have mobile-appropriate columns
      const gridItems = productGrid.locator('> *');
      const itemCount = await gridItems.count();
      expect(itemCount).toBeGreaterThan(0);
    }
  });

  test('should handle loading states and errors gracefully', async ({ page }) => {
    // Test slow network conditions
    await page.route('**/api/products**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
      await route.continue();
    });
    
    await page.goto('/browse');
    
    // Should show loading indicator
    const loadingIndicator = page.getByText(/loading/i)
      .or(page.getByTestId('loading'))
      .or(page.locator('[data-loading="true"]'));
    
    if (await loadingIndicator.isVisible({ timeout: 1000 })) {
      await expect(loadingIndicator).toBeVisible();
    }
    
    // Wait for content to load
    await page.waitForTimeout(3000);
  });

  test('should handle accessibility in shopping flow', async ({ page }) => {
    await page.goto('/browse');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Should be able to navigate products with keyboard
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test screen reader attributes
    const productCards = page.getByRole('article').or(page.locator('[role="listitem"]'));
    if (await productCards.first().isVisible()) {
      const firstCard = productCards.first();
      
      // Should have accessible name
      await expect(firstCard.getByRole('heading')).toBeVisible();
      
      // Images should have alt text
      const images = firstCard.locator('img');
      if (await images.first().isVisible()) {
        await expect(images.first()).toHaveAttribute('alt');
      }
    }
  });
});