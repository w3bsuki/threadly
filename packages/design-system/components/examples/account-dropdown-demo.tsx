'use client';

import { useState } from 'react';
import {
  AccountDropdown,
  MobileAccountDropdown,
} from '../navigation/account-dropdown';
import { Button } from '../ui/button';

export function AccountDropdownDemo() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
  };

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-4">
        <h2 className="font-bold text-2xl">Account Dropdown Component</h2>
        <p className="text-muted-foreground">
          A modern account dropdown component with smooth animations and
          mobile-friendly design.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex gap-4">
          <Button onClick={() => setIsSignedIn(!isSignedIn)} variant="outline">
            Toggle Sign In State (Currently:{' '}
            {isSignedIn ? 'Signed In' : 'Signed Out'})
          </Button>
          <Button onClick={() => setShowMobile(!showMobile)} variant="outline">
            {showMobile ? 'Show Desktop' : 'Show Mobile'} Version
          </Button>
        </div>

        <div className="flex items-center gap-8">
          <div className="space-y-2">
            <h3 className="font-medium text-muted-foreground text-sm">
              {showMobile ? 'Mobile' : 'Desktop'} Version
            </h3>
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
              {showMobile ? (
                <MobileAccountDropdown
                  isSignedIn={isSignedIn}
                  onSignOut={() => {
                    alert('Sign out clicked');
                    setIsSignedIn(false);
                  }}
                  user={isSignedIn ? mockUser : undefined}
                />
              ) : (
                <AccountDropdown
                  isSignedIn={isSignedIn}
                  onSignOut={() => {
                    alert('Sign out clicked');
                    setIsSignedIn(false);
                  }}
                  user={isSignedIn ? mockUser : undefined}
                />
              )}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <h3 className="font-medium text-muted-foreground text-sm">
              Features
            </h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Smooth fade and zoom animations</li>
              <li>
                • Proper touch targets for mobile (
                {showMobile ? '48px' : '40px'})
              </li>
              <li>• Clean, modern design with subtle hover states</li>
              <li>• Backdrop blur for premium feel</li>
              <li>• Destructive styling for sign out action</li>
              <li>• Accessible with keyboard navigation</li>
              <li>• Responsive with mobile-optimized variant</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 rounded-lg bg-muted/50 p-4">
          <h3 className="font-medium text-sm">Component States</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-2 font-medium text-muted-foreground text-xs">
                Signed In Menu Items
              </h4>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• User info (name & email)</li>
                <li>• Profile</li>
                <li>• Orders</li>
                <li>• Settings</li>
                <li>• Sign Out (destructive)</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-muted-foreground text-xs">
                Signed Out Menu Items
              </h4>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• Sign In</li>
                <li>• Create Account</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-lg bg-muted/30 p-4">
          <h3 className="font-medium text-sm">Usage Example</h3>
          <pre className="overflow-x-auto text-xs">
            {`import { AccountDropdown } from '@repo/ui/components/navigation';

<AccountDropdown
  isSignedIn={isSignedIn}
  user={{
    name: 'John Doe',
    email: 'john@example.com'
  }}
  locale="en"
  dictionary={{
    profile: 'Profile',
    orders: 'Orders',
    settings: 'Settings',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    createAccount: 'Create Account'
  }}
  onSignOut={() => handleSignOut()}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
