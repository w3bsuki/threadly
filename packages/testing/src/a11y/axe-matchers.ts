import { type AxeResults, run as axeRun } from 'axe-core';
import { expect } from 'vitest';

interface AxeMatchers<R = unknown> {
  toHaveNoViolations(): R;
  toPassA11yChecks(): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends AxeMatchers<T> {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

async function runAxeCheck(element: Element | string): Promise<AxeResults> {
  const context =
    typeof element === 'string'
      ? document.querySelector(element) || document.body
      : element;

  return await axeRun(context);
}

expect.extend({
  async toHaveNoViolations(element: Element | string) {
    const results = await runAxeCheck(element);

    const violations = results.violations;
    const violationCount = violations.length;

    if (violationCount === 0) {
      return {
        pass: true,
        message: () =>
          'Expected element to have accessibility violations, but found none',
      };
    }

    const violationDetails = violations
      .map((violation) => {
        const targets = violation.nodes.map((node) => node.target).join(', ');
        return `${violation.id}: ${violation.description} (${targets})`;
      })
      .join('\n');

    return {
      pass: false,
      message: () =>
        `Found ${violationCount} accessibility violation(s):\n${violationDetails}`,
    };
  },

  async toPassA11yChecks(element: Element | string) {
    const results = await runAxeCheck(element);

    const violations = results.violations;
    const violationCount = violations.length;

    if (violationCount === 0) {
      return {
        pass: true,
        message: () =>
          `Element passed all ${results.passes.length} accessibility checks`,
      };
    }

    const violationSummary = violations.map((violation) => ({
      rule: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.length,
    }));

    return {
      pass: false,
      message: () =>
        `Accessibility violations found:\n${JSON.stringify(violationSummary, null, 2)}`,
    };
  },
});

export { runAxeCheck };
