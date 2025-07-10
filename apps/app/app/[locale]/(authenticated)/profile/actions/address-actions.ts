'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  streetLine1: z.string().min(1, 'Address line 1 is required'),
  streetLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code is required'),
  country: z.string().min(1, 'Country is required').default('US'),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
  type: z.enum(['SHIPPING', 'BILLING']).default('SHIPPING'),
});

export async function createAddress(input: z.infer<typeof addressSchema>) {
  try {
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    const validatedInput = addressSchema.parse(input);

    // If this address is being set as default, unset the current default
    if (validatedInput.isDefault) {
      await database.address.updateMany({
        where: {
          userId: dbUser.id,
          type: validatedInput.type,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await database.address.create({
      data: {
        ...validatedInput,
        userId: dbUser.id,
      },
    });

    return {
      success: true,
      address,
    };

  } catch (error) {
    logError('Failed to create address:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid address data',
        details: error.issues,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create address',
    };
  }
}

export async function updateAddress(addressId: string, input: z.infer<typeof addressSchema>) {
  try {
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    const validatedInput = addressSchema.parse(input);

    // Verify the user owns this address
    const existingAddress = await database.address.findUnique({
      where: {
        id: addressId,
        userId: dbUser.id,
      },
    });

    if (!existingAddress) {
      throw new Error('Address not found or access denied');
    }

    // If this address is being set as default, unset the current default
    if (validatedInput.isDefault && !existingAddress.isDefault) {
      await database.address.updateMany({
        where: {
          userId: dbUser.id,
          type: validatedInput.type,
          isDefault: true,
          id: { not: addressId },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await database.address.update({
      where: {
        id: addressId,
      },
      data: {
        ...validatedInput,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      address,
    };

  } catch (error) {
    logError('Failed to update address:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid address data',
        details: error.issues,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update address',
    };
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    // Verify the user owns this address
    const existingAddress = await database.address.findUnique({
      where: {
        id: addressId,
        userId: dbUser.id,
      },
    });

    if (!existingAddress) {
      throw new Error('Address not found or access denied');
    }

    // Check if this address is used in any orders
    const ordersCount = await database.order.count({
      where: {
        shippingAddressId: addressId,
      },
    });

    if (ordersCount > 0) {
      throw new Error('Cannot delete address that has been used in orders');
    }

    await database.address.delete({
      where: {
        id: addressId,
      },
    });

    return {
      success: true,
    };

  } catch (error) {
    logError('Failed to delete address:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete address',
    };
  }
}

export async function setDefaultAddress(addressId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    // Verify the user owns this address
    const address = await database.address.findUnique({
      where: {
        id: addressId,
        userId: dbUser.id,
      },
    });

    if (!address) {
      throw new Error('Address not found or access denied');
    }

    // Use transaction to ensure consistency
    await database.$transaction(async (tx) => {
      // Unset current default
      await tx.address.updateMany({
        where: {
          userId: dbUser.id,
          type: address.type,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      // Set new default
      await tx.address.update({
        where: {
          id: addressId,
        },
        data: {
          isDefault: true,
        },
      });
    });

    return {
      success: true,
    };

  } catch (error) {
    logError('Failed to set default address:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set default address',
    };
  }
}

export async function getUserAddresses() {
  try {
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    const addresses = await database.address.findMany({
      where: {
        userId: dbUser.id,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return {
      success: true,
      addresses,
    };

  } catch (error) {
    logError('Failed to get user addresses:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get addresses',
      addresses: [],
    };
  }
}

export async function getDefaultAddress(type: 'SHIPPING' | 'BILLING' = 'SHIPPING') {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        address: null,
      };
    }

    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User not found',
        address: null,
      };
    }

    const address = await database.address.findFirst({
      where: {
        userId: dbUser.id,
        type,
        isDefault: true,
      },
    });

    return {
      success: true,
      address,
    };

  } catch (error) {
    logError('Failed to get default address:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get default address',
      address: null,
    };
  }
}