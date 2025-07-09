import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import type { Prisma } from '@repo/database';
import { logError } from '@repo/observability/server';
import { decimalToNumber } from '@repo/utils';
import { getDictionary } from '@repo/internationalization';
import { SimpleDashboard } from './components/simple-dashboard';

export async function DashboardPage({ locale }: { locale: string }) {
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    return null; // This should be handled by the layout auth check
  }

  // Get or create database user
  let dbUser;
  try {
    dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await database.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        },
        select: { id: true }
      });
    }
  } catch (error) {
    logError('Database error during user creation/lookup', error);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dictionary.dashboard.dashboard.title}</h1>
          <p className="text-muted-foreground">{dictionary.dashboard.dashboard.loadingAccount}</p>
        </div>
      </div>
    );
  }

  // Define types for the query results
  type OrderAggregateResult = Prisma.GetOrderAggregateType<{
    _sum: { amount: true };
    _count: true;
  }>;

  type RecentOrder = {
    id: string;
    amount: Prisma.Decimal | null;
    status: string;
    createdAt: Date;
    product: {
      id: string;
      title: string;
      images: {
        imageUrl: string;
      }[];
    };
  };

  // Simplified queries for better performance with error handling
  let activeListings = 0;
  let totalSales: OrderAggregateResult = { _sum: { amount: null }, _count: 0 };
  let recentOrders: RecentOrder[] = [];

  try {
    [activeListings, totalSales, recentOrders] = await Promise.all([
      database.product.count({
        where: {
          sellerId: dbUser.id,
          status: 'AVAILABLE'
        }
      }),
      database.order.aggregate({
        where: {
          sellerId: dbUser.id,
          status: 'DELIVERED'
        },
        _sum: { amount: true },
        _count: true
      }),
      database.order.findMany({
        where: {
          buyerId: dbUser.id
        },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true,
              images: {
                take: 1,
                orderBy: { displayOrder: 'asc' },
                select: {
                  imageUrl: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      })
    ]);
  } catch (error) {
    logError('Error fetching dashboard data', error);
    // Use default values if queries fail
  }

  // Simplified unread messages count - just set to 0 for now to avoid complex query
  const unreadMessages = 0;

  const totalRevenue = decimalToNumber(totalSales?._sum?.amount);
  const completedSales = totalSales?._count || 0;

  // Convert Decimal values to numbers for serialization
  const serializedOrders = recentOrders.map(order => ({
    ...order,
    amount: order.amount ? decimalToNumber(order.amount) : 0,
    createdAt: order.createdAt.toISOString(),
  }));

  return (
    <SimpleDashboard
      user={{
        id: user.id,
        firstName: user.firstName,
        imageUrl: user.imageUrl,
      }}
      dictionary={dictionary}
      metrics={{
        activeListings,
        totalRevenue,
        completedSales,
        unreadMessages
      }}
      recentOrders={serializedOrders as any}
    />
  );
}