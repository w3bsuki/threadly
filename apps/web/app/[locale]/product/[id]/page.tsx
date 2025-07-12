import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { database } from "@repo/database";
import { ProductDetail } from "./components/product-detail";
import { generateProductStructuredData, generateBreadcrumbStructuredData } from "@repo/seo/structured-data";

// Static generation: Generate static params for most popular products
export async function generateStaticParams() {
  const products = await database.product.findMany({
    where: {
      status: "AVAILABLE",
    },
    orderBy: [
      { views: "desc" },
      { createdAt: "desc" }
    ],
    take: 100, // Generate static pages for top 100 products
    select: {
      id: true,
    }
  });

  return products.map((product) => ({
    id: product.id,
  }));
}

interface ProductPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await database.product.findFirst({
    where: {
      id,
      status: "AVAILABLE",
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
        orderBy: { displayOrder: "asc" },
        take: 1,
      },
    },
  });

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.title} - ${product.category.name} | Threadly`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images[0] ? [product.images[0].imageUrl] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description,
      images: product.images[0] ? [product.images[0].imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await database.product.findFirst({
    where: {
      id,
      status: "AVAILABLE",
    },
    include: {
      images: {
        orderBy: { displayOrder: "asc" },
      },
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          joinedAt: true,
          _count: {
            select: {
              listings: {
                where: {
                  status: "SOLD",
                },
              },
              followers: true,
            },
          },
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          parent: {
            select: {
              name: true,
              slug: true,
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

  // Increment view count
  await database.product.update({
    where: { id },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  // Fetch similar products
  const similarProducts = await database.product.findMany({
    where: {
      categoryId: product.category.id,
      status: "AVAILABLE",
      NOT: {
        id: product.id,
      },
    },
    include: {
      images: {
        orderBy: { displayOrder: "asc" },
        take: 1,
      },
      seller: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    take: 8,
    orderBy: {
      createdAt: "desc",
    },
  });

  // Generate structured data
  const productStructuredData = generateProductStructuredData({
    id: product.id,
    title: product.title,
    description: product.description,
    price: Number(product.price),
    condition: product.condition,
    brand: product.brand || undefined,
    size: product.size || undefined,
    color: product.color || undefined,
    images: product.images.map(image => ({
      imageUrl: image.imageUrl,
      alt: image.alt || undefined,
    })),
    seller: {
      firstName: product.seller.firstName || undefined,
      lastName: product.seller.lastName || undefined,
    },
    category: product.category,
  });

  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: 'https://threadly.com' },
    { name: 'Products', url: 'https://threadly.com/products' },
    { name: product.category.name, url: `https://threadly.com/products?category=${product.category.slug}` },
    { name: product.title, url: `https://threadly.com/product/${product.id}` },
  ]);

  // Transform product for component (keep null values as interface expects string | null)
  const transformedProduct = {
    ...product,
    price: Number(product.price),
  };

  // Transform similar products for component
  const transformedSimilarProducts = similarProducts.map(similar => ({
    ...similar,
    price: Number(similar.price),
  }));

  return (
    <>
      {/* Static structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      
      {/* PPR: Main product detail with loading fallback */}
      <Suspense fallback={<ProductDetailLoading />}>
        <ProductDetail
          product={transformedProduct}
          similarProducts={transformedSimilarProducts}
        />
      </Suspense>
    </>
  );
}

// PPR: Loading component for product detail
function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image loading skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted/20 animate-pulse rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted/20 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
        
        {/* Product info loading skeleton */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="h-8 bg-muted/20 animate-pulse rounded w-3/4" />
            <div className="h-6 bg-muted/20 animate-pulse rounded w-1/2" />
            <div className="h-4 bg-muted/20 animate-pulse rounded w-full" />
            <div className="h-4 bg-muted/20 animate-pulse rounded w-5/6" />
          </div>
          
          <div className="space-y-2">
            <div className="h-4 bg-muted/20 animate-pulse rounded w-1/3" />
            <div className="h-4 bg-muted/20 animate-pulse rounded w-1/4" />
            <div className="h-4 bg-muted/20 animate-pulse rounded w-1/2" />
          </div>
          
          <div className="h-12 bg-muted/20 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}