import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@repo/design-system/components';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Plus, Edit, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { decimalToNumber } from '@repo/utils';

const title = 'My Listings';
const description = 'Manage your product listings';

export const metadata: Metadata = {
  title,
  description,
};

const MyListingsPage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get database user with just ID for performance
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true }
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
      select: { id: true }
    });
    
    // Return empty state for new user
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
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

  // Fetch user's products
  const products = await database.product.findMany({
    where: {
      sellerId: dbUser.id,
    },
    include: {
      images: {
        orderBy: {
          displayOrder: 'asc',
        },
        take: 1, // Only get the first image for listing view
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
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'SOLD':
        return 'bg-gray-100 text-gray-800';
      case 'RESERVED':
        return 'bg-blue-100 text-blue-800';
      case 'REMOVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'NEW_WITH_TAGS':
        return 'New with tags';
      case 'NEW_WITHOUT_TAGS':
        return 'New without tags';
      case 'VERY_GOOD':
        return 'Very good';
      case 'GOOD':
        return 'Good';
      case 'SATISFACTORY':
        return 'Satisfactory';
      default:
        return condition;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
          <p className="text-muted-foreground">
            Manage your products and track their performance
          </p>
        </div>
        <Button asChild>
          <Link href="/selling/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </Link>
        </Button>
      </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start selling by creating your first product listing
                </p>
                <Button asChild>
                  <Link href="/selling/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Listing
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  {product.images[0] ? (
                    <img
                      src={product.images[0].imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2">
                    <Badge className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white/90">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                    <p className="text-2xl font-bold">${(decimalToNumber(product.price) / 100).toFixed(2)}</p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{getConditionText(product.condition)}</span>
                      <span>{product.category.name}</span>
                    </div>
                    
                    {product.brand && (
                      <p className="text-sm text-muted-foreground">
                        Brand: {product.brand}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                      <span>{product._count.favorites} saves</span>
                      <span>Listed {new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/selling/listings/${product.id}/edit`}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/product/${product.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Summary Stats */}
        {products.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{products.length}</p>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.status === 'AVAILABLE').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.status === 'SOLD').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Sold</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    ${(products.reduce((sum, p) => sum + decimalToNumber(p.price), 0) / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
};

export default MyListingsPage;