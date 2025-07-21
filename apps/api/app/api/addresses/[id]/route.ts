import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { logError } from '@repo/observability/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateAddressSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  company: z.string().optional(),
  streetLine1: z.string().min(1).optional(),
  streetLine2: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  zipCode: z.string().min(1).optional(),
  country: z.string().min(2).optional(),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
  type: z.enum(['SHIPPING', 'BILLING']).optional(),
});

// GET /api/addresses/[id] - Get a specific address
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const address = await database.address.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Check if address belongs to user
    if (address.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ address });
  } catch (error) {
    logError('Error fetching address:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address' },
      { status: 500 }
    );
  }
}

// PUT /api/addresses/[id] - Update an address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const existingAddress = await database.address.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Check if address belongs to user
    if (existingAddress.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateAddressSchema.parse(body);

    // If setting as default, unset other default addresses of the same type
    if (validatedData.isDefault === true) {
      const addressType = validatedData.type || existingAddress.type;
      await database.address.updateMany({
        where: {
          userId: user.id,
          type: addressType,
          isDefault: true,
          id: { not: resolvedParams.id },
        },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await database.address.update({
      where: { id: resolvedParams.id },
      data: validatedData,
    });

    return NextResponse.json({ address: updatedAddress });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    logError('Error updating address:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

// DELETE /api/addresses/[id] - Delete an address
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const existingAddress = await database.address.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Check if address belongs to user
    if (existingAddress.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await database.address.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    logError('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
