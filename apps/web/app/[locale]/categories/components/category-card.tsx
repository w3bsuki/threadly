import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  _count: {
    Product: number;
  };
  children: {
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
  const totalProducts =
    category._count.Product +
    category.children.reduce((sum, sub) => sum + sub._count.Product, 0);

  return (
    <div className="group relative overflow-hidden rounded-[var(--radius-lg)] bg-background shadow-md transition-shadow hover:shadow-lg">
      <Link href={`/products?category=${category.slug}`}>
        <div className="relative aspect-[4/3]">
          {category.imageUrl ? (
            <Image
              alt={category.name}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              src={category.imageUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <span className="font-bold text-6xl text-blue-200">
                {category.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-foreground/20 transition-colors group-hover:bg-foreground/30" />
          <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="font-semibold text-background text-lg">
              {category.name}
            </h3>
            <p className="text-background/90 text-sm">
              {totalProducts} {totalProducts === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
      </Link>

      {category.children.length > 0 && (
        <div className="border-border border-t p-4">
          <h4 className="mb-2 font-medium text-foreground text-sm">
            Subcategories
          </h4>
          <div className="grid grid-cols-1 gap-1">
            {category.children.slice(0, 3).map((sub) => (
              <Link
                className="flex items-center justify-between rounded px-2 py-1 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
                href={`/products?category=${sub.slug}`}
                key={sub.id}
              >
                <span>{sub.name}</span>
                <span className="flex items-center gap-1 text-xs">
                  {sub._count.Product}
                  <ChevronRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
            {category.children.length > 3 && (
              <Link
                className="px-2 py-1 font-medium text-blue-600 text-sm hover:text-blue-800"
                href={`/products?category=${category.slug}`}
              >
                +{category.children.length - 3} more
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
