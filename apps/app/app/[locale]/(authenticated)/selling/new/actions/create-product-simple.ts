'use server';

import { currentUser } from '@repo/auth/server';
import { log, logError } from '@repo/tooling/observability/server';
import { redirect } from 'next/navigation';

interface CreateProductInput {
  title?: string;
  description?: string;
  price?: number;
  [key: string]: unknown;
}

export async function createProductSimple(input: CreateProductInput) {
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
      input,
    };
  } catch (error) {
    logError('Error in simple create product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
