import 'server-only';
import { Resend } from 'resend';
import sgMail from '@sendgrid/mail';
import { render } from '@react-email/render';
import { emailEnv } from './keys';
import type { EmailOptions, EmailResponse } from './types';

const resend = emailEnv.RESEND_API_KEY ? new Resend(emailEnv.RESEND_API_KEY) : null;

if (emailEnv.SENDGRID_API_KEY) {
  sgMail.setApiKey(emailEnv.SENDGRID_API_KEY);
}

export async function sendWithResend(options: EmailOptions): Promise<EmailResponse> {
  if (!resend) {
    throw new Error('Resend API key not configured');
  }

  try {
    let html = options.html;
    
    if (options.react && !html) {
      html = await render(options.react);
    }

    const response = await resend.emails.send({
      from: options.from || emailEnv.EMAIL_FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: html || '',
      text: options.text,
      replyTo: options.replyTo || emailEnv.EMAIL_REPLY_TO,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    });

    return {
      id: response.data?.id || '',
      provider: 'resend',
      success: true,
    };
  } catch (error) {
    return {
      id: '',
      provider: 'resend',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendWithSendGrid(options: EmailOptions): Promise<EmailResponse> {
  try {
    let html = options.html;
    
    if (options.react && !html) {
      html = await render(options.react);
    }

    const msg = {
      to: options.to,
      from: options.from || emailEnv.EMAIL_FROM,
      subject: options.subject,
      text: options.text,
      html: html || '',
      replyTo: options.replyTo || emailEnv.EMAIL_REPLY_TO,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments?.map(att => ({
        content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
        filename: att.filename,
        type: att.contentType,
      })),
    };

    const response = await sgMail.send(msg);

    return {
      id: response[0].headers['x-message-id'] || '',
      provider: 'sendgrid',
      success: true,
    };
  } catch (error) {
    return {
      id: '',
      provider: 'sendgrid',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}