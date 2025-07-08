import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Page from '../app/[locale]/(unauthenticated)/sign-in/[[...sign-in]]/page';

test('Sign In Page', async () => {
  const params = Promise.resolve({ locale: 'en' });
  const Component = await Page({ params });
  render(Component);
  expect(
    screen.getByRole('heading', {
      level: 1,
      name: 'Welcome back',
    })
  ).toBeDefined();
});
