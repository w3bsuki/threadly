import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logError } from '@repo/observability/server';

const sellerProfileSchema = z.object({
  displayName: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  profilePhoto: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankRoutingNumber: z.string().length(9).optional(),
  accountHolderName: z.string().optional(),
  payoutMethod: z.enum(['bank_transfer', 'paypal']).default('bank_transfer'),
  shippingFrom: z.string().min(1),
  processingTime: z.string().transform(val => parseInt(val)),
  defaultShippingCost: z.string().transform(val => parseFloat(val)),
  shippingNotes: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = sellerProfileSchema.parse(body);

    // Get or create database user
    let dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      dbUser = await database.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        },
        select: { id: true }
      });
    }

    // Create seller profile in a transaction
    const result = await database.$transaction(async (tx) => {
      // Update user with payment info
      const updatedUser = await tx.user.update({
        where: { id: dbUser.id },
        data: {
          bankAccountNumber: validated.bankAccountNumber,
          bankRoutingNumber: validated.bankRoutingNumber,
          accountHolderName: validated.accountHolderName,
          payoutMethod: validated.payoutMethod === 'bank_transfer' ? 'BANK_TRANSFER' : 'PAYPAL',
        },
      });

      // Create seller profile
      const sellerProfile = await tx.sellerProfile.create({
        data: {
          userId: dbUser.id,
          displayName: validated.displayName,
          bio: validated.bio,
          shippingFrom: validated.shippingFrom,
          processingTime: validated.processingTime,
          defaultShippingCost: validated.defaultShippingCost,
          shippingNotes: validated.shippingNotes,
        },
      });

      return { user: updatedUser, sellerProfile };
    });

    return NextResponse.json({
      success: true,
      sellerProfile: result.sellerProfile,
    });
  } catch (error) {
    logError('Failed to create seller profile', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create seller profile' },
      { status: 500 }
    );
  }
}