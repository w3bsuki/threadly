// Re-export cleanup directly for convenience
export { cleanup } from '@testing-library/react';
// Re-export vitest globals for test files
export {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
export * from './a11y';
export * from './helpers';
export * from './mocks';
