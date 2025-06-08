import { render as rtlRender, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { ReactElement, ReactNode } from 'react';

// Custom providers wrapper
interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return (
    <div>
      {/* Add your providers here when needed */}
      {children}
    </div>
  );
}

// Custom render function
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult & { user: UserEvent } {
  return {
    user: userEvent.setup(),
    ...rtlRender(ui, { wrapper: Providers, ...options }),
  };
}

// Export specific items to avoid conflicts
export {
  screen,
  fireEvent,
  waitFor,
  act,
  within,
  cleanup,
  queryByTestId,
  findByTestId,
  getByRole,
  queryByRole,
  findByRole,
  getByText,
  queryByText,
  findByText,
  getByLabelText,
  queryByLabelText,
  findByLabelText,
  getByPlaceholderText,
  queryByPlaceholderText,
  findByPlaceholderText,
  getByDisplayValue,
  queryByDisplayValue,
  findByDisplayValue
} from '@testing-library/react';

export { customRender as render };

// Helper to render with user event
export function renderWithUser(
  ui: ReactElement, 
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult & { user: UserEvent } {
  return {
    user: userEvent.setup(),
    ...rtlRender(ui, { wrapper: Providers, ...options }),
  };
}

// Helper to render async components
export async function renderAsync(
  ui: ReactElement, 
  options?: Omit<RenderOptions, 'wrapper'>
): Promise<RenderResult & { user: UserEvent }> {
  const result = customRender(ui, options);
  
  // Wait for any async operations to complete
  await new Promise(resolve => setTimeout(resolve, 0));
  
  return result;
}

// Helper to render with specific screen size
export function renderWithViewport(
  ui: ReactElement,
  viewport: { width: number; height: number },
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult & { user: UserEvent } {
  // Mock window dimensions
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: viewport.width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: viewport.height,
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));

  return customRender(ui, options);
}

// Helper to render with mock router
export function renderWithRouter(
  ui: ReactElement,
  initialRoute = '/',
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult & { user: UserEvent } {
  // This would be implemented with Next.js router mock
  // For now, just render normally
  return customRender(ui, options);
}

// Helper to find element by test id with better error messages
export function getByTestId(container: HTMLElement, testId: string) {
  const element = container.querySelector(`[data-testid="${testId}"]`);
  if (!element) {
    throw new Error(
      `Unable to find element with data-testid="${testId}". ` +
      `Available test ids: ${Array.from(container.querySelectorAll('[data-testid]'))
        .map(el => el.getAttribute('data-testid'))
        .join(', ')}`
    );
  }
  return element;
}

// Helper to wait for loading states to complete
export async function waitForLoading(container: HTMLElement) {
  const { findByTestId, queryByTestId } = rtlRender(<div />, { container });
  
  // Wait for loading indicators to disappear
  const loadingIndicators = [
    'loading',
    'spinner',
    'skeleton',
    'loading-spinner',
    'loading-indicator'
  ];

  for (const indicator of loadingIndicators) {
    const element = queryByTestId(indicator);
    if (element) {
      await new Promise(resolve => {
        const observer = new MutationObserver(() => {
          if (!container.contains(element)) {
            observer.disconnect();
            resolve(undefined);
          }
        });
        observer.observe(container, { childList: true, subtree: true });
      });
    }
  }
}

// Helper to test component accessibility
export async function testAccessibility(container: HTMLElement) {
  // This would integrate with @axe-core/react in a real implementation
  // For now, just check basic accessibility attributes
  const interactiveElements = container.querySelectorAll(
    'button, input, select, textarea, a[href]'
  );

  interactiveElements.forEach(element => {
    if (!element.getAttribute('aria-label') && !element.textContent?.trim()) {
      console.warn(`Interactive element without accessible name:`, element);
    }
  });

  return true;
}