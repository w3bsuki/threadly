import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components';
import { ArrowLeft, Edit3, Package, Star } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { MobileReviewForm } from '../components/mobile-review-form';
import { ReviewStats } from '../components/review-stats';
import { SwipeableReviews } from '../components/swipeable-reviews';

interface ReviewsPageProps {
  searchParams: Promise<{
    orderId?: string;
    tab?: 'write' | 'received' | 'given';
  }>;
}

export default async function MobileReviewsPage({
  searchParams,
}: ReviewsPageProps) {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    redirect('/sign-in');
  }

  const params = await searchParams;
  const selectedTab = params.tab || 'write';
  const orderId = params.orderId;

  // If orderId is provided, show the review form
  if (orderId && selectedTab === 'write') {
    const order = await database.order.findUnique({
      where: {
        id: orderId,
        buyerId: dbUser.id,
        status: 'DELIVERED',
      },
      include: {
        Product: {
          include: {
            seller: true,
            images: {
              orderBy: { displayOrder: 'asc' },
              take: 1,
            },
          },
        },
        Review: true,
      },
    });

    if (!order) {
      redirect('/reviews/mobile');
    }

    if (order.Review) {
      redirect('/reviews/mobile?tab=given');
    }

    return (
      <MobileReviewForm
        onSuccess={() => redirect('/reviews/mobile?tab=given')}
        orderId={order.id}
        productImage={order.Product.images[0]?.imageUrl}
        productTitle={order.Product.title}
        sellerName={
          `${order.Product.seller.firstName || ''} ${order.Product.seller.lastName || ''}`.trim() ||
          'Anonymous'
        }
      />
    );
  }

  // Get orders pending review
  const pendingReviewOrders = await database.order.findMany({
    where: {
      buyerId: dbUser.id,
      status: 'DELIVERED',
      Review: null,
    },
    include: {
      Product: {
        include: {
          seller: true,
          images: {
            orderBy: { displayOrder: 'asc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { deliveredAt: 'desc' },
  });

  // Get reviews written by user
  const givenReviews = await database.review.findMany({
    where: {
      reviewerId: dbUser.id,
    },
    include: {
      User_Review_reviewedIdToUser: {
        select: {
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
      Order: {
        include: {
          Product: {
            select: {
              title: true,
              images: {
                select: { imageUrl: true },
                orderBy: { displayOrder: 'asc' },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get reviews received as seller
  const receivedReviews = await database.review.findMany({
    where: {
      reviewedId: dbUser.id,
    },
    include: {
      User_Review_reviewerIdToUser: {
        select: {
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate review statistics
  const ratingDistribution = receivedReviews.reduce(
    (acc, review) => {
      acc[review.rating as keyof typeof acc]++;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  );

  const stats = {
    totalReviews: receivedReviews.length,
    averageRating: dbUser.averageRating || 0,
    ratingDistribution,
    recentReviews: receivedReviews.slice(0, 3).map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      reviewer: review.User_Review_reviewerIdToUser,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background">
        <div className="flex items-center gap-3 p-4">
          <Link href="/dashboard">
            <Button className="h-8 w-8" size="icon" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="font-bold text-2xl">Reviews</h1>
        </div>
      </div>

      <Tabs className="flex-1" value={selectedTab}>
        <TabsList className="sticky top-[73px] z-10 grid w-full grid-cols-3 rounded-none">
          <TabsTrigger asChild value="write">
            <Link
              className="flex items-center gap-2"
              href="/reviews/mobile?tab=write"
            >
              <Edit3 className="h-4 w-4" />
              <span className="hidden sm:inline">Write</span>
              {pendingReviewOrders.length > 0 && (
                <span className="ml-1 rounded-[var(--radius-full)] bg-primary/10 px-1.5 py-0.5 text-primary text-xs">
                  {pendingReviewOrders.length}
                </span>
              )}
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="received">
            <Link
              className="flex items-center gap-2"
              href="/reviews/mobile?tab=received"
            >
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Received</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="given">
            <Link
              className="flex items-center gap-2"
              href="/reviews/mobile?tab=given"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Given</span>
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-0" value="write">
          <div className="space-y-4 p-4">
            <h2 className="font-medium text-lg">Orders to Review</h2>

            {pendingReviewOrders.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Package className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p>No orders pending review</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReviewOrders.map((order) => (
                  <Link
                    className="block"
                    href={`/reviews/mobile?tab=write&orderId=${order.id}`}
                    key={order.id}
                  >
                    <div className="rounded-[var(--radius-lg)] border bg-card p-4 transition-colors hover:border-primary/50">
                      <div className="flex gap-3">
                        {order.Product.images[0] && (
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[var(--radius-lg)]">
                            <img
                              alt={order.Product.title}
                              className="h-full w-full object-cover"
                              src={order.Product.images[0].imageUrl}
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-1 font-medium">
                            {order.Product.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Sold by{' '}
                            {order.Product.seller.firstName || 'Anonymous'}
                          </p>
                          <p className="mt-1 text-muted-foreground text-xs">
                            Delivered{' '}
                            {order.deliveredAt &&
                              new Date(order.deliveredAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm">Review</Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent className="mt-0" value="received">
          <div className="space-y-6 p-4">
            <ReviewStats stats={stats} />

            <div className="space-y-4">
              <h2 className="font-medium text-lg">All Reviews</h2>
              <SwipeableReviews
                reviews={receivedReviews.map((review) => ({
                  id: review.id,
                  rating: review.rating,
                  comment: review.comment,
                  createdAt: review.createdAt,
                  reviewer: review.User_Review_reviewerIdToUser,
                  photos: [],
                  helpfulCount: 0,
                  helpful: undefined,
                }))}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent className="mt-0" value="given">
          <div className="space-y-4 p-4">
            <h2 className="font-medium text-lg">Reviews You've Written</h2>

            {givenReviews.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Edit3 className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p>You haven't written any reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {givenReviews.map((review) => (
                  <div
                    className="rounded-[var(--radius-lg)] border bg-card p-4"
                    key={review.id}
                  >
                    <div className="flex items-start gap-3">
                      {review.Order.Product.images[0] && (
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[var(--radius-lg)]">
                          <img
                            alt={review.Order.Product.title}
                            className="h-full w-full object-cover"
                            src={review.Order.Product.images[0].imageUrl}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="line-clamp-1 font-medium text-sm">
                          {review.Order.Product.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground/30'
                              }`}
                              key={i}
                            />
                          ))}
                          <span className="ml-1 text-muted-foreground text-xs">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="mt-2 line-clamp-2 text-muted-foreground text-sm">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
