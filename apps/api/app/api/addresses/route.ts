import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { logError } from '@repo/tooling/observability/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  streetLine1: z.string().min(1, 'Street address is required'),
  streetLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(2, 'Country is required').default('US'),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
  type: z.enum(['SHIPPING', 'BILLING']).default('SHIPPING'),
});

// GET /api/addresses - Get user's addresses
export async function GET(_request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await database.address.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: 'desc' }, // Default addresses first
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    logError('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST /api/addresses - Create a new address
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAddressSchema.parse(body);

    // If this is set as default, unset other default addresses of the same type
    if (validatedData.isDefault) {
      await database.address.updateMany({
        where: {
          userId: user.id,
          type: validatedData.type,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const address = await database.address.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    logError('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}
