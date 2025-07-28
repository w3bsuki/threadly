import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const sellerProfileSchema = z.object({
  displayName: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  profilePhoto: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankRoutingNumber: z.string().length(9).optional(),
  accountHolderName: z.string().optional(),
  payoutMethod: z.enum(['bank_transfer', 'paypal']).default('bank_transfer'),
  shippingFrom: z.string().min(1),
  processingTime: z.string().transform((val) => Number.parseInt(val)),
  defaultShippingCost: z.string().transform((val) => Number.parseFloat(val)),
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
      select: { id: true, SellerProfile: true },
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
        select: { id: true, SellerProfile: true },
      });
    }

    // Check if seller profile already exists
    if (dbUser.SellerProfile) {
      return NextResponse.json(
        { error: 'Seller profile already exists' },
        { status: 409 }
      );
    }

    // Update user with payment info if provided
    if (
      validated.bankAccountNumber ||
      validated.bankRoutingNumber ||
      validated.accountHolderName
    ) {
      await database.user.update({
        where: { id: dbUser.id },
        data: {
          bankAccountNumber: validated.bankAccountNumber || null,
          bankRoutingNumber: validated.bankRoutingNumber || null,
          accountHolderName: validated.accountHolderName || null,
          payoutMethod:
            validated.payoutMethod === 'bank_transfer'
              ? 'BANK_TRANSFER'
              : 'PAYPAL',
        },
      });
    }

    // Create seller profile
    const sellerProfile = await database.sellerProfile.create({
      data: {
        userId: dbUser.id,
        displayName: validated.displayName,
        bio: validated.bio || '',
        shippingFrom: validated.shippingFrom,
        processingTime: validated.processingTime,
        defaultShippingCost: validated.defaultShippingCost,
        shippingNotes: validated.shippingNotes || '',
      },
    });

    return NextResponse.json({
      success: true,
      sellerProfile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    // Prisma errors
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json(
        { error: 'A seller profile already exists for this user' },
        { status: 409 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to create seller profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create seller profile' },
      { status: 500 }
    );
  }
}
