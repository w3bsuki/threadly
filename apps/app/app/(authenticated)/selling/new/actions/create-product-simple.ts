'use server';

import { currentUser } from '@repo/auth/server';
import { redirect } from 'next/navigation';
import { log } from '@repo/observability/log';
import { logError } from '@repo/observability/error';

export async function createProductSimple(input: any) {
  log.info('Simple create product called with:', input);
  
  try {
    // Just verify authentication works
    const user = await currentUser();
    if (!user) {
      log.info('No user found, redirecting...');
      redirect('/sign-in');
    }
    
    log.info('Clerk user authenticated:', { userId: user.id });
    
    // Return success without database call
    return {
      success: true,
      message: 'Test successful - authentication works',
      clerkId: user.id,
      input: input,
    };
    
  } catch (error) {
    logError('Error in simple create product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}