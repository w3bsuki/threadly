import Link from 'next/link';
import { CategoryCard } from './category-card';

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

type CategoryGridProps = {
  categories: CategoryWithCount[];
};

export const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryCard category={category} key={category.id} />
      ))}
    </div>
  );
};
