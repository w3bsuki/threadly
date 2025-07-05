import { log } from '@repo/observability/server';
'use server';

export async function testServerAction() {
  log.info('Test server action called');
  
  return {
    success: true,
    message: 'Server action is working!',
    timestamp: new Date().toISOString(),
  };
}