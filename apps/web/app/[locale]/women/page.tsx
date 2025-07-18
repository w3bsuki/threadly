import { ProductGrid } from '../(home)/components/product-grid';
import { CategoryNav } from '../components/category-nav';

export default function WomenPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Category Navigation */}
      <CategoryNav
        category="women"
        description="Discover unique women's fashion from our community of sellers"
        title="Women's Fashion"
      />

      {/* Product Grid with Women's Filter */}
      <ProductGrid category="women" />
    </div>
  );
}
