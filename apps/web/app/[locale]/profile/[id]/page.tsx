import { database } from '@repo/database';
import {
  Badge,
  Button,
  Card,
  CardContent,
} from '@repo/design-system/components';
import { Calendar, Heart, MapPin, Package, Star } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AvatarImage, ProductImage } from '../../components/optimized-image';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const user = await database.user.findUnique({
    where: { id },
    select: { firstName: true, lastName: true },
  });

  const name = user ? `${user.firstName} ${user.lastName}` : 'User Profile';

  return {
    title: `${name} - Threadly`,
    description: `View ${name}'s profile and products on Threadly marketplace.`,
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;

  const user = await database.user.findUnique({
    where: { id },
    include: {
      Product: {
        where: { status: 'AVAILABLE' },
        include: {
          images: { take: 1 },
          _count: { select: { favorites: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      },
      Review_Review_reviewedIdToUser: {
        include: {
          User_Review_reviewerIdToUser: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: {
        select: {
          Product: true,
          Review_Review_reviewedIdToUser: true,
          Follow_Follow_followingIdToUser: true,
          Follow_Follow_followerIdToUser: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const fullName =
    `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous User';
  const joinDate = new Date(user.joinedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Profile Header */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                {user.imageUrl ? (
                  <AvatarImage
                    alt={fullName}
                    className="h-16 w-16"
                    src={user.imageUrl}
                    size={64}
                  />
                ) : (
                  <span className="font-semibold text-gray-600 text-xl">
                    {fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <h1 className="font-bold text-2xl text-gray-900">{fullName}</h1>

                <div className="mt-2 flex items-center gap-4 text-gray-600 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {joinDate}</span>
                  </div>

                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{user.location}</span>
                    </div>
                  )}

                  {user.averageRating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{user.averageRating.toFixed(1)}</span>
                      <span>
                        ({user._count.Review_Review_reviewedIdToUser} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href={`/messages?user=${user.id}`}>Message Seller</Link>
            </Button>
            <Button variant="outline">Follow</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="font-bold text-2xl text-gray-900">
                {user._count.Product}
              </div>
              <div className="text-gray-600 text-sm">Items Listed</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="font-bold text-2xl text-gray-900">
                {user._count.Review_Review_reviewedIdToUser}
              </div>
              <div className="text-gray-600 text-sm">Reviews</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="font-bold text-2xl text-gray-900">
                {user._count.Follow_Follow_followingIdToUser}
              </div>
              <div className="text-gray-600 text-sm">Followers</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="font-bold text-2xl text-gray-900">
                {user._count.Follow_Follow_followerIdToUser}
              </div>
              <div className="text-gray-600 text-sm">Following</div>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <section className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold text-xl">Listed Items</h2>
            {user.Product.length > 12 && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/products?seller=${user.id}`}>View All</Link>
              </Button>
            )}
          </div>

          {user.Product.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 font-medium text-gray-900 text-lg">
                  No items listed
                </h3>
                <p className="text-gray-600">
                  This user hasn't listed any items yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {user.Product.map((product) => (
                <Link href={`/product/${product.id}`} key={product.id}>
                  <Card className="transition-shadow hover:shadow-lg">
                    <div className="relative aspect-square bg-gray-100">
                      {product.images[0] ? (
                        <ProductImage
                          alt={product.title}
                          className="rounded-t-lg"
                          src={product.images[0].imageUrl}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-3">
                      <h3 className="truncate font-medium text-sm">
                        {product.title}
                      </h3>
                      <p className="font-bold text-gray-900 text-lg">
                        ${Number(product.price)}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge className="text-xs" variant="secondary">
                          {product.condition}
                        </Badge>
                        {product._count.favorites > 0 && (
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Heart className="h-3 w-3" />
                            {product._count.favorites}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        {user.Review_Review_reviewedIdToUser.length > 0 && (
          <section>
            <h2 className="mb-6 font-semibold text-xl">Recent Reviews</h2>
            <div className="space-y-4">
              {user.Review_Review_reviewedIdToUser.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              key={i}
                            />
                          ))}
                        </div>
                        <span className="text-gray-600 text-sm">
                          by {review.User_Review_reviewerIdToUser.firstName}{' '}
                          {review.User_Review_reviewerIdToUser.lastName}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700">{review.comment}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
