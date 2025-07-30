import { a11yTestHelpers, renderNavigationWithA11y } from '@repo/tooling/testing/a11y';
import { describe, it } from 'vitest';
import '@repo/testing/a11y/axe-matchers';

// Mock navigation components
const MockMainNavigation = () => (
  <nav aria-label="Main navigation">
    <div>
      <a aria-current="page" href="/">
        <span className="sr-only">Threadly</span>
        <img alt="Threadly Logo" height="32" src="/logo.svg" width="32" />
      </a>
    </div>
    <ul>
      <li>
        <a aria-describedby="browse-desc" href="/browse">
          Browse
        </a>
        <div id="browse-desc">Browse all products</div>
      </li>
      <li>
        <a href="/categories">Categories</a>
      </li>
      <li>
        <a href="/sell">Sell</a>
      </li>
    </ul>
    <div>
      <button
        aria-controls="user-menu"
        aria-expanded="false"
        aria-label="User menu"
        type="button"
      >
        Account
      </button>
      <div hidden id="user-menu" role="menu">
        <a href="/profile" role="menuitem">
          Profile
        </a>
        <a href="/orders" role="menuitem">
          Orders
        </a>
        <a href="/settings" role="menuitem">
          Settings
        </a>
        <button role="menuitem" type="button">
          Sign Out
        </button>
      </div>
    </div>
  </nav>
);

const MockBreadcrumbs = () => (
  <nav aria-label="Breadcrumb">
    <ol>
      <li>
        <a href="/">Home</a>
      </li>
      <li>
        <span aria-hidden="true">/</span>
        <a href="/category/clothing">Clothing</a>
      </li>
      <li>
        <span aria-hidden="true">/</span>
        <a href="/category/clothing/tops">Tops</a>
      </li>
      <li>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Vintage T-Shirt</span>
      </li>
    </ol>
  </nav>
);

const MockSkipLinks = () => (
  <div>
    <a className="skip-link" href="#main-content">
      Skip to main content
    </a>
    <a className="skip-link" href="#main-navigation">
      Skip to navigation
    </a>
    <a className="skip-link" href="#footer">
      Skip to footer
    </a>
  </div>
);

const MockPageLayout = () => (
  <div>
    <MockSkipLinks />
    <header>
      <h1>Page Title</h1>
      <MockMainNavigation />
    </header>
    <main id="main-content">
      <MockBreadcrumbs />
      <h2>Section Heading</h2>
      <p>Main content goes here.</p>
    </main>
    <footer id="footer" role="contentinfo">
      <p>&copy; 2024 Threadly</p>
    </footer>
  </div>
);

describe('Navigation Accessibility', () => {
  describe('Main Navigation', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderNavigationWithA11y(<MockMainNavigation />);
      await expect(container).toHaveNoViolations();
    });

    it('should have proper navigation structure', () => {
      const { container } = renderNavigationWithA11y(<MockMainNavigation />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveAttribute('role', 'navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('should have accessible logo', () => {
      const { container } = renderNavigationWithA11y(<MockMainNavigation />);

      const logo = container.querySelector('img');
      expect(logo).toHaveAttribute('alt', 'Threadly Logo');
    });

    it('should have keyboard accessible menu items', () => {
      const { container } = renderNavigationWithA11y(<MockMainNavigation />);

      const menuButton = container.querySelector('[aria-controls="user-menu"]');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      expect(menuButton).toHaveAttribute('aria-label', 'User menu');

      const menu = container.querySelector('#user-menu');
      expect(menu).toHaveAttribute('role', 'menu');
    });

    it('should have current page indicator', () => {
      const { container } = renderNavigationWithA11y(<MockMainNavigation />);

      const currentPage = container.querySelector('[aria-current="page"]');
      expect(currentPage).toBeInTheDocument();
    });
  });

  describe('Breadcrumbs', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderNavigationWithA11y(<MockBreadcrumbs />);
      await expect(container).toHaveNoViolations();
    });

    it('should have proper breadcrumb structure', () => {
      const { container } = renderNavigationWithA11y(<MockBreadcrumbs />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');

      const list = container.querySelector('ol');
      expect(list).toHaveAttribute('role', 'list');
    });

    it('should indicate current page', () => {
      const { container } = renderNavigationWithA11y(<MockBreadcrumbs />);

      const currentPage = container.querySelector('[aria-current="page"]');
      expect(currentPage).toBeInTheDocument();
      expect(currentPage).toHaveTextContent('Vintage T-Shirt');
    });

    it('should hide decorative separators from screen readers', () => {
      const { container } = renderNavigationWithA11y(<MockBreadcrumbs />);

      const separators = container.querySelectorAll('[aria-hidden="true"]');
      expect(separators.length).toBeGreaterThan(0);

      separators.forEach((separator) => {
        expect(separator).toHaveTextContent('/');
      });
    });
  });

  describe('Skip Links', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderNavigationWithA11y(<MockSkipLinks />);
      await expect(container).toHaveNoViolations();
    });

    it('should have meaningful link text', () => {
      const { container } = renderNavigationWithA11y(<MockSkipLinks />);

      const skipLinks = container.querySelectorAll('.skip-link');

      skipLinks.forEach((link) => {
        expect(link.textContent).toMatch(/skip to/i);
        expect(link.getAttribute('href')).toMatch(/^#/);
      });
    });
  });

  describe('Page Layout', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderNavigationWithA11y(<MockPageLayout />);
      await expect(container).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', () => {
      const { container } = renderNavigationWithA11y(<MockPageLayout />);

      const headings = a11yTestHelpers.getHeadings(container);
      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();

      // H1 should come before H2
      const allHeadings = Array.from(headings);
      const h1Index = allHeadings.indexOf(h1!);
      const h2Index = allHeadings.indexOf(h2!);
      expect(h1Index).toBeLessThan(h2Index);
    });

    it('should have proper landmark roles', () => {
      const { container } = renderNavigationWithA11y(<MockPageLayout />);

      const main = container.querySelector('main');
      expect(main).toHaveAttribute('role', 'main');
      expect(main).toHaveAttribute('id', 'main-content');

      const footer = container.querySelector('footer');
      expect(footer).toHaveAttribute('role', 'contentinfo');
    });

    it('should have skip link targets', () => {
      const { container } = renderNavigationWithA11y(<MockPageLayout />);

      const skipLinks = container.querySelectorAll('.skip-link');

      skipLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href?.startsWith('#')) {
          const targetId = href.substring(1);
          const target = container.querySelector(`#${targetId}`);
          expect(target).toBeInTheDocument();
        }
      });
    });
  });
});
