import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { 
  createAddress, 
  getUserAddresses 
} from '../../(authenticated)/profile/actions/address-actions';

export async function GET(): Promise<NextResponse> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await getUserAddresses();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ addresses: result.addresses });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await createAddress(body);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          details: result.details 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      address: result.address 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}