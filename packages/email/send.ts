import 'server-only';
import { emailEnv } from './keys';
import { sendWithResend, sendWithSendGrid } from './providers';
import type { EmailOptions, EmailResponse } from './types';

export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  const provider = emailEnv.EMAIL_PROVIDER;

  switch (provider) {
    case 'resend':
      return sendWithResend(options);
    case 'sendgrid':
      return sendWithSendGrid(options);
    default:
      throw new Error(`Unknown email provider: ${provider}`);
  }
}