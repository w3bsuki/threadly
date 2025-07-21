import { Badge, Card, CardContent } from '@repo/design-system/components';
import { OptimizedImage } from '@repo/design-system/components/optimized-image';
import { formatCurrency } from '@repo/utils';
import Link from 'next/link';

interface OptimizedProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    brand?: string;
    size?: string;
    favoritesCount?: number;
    seller?: {
      name: string;
      location: string;
      rating: number;
    };
    createdAt: string;
  };
  priority?: boolean;
  index?: number;
}

export function OptimizedProductCard({
  product,
  priority = false,
  index = 0,
}: OptimizedProductCardProps) {
  // First 6 products get priority loading
  const shouldPrioritize = priority || index < 6;

  // Optimize image sizes based on viewport
  const imageSizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

  return (
    <Link
      className="group block"
      href={`/products/${product.id}`}
      prefetch={index < 3} // Prefetch first 3 products
    >
      <Card className="hover:-translate-y-0.5 overflow-hidden transition-all duration-200 hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <OptimizedImage
            alt={product.title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            fill
            priority={shouldPrioritize}
            quality={shouldPrioritize ? 90 : 75}
            sizes={imageSizes}
            src={product.images[0] || '/placeholder.jpg'}
          />
          {product.favoritesCount && product.favoritesCount > 0 && (
            <Badge
              className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm"
              variant="secondary"
            >
              ❤️ {product.favoritesCount}
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-1">
            <h3 className="line-clamp-1 font-medium transition-colors group-hover:text-primary">
              {product.title}
            </h3>

            <div className="flex items-baseline justify-between">
              <p className="font-semibold text-lg">
                {formatCurrency(product.price)}
              </p>
              {product.size && (
                <span className="text-muted-foreground text-sm">
                  {product.size}
                </span>
              )}
            </div>

            {product.brand && (
              <p className="text-muted-foreground text-sm">{product.brand}</p>
            )}

            {product.seller && (
              <div className="flex items-center justify-between pt-2 text-muted-foreground text-xs">
                <span className="truncate">{product.seller.location}</span>
                <span>{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
