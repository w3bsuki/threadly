import { Resend } from 'resend';
import { keys } from './keys';

export const resend = new Resend(keys().RESEND_TOKEN);

// Export all email functions and templates
export * from './service';
export * from './templates/welcome';
export * from './templates/order-confirmation';
export * from './templates/order-shipped';
export * from './templates/contact';
