import { Suspense } from 'react';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { MobileReviewForm } from '../components/mobile-review-form';
import { SwipeableReviews } from '../components/swipeable-reviews';
import { ReviewStats } from '../components/review-stats';
import { Button } from '@repo/design-system/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components';
import { ArrowLeft, Star, Package, Edit3 } from 'lucide-react';
import Link from 'next/link';

interface ReviewsPageProps {
  searchParams: Promise<{
    orderId?: string;
    tab?: 'write' | 'received' | 'given';
  }>;
}

export default async function MobileReviewsPage({ searchParams }: ReviewsPageProps) {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id }
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
        status: 'DELIVERED'
      },
      include: {
        Product: {
          include: {
            seller: true,
            images: {
              orderBy: { displayOrder: 'asc' },
              take: 1
            }
          }
        },
        Review: true
      }
    });

    if (!order) {
      redirect('/reviews/mobile');
    }

    if (order.Review) {
      redirect('/reviews/mobile?tab=given');
    }

    return (
      <MobileReviewForm
        orderId={order.id}
        productTitle={order.Product.title}
        productImage={order.Product.images[0]?.imageUrl}
        sellerName={`${order.Product.seller.firstName || ''} ${order.Product.seller.lastName || ''}`.trim() || 'Anonymous'}
        onSuccess={() => redirect('/reviews/mobile?tab=given')}
      />
    );
  }

  // Get orders pending review
  const pendingReviewOrders = await database.order.findMany({
    where: {
      buyerId: dbUser.id,
      status: 'DELIVERED',
      Review: null
    },
    include: {
      Product: {
        include: {
          seller: true,
          images: {
            orderBy: { displayOrder: 'asc' },
            take: 1
          }
        }
      }
    },
    orderBy: { deliveredAt: 'desc' }
  });

  // Get reviews written by user
  const givenReviews = await database.review.findMany({
    where: {
      reviewerId: dbUser.id
    },
    include: {
      User_Review_reviewedIdToUser: {
        select: {
          firstName: true,
          lastName: true,
          imageUrl: true
        }
      },
      Order: {
        include: {
          Product: {
            select: {
              title: true,
              images: {
                select: { imageUrl: true },
                orderBy: { displayOrder: 'asc' },
                take: 1
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Get reviews received as seller
  const receivedReviews = await database.review.findMany({
    where: {
      reviewedId: dbUser.id
    },
    include: {
      User_Review_reviewerIdToUser: {
        select: {
          firstName: true,
          lastName: true,
          imageUrl: true
        }
      },
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate review statistics
  const ratingDistribution = receivedReviews.reduce((acc, review) => {
    acc[review.rating as keyof typeof acc]++;
    return acc;
  }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  const stats = {
    totalReviews: receivedReviews.length,
    averageRating: dbUser.averageRating || 0,
    ratingDistribution,
    recentReviews: receivedReviews.slice(0, 3).map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      reviewer: review.User_Review_reviewerIdToUser
    }))
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Reviews</h1>
        </div>
      </div>

      <Tabs value={selectedTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-3 sticky top-[73px] z-10 rounded-none">
          <TabsTrigger value="write" asChild>
            <Link href="/reviews/mobile?tab=write" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              <span className="hidden sm:inline">Write</span>
              {pendingReviewOrders.length > 0 && (
                <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-[var(--radius-full)]">
                  {pendingReviewOrders.length}
                </span>
              )}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="received" asChild>
            <Link href="/reviews/mobile?tab=received" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Received</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="given" asChild>
            <Link href="/reviews/mobile?tab=given" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Given</span>
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="mt-0">
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-medium">Orders to Review</h2>
            
            {pendingReviewOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No orders pending review</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReviewOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/reviews/mobile?tab=write&orderId=${order.id}`}
                    className="block"
                  >
                    <div className="bg-card rounded-[var(--radius-lg)] border p-4 hover:border-primary/50 transition-colors">
                      <div className="flex gap-3">
                        {order.Product.images[0] && (
                          <div className="relative w-16 h-16 rounded-[var(--radius-lg)] overflow-hidden flex-shrink-0">
                            <img
                              src={order.Product.images[0].imageUrl}
                              alt={order.Product.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium line-clamp-1">{order.Product.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Sold by {order.Product.seller.firstName || 'Anonymous'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Delivered {order.deliveredAt && 
                              new Date(order.deliveredAt).toLocaleDateString()
                            }
                          </p>
                        </div>
                        <Button size="sm">
                          Review
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="received" className="mt-0">
          <div className="p-4 space-y-6">
            <ReviewStats stats={stats} />
            
            <div className="space-y-4">
              <h2 className="text-lg font-medium">All Reviews</h2>
              <SwipeableReviews
                reviews={receivedReviews.map(review => ({
                  id: review.id,
                  rating: review.rating,
                  comment: review.comment,
                  createdAt: review.createdAt,
                  reviewer: review.User_Review_reviewerIdToUser,
                  photos: [],
                  helpfulCount: 0,
                  helpful: undefined
                }))}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="given" className="mt-0">
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-medium">Reviews You've Written</h2>
            
            {givenReviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Edit3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>You haven't written any reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {givenReviews.map((review) => (
                  <div key={review.id} className="bg-card rounded-[var(--radius-lg)] border p-4">
                    <div className="flex items-start gap-3">
                      {review.Order.Product.images[0] && (
                        <div className="relative w-12 h-12 rounded-[var(--radius-lg)] overflow-hidden flex-shrink-0">
                          <img
                            src={review.Order.Product.images[0].imageUrl}
                            alt={review.Order.Product.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-sm line-clamp-1">
                          {review.Order.Product.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
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