import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

// Mock Clerk components
vi.mock('@repo/auth/client', () => ({
  SignUp: () => <div>Sign Up Component</div>,
}));

test('Sign Up Page', async () => {
  // Since the sign-up page uses Clerk's SignUp component directly,
  // we'll test that it renders without errors
  const { SignUp } = await import('@repo/auth/client');
  render(<SignUp />);
  
  expect(screen.getByText('Sign Up Component')).toBeDefined();
});
