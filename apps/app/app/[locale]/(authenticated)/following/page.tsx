import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components';
import { 
  Users, 
  UserPlus, 
  Star, 
  Package, 
  MessageCircle, 
  ExternalLink,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { FollowButton } from './components/follow-button';
import { getDictionary } from '@repo/internationalization';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  
  return {
    title: 'Following',
    description: 'Sellers and users you follow',
  };
}

const FollowingPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
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

  // Get users that current user is following
  const followingUsers = await database.follow.findMany({
    where: { followerId: dbUser.id },
    include: {
      following: {
        include: {
          _count: {
            select: {
              listings: { where: { status: 'AVAILABLE' } },
              receivedReviews: true,
            },
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Get recent items from followed users (feed)
  const followedUserIds = followingUsers.map(f => f.followingId);
  const feedItems = followedUserIds.length > 0 ? await database.product.findMany({
    where: {
      sellerId: { in: followedUserIds },
      status: 'AVAILABLE'
    },
    include: {
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          averageRating: true
        }
      },
      images: {
        take: 1,
        orderBy: { displayOrder: 'asc' }
      },
      category: { select: { name: true } },
      _count: {
        select: { favorites: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  }) : [];

  // Get suggested sellers (users not already followed)
  const topSellers = await database.user.findMany({
    where: {
      NOT: {
        OR: [
          { id: dbUser.id }, // Exclude current user
          { id: { in: followedUserIds } } // Exclude already followed users
        ]
      },
    },
    include: {
      _count: {
        select: {
          listings: { where: { status: 'AVAILABLE' } },
          receivedReviews: true,
        },
      },
      listings: {
        where: { status: 'AVAILABLE' },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { take: 1, orderBy: { displayOrder: 'asc' } },
          category: { select: { name: true } }
        }
      }
    },
    orderBy: [
      { averageRating: 'desc' },
      { joinedAt: 'desc' }
    ],
    take: 8
  });

  const getUserName = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email?.split('@')[0] || 'Unknown User';
  };

  const getInitials = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    const email = user.email?.split('@')[0] || 'U';
    return email[0]?.toUpperCase() || 'U';
  };

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  return (
    <>
      <Header pages={['Dashboard', 'Following']} page="Following" dictionary={dictionary} />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Following</h1>
            <p className="text-muted-foreground">
              Discover and follow sellers you love
            </p>
          </div>
          <Button asChild>
            <Link href="/browse">
              <Search className="h-4 w-4 mr-2" />
              Discover Sellers
            </Link>
          </Button>
        </div>

        {/* Feed from Followed Users */}
        {feedItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Latest from People You Follow</h2>
              <Badge variant="secondary">{feedItems.length} new items</Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {feedItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="aspect-square relative bg-muted">
                      {item.images[0] ? (
                        <img
                          src={item.images[0].imageUrl}
                          alt={item.title}
                          className="object-cover w-full h-full rounded-t-lg"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-black/50 text-white border-0">
                          {formatPrice(item.price.toNumber())}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium text-sm truncate mb-1">{item.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={item.seller.imageUrl || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(item.seller)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {getUserName(item.seller)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.category?.name}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {item._count.favorites}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Currently Following */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              People You Follow ({followingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {followingUsers.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No one followed yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start following sellers to see their latest items and updates
                </p>
                <Button asChild>
                  <Link href="/browse">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Find People to Follow
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {followingUsers.map((follow) => (
                  <div key={follow.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={follow.following.imageUrl || undefined} />
                      <AvatarFallback>
                        {getInitials(follow.following)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {getUserName(follow.following)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {follow.following._count.listings} items • 
                        {follow.following.averageRating && follow.following.averageRating > 0 
                          ? ` ${follow.following.averageRating.toFixed(1)} ⭐` 
                          : ' New seller'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/messages?user=${follow.following.id}`}>
                          <MessageCircle className="h-4 w-4" />
                        </Link>
                      </Button>
                      <FollowButton userId={follow.following.id} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggested Sellers */}
        {topSellers.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Discover New Sellers</h2>
              <Badge variant="secondary">
                {topSellers.length} recommendations
              </Badge>
            </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topSellers.map((seller) => (
              <Card key={seller.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarImage src={seller.imageUrl || undefined} />
                    <AvatarFallback className="text-lg">
                      {getInitials(seller)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{getUserName(seller)}</CardTitle>
                  
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {seller._count.listings} items
                    </div>
                    {seller.averageRating && seller.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {seller.averageRating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Recent Items Preview */}
                  {seller.listings.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <h4 className="text-sm font-medium">Recent Items</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {seller.listings.map((product) => (
                          <div key={product.id} className="aspect-square relative">
                            {product.images[0] ? (
                              <img
                                src={product.images[0].imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-md flex items-center justify-center">
                                <Package className="h-4 w-4 text-white opacity-80" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-md">
                              {formatPrice(product.price.toNumber())}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <FollowButton userId={seller.id} className="flex-1" />
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/messages?user=${seller.id}`}>
                        <MessageCircle className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/seller/${seller.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        )}

        {/* Follow Benefits */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Benefits of Following</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Package className="h-4 w-4" />
                <span>See new listings first</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Star className="h-4 w-4" />
                <span>Get notified of sales</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <MessageCircle className="h-4 w-4" />
                <span>Easier communication</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Users className="h-4 w-4" />
                <span>Discover similar styles</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Discover by Category</CardTitle>
            <p className="text-sm text-muted-foreground">
              Find sellers specializing in your favorite styles
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {['Women\'s Fashion', 'Men\'s Style', 'Designer Items', 'Vintage Finds'].map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  className="h-auto p-4 flex-col gap-2"
                  asChild
                >
                  <Link href={`/browse?category=${category.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Package className="h-6 w-6" />
                    <span className="text-sm">{category}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default FollowingPage;