'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { log, logError } from '@repo/observability/server';
import { decimalToNumber } from '@repo/utils';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1),
        price: z.number().min(0),
      })
    )
    .min(1),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().optional(),
  }),
  shippingMethod: z.enum(['standard', 'express', 'overnight']),
  subtotal: z.number().min(0),
  shippingCost: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
  notes: z.string().optional(),
  paymentIntentId: z.string().optional(),
  saveAddress: z.boolean().default(false),
});

export async function createOrder(input: z.infer<typeof createOrderSchema>) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User not found in database',
      };
    }

    // Validate input
    const validatedInput = createOrderSchema.parse(input);

    // Verify all products exist and are available
    const productIds = validatedInput.items.map((item) => item.productId);
    const products = await database.product.findMany({
      where: {
        id: { in: productIds },
        status: 'AVAILABLE',
      },
      include: {
        seller: true,
      },
    });

    if (products.length !== productIds.length) {
      return {
        success: false,
        error: 'Some products are no longer available',
      };
    }

    // Verify prices haven't changed
    for (const orderItem of validatedInput.items) {
      const product = products.find((p) => p.id === orderItem.productId);
      if (
        !product ||
        Math.abs(decimalToNumber(product.price) - orderItem.price) > 0.01
      ) {
        return {
          success: false,
          error: 'Product prices have changed. Please refresh your cart.',
        };
      }
    }

    // Save shipping address if requested
    if (validatedInput.saveAddress) {
      try {
        // Check if this exact address already exists
        const existingAddress = await database.address.findFirst({
          where: {
            userId: dbUser.id,
            firstName: validatedInput.shippingAddress.firstName,
            lastName: validatedInput.shippingAddress.lastName,
            streetLine1: validatedInput.shippingAddress.address,
            city: validatedInput.shippingAddress.city,
            state: validatedInput.shippingAddress.state,
            zipCode: validatedInput.shippingAddress.zipCode,
            country: validatedInput.shippingAddress.country,
            type: 'SHIPPING',
          },
        });

        if (!existingAddress) {
          // Check if user has any default shipping addresses
          const hasDefaultShipping = await database.address.findFirst({
            where: {
              userId: dbUser.id,
              type: 'SHIPPING',
              isDefault: true,
            },
          });

          // Create new address
          await database.address.create({
            data: {
              userId: dbUser.id,
              firstName: validatedInput.shippingAddress.firstName,
              lastName: validatedInput.shippingAddress.lastName,
              streetLine1: validatedInput.shippingAddress.address,
              city: validatedInput.shippingAddress.city,
              state: validatedInput.shippingAddress.state,
              zipCode: validatedInput.shippingAddress.zipCode,
              country: validatedInput.shippingAddress.country,
              phone: validatedInput.shippingAddress.phone,
              type: 'SHIPPING',
              isDefault: !hasDefaultShipping, // Make it default if user has no default shipping address
            },
          });
        }
      } catch (error) {
        logError('Failed to save shipping address:', error);
        // Don't fail the order if address saving fails
      }
    }

    // Use transaction to ensure all orders are created successfully
    const result = await database.$transaction(async (tx) => {
      const orders = [];

      // Get or create the shipping address first
      let shippingAddress = await tx.address.findFirst({
        where: {
          userId: dbUser.id,
          firstName: validatedInput.shippingAddress.firstName,
          lastName: validatedInput.shippingAddress.lastName,
          streetLine1: validatedInput.shippingAddress.address,
          city: validatedInput.shippingAddress.city,
          state: validatedInput.shippingAddress.state,
          zipCode: validatedInput.shippingAddress.zipCode,
          type: 'SHIPPING',
        },
      });

      if (!shippingAddress) {
        shippingAddress = await tx.address.create({
          data: {
            userId: dbUser.id,
            firstName: validatedInput.shippingAddress.firstName,
            lastName: validatedInput.shippingAddress.lastName,
            streetLine1: validatedInput.shippingAddress.address,
            city: validatedInput.shippingAddress.city,
            state: validatedInput.shippingAddress.state,
            zipCode: validatedInput.shippingAddress.zipCode,
            country: validatedInput.shippingAddress.country,
            type: 'SHIPPING',
            isDefault: validatedInput.saveAddress,
          },
        });
      }

      // Create separate orders for each product (current schema limitation)
      for (const item of validatedInput.items) {
        const product = products.find((p) => p.id === item.productId)!;

        // Create individual order for each product
        const order = await tx.order.create({
          data: {
            buyerId: dbUser.id, // Use database user ID, not Clerk ID
            sellerId: product.sellerId,
            productId: item.productId,
            amount: item.price * item.quantity,
            shippingCost: validatedInput.shippingCost,
            tax: validatedInput.tax,
            totalAmount:
              item.price * item.quantity +
              validatedInput.shippingCost +
              validatedInput.tax,
            status: 'PENDING',
            shippingAddressId: shippingAddress.id,
          },
          include: {
            Product: {
              include: {
                images: {
                  take: 1,
                  orderBy: {
                    displayOrder: 'asc',
                  },
                },
                seller: true,
              },
            },
            shippingAddress: true,
            seller: true,
          },
        });

        orders.push(order);

        // Remove item from cart after order creation
        await tx.cartItem.deleteMany({
          where: {
            userId: dbUser.id,
            productId: item.productId,
          },
        });
      }

      return orders;
    });

    const orders = result;

    // NOTE: Product status will be updated to SOLD by the payment webhook
    // This prevents race conditions where products are marked sold before payment confirmation

    // Send confirmation email to buyer
    try {
      const { sendOrderConfirmationEmail } = await import('@repo/email');
      if (user.emailAddresses?.[0]?.emailAddress && orders.length > 0) {
        const primaryOrder = orders[0];
        await sendOrderConfirmationEmail(user.emailAddresses[0].emailAddress, {
          firstName: dbUser.firstName || 'Customer',
          orderId: primaryOrder.id,
          productTitle: primaryOrder.Product.title,
          productImage: primaryOrder.Product.images[0]?.imageUrl,
          price: decimalToNumber(primaryOrder.amount),
          sellerName: primaryOrder.seller.firstName || 'Seller',
          orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/buying/orders/${primaryOrder.id}`,
        });
      }
    } catch (error) {
      logError('Failed to send confirmation email:', error);
    }

    // TODO: Implement real-time notifications to sellers

    // Return the first order with virtual properties to match expected format
    const primaryOrder = orders[0];
    return {
      success: true,
      order: {
        ...primaryOrder,
        id: primaryOrder.id, // Use first order's ID as primary
        // Virtual properties to match the expected format
        subtotal: validatedInput.subtotal,
        shippingCost: validatedInput.shippingCost,
        tax: validatedInput.tax,
        total: validatedInput.total,
        shippingMethod: validatedInput.shippingMethod,
        shippingFirstName: validatedInput.shippingAddress.firstName,
        shippingLastName: validatedInput.shippingAddress.lastName,
        shippingAddress: validatedInput.shippingAddress.address,
        shippingCity: validatedInput.shippingAddress.city,
        shippingState: validatedInput.shippingAddress.state,
        shippingZipCode: validatedInput.shippingAddress.zipCode,
        shippingCountry: validatedInput.shippingAddress.country,
        notes: validatedInput.notes,
        paymentIntentId: validatedInput.paymentIntentId,
        // Transform orders into orderItems format
        orderItems: orders.map((o) => ({
          id: o.id,
          productId: o.productId,
          sellerId: o.sellerId,
          quantity: 1, // Current schema only supports quantity 1 per order
          price: o.Product.price,
          title: o.Product.title,
          description: o.Product.description || '',
          condition: o.Product.condition,
          product: o.Product,
        })),
      },
    };
  } catch (error) {
    logError('Failed to create order:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid order data',
        details: error.issues,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    };
  }
}
