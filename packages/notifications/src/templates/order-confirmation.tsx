import * as React from 'react';
import {
  Button,
  Column,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { BaseTemplate } from './base-template';

interface OrderConfirmationEmailProps {
  orderId: string;
  buyerName: string;
  items: Array<{
    product: {
      title: string;
      price: number;
      images: Array<{ url: string }>;
    };
    quantity: number;
  }>;
  total: number;
  estimatedDelivery?: Date;
}

export function OrderConfirmationEmail({
  orderId,
  buyerName,
  items,
  total,
  estimatedDelivery,
}: OrderConfirmationEmailProps): React.ReactElement {
  return (
    <BaseTemplate
      preview={`Order #${orderId} confirmed`}
      heading={`Hi ${buyerName}, your order is confirmed!`}
    >
      <Section style={content}>
        <Text style={text}>
          Thank you for your order! We've received your payment and your seller has been notified.
          You'll receive shipping updates as your order progresses.
        </Text>

        <Section style={orderDetails}>
          <Text style={orderHeader}>Order Details</Text>
          <Text style={orderNumber}>Order #{orderId}</Text>
          
          {items.map((item, index) => (
            <Row key={index} style={itemRow}>
              <Column style={itemImage}>
                <img
                  src={item.product.images[0]?.url || '/placeholder.jpg'}
                  width="60"
                  height="60"
                  style={{ borderRadius: '4px' }}
                  alt={item.product.title}
                />
              </Column>
              <Column style={itemDetails}>
                <Text style={itemTitle}>{item.product.title}</Text>
                <Text style={itemMeta}>Quantity: {item.quantity}</Text>
              </Column>
              <Column style={itemPrice}>
                <Text style={priceText}>${item.product.price}</Text>
              </Column>
            </Row>
          ))}
          
          <Row style={totalRow}>
            <Column>
              <Text style={totalText}>Total: ${total}</Text>
            </Column>
          </Row>
        </Section>

        {estimatedDelivery && (
          <Section style={deliverySection}>
            <Text style={deliveryText}>
              Estimated delivery: {estimatedDelivery.toLocaleDateString()}
            </Text>
          </Section>
        )}

        <Button
          href={`https://app.threadly.com/orders/${orderId}`}
          style={button}
        >
          Track Your Order
        </Button>
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

const orderDetails = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const orderHeader = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const orderNumber = {
  color: '#666',
  fontSize: '14px',
  margin: '0 0 16px 0',
};

const itemRow = {
  borderBottom: '1px solid #e6ebf1',
  paddingBottom: '16px',
  marginBottom: '16px',
};

const itemImage = {
  width: '80px',
  verticalAlign: 'top',
};

const itemDetails = {
  paddingLeft: '16px',
  verticalAlign: 'top',
};

const itemTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 4px 0',
};

const itemMeta = {
  color: '#666',
  fontSize: '14px',
  margin: '0',
};

const itemPrice = {
  textAlign: 'right' as const,
  verticalAlign: 'top',
};

const priceText = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const totalRow = {
  borderTop: '2px solid #333',
  paddingTop: '16px',
  marginTop: '16px',
};

const totalText = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
  margin: '0',
};

const deliverySection = {
  backgroundColor: '#e3f2fd',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const deliveryText = {
  color: '#1976d2',
  fontSize: '16px',
  textAlign: 'center' as const,
  margin: '0',
};

const button = {
  backgroundColor: '#000',
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