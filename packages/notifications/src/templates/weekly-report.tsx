import * as React from 'react';
import {
  Button,
  Column,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { BaseTemplate } from './base-template';

interface WeeklyReportEmailProps {
  sellerName: string;
  weekStartDate: Date;
  weekEndDate: Date;
  totalSales: number;
  totalRevenue: number;
  totalViews: number;
  totalMessages: number;
  topProducts: Array<{
    title: string;
    views: number;
    sales: number;
  }>;
}

export function WeeklyReportEmail({
  sellerName,
  weekStartDate,
  weekEndDate,
  totalSales,
  totalRevenue,
  totalViews,
  totalMessages,
  topProducts,
}: WeeklyReportEmailProps): React.ReactElement {
  const weekRange = `${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}`;

  return (
    <BaseTemplate
      preview={`Your weekly Threadly report for ${weekRange}`}
      heading={`Hi ${sellerName}, here's your weekly report!`}
    >
      <Section style={content}>
        <Text style={text}>
          Here's how your listings performed from {weekRange}:
        </Text>

        <Section style={metricsSection}>
          <Row>
            <Column style={metricColumn}>
              <Text style={metricNumber}>{totalSales}</Text>
              <Text style={metricLabel}>Sales</Text>
            </Column>
            <Column style={metricColumn}>
              <Text style={metricNumber}>${totalRevenue}</Text>
              <Text style={metricLabel}>Revenue</Text>
            </Column>
          </Row>
          <Row>
            <Column style={metricColumn}>
              <Text style={metricNumber}>{totalViews}</Text>
              <Text style={metricLabel}>Views</Text>
            </Column>
            <Column style={metricColumn}>
              <Text style={metricNumber}>{totalMessages}</Text>
              <Text style={metricLabel}>Messages</Text>
            </Column>
          </Row>
        </Section>

        {topProducts.length > 0 && (
          <Section style={topProductsSection}>
            <Text style={sectionHeader}>Top Performing Products</Text>
            {topProducts.slice(0, 3).map((product, index) => (
              <Row key={index} style={productRow}>
                <Column style={productRank}>
                  <Text style={rankText}>{index + 1}</Text>
                </Column>
                <Column style={productDetails}>
                  <Text style={productTitle}>{product.title}</Text>
                  <Text style={productStats}>
                    {product.views} views • {product.sales} sales
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>
        )}

        <Section style={tipsSection}>
          <Text style={sectionHeader}>💡 Tips to Boost Your Sales</Text>
          <Text style={tipItem}>
            • Upload high-quality photos with good lighting
          </Text>
          <Text style={tipItem}>
            • Respond to messages within 24 hours
          </Text>
          <Text style={tipItem}>
            • Price competitively by checking similar items
          </Text>
          <Text style={tipItem}>
            • Write detailed descriptions with measurements
          </Text>
        </Section>

        <Button
          href="https://app.threadly.com/selling/analytics"
          style={button}
        >
          View Full Analytics
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

const metricsSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const metricColumn = {
  textAlign: 'center' as const,
  padding: '0 12px',
};

const metricNumber = {
  color: '#333',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const metricLabel = {
  color: '#666',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const topProductsSection = {
  margin: '32px 0',
};

const sectionHeader = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const productRow = {
  borderBottom: '1px solid #e6ebf1',
  padding: '12px 0',
};

const productRank = {
  width: '40px',
  textAlign: 'center' as const,
};

const rankText = {
  color: '#007bff',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
};

const productDetails = {
  paddingLeft: '16px',
};

const productTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 4px 0',
};

const productStats = {
  color: '#666',
  fontSize: '14px',
  margin: '0',
};

const tipsSection = {
  backgroundColor: '#f0f8f0',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
};

const tipItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
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