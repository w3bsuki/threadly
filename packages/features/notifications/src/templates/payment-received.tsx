import { Button, Section, Text } from '@react-email/components';
import type * as React from 'react';
import { BaseTemplate } from './base-template';

interface PaymentReceivedEmailProps {
  sellerName: string;
  amount: number;
  orderId: string;
  productName: string;
  payoutDate: Date;
}

export function PaymentReceivedEmail({
  sellerName,
  amount,
  orderId,
  productName,
  payoutDate,
}: PaymentReceivedEmailProps): React.ReactElement {
  return (
    <BaseTemplate
      heading={`Great news ${sellerName}! You've received a payment`}
      preview={`Payment received: $${amount}`}
    >
      <Section style={content}>
        <Text style={text}>
          Congratulations! You've successfully received a payment for your sale.
        </Text>

        <Section style={paymentSection}>
          <Text style={paymentHeader}>Payment Details</Text>
          <Text style={paymentAmount}>${amount}</Text>
          <Text style={paymentDetails}>
            Order #{orderId}
            <br />
            Product: {productName}
          </Text>
        </Section>

        <Section style={payoutSection}>
          <Text style={payoutText}>
            <strong>Payout Information</strong>
            <br />
            Your earnings will be transferred to your connected account on{' '}
            {payoutDate.toLocaleDateString()}. You can track all your earnings
            in your seller dashboard.
          </Text>
        </Section>

        <Button
          href={'https://app.threadly.com/selling/history'}
          style={button}
        >
          View Earnings
        </Button>

        <Text style={tipText}>
          💡 <strong>Tip:</strong> Keep up the great work! Respond quickly to
          messages and maintain great photos to increase your sales.
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

const paymentSection = {
  backgroundColor: '#f0f8f0',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const paymentHeader = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const paymentAmount = {
  color: '#28a745',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const paymentDetails = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const payoutSection = {
  backgroundColor: '#fff3cd',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const payoutText = {
  color: '#856404',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const button = {
  backgroundColor: '#28a745',
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

const tipText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0 0 0',
};
