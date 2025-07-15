import { NextRequest } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { stripe, calculatePlatformFee, isStripeConfigured } from '@repo/payments';
import { paymentRateLimit, checkRateLimit } from '@repo/security';
import { z } from 'zod';
import { decimalToNumber } from '@repo/utils';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  validateInput,
  ErrorCode
} from '@repo/api-utils';

const createCheckoutSessionSchema = z.object({
  productId: z.string().min(1),
  sellerId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(paymentRateLimit, request);
    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        new Error(rateLimitResult.error?.message || 'Rate limit exceeded'),
        { 
          status: 429,
          headers: rateLimitResult.headers,
          errorCode: ErrorCode.RATE_LIMIT_EXCEEDED
        }
      );
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return createErrorResponse(
        new Error('Payment processing is not configured'),
        { status: 503, errorCode: ErrorCode.SERVICE_UNAVAILABLE }
      );
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return createErrorResponse(
        new Error('Unauthorized'),
        { status: 401, errorCode: ErrorCode.UNAUTHORIZED }
      );
    }

    // SECURITY: Get database user to ensure proper ID comparison
    const user = await database.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!user) {
      return createErrorResponse(
        new Error('User not found'),
        { status: 404, errorCode: ErrorCode.NOT_FOUND }
      );
    }

    const body = await request.json();
    const validationResult = validateInput(body, createCheckoutSessionSchema);
    if (!validationResult.success) {
      return createErrorResponse(
        new Error('Invalid request data'),
        { 
          status: 400, 
          errorCode: ErrorCode.VALIDATION_FAILED,
          details: validationResult.error.issues
        }
      );
    }
    const { productId, sellerId } = validationResult.data;

    // Verify product exists and is available
    const product = await database.product.findUnique({
      where: {
        id: productId,
        status: 'AVAILABLE',
      },
      include: {
        seller: {
          select: {
            stripeAccountId: true,
          },
        },
      },
    });

    if (!product) {
      return createErrorResponse(
        new Error('Product not available'),
        { status: 404, errorCode: ErrorCode.NOT_FOUND }
      );
    }

    // SECURITY: Proper ID comparison - database user ID vs database seller ID
    if (product.sellerId === user.id) {
      return createErrorResponse(
        new Error('Cannot purchase your own product'),
        { status: 400, errorCode: ErrorCode.INVALID_INPUT }
      );
    }

    // Get or create a default shipping address for the user
    let defaultAddress = await database.address.findFirst({
      where: {
        userId: user.id,
        isDefault: true,
        type: 'SHIPPING',
      },
    });

    if (!defaultAddress) {
      // Create a placeholder address that will be updated during checkout
      defaultAddress = await database.address.create({
        data: {
          userId: user.id,
          firstName: user.firstName || 'TBD',
          lastName: user.lastName || 'TBD',
          streetLine1: 'To be provided during checkout',
          city: 'TBD',
          state: 'TBD',
          zipCode: '00000',
          country: 'US',
          isDefault: true,
          type: 'SHIPPING',
        },
      });
    }

    // Create order and reserve product atomically to prevent race conditions
    const order = await database.$transaction(async (tx) => {
      // First, verify product is still available and reserve it
      const availableProduct = await tx.product.findFirst({
        where: {
          id: productId,
          status: 'AVAILABLE',
        },
      });

      if (!availableProduct) {
        throw new Error('Product is no longer available');
      }

      // Update product status to RESERVED
      await tx.product.update({
        where: { id: productId },
        data: { status: 'RESERVED' },
      });

      // Create order
      return tx.order.create({
        data: {
          buyerId: user.id,
          sellerId: product.sellerId,
          productId: product.id,
          amount: product.price,
          status: 'PENDING',
          shippingAddressId: defaultAddress.id,
        },
      });
    });

    // Calculate fees
    const amountInCents = Math.round(decimalToNumber(product.price) * 100);
    const platformFeeInCents = Math.round(calculatePlatformFee(decimalToNumber(product.price)) * 100);
    
    // Create payment intent parameters
    const paymentIntentParams: Parameters<typeof stripe.paymentIntents.create>[0] = {
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        orderId: order.id,
        productId: product.id,
        buyerId: user.id,
        sellerId: product.sellerId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // If seller has connected Stripe account, set up the transfer
    if (product.seller.stripeAccountId) {
      paymentIntentParams.application_fee_amount = platformFeeInCents;
      paymentIntentParams.transfer_data = {
        destination: product.seller.stripeAccountId,
      };
    }
    // Otherwise, the platform will handle manual payouts later

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return createSuccessResponse({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });

  } catch (error) {
    return createErrorResponse(error);
  }
}