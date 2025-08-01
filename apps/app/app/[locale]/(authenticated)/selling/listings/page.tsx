import { currentUser } from '@repo/auth/server';
import { CACHE_KEYS, getCacheService } from '@repo/database';
import { database } from '@repo/database';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import {
  buildCursorWhere,
  processPaginationResult,
  validatePaginationParams,
} from '@repo/ui/lib/pagination';
import { getDictionary } from '@repo/content/internationalization';
import { decimalToNumber } from '@repo/api/utils';
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { formatCurrency, formatNumber } from '@/lib/locale-format';
import { ListingsWithPagination } from './components/listings-with-pagination';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.dashboard.listings.title,
    description: dictionary.dashboard.listings.title,
  };
}

async function getCachedListingsData(
  userId: string,
  cursor?: string,
  limit = 20
) {
  const cache = getCacheService();

  return cache.remember(
    CACHE_KEYS.USER_LISTINGS(userId, cursor, limit),
    async () => {
      const [totalCount, products] = await Promise.all([
        database.product.count({
          where: { sellerId: userId },
        }),
        database.product.findMany({
          where: {
            sellerId: userId,
            ...buildCursorWhere(cursor),
          },
          include: {
            images: {
              orderBy: {
                displayOrder: 'asc',
              },
              take: 1,
            },
            category: true,
            _count: {
              select: {
                orders: true,
                favorites: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
        }),
      ]);

      return {
        products,
        totalCount,
        pagination: processPaginationResult(products, limit, totalCount),
      };
    },
    5 * 60, // 5 minutes TTL
    ['products', 'users']
  );
}

const MyListingsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  // Get database user with just ID for performance
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  });

  if (!dbUser) {
    // Create user if doesn't exist
    const newUser = await database.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
      select: { id: true },
    });

    // Return empty state for new user
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">My Listings</h1>
            <p className="text-muted-foreground">
              Manage your products and track their performance
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Parse pagination parameters
  const awaitedSearchParams = await searchParams;
  const searchParamsObj = new URLSearchParams();
  Object.entries(awaitedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      searchParamsObj.set(key, value);
    }
  });
  const pagination = validatePaginationParams(searchParamsObj);

  // Fetch cached listings data
  const {
    products,
    totalCount,
    pagination: paginationResult,
  } = await getCachedListingsData(
    dbUser.id,
    pagination.cursor,
    pagination.limit
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">My Listings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your products and track their performance
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/selling/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add New
          </Link>
        </Button>
      </div>

      <ListingsWithPagination
        dictionary={dictionary}
        initialData={paginationResult}
        locale={locale}
        userId={dbUser.id}
      />

      {/* Summary Stats */}
      {totalCount > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <p className="font-bold text-lg">{totalCount}</p>
                <p className="text-muted-foreground text-xs">Total Listings</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <p className="font-bold text-lg">
                  {products.filter((p) => p.status === 'AVAILABLE').length}
                </p>
                <p className="text-muted-foreground text-xs">Active</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <p className="font-bold text-lg">
                  {products.filter((p) => p.status === 'SOLD').length}
                </p>
                <p className="text-muted-foreground text-xs">Sold</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <p className="font-bold text-lg">
                  $
                  {(
                    products.reduce(
                      (sum, p) => sum + decimalToNumber(p.price),
                      0
                    ) / 100
                  ).toFixed(0)}
                </p>
                <p className="text-muted-foreground text-xs">Page Value</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyListingsPage;
