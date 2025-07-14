import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../components/header';
import { ReviewForm } from './components/review-form';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Star, Package, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getDictionary } from '@repo/internationalization';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  
  return {
    title: 'Reviews',
    description: 'Manage your reviews and feedback',
  };
}

const ReviewsPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Get database user
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id }
  });

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Get orders that can be reviewed (delivered orders without reviews)
  const ordersToReview = await database.order.findMany({
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

  // Get reviews I've written
  const myReviews = await database.review.findMany({
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

  // Get reviews I've received (as a seller)
  const receivedReviews = await database.review.findMany({
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getSellerName = (seller: any) => {
    if (seller.firstName && seller.lastName) {
      return `${seller.firstName} ${seller.lastName}`;
    }
    return seller.email;
  };

  const getBuyerName = (buyer: any) => {
    if (buyer.firstName && buyer.lastName) {
      return `${buyer.firstName} ${buyer.lastName}`;
    }
    return buyer.email;
  };

  return (
    <>
      <Header pages={['Dashboard', 'Reviews']} page="Reviews" dictionary={dictionary} />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">
            Manage your feedback and reviews
          </p>
        </div>

        {/* Orders Pending Review */}
        {ordersToReview.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Orders to Review</h2>
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
          <h2 className="text-lg font-semibold">Reviews I've Written</h2>
          {myReviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  You haven't written any reviews yet.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete some purchases to start leaving reviews!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myReviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {review.Order.Product.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Seller: {getSellerName(review.User_Review_reviewedIdToUser)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <Badge variant="outline">
                          {review.rating}/5
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">{review.comment}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Reviews I've Received (As a seller) */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Reviews I've Received</h2>
          {receivedReviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  You haven't received any reviews yet.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start selling items to receive feedback from buyers!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {receivedReviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {review.Order.Product.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          From: {getBuyerName(review.User_Review_reviewerIdToUser)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <Badge variant="outline">
                          {review.rating}/5
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">{review.comment}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
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