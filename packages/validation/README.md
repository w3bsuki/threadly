# @repo/validation

Comprehensive validation and sanitization package for the Threadly marketplace.

## Features

- 🛡️ **Input Validation**: Zod-based schemas for all data types
- 🧹 **Sanitization**: HTML stripping, XSS prevention, SQL escape
- 🤬 **Profanity Filtering**: Built-in bad words detection
- 📧 **Email Validation**: Including disposable email detection
- 💳 **Payment Validation**: Credit card and bank account validation
- 🔒 **Security**: Password strength checking, CSRF protection
- 🚀 **Middleware**: Ready-to-use Next.js API route middleware
- 📏 **Business Rules**: Custom validators for marketplace logic

## Installation

This package is already included in the monorepo. To use it in any app:

```typescript
import { createProductSchema, sanitizeText } from '@repo/validation';
```

## Usage

### Basic Validation

```typescript
import { createProductSchema } from '@repo/validation';

const productData = {
  title: 'Vintage Jacket',
  price: 89.99,
  // ... other fields
};

try {
  const validated = createProductSchema.parse(productData);
  // Data is valid and typed
} catch (error) {
  // Handle validation errors
}
```

### Sanitization

```typescript
import { sanitizeText, filterProfanity, sanitizeHtml } from '@repo/validation';

// Remove HTML tags
const clean = sanitizeText('<script>alert("xss")</script>Hello');
// Result: "Hello"

// Filter profanity
const filtered = filterProfanity('This is damn good!');
// Result: "This is *** good!"

// Safe HTML (keeps allowed tags)
const safe = sanitizeHtml('<p>Hello <b>world</b></p><script>bad</script>');
// Result: "<p>Hello <b>world</b></p>"
```

### API Route Validation

```typescript
import { withValidation, createMessageSchema } from '@repo/validation';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withValidation(
  async (request, data) => {
    // Data is already validated and typed
    await saveMessage(data);
    return NextResponse.json({ success: true });
  },
  createMessageSchema,
  'body'
);
```

### Custom Validators

```typescript
import { isValidProductTitle, checkPasswordStrength } from '@repo/validation';

// Check product title
if (!isValidProductTitle('AMAZING DEAL!!!!')) {
  // Title has too many caps or special chars
}

// Check password strength
const strength = checkPasswordStrength('MyP@ssw0rd');
console.log(strength.score); // 0-4
console.log(strength.feedback); // Array of suggestions
console.log(strength.isStrong); // true/false
```

## Available Schemas

### Product Schemas
- `createProductSchema` - Create new product listing
- `updateProductSchema` - Update existing product
- `productFilterSchema` - Search/filter products
- `productConditionSchema` - Product conditions enum
- `productCategorySchema` - Product categories enum

### User Schemas
- `createUserProfileSchema` - User registration
- `updateUserProfileSchema` - Profile updates
- `changePasswordSchema` - Password changes
- `sellerVerificationSchema` - Seller account setup

### Message Schemas
- `createMessageSchema` - Send message
- `createOfferMessageSchema` - Send offer
- `reportMessageSchema` - Report inappropriate message

### Common Schemas
- `emailSchema` - Email with disposable check
- `priceSchema` - Price validation (0.01-999999.99)
- `phoneSchema` - International phone numbers
- `addressSchema` - Shipping addresses
- `paginationSchema` - API pagination

## Sanitization Functions

- `sanitizeHtml()` - Allow safe HTML tags
- `stripHtml()` - Remove all HTML
- `sanitizeText()` - Clean text input
- `filterProfanity()` - Replace bad words
- `sanitizeFilename()` - Prevent directory traversal
- `sanitizeUrl()` - Prevent open redirects
- `maskSensitiveData()` - Mask credit cards, etc.

## Middleware

### Validation Middleware
```typescript
const middleware = createValidationMiddleware(schema, 'body');
```

### Rate Limiting
```typescript
const rateLimiter = createRateLimitMiddleware(60, 60000); // 60 req/min
```

### Size Limiting
```typescript
const sizeLimit = createSizeLimitMiddleware(1024 * 1024); // 1MB
```

### Combining Middleware
```typescript
const combined = combineMiddleware(
  rateLimiter,
  sizeLimit,
  validator
);
```

## Business Validators

- `isDisposableEmail()` - Check if email is temporary
- `isValidProductTitle()` - Check title quality
- `isValidCreditCard()` - Luhn algorithm check
- `isAdult()` - Age verification (18+)
- `isValidOffer()` - Check offer amount
- `isCompleteAddress()` - Verify address fields

## Security Best Practices

1. **Always validate on the server** - Never trust client-side validation alone
2. **Sanitize for context** - Use appropriate sanitization for the output context
3. **Rate limit APIs** - Prevent abuse with rate limiting middleware
4. **Check file uploads** - Validate file types and sizes
5. **Use parameterized queries** - The SQL escape function is basic protection only

## Error Handling

```typescript
import { formatZodErrors, type ValidationError } from '@repo/validation';

try {
  schema.parse(data);
} catch (error) {
  if (error instanceof ZodError) {
    const errors: ValidationError[] = formatZodErrors(error);
    // Handle validation errors
  }
}
```

## Types

All schemas automatically generate TypeScript types:

```typescript
import type { 
  CreateProductInput,
  UpdateProductInput,
  ProductCategory,
  UserRole 
} from '@repo/validation';
```