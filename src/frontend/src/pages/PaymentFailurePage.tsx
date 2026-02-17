import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="container py-12">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Your payment was cancelled. No charges were made to your account.
          </p>
          <p className="text-sm text-muted-foreground">
            If you experienced any issues, please try again or contact support.
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button onClick={() => navigate({ to: '/cart' })} className="w-full">
            Return to Cart
          </Button>
          <Button onClick={() => navigate({ to: '/' })} variant="outline" className="w-full">
            Continue Shopping
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
