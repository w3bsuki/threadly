import { ProductGrid } from '../(home)/components/product-grid';
import { CategoryNav } from '../components/category-nav';

export default function UnisexPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Category Navigation */}
      <CategoryNav
        category="unisex"
        description="Discover gender-neutral fashion pieces that work for everyone"
        title="Unisex Fashion"
      />

      {/* Product Grid with Unisex Filter */}
      <ProductGrid category="unisex" />
    </div>
  );
}
