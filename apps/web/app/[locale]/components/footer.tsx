import type { Dictionary } from '@repo/content/internationalization';
import Link from 'next/link';
import { RegionSelector } from './region-selector';

type FooterProps = {
  dictionary: Dictionary;
};

export const Footer = ({ dictionary }: FooterProps) => {
  return (
    <footer className="mt-16 border-gray-200 border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Main Footer Links */}
        <nav
          aria-label="Footer navigation"
          className="grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          <div>
            <h3 className="mb-3 font-semibold text-foreground">
              {dictionary.web.footer?.sections?.company || 'Threadly'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/contact"
                >
                  {dictionary.web.footer?.links?.about || 'About'}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/pricing"
                >
                  {dictionary.web.footer?.links?.howItWorks || 'How it works'}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/contact"
                >
                  {dictionary.web.footer?.links?.careers || 'Careers'}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/contact"
                >
                  {dictionary.web.footer?.links?.press || 'Press'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-foreground">
              {dictionary.web.footer?.sections?.discover || 'Discover'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/products?gender=women"
                >
                  {dictionary.web.footer?.links?.women || 'Women'}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/products?gender=men"
                >
                  {dictionary.web.footer?.links?.men || 'Men'}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/products?gender=kids"
                >
                  {dictionary.web.footer?.links?.kids || 'Kids'}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/categories/home"
                >
                  {dictionary.web.footer?.links?.home || 'Home'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-foreground">
              {dictionary.web.footer?.sections?.selling || 'Selling'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/pricing"
                >
                  {dictionary.web.footer?.links?.sellNow || 'Sell now'}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/pricing"
                >
                  {dictionary.web.footer?.links?.sellingGuide ||
                    'Selling guide'}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/pricing"
                >
                  {dictionary.web.footer?.links?.fees || 'Fees'}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/contact"
                >
                  {dictionary.web.footer?.links?.shipping || 'Shipping'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-foreground">
              {dictionary.web.footer?.sections?.help || 'Help'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/contact"
                >
                  {dictionary.web.footer?.links?.helpCentre || 'Help centre'}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/contact"
                >
                  {dictionary.web.footer?.links?.contactUs || 'Contact us'}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/contact"
                >
                  {dictionary.web.footer?.links?.sizeGuide || 'Size guide'}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href="/contact"
                >
                  {dictionary.web.footer?.links?.returns || 'Returns'}
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="mt-8 border-gray-200 border-t pt-8">
          {/* Region Selector */}
          <div className="mb-6 flex items-center justify-center">
            <RegionSelector showTrigger />
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 flex items-center space-x-4 text-muted-foreground text-sm md:mb-0">
              <Link className="hover:text-foreground" href="/legal/terms">
                {dictionary.web.footer?.links?.terms || 'Terms'}
              </Link>
              <Link className="hover:text-foreground" href="/legal/privacy">
                {dictionary.web.footer?.links?.privacy || 'Privacy'}
              </Link>
              <Link className="hover:text-foreground" href="/legal/cookies">
                {dictionary.web.footer?.links?.cookies || 'Cookies'}
              </Link>
            </div>

            <div className="text-muted-foreground text-sm">
              {dictionary.web.footer?.copyright ||
                '© 2024 Threadly. All rights reserved.'}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
