/**
 * Commerce Validation Utilities
 * 
 * Provides validation functions for commerce-related data including
 * products, prices, orders, and marketplace-specific business rules.
 */

import { isValidPrice, toNumber, type PriceInput } from './price';
import { isSupportedCurrency, type SupportedCurrency } from './currency';

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates product pricing data
 * 
 * @param price - Product price
 * @param currency - Currency code
 * @param category - Product category (optional, for category-specific rules)
 * @returns Validation result
 */
export function validateProductPrice(
  price: PriceInput,
  currency: SupportedCurrency = 'USD',
  category?: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const numericPrice = toNumber(price);
  
  // Basic price validation
  if (!isValidPrice(price)) {
    if (numericPrice <= 0) {
      errors.push('Price must be greater than 0');
    } else if (numericPrice > 999999.99) {
      errors.push('Price cannot exceed $999,999.99');
    } else {
      errors.push('Invalid price format');
    }
  }
  
  // Currency validation
  if (!isSupportedCurrency(currency)) {
    errors.push(`Unsupported currency: ${currency}`);
  }
  
  // Minimum price warnings based on category
  if (category && numericPrice > 0) {
    const categoryMinimums: Record<string, number> = {
      'luxury': 50,
      'jewelry': 25,
      'electronics': 10,
      'clothing': 5,
      'accessories': 3,
    };
    
    const categoryKey = category.toLowerCase();
    const minPrice = categoryMinimums[categoryKey];
    
    if (minPrice && numericPrice < minPrice) {
      warnings.push(`Price seems low for ${category} items. Consider pricing above $${minPrice}`);
    }
  }
  
  // Suspiciously high price warning
  if (numericPrice > 10000) {
    warnings.push('High-value items require additional verification');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates product listing data
 * 
 * @param product - Product data to validate
 * @returns Validation result
 */
export function validateProductListing(product: {
  title?: string;
  description?: string;
  price?: PriceInput;
  images?: string[];
  category?: string;
  condition?: string;
  brand?: string;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Title validation
  if (!product.title?.trim()) {
    errors.push('Product title is required');
  } else if (product.title.length < 10) {
    warnings.push('Product title should be at least 10 characters for better searchability');
  } else if (product.title.length > 100) {
    errors.push('Product title cannot exceed 100 characters');
  }
  
  // Description validation
  if (!product.description?.trim()) {
    errors.push('Product description is required');
  } else if (product.description.length < 50) {
    warnings.push('Detailed descriptions help buyers make decisions. Consider adding more details');
  } else if (product.description.length > 2000) {
    errors.push('Product description cannot exceed 2000 characters');
  }
  
  // Price validation
  const priceValidation = validateProductPrice(product.price);
  errors.push(...priceValidation.errors);
  warnings.push(...priceValidation.warnings);
  
  // Images validation
  if (!product.images?.length) {
    errors.push('At least one product image is required');
  } else {
    if (product.images.length < 3) {
      warnings.push('Adding more photos increases buyer confidence');
    }
    
    // Validate image URLs
    product.images.forEach((url, index) => {
      if (!isValidImageUrl(url)) {
        errors.push(`Invalid image URL at position ${index + 1}`);
      }
    });
  }
  
  // Category validation
  if (!product.category?.trim()) {
    errors.push('Product category is required');
  }
  
  // Condition validation
  const validConditions = ['NEW', 'LIKE_NEW', 'EXCELLENT', 'GOOD', 'FAIR'];
  if (!product.condition || !validConditions.includes(product.condition)) {
    errors.push('Valid product condition is required');
  }
  
  // Brand validation (optional but recommended)
  if (!product.brand?.trim()) {
    warnings.push('Adding brand information helps with search and credibility');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates order data before processing
 * 
 * @param order - Order data to validate
 * @returns Validation result
 */
export function validateOrder(order: {
  items?: Array<{
    productId: string;
    quantity: number;
    price: PriceInput;
  }>;
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  total?: PriceInput;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Items validation
  if (!order.items?.length) {
    errors.push('Order must contain at least one item');
  } else {
    let calculatedTotal = 0;
    
    order.items.forEach((item, index) => {
      if (!item.productId?.trim()) {
        errors.push(`Item ${index + 1}: Product ID is required`);
      }
      
      if (!item.quantity || item.quantity < 1) {
        errors.push(`Item ${index + 1}: Quantity must be at least 1`);
      }
      
      const itemPrice = toNumber(item.price);
      if (!isValidPrice(item.price)) {
        errors.push(`Item ${index + 1}: Invalid price`);
      } else {
        calculatedTotal += itemPrice * item.quantity;
      }
    });
    
    // Validate total against calculated total
    const orderTotal = toNumber(order.total);
    if (Math.abs(orderTotal - calculatedTotal) > 0.01) {
      errors.push('Order total does not match item prices');
    }
  }
  
  // Shipping address validation
  if (order.shippingAddress) {
    const addr = order.shippingAddress;
    
    if (!addr.name?.trim()) {
      errors.push('Shipping address: Recipient name is required');
    }
    
    if (!addr.street?.trim()) {
      errors.push('Shipping address: Street address is required');
    }
    
    if (!addr.city?.trim()) {
      errors.push('Shipping address: City is required');
    }
    
    if (!addr.state?.trim()) {
      errors.push('Shipping address: State/Province is required');
    }
    
    if (!addr.postalCode?.trim()) {
      errors.push('Shipping address: Postal code is required');
    } else if (!isValidPostalCode(addr.postalCode, addr.country)) {
      warnings.push('Postal code format may be invalid for the selected country');
    }
    
    if (!addr.country?.trim()) {
      errors.push('Shipping address: Country is required');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates seller verification data
 * 
 * @param seller - Seller data to validate
 * @returns Validation result
 */
export function validateSellerData(seller: {
  businessName?: string;
  taxId?: string;
  bankAccount?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Business name validation
  if (!seller.businessName?.trim()) {
    errors.push('Business name is required');
  } else if (seller.businessName.length < 2) {
    errors.push('Business name must be at least 2 characters');
  }
  
  // Tax ID validation (optional but recommended)
  if (!seller.taxId?.trim()) {
    warnings.push('Adding tax identification helps with payment processing');
  }
  
  // Bank account validation
  if (!seller.bankAccount?.trim()) {
    errors.push('Bank account information is required for payouts');
  }
  
  // Address validation
  if (seller.address) {
    const addr = seller.address;
    
    const requiredFields = ['street', 'city', 'state', 'postalCode', 'country'];
    requiredFields.forEach(field => {
      if (!addr[field as keyof typeof addr]?.trim()) {
        errors.push(`Business address: ${field} is required`);
      }
    });
  } else {
    errors.push('Business address is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Helper functions

/**
 * Validates if a string is a valid image URL
 */
function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const hasValidExtension = validExtensions.some(ext => 
      urlObj.pathname.toLowerCase().endsWith(ext)
    );
    
    // Allow uploadthing and other CDN URLs even without extensions
    const isFromCDN = [
      'uploadthing.com',
      'cloudinary.com',
      'amazonaws.com',
      'googleusercontent.com'
    ].some(domain => urlObj.hostname.includes(domain));
    
    return hasValidExtension || isFromCDN;
  } catch {
    return false;
  }
}

/**
 * Validates postal code format for different countries
 */
function isValidPostalCode(postalCode: string, country: string): boolean {
  const patterns: Record<string, RegExp> = {
    'US': /^\d{5}(-\d{4})?$/,
    'BG': /^\d{4}$/,
    'GB': /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
    'DE': /^\d{5}$/,
    'FR': /^\d{5}$/,
  };
  
  const pattern = patterns[country.toUpperCase()];
  if (!pattern) {
    // If we don't have a pattern for the country, assume it's valid
    return true;
  }
  
  return pattern.test(postalCode.trim());
}