import { useGetProducts } from '../hooks/useQueries';
import { useCartStore } from '../state/cart';
import { useNavigate } from '@tanstack/react-router';
import ProductCard from '../components/store/ProductCard';
import { toast } from 'sonner';
import type { Product } from '../backend';
import { Skeleton } from '../components/ui/skeleton';

export default function StorefrontPage() {
  const { data: products, isLoading } = useGetProducts();
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const handleViewDetails = (product: Product) => {
    navigate({ to: '/product/$productId', params: { productId: product.id } });
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to Ocarina Store</h1>
        <p className="text-muted-foreground">Discover our collection of quality products</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
