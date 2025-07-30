import { Button, Section, Text } from '@react-email/components';
import type * as React from 'react';
import { BaseTemplate } from './base-template';

interface NewMessageEmailProps {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  conversationUrl: string;
}

export function NewMessageEmail({
  recipientName,
  senderName,
  messagePreview,
  conversationUrl,
}: NewMessageEmailProps): React.ReactElement {
  return (
    <BaseTemplate
      heading={`Hi ${recipientName}, you have a new message!`}
      preview={`New message from ${senderName}`}
    >
      <Section style={content}>
        <Text style={text}>{senderName} sent you a message on Threadly:</Text>

        <Section style={messagePreviewSection}>
          <Text style={messagePreviewText}>
            "{messagePreview}
            {messagePreview.length >= 100 ? '...' : ''}"
          </Text>
        </Section>

        <Text style={text}>
          Reply quickly to keep the conversation going and close the deal!
        </Text>

        <Button href={conversationUrl} style={button}>
          Reply to Message
        </Button>

        <Text style={footerNote}>
          You're receiving this because you have message notifications enabled.
          You can update your preferences in your account settings.
        </Text>
      </Section>
    </BaseTemplate>
  );
}

const content = {
  padding: '0 48px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const messagePreviewSection = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #007bff',
  borderRadius: '4px',
  padding: '16px',
  margin: '24px 0',
};

const messagePreviewText = {
  color: '#333',
  fontSize: '16px',
  fontStyle: 'italic',
  lineHeight: '24px',
  margin: '0',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '12px 0',
  margin: '24px auto',
};

const footerNote = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0 0',
  textAlign: 'center' as const,
};
