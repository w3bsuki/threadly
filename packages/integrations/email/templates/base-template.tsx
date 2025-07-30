import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
} from '@react-email/components';

interface BaseTemplateProps {
  preview: string;
  children: React.ReactNode;
}

export function BaseTemplate({ preview, children }: BaseTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-8 max-w-[600px] rounded-lg bg-white p-8 shadow-sm">
            <Section>{children}</Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}