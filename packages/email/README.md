# @repo/email

Email sending utilities with support for Resend and SendGrid providers.

## Installation

This package is part of the monorepo and should be installed as a workspace dependency:

```json
{
  "dependencies": {
    "@repo/email": "workspace:*"
  }
}
```

## Configuration

Set the following environment variables:

```env
# Email Provider
EMAIL_PROVIDER=resend # or sendgrid

# Provider API Keys
RESEND_API_KEY=re_...
SENDGRID_API_KEY=SG...

# Email Settings
EMAIL_FROM=noreply@example.com
EMAIL_REPLY_TO=support@example.com
```

## Usage

### Send Email

```typescript
import { sendEmail } from '@repo/email';

// Send with HTML
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to our platform!</h1>'
});

// Send with React component
import { WelcomeEmail } from '@repo/email/templates';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  react: <WelcomeEmail name="John" />
});
```

### Email Templates

```typescript
import { WelcomeEmail, ResetPasswordEmail } from '@repo/email/templates';

// Welcome email
<WelcomeEmail 
  name="John"
  verificationUrl="https://example.com/verify?token=..."
/>

// Password reset email
<ResetPasswordEmail
  name="John"
  resetUrl="https://example.com/reset?token=..."
  expiresIn="24 hours"
/>
```

## Creating Custom Templates

```typescript
import { BaseTemplate } from '@repo/email/templates';
import { Text, Button } from '@react-email/components';

export function CustomEmail({ name }: { name: string }) {
  return (
    <BaseTemplate preview="Custom email preview">
      <Text>Hello {name}!</Text>
      <Button href="https://example.com">
        Click me
      </Button>
    </BaseTemplate>
  );
}
```

## Exports

- `sendEmail` - Send an email using configured provider
- `sendWithResend` - Send directly with Resend
- `sendWithSendGrid` - Send directly with SendGrid
- Templates: `BaseTemplate`, `WelcomeEmail`, `ResetPasswordEmail`
- Types: `EmailOptions`, `EmailResponse`, `EmailAttachment`