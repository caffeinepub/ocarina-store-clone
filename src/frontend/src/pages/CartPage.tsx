import { useCartStore } from '../state/cart';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { useCreateCheckoutSession } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { ShoppingItem } from '../backend';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const createCheckoutSession = useCreateCheckoutSession();

  const isAuthenticated = !!identity;
  const totalPrice = getTotalPrice();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to checkout');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const shoppingItems: ShoppingItem[] = items.map((item) => ({
        productName: item.product.name,
        productDescription: item.product.description,
        priceInCents: item.product.priceInCents,
        currency: item.product.currency,
        quantity: BigInt(item.quantity),
      }));

      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;

      const session = await createCheckoutSession.mutateAsync({
        items: shoppingItems,
        successUrl,
        cancelUrl,
      });

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (error) {
      // Enhanced error logging for debugging while maintaining user-friendly toast
      console.error('Checkout error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      toast.error('Failed to create checkout session');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-12 pb-8">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some products to get started!</p>
            <Button onClick={() => navigate({ to: '/' })}>Browse Products</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const imageUrl = item.product.image.getDirectURL();
            return (
              <Card key={item.product.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-muted">
                      <img
                        src={imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.product.description}
                      </p>
                      <p className="font-bold">
                        {formatPrice(Number(item.product.priceInCents), item.product.currency)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>
                      {formatPrice(
                        Number(item.product.priceInCents) * item.quantity,
                        item.product.currency
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice, items[0]?.product.currency || 'USD')}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                onClick={handleCheckout}
                className="w-full"
                size="lg"
                disabled={createCheckoutSession.isPending}
              >
                {createCheckoutSession.isPending ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
              {!isAuthenticated && (
                <p className="text-xs text-muted-foreground text-center">
                  You need to log in to checkout
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
