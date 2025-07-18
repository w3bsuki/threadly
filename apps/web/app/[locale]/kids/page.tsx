import { ProductGrid } from '../(home)/components/product-grid';
import { CategoryNav } from '../components/category-nav';

export default function KidsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Category Navigation */}
      <CategoryNav
        category="kids"
        description="Discover unique kids' fashion from our community of sellers"
        title="Kids' Fashion"
      />

      {/* Product Grid with Kids' Filter */}
      <ProductGrid category="kids" />
    </div>
  );
}
