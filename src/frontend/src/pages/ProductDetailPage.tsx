import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetProducts } from '../hooks/useQueries';
import { useCartStore } from '../state/cart';
import { Button } from '../components/ui/button';
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatPrice } from '../lib/utils';

export default function ProductDetailPage() {
  const { productId } = useParams({ from: '/product/$productId' });
  const { data: products } = useGetProducts();
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const product = products?.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="container py-12">
        <p className="text-center text-muted-foreground">Product not found</p>
        <div className="text-center mt-4">
          <Button onClick={() => navigate({ to: '/' })} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Button>
        </div>
      </div>
    );
  }

  const imageUrl = product.image.getDirectURL();

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
  };

  return (
    <div className="container py-8">
      <Button onClick={() => navigate({ to: '/' })} variant="ghost" className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Store
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-3xl font-bold text-primary">
              {formatPrice(Number(product.priceInCents), product.currency)}
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button onClick={handleAddToCart} size="lg" className="w-full">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
