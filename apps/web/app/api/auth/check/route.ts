import { currentUser } from '@repo/auth/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      }
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}