import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { configureAxe } from '@axe-core/react';

// Configure axe for development
if (process.env.NODE_ENV === 'development') {
  configureAxe({
    rules: {
      // Disable color-contrast in development for performance
      'color-contrast': { enabled: false },
    },
  });
}

// Common a11y test configurations
export const axeConfig = {
  standard: {
    rules: {
      // Core WCAG AA compliance
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-visible': { enabled: true },
      'aria-roles': { enabled: true },
      'form-labels': { enabled: true },
    },
  },
  strict: {
    rules: {
      // WCAG AAA compliance
      'color-contrast-enhanced': { enabled: true },
      'focus-order-semantics': { enabled: true },
      'landmark-complementary-is-top-level': { enabled: true },
    },
  },
  forms: {
    rules: {
      // Form-specific checks
      'label': { enabled: true },
      'form-field-multiple-labels': { enabled: true },
      'autocomplete-valid': { enabled: true },
      'required-attr': { enabled: true },
    },
  },
  navigation: {
    rules: {
      // Navigation-specific checks
      'landmark-one-main': { enabled: true },
      'bypass': { enabled: true },
      'heading-order': { enabled: true },
      'link-name': { enabled: true },
    },
  },
};

interface A11yRenderOptions extends RenderOptions {
  axeConfig?: typeof axeConfig.standard;
}

// Enhanced render function with a11y checks
export function renderWithA11y(
  ui: React.ReactElement,
  options: A11yRenderOptions = {}
) {
  const { axeConfig: config, ...renderOptions } = options;
  
  const result = render(ui, renderOptions);
  
  // Attach axe config to container for later testing
  if (config && result.container) {
    (result.container as any).__axeConfig = config;
  }
  
  return result;
}

// Helper for testing form accessibility
export function renderFormWithA11y(
  ui: React.ReactElement,
  options: A11yRenderOptions = {}
) {
  return renderWithA11y(ui, {
    ...options,
    axeConfig: { ...axeConfig.forms, ...options.axeConfig },
  });
}

// Helper for testing navigation accessibility
export function renderNavigationWithA11y(
  ui: React.ReactElement,
  options: A11yRenderOptions = {}
) {
  return renderWithA11y(ui, {
    ...options,
    axeConfig: { ...axeConfig.navigation, ...options.axeConfig },
  });
}

// Helper to get common test elements
export const a11yTestHelpers = {
  // Get all interactive elements
  getInteractiveElements: (container: HTMLElement) => 
    container.querySelectorAll('button, a, input, select, textarea, [tabindex]'),
  
  // Get all form elements
  getFormElements: (container: HTMLElement) =>
    container.querySelectorAll('input, select, textarea, button[type="submit"]'),
  
  // Get all headings
  getHeadings: (container: HTMLElement) =>
    container.querySelectorAll('h1, h2, h3, h4, h5, h6'),
  
  // Get elements with ARIA labels
  getAriaLabeled: (container: HTMLElement) =>
    container.querySelectorAll('[aria-label], [aria-labelledby]'),
  
  // Check if element is keyboard accessible
  isKeyboardAccessible: (element: Element) => {
    const tabIndex = element.getAttribute('tabindex');
    return tabIndex !== '-1' && (
      element.tagName === 'BUTTON' ||
      element.tagName === 'A' ||
      element.tagName === 'INPUT' ||
      element.tagName === 'SELECT' ||
      element.tagName === 'TEXTAREA' ||
      tabIndex !== null
    );
  },
};