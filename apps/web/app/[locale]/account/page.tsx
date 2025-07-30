import { UserButton } from '@repo/auth/auth/client';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { Button } from '@repo/ui/components';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

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
      ordersAsBuyer: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
      ordersAsSeller: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-bold text-3xl">My Account</h1>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Profile Section */}
          <div className="rounded-lg bg-card p-6">
            <h2 className="mb-4 font-semibold text-xl">Profile</h2>
            <div className="mb-4 flex items-center gap-4">
              <UserButton afterSignOutUrl={`/${locale}`} />
              <div>
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-muted-foreground text-sm">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Member since: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg bg-card p-6">
            <h2 className="mb-4 font-semibold text-xl">Quick Actions</h2>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href={`/${locale}/selling/new`}>Sell New Item</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/${locale}/orders`}>View Orders</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/${locale}/messages`}>Messages</Link>
              </Button>
            </div>
          </div>

          {/* Seller Status */}
          <div className="rounded-lg bg-card p-6">
            <h2 className="mb-4 font-semibold text-xl">Seller Status</h2>
            {dbUser?.SellerProfile ? (
              <div>
                <p className="mb-2 font-medium text-green-600 text-sm">
                  ✓ Active Seller
                </p>
                <p className="text-muted-foreground text-sm">
                  {dbUser.Product.length} active listings
                </p>
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link
                    href={
                      process.env.NEXT_PUBLIC_APP_URL + `/${locale}/dashboard`
                    }
                  >
                    Go to Seller Dashboard
                  </Link>
                </Button>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-muted-foreground text-sm">
                  Start selling on Threadly today!
                </p>
                <Button asChild className="w-full">
                  <Link href={`/${locale}/selling/new`}>Start Selling</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg bg-card p-6">
            <h2 className="mb-4 font-semibold text-xl">Recent Activity</h2>
            {dbUser &&
            (dbUser.ordersAsBuyer.length > 0 ||
              dbUser.ordersAsSeller.length > 0) ? (
              <div className="space-y-3">
                {dbUser.ordersAsBuyer.length > 0 && (
                  <div>
                    <p className="mb-2 font-medium text-sm">
                      Recent Purchases:
                    </p>
                    {dbUser.ordersAsBuyer.slice(0, 3).map((order) => (
                      <div
                        className="text-muted-foreground text-sm"
                        key={order.id}
                      >
                        Order #{order.orderNumber} - {order.status}
                      </div>
                    ))}
                  </div>
                )}
                {dbUser.ordersAsSeller.length > 0 && (
                  <div>
                    <p className="mb-2 font-medium text-sm">Recent Sales:</p>
                    {dbUser.ordersAsSeller.slice(0, 3).map((order) => (
                      <div
                        className="text-muted-foreground text-sm"
                        key={order.id}
                      >
                        Sale #{order.orderNumber} - {order.status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* Account Management */}
        <div className="mt-8 rounded-lg bg-card p-6">
          <h2 className="mb-4 font-semibold text-xl">Account Management</h2>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="outline">
              <Link href={`/${locale}/profile/${dbUser?.id || user.id}`}>
                View Public Profile
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/${locale}/favorites`}>My Favorites</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/${locale}/cart`}>Shopping Cart</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
