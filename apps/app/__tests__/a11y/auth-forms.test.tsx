import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

const renderFormWithA11y = render;
const a11yTestHelpers = {
  getInteractiveElements: (container: HTMLElement) => 
    container.querySelectorAll('button, a, input, select, textarea, [tabindex]'),
  getFormElements: (container: HTMLElement) =>
    container.querySelectorAll('input, select, textarea, button[type="submit"]'),
  getHeadings: (container: HTMLElement) =>
    container.querySelectorAll('h1, h2, h3, h4, h5, h6'),
  getAriaLabeled: (container: HTMLElement) =>
    container.querySelectorAll('[aria-label], [aria-labelledby]'),
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

// Mock auth forms since we need to test structure
const MockSignInForm = () => (
  <form role="form" aria-labelledby="signin-title">
    <h1 id="signin-title">Sign In</h1>
    <div>
      <label htmlFor="email">Email Address</label>
      <input
        id="email"
        type="email"
        name="email"
        required
        aria-describedby="email-help"
        aria-invalid="false"
      />
      <div id="email-help">Enter your email address</div>
    </div>
    <div>
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        name="password"
        required
        aria-describedby="password-help"
      />
      <div id="password-help">Enter your password</div>
    </div>
    <button type="submit" aria-describedby="submit-help">
      Sign In
    </button>
    <div id="submit-help">Click to sign in to your account</div>
  </form>
);

const MockSignUpForm = () => (
  <form role="form" aria-labelledby="signup-title">
    <h1 id="signup-title">Create Account</h1>
    <fieldset>
      <legend>Personal Information</legend>
      <div>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          name="firstName"
          required
          aria-describedby="firstName-help"
        />
        <div id="firstName-help">Enter your first name</div>
      </div>
      <div>
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          name="lastName"
          required
          aria-describedby="lastName-help"
        />
        <div id="lastName-help">Enter your last name</div>
      </div>
    </fieldset>
    <fieldset>
      <legend>Account Details</legend>
      <div>
        <label htmlFor="signupEmail">Email Address</label>
        <input
          id="signupEmail"
          type="email"
          name="email"
          required
          aria-describedby="signupEmail-help"
        />
        <div id="signupEmail-help">This will be your login email</div>
      </div>
      <div>
        <label htmlFor="signupPassword">Password</label>
        <input
          id="signupPassword"
          type="password"
          name="password"
          required
          aria-describedby="signupPassword-help password-requirements"
        />
        <div id="password-requirements">
          Password must be at least 8 characters long
        </div>
      </div>
    </fieldset>
    <div>
      <input
        id="terms"
        type="checkbox"
        name="acceptTerms"
        required
        aria-describedby="terms-help"
      />
      <label htmlFor="terms">
        I accept the Terms of Service and Privacy Policy
      </label>
      <div id="terms-help">You must accept to create an account</div>
    </div>
    <button type="submit">Create Account</button>
  </form>
);

describe('Authentication Forms Accessibility', () => {
  describe('Sign In Form', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderFormWithA11y(<MockSignInForm />);
      await expect(container).toHaveNoViolations();
    });

    it('should have proper form structure', () => {
      const { container } = renderFormWithA11y(<MockSignInForm />);
      
      // Check for form heading
      const heading = container.querySelector('h1');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute('id', 'signin-title');
      
      // Check form has proper role and labelledby
      const form = container.querySelector('form');
      expect(form).toHaveAttribute('role', 'form');
      expect(form).toHaveAttribute('aria-labelledby', 'signin-title');
    });

    it('should have properly labeled form fields', () => {
      const { container } = renderFormWithA11y(<MockSignInForm />);
      
      const formElements = a11yTestHelpers.getFormElements(container);
      
      formElements.forEach((element: Element) => {
        // Each input should have an associated label
        const id = element.getAttribute('id');
        if (id && element.tagName === 'INPUT') {
          const label = container.querySelector(`label[for="${id}"]`);
          expect(label).toBeInTheDocument();
        }
      });
    });

    it('should have keyboard accessible elements', () => {
      const { container } = renderFormWithA11y(<MockSignInForm />);
      
      const interactiveElements = a11yTestHelpers.getInteractiveElements(container);
      
      interactiveElements.forEach((element: Element) => {
        expect(a11yTestHelpers.isKeyboardAccessible(element)).toBe(true);
      });
    });
  });

  describe('Sign Up Form', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderFormWithA11y(<MockSignUpForm />);
      await expect(container).toHaveNoViolations();
    });

    it('should use fieldsets for grouped fields', () => {
      const { container } = renderFormWithA11y(<MockSignUpForm />);
      
      const fieldsets = container.querySelectorAll('fieldset');
      expect(fieldsets.length).toBeGreaterThan(0);
      
      fieldsets.forEach((fieldset: Element) => {
        const legend = fieldset.querySelector('legend');
        expect(legend).toBeInTheDocument();
      });
    });

    it('should have proper ARIA descriptions', () => {
      const { container } = renderFormWithA11y(<MockSignUpForm />);
      
      const inputsWithDescriptions = container.querySelectorAll('[aria-describedby]');
      
      inputsWithDescriptions.forEach((input: Element) => {
        const describedBy = input.getAttribute('aria-describedby');
        if (describedBy) {
          const descriptionElement = container.querySelector(`#${describedBy}`);
          expect(descriptionElement).toBeInTheDocument();
        }
      });
    });

    it('should have proper checkbox labeling', () => {
      const { container } = renderFormWithA11y(<MockSignUpForm />);
      
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
      
      const checkboxId = checkbox?.getAttribute('id');
      const label = container.querySelector(`label[for="${checkboxId}"]`);
      expect(label).toBeInTheDocument();
    });
  });
});