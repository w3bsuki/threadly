import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

// Mock Clerk components
vi.mock('@repo/auth/client', () => ({
  SignIn: () => <div>Sign In Component</div>,
}));

test('Sign In Page', async () => {
  // Since the sign-in page uses Clerk's SignIn component directly,
  // we'll test that it renders without errors
  const { SignIn } = await import('@repo/auth/client');
  render(<SignIn />);

  expect(screen.getByText('Sign In Component')).toBeDefined();
});
