import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  _count: {
    Product: number;
  };
  other_Category: {
    id: string;
    name: string;
    slug: string;
    _count: {
      Product: number;
    };
  }[];
};

type CategoryCardProps = {
  category: CategoryWithCount;
};

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const totalProducts = category._count.Product + 
    category.other_Category.reduce((sum, sub) => sum + sub._count.Product, 0);

  return (
    <div className="group relative overflow-hidden rounded-[var(--radius-lg)] bg-background shadow-md hover:shadow-lg transition-shadow">
      <Link href={`/products?category=${category.slug}`}>
        <div className="aspect-[4/3] relative">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <span className="text-6xl font-bold text-blue-200">
                {category.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/30 transition-colors" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="font-semibold text-background text-lg">{category.name}</h3>
            <p className="text-background/90 text-sm">
              {totalProducts} {totalProducts === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
      </Link>
      
      {category.other_Category.length > 0 && (
        <div className="p-4 border-t border-border">
          <h4 className="font-medium text-foreground text-sm mb-2">Subcategories</h4>
          <div className="grid grid-cols-1 gap-1">
            {category.other_Category.slice(0, 3).map((sub) => (
              <Link
                key={sub.id}
                href={`/products?category=${sub.slug}`}
                className="flex items-center justify-between py-1 px-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <span>{sub.name}</span>
                <span className="flex items-center gap-1 text-xs">
                  {sub._count.Product}
                  <ChevronRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
            {category.other_Category.length > 3 && (
              <Link
                href={`/products?category=${category.slug}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium py-1 px-2"
              >
                +{category.other_Category.length - 3} more
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};