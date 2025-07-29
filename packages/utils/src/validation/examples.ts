/**
 * Example usage of the validation package
 */

import {
  checkPasswordStrength,
  createMessageSchema,
  // Schemas
  createProductSchema,
  emailSchema,
  filterProfanity,
  // Validators
  isValidProductTitle,
  // Sanitization
  sanitizeHtml,
  sanitizeText,
  // Middleware
  withValidation,
  // Types
  z,
} from './index';

// Example 1: Validate a product submission
const validateProduct = () => {
  const productData = {
    title: "Vintage Levi's Denim Jacket",
    description:
      'Beautiful vintage denim jacket from the 1990s. Great condition with minor wear.',
    price: 89.99,
    category: 'UNISEX',
    subcategory: 'JACKETS',
    condition: 'VERY_GOOD',
    size: 'M',
    color: 'BLUE',
    brand: "Levi's",
    images: [
      {
        url: 'https://utfs.io/f/abc123.jpg',
        alt: 'Front view',
        order: 0,
      },
    ],
    quantity: 1,
  };

  try {
    const validated = createProductSchema.parse(productData);
  } catch (error) {
    if (error instanceof z.ZodError) {
    }
  }
};

// Example 2: Sanitize user input
const sanitizeUserInput = () => {
  const userMessage =
    'Check out my <script>alert("xss")</script> awesome product!';

  // Remove all HTML
  const sanitized = sanitizeText(userMessage);

  // Filter profanity
  const withProfanity = 'This is a damn good product!';
  const filtered = filterProfanity(withProfanity);
};

// Example 3: Validate email with disposable check
const validateEmail = async () => {
  const emails = [
    'user@gmail.com',
    'test@tempmail.com', // Disposable
    'invalid.email',
  ];

  for (const email of emails) {
    try {
      emailSchema.parse(email);
    } catch (error) {}
  }
};

// Example 4: Check password strength
const checkPassword = () => {
  const passwords = [
    'password', // Weak
    'Password1', // Better
    'P@ssw0rd123!', // Strong
  ];

  passwords.forEach((pwd) => {
    const result = checkPasswordStrength(pwd);
  });
};

// Example 5: API Route with validation
import { type NextRequest, NextResponse } from 'next/server';

export const POST = withValidation(
  async (request: NextRequest, data: z.infer<typeof createMessageSchema>) => {
    // Data is already validated and typed

    // Sanitize the content before saving
    const sanitizedContent = filterProfanity(data.content);

    // Process the message...

    return NextResponse.json({ success: true });
  },
  createMessageSchema,
  'body'
);

// Example 6: Custom validation for business rules
const validateBusinessRules = () => {
  const title = 'AMAZING DEAL!!!! BUY NOW!!!!';

  if (!isValidProductTitle(title)) {
  }
};
