import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../../components/header';
import { ProductDetailContent } from './components/product-detail-content';
import { getDictionary } from '@repo/internationalization';

interface ProductPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const dictionary = await getDictionary(locale);
  const product = await database.product.findFirst({
    where: {
      id,
      status: 'AVAILABLE',
    },
    include: {
      seller: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      images: {
        orderBy: { displayOrder: 'asc' },
        take: 1,
      },
    },
  });

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.title} - ${product.category.name}`,
    description: product.description,
  };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { locale, id } = await params;
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
  
  // Fetch product with all necessary details
  const product = await database.product.findFirst({
    where: {
      id,
      status: 'AVAILABLE',
    },
    include: {
      images: {
        orderBy: { displayOrder: 'asc' },
      },
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          averageRating: true,
          joinedAt: true,
          _count: {
            select: {
              listings: {
                where: {
                  status: 'SOLD',
                },
              },
            },
          },
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          parent: {
            select: {
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          favorites: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Check if current user has favorited this product
  const isFavorited = await database.favorite.findFirst({
    where: {
      userId: dbUser.id,
      productId: product.id,
    },
  });

  // Increment view count (don't wait for it)
  database.product.update({
    where: { id },
    data: {
      views: {
        increment: 1,
      },
    },
  }).catch(() => {
    // Ignore errors for view count
  });

  // Fetch similar products
  const similarProducts = await database.product.findMany({
    where: {
      categoryId: product.category.id,
      status: 'AVAILABLE',
      NOT: {
        id: product.id,
      },
    },
    include: {
      images: {
        orderBy: { displayOrder: 'asc' },
        take: 1,
      },
      seller: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    take: 6,
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get seller's other products
  const sellerProducts = await database.product.findMany({
    where: {
      sellerId: product.seller.id,
      status: 'AVAILABLE',
      NOT: {
        id: product.id,
      },
    },
    include: {
      images: {
        orderBy: { displayOrder: 'asc' },
        take: 1,
      },
    },
    take: 4,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <>
      <Header 
        pages={['Dashboard', 'Browse', 'Product']} 
        page={product.title}
        dictionary={dictionary}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ProductDetailContent
          product={product}
          currentUser={dbUser}
          isFavorited={!!isFavorited}
          similarProducts={similarProducts}
          sellerProducts={sellerProducts}
        />
      </div>
    </>
  );
};

export default ProductPage;