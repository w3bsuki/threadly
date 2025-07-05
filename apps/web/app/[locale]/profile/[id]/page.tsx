import { database } from '@repo/database';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Star, MapPin, Package, Calendar, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  const user = await database.user.findUnique({
    where: { id },
    select: { firstName: true, lastName: true }
  });

  const name = user ? `${user.firstName} ${user.lastName}` : 'User Profile';

  return {
    title: `${name} - Threadly`,
    description: `View ${name}'s profile and products on Threadly marketplace.`
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;

  const user = await database.user.findUnique({
    where: { id },
    include: {
      listings: {
        where: { status: 'AVAILABLE' },
        include: {
          images: { take: 1 },
          _count: { select: { favorites: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 12
      },
      reviews: {
        include: {
          reviewer: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      _count: {
        select: {
          listings: true,
          reviews: true,
          followers: true,
          following: true
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous User';
  const joinDate = new Date(user.joinedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-semibold text-gray-600">
                    {fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
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
                      <span>({user._count.reviews} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href={`/messages?user=${user.id}`}>
                Message Seller
              </Link>
            </Button>
            <Button variant="outline">
              Follow
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{user._count.listings}</div>
              <div className="text-sm text-gray-600">Items Listed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{user._count.reviews}</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{user._count.followers}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{user._count.following}</div>
              <div className="text-sm text-gray-600">Following</div>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Listed Items</h2>
            {user.listings.length > 12 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/products?seller=${user.id}`}>
                  View All
                </Link>
              </Button>
            )}
          </div>
          
          {user.listings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items listed</h3>
                <p className="text-gray-600">This user hasn't listed any items yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {user.listings.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative bg-gray-100">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm truncate">{product.title}</h3>
                      <p className="text-lg font-bold text-gray-900">${Number(product.price)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {product.condition}
                        </Badge>
                        {product._count.favorites > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
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
        {user.reviews.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-6">Recent Reviews</h2>
            <div className="space-y-4">
              {user.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          by {review.reviewer.firstName} {review.reviewer.lastName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
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