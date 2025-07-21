import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server with our handlers
export const server = setupServer(...handlers);

// Helper to add custom handlers for specific tests
export function addHandlers(...customHandlers: any[]) {
  server.use(...customHandlers);
}

// Helper to reset handlers to original state
export function resetHandlers() {
  server.resetHandlers(...handlers);
}