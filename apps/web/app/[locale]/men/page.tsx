import { ProductGrid } from '../(home)/components/product-grid';
import { CategoryNav } from '../components/category-nav';

export default function MenPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Category Navigation */}
      <CategoryNav
        category="men"
        description="Discover unique men's fashion from our community of sellers"
        title="Men's Fashion"
      />

      {/* Product Grid with Men's Filter */}
      <ProductGrid category="men" />
    </div>
  );
}
