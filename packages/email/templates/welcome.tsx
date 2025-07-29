import { Button, Heading, Text } from '@react-email/components';
import { BaseTemplate } from './base-template';

interface WelcomeEmailProps {
  name: string;
  verificationUrl?: string;
}

export function WelcomeEmail({ name, verificationUrl }: WelcomeEmailProps) {
  return (
    <BaseTemplate preview={`Welcome to our platform, ${name}!`}>
      <Heading className="text-2xl font-bold text-gray-900">
        Welcome, {name}!
      </Heading>
      <Text className="mt-4 text-gray-600">
        We're excited to have you on board. Your account has been created successfully.
      </Text>
      {verificationUrl && (
        <>
          <Text className="mt-4 text-gray-600">
            Please verify your email address by clicking the button below:
          </Text>
          <Button
            href={verificationUrl}
            className="mt-4 rounded bg-blue-600 px-6 py-3 text-white"
          >
            Verify Email
          </Button>
        </>
      )}
      <Text className="mt-6 text-sm text-gray-500">
        If you have any questions, feel free to reach out to our support team.
      </Text>
    </BaseTemplate>
  );
}