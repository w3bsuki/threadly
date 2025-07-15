import Link from 'next/link';
import { Card, CardContent } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { OptimizedImage } from '@repo/design-system/components/optimized-image';
import { formatCurrency } from '@repo/utils';

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

export function OptimizedProductCard({ product, priority = false, index = 0 }: OptimizedProductCardProps) {
  // First 6 products get priority loading
  const shouldPrioritize = priority || index < 6;
  
  // Optimize image sizes based on viewport
  const imageSizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

  return (
    <Link 
      href={`/products/${product.id}`}
      className="group block"
      prefetch={index < 3} // Prefetch first 3 products
    >
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
        <div className="aspect-square relative overflow-hidden bg-muted">
          <OptimizedImage
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.title}
            fill
            sizes={imageSizes}
            priority={shouldPrioritize}
            quality={shouldPrioritize ? 90 : 75}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
            <h3 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            
            <div className="flex items-baseline justify-between">
              <p className="text-lg font-semibold">
                {formatCurrency(product.price)}
              </p>
              {product.size && (
                <span className="text-sm text-muted-foreground">
                  {product.size}
                </span>
              )}
            </div>
            
            {product.brand && (
              <p className="text-sm text-muted-foreground">
                {product.brand}
              </p>
            )}
            
            {product.seller && (
              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
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