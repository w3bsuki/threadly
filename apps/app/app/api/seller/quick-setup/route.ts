import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { returnTo } = await request.json();
    
    // Find or create user
    const dbUser = await database.user.upsert({
      where: { clerkId: user.id },
      update: {},
      create: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        imageUrl: user.imageUrl || null,
      },
    });
    
    // Check if seller profile already exists
    const existingProfile = await database.sellerProfile.findUnique({
      where: { userId: dbUser.id },
    });
    
    if (existingProfile) {
      return NextResponse.json({ 
        success: true, 
        message: 'Seller profile already exists',
        redirectTo: returnTo || '/selling/dashboard'
      });
    }
    
    // Create basic seller profile with minimal info
    await database.sellerProfile.create({
      data: {
        userId: dbUser.id,
        displayName: `${user.firstName || 'User'}'s Shop`,
        bio: 'Selling quality fashion items',
        processingTime: 3,
        defaultShippingCost: 5.00,
        shippingFrom: 'Bulgaria', // Default, can be updated later
      },
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Quick seller profile created',
      redirectTo: returnTo || '/selling/dashboard'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create seller profile' },
      { status: 500 }
    );
  }
}