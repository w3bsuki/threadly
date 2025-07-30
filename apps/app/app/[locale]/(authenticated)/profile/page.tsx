import { currentUser } from '@repo/auth/server';
import { getCacheService } from '@repo/database';
import { database } from '@repo/database';
import { decimalToNumber } from '@repo/api/utils';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ProfileContent } from './components/profile-content';

const paramsSchema = z.object({
  locale: z.string(),
});

const title = 'Profile Settings';
const description = 'Manage your account and marketplace preferences';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const rawParams = await params;
  paramsSchema.parse(rawParams);

  return {
    title,
    description,
  };
}

const ProfilePage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const rawParams = await params;
  paramsSchema.parse(rawParams);

  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get cached database user
  const cache = getCacheService();
  const dbUser = await cache.remember(
    `user-by-clerk-id:${user.id}`,
    async () => {
      return await database.user.findUnique({
        where: { clerkId: user.id },
      });
    },
    15 * 60,
    ['users']
  );

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Fetch cached user's marketplace data
  const stats = await cache.remember(
    `user-profile-stats:${dbUser.id}`,
    async () => {
      const [
        productsSold,
        totalEarnings,
        productsBought,
        totalSpent,
        activeListings,
        followersCount,
        followingCount,
      ] = await Promise.all([
        // Products sold count
        database.order.count({
          where: {
            sellerId: dbUser.id,
            status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
          },
        }),
        // Total earnings
        database.order.aggregate({
          where: {
            sellerId: dbUser.id,
            status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
          },
          _sum: { amount: true },
        }),
        // Products bought count
        database.order.count({
          where: {
            buyerId: dbUser.id,
            status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
          },
        }),
        // Total spent
        database.order.aggregate({
          where: {
            buyerId: dbUser.id,
            status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
          },
          _sum: { amount: true },
        }),
        // Active listings
        database.product.count({
          where: {
            sellerId: dbUser.id,
            status: 'AVAILABLE',
          },
        }),
        // Followers count
        database.follow.count({
          where: {
            followingId: dbUser.id,
          },
        }),
        // Following count
        database.follow.count({
          where: {
            followerId: dbUser.id,
          },
        }),
      ]);

      return {
        products_sold: productsSold,
        total_earnings: totalEarnings._sum?.amount
          ? decimalToNumber(totalEarnings._sum.amount)
          : 0,
        products_bought: productsBought,
        total_spent: totalSpent._sum?.amount
          ? decimalToNumber(totalSpent._sum.amount)
          : 0,
        active_listings: activeListings,
        followers_count: followersCount,
        following_count: followingCount,
      };
    },
    30 * 60, // 30 minutes TTL
    ['users', 'orders', 'products']
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and marketplace preferences
        </p>
      </div>

      <ProfileContent
        stats={stats}
        user={{
          id: user.id,
          emailAddresses: [
            { emailAddress: user.emailAddresses[0]?.emailAddress || '' },
          ],
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          username: user.username || undefined,
          imageUrl: user.imageUrl || undefined,
          createdAt: new Date(user.createdAt),
        }}
      />
    </div>
  );
};

export default ProfilePage;
