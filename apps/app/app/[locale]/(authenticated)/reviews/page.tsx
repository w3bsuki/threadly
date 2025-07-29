import { currentUser } from '@repo/auth/server';
import { cache } from '@repo/cache';
import { database } from '@repo/database';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import { getDictionary } from '@repo/internationalization';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Package, Star } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { Header } from '../components/header';
import { ReviewForm } from './components/review-form';

type UserInfo = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

const paramsSchema = z.object({
  locale: z.string(),
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return {
    title: 'Reviews',
    description: 'Manage your reviews and feedback',
  };
}

const ReviewsPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const rawParams = await params;
  const { locale } = paramsSchema.parse(rawParams);
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get database user
  const dbUser = await cache.remember(
    `user:${user.id}:reviews`,
    async () => {
      return database.user.findUnique({
        where: { clerkId: user.id },
      });
    },
    300
  );

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Get orders that can be reviewed (delivered orders without reviews)
  const ordersToReview = await cache.remember(
    `user:${dbUser.id}:orders-to-review`,
    async () => {
      return database.order.findMany({
        where: {
          buyerId: dbUser.id,
          status: 'DELIVERED',
          Review: null, // No review exists yet
        },
        include: {
          Product: {
            include: {
              seller: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    },
    60
  );

  // Get reviews I've written
  const myReviews = await cache.remember(
    `user:${dbUser.id}:my-reviews`,
    async () => {
      return database.review.findMany({
        where: {
          reviewerId: dbUser.id,
        },
        include: {
          Order: {
            include: {
              Product: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          User_Review_reviewedIdToUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    },
    300
  );

  // Get reviews I've received (as a seller)
  const receivedReviews = await cache.remember(
    `user:${dbUser.id}:received-reviews`,
    async () => {
      return database.review.findMany({
        where: {
          reviewedId: dbUser.id,
        },
        include: {
          User_Review_reviewerIdToUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          Order: {
            include: {
              Product: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    },
    300
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        className={`h-4 w-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-muted-foreground'
        }`}
        key={i}
      />
    ));
  };

  const getSellerName = (seller: UserInfo) => {
    if (seller.firstName && seller.lastName) {
      return `${seller.firstName} ${seller.lastName}`;
    }
    return seller.email;
  };

  const getBuyerName = (buyer: UserInfo) => {
    if (buyer.firstName && buyer.lastName) {
      return `${buyer.firstName} ${buyer.lastName}`;
    }
    return buyer.email;
  };

  return (
    <>
      <Header
        dictionary={dictionary}
        page="Reviews"
        pages={['Dashboard', 'Reviews']}
      />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="mb-6">
          <h1 className="font-bold text-2xl">Reviews</h1>
          <p className="text-muted-foreground">
            Manage your feedback and reviews
          </p>
        </div>

        {/* Orders Pending Review */}
        {ordersToReview.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Orders to Review</h2>
            <div className="grid gap-4">
              {ordersToReview.map((order) => (
                <ReviewForm
                  key={order.id}
                  orderId={order.id}
                  productTitle={order.Product.title}
                  sellerName={getSellerName(order.Product.seller)}
                />
              ))}
            </div>
          </div>
        )}

        {/* My Reviews (Reviews I've written) */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Reviews I've Written</h2>
          {myReviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  You haven't written any reviews yet.
                </p>
                <p className="mt-2 text-muted-foreground text-sm">
                  Complete some purchases to start leaving reviews!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myReviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {review.Order.Product.title}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                          Seller:{' '}
                          {getSellerName(review.User_Review_reviewedIdToUser)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <Badge variant="outline">{review.rating}/5</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-sm">{review.comment}</p>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Reviews I've Received (As a seller) */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Reviews I've Received</h2>
          {receivedReviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Star className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  You haven't received any reviews yet.
                </p>
                <p className="mt-2 text-muted-foreground text-sm">
                  Start selling items to receive feedback from buyers!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {receivedReviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {review.Order.Product.title}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                          From:{' '}
                          {getBuyerName(review.User_Review_reviewerIdToUser)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <Badge variant="outline">{review.rating}/5</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-sm">{review.comment}</p>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewsPage;
