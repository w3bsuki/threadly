import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Links */}
        <nav aria-label="Footer navigation" className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Threadly</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">About</Link></li>
              <li><Link href="/how-it-works" className="text-sm text-gray-600 hover:text-gray-900">How it works</Link></li>
              <li><Link href="/careers" className="text-sm text-gray-600 hover:text-gray-900">Careers</Link></li>
              <li><Link href="/press" className="text-sm text-gray-600 hover:text-gray-900">Press</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Discover</h3>
            <ul className="space-y-2">
              <li><Link href="/products?gender=women" className="text-sm text-gray-600 hover:text-gray-900">Women</Link></li>
              <li><Link href="/products?gender=men" className="text-sm text-gray-600 hover:text-gray-900">Men</Link></li>
              <li><Link href="/products?gender=kids" className="text-sm text-gray-600 hover:text-gray-900">Kids</Link></li>
              <li><Link href="/categories/home" className="text-sm text-gray-600 hover:text-gray-900">Home</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Selling</h3>
            <ul className="space-y-2">
              <li><Link href="/sell" className="text-sm text-gray-600 hover:text-gray-900">Sell now</Link></li>
              <li><Link href="/help/selling" className="text-sm text-gray-600 hover:text-gray-900">Selling guide</Link></li>
              <li><Link href="/help/fees" className="text-sm text-gray-600 hover:text-gray-900">Fees</Link></li>
              <li><Link href="/help/shipping" className="text-sm text-gray-600 hover:text-gray-900">Shipping</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Help</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-sm text-gray-600 hover:text-gray-900">Help centre</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">Contact us</Link></li>
              <li><Link href="/help/sizing" className="text-sm text-gray-600 hover:text-gray-900">Size guide</Link></li>
              <li><Link href="/help/returns" className="text-sm text-gray-600 hover:text-gray-900">Returns</Link></li>
            </ul>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4 md:mb-0">
            <Link href="/legal/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/legal/cookies" className="hover:text-gray-900">Cookies</Link>
          </div>
          
          <div className="text-sm text-gray-600">
            © 2024 Threadly. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
