import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { Button } from '@repo/design-system/components';
import { UserButton } from '@repo/auth/client';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account - Threadly',
  description: 'Manage your Threadly account',
};

interface AccountPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params;
  const user = await currentUser();
  
  if (!user) {
    redirect(`/${locale}/sign-in?from=/${locale}/account`);
  }
  
  // Get user data from database
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    include: {
      SellerProfile: true,
      Product: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
      Order_Order_sellerIdToUser: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Profile Section */}
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="flex items-center gap-4 mb-4">
              <UserButton afterSignOutUrl={`/${locale}`} />
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-muted-foreground">{user.emailAddresses[0]?.emailAddress}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Member since: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href={`/${locale}/selling/new`}>
                  Sell New Item
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/${locale}/orders`}>
                  View Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/${locale}/messages`}>
                  Messages
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Seller Status */}
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Seller Status</h2>
            {dbUser?.SellerProfile ? (
              <div>
                <p className="text-sm text-green-600 font-medium mb-2">✓ Active Seller</p>
                <p className="text-sm text-muted-foreground">
                  {dbUser.Product.length} active listings
                </p>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href={process.env.NEXT_PUBLIC_APP_URL + `/${locale}/dashboard`}>
                    Go to Seller Dashboard
                  </Link>
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Start selling on Threadly today!
                </p>
                <Button asChild className="w-full">
                  <Link href={`/${locale}/selling/new`}>
                    Start Selling
                  </Link>
                </Button>
              </div>
            )}
          </div>
          
          {/* Recent Activity */}
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            {dbUser?.Order_Order_sellerIdToUser && dbUser.Order_Order_sellerIdToUser.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Recent Orders:</p>
                {dbUser.Order_Order_sellerIdToUser.map((order) => (
                  <div key={order.id} className="text-sm text-muted-foreground">
                    Order #{order.id.slice(-8)} - {order.status}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
        </div>
        
        {/* Account Management */}
        <div className="mt-8 bg-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Management</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <Link href={`/${locale}/profile/${user.id}`}>
                View Public Profile
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/favorites`}>
                My Favorites
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/cart`}>
                Shopping Cart
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}