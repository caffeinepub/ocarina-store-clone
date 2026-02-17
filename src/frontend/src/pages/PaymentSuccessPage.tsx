import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useCartStore } from '../state/cart';
import { useGetStripeSessionStatus } from '../hooks/useQueries';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const clearCart = useCartStore((state) => state.clearCart);

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  const { data: sessionStatus } = useGetStripeSessionStatus(sessionId);

  useEffect(() => {
    if (sessionStatus && sessionStatus.__kind__ === 'completed') {
      clearCart();
    }
  }, [sessionStatus, clearCart]);

  return (
    <div className="container py-12">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </p>
          {sessionStatus && sessionStatus.__kind__ === 'completed' && (
            <div className="text-sm text-muted-foreground">
              <p>Order ID: {sessionId}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button onClick={() => navigate({ to: '/' })} className="w-full">
            Continue Shopping
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
