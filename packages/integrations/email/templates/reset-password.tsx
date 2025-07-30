import { Button, Heading, Text } from '@react-email/components';
import { BaseTemplate } from './base-template';

interface ResetPasswordEmailProps {
  name: string;
  resetUrl: string;
  expiresIn?: string;
}

export function ResetPasswordEmail({ 
  name, 
  resetUrl, 
  expiresIn = '1 hour' 
}: ResetPasswordEmailProps) {
  return (
    <BaseTemplate preview="Reset your password">
      <Heading className="text-2xl font-bold text-gray-900">
        Password Reset Request
      </Heading>
      <Text className="mt-4 text-gray-600">
        Hi {name},
      </Text>
      <Text className="mt-2 text-gray-600">
        We received a request to reset your password. Click the button below to create a new password:
      </Text>
      <Button
        href={resetUrl}
        className="mt-6 rounded bg-blue-600 px-6 py-3 text-white"
      >
        Reset Password
      </Button>
      <Text className="mt-4 text-sm text-gray-500">
        This link will expire in {expiresIn}. If you didn't request this, you can safely ignore this email.
      </Text>
      <Text className="mt-4 text-xs text-gray-400">
        For security reasons, please don't forward this email to anyone.
      </Text>
    </BaseTemplate>
  );
}