import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type * as React from 'react';

interface BaseTemplateProps {
  preview: string;
  heading: string;
  children: React.ReactNode;
}

export function BaseTemplate({
  preview,
  heading,
  children,
}: BaseTemplateProps): React.ReactElement {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              alt="Threadly"
              height="50"
              src="https://threadly.com/logo.png"
              width="150"
            />
          </Section>

          <Heading style={h1}>{heading}</Heading>

          {children as any}

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Threadly. All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href="https://threadly.com/unsubscribe" style={link}>
                Unsubscribe
              </Link>
              {' · '}
              <Link href="https://threadly.com/privacy" style={link}>
                Privacy Policy
              </Link>
              {' · '}
              <Link href="https://threadly.com/help" style={link}>
                Help Center
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '5px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
};

const header = {
  padding: '0 48px',
  marginBottom: '32px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0 48px',
  marginBottom: '24px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const footer = {
  padding: '0 48px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
};

const link = {
  color: '#8898aa',
  textDecoration: 'underline',
};
