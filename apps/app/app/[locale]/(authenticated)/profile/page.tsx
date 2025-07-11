import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ProfileContent } from './components/profile-content';
import { decimalToNumber } from '@repo/utils';

const title = 'Profile Settings';
const description = 'Manage your account and marketplace preferences';

export const metadata: Metadata = {
  title,
  description,
};

const ProfilePage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get database user
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Fetch user's marketplace data using Prisma queries for SQLite compatibility
  const [productsSold, totalEarnings, productsBought, totalSpent, activeListings, followersCount, followingCount] = await Promise.all([
    // Products sold count
    database.order.count({
      where: {
        sellerId: dbUser.id,
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] }
      }
    }),
    // Total earnings
    database.order.aggregate({
      where: {
        sellerId: dbUser.id,
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] }
      },
      _sum: { amount: true }
    }),
    // Products bought count
    database.order.count({
      where: {
        buyerId: dbUser.id,
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] }
      }
    }),
    // Total spent
    database.order.aggregate({
      where: {
        buyerId: dbUser.id,
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] }
      },
      _sum: { amount: true }
    }),
    // Active listings
    database.product.count({
      where: {
        sellerId: dbUser.id,
        status: 'AVAILABLE'
      }
    }),
    // Followers count
    database.follow.count({
      where: {
        followingId: dbUser.id
      }
    }),
    // Following count
    database.follow.count({
      where: {
        followerId: dbUser.id
      }
    })
  ]);

  const stats = {
    products_sold: productsSold,
    total_earnings: totalEarnings._sum?.amount ? decimalToNumber(totalEarnings._sum.amount) : 0,
    products_bought: productsBought,
    total_spent: totalSpent._sum?.amount ? decimalToNumber(totalSpent._sum.amount) : 0,
    active_listings: activeListings,
    followers_count: followersCount,
    following_count: followingCount,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and marketplace preferences
        </p>
      </div>
      
      <ProfileContent 
        user={{
          id: user.id,
          emailAddresses: [{ emailAddress: user.emailAddresses[0]?.emailAddress || '' }],
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          username: user.username || undefined,
          imageUrl: user.imageUrl || undefined,
          createdAt: new Date(user.createdAt),
        }}
        stats={stats}
      />
    </div>
  );
};

export default ProfilePage;