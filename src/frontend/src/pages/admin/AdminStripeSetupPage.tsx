import { useState, useEffect } from 'react';
import AdminRouteGuard from '../../components/auth/AdminRouteGuard';
import { useIsStripeConfigured, useSetStripeConfiguration, useGetPaymentMethodOptions, useSetPaymentMethodOptions } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Checkbox } from '../../components/ui/checkbox';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStripeSetupPage() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const { data: paymentMethodOptions, isLoading: isLoadingOptions } = useGetPaymentMethodOptions();
  const setConfiguration = useSetStripeConfiguration();
  const setPaymentMethods = useSetPaymentMethodOptions();

  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');
  
  // Payment method toggles
  const [allowCreditCards, setAllowCreditCards] = useState(true);
  const [allowCryptoPayments, setAllowCryptoPayments] = useState(false);
  const [allowCashApp, setAllowCashApp] = useState(false);
  const [allowDirectDebit, setAllowDirectDebit] = useState(false);

  // Load initial payment method options
  useEffect(() => {
    if (paymentMethodOptions) {
      setAllowCreditCards(paymentMethodOptions.allowCreditCards);
      setAllowCryptoPayments(paymentMethodOptions.allowCryptoPayments);
      setAllowCashApp(paymentMethodOptions.allowCashApp);
      setAllowDirectDebit(paymentMethodOptions.allowDirectDebit);
    }
  }, [paymentMethodOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretKey.trim()) {
      toast.error('Please enter your Stripe secret key');
      return;
    }

    const allowedCountries = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    if (allowedCountries.length === 0) {
      toast.error('Please enter at least one valid country code');
      return;
    }

    // Validate at least one payment method is selected
    if (!allowCreditCards && !allowCryptoPayments && !allowCashApp && !allowDirectDebit) {
      toast.error('Please select at least one payment method');
      return;
    }

    try {
      // Save Stripe configuration
      await setConfiguration.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries,
      });

      // Save payment method options
      await setPaymentMethods.mutateAsync({
        allowCreditCards,
        allowCryptoPayments,
        allowCashApp,
        allowDirectDebit,
      });

      toast.success('Stripe configuration saved successfully');
      setSecretKey('');
    } catch (error) {
      console.error('Error saving Stripe configuration:', error);
      toast.error('Failed to save Stripe configuration');
    }
  };

  if (isLoading || isLoadingOptions) {
    return (
      <AdminRouteGuard>
        <div className="container py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </AdminRouteGuard>
    );
  }

  return (
    <AdminRouteGuard>
      <div className="container py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Payment Settings</h1>

        {isConfigured ? (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Stripe is configured and ready to accept payments.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Stripe is not configured. Please set up your Stripe integration below.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Stripe Configuration</CardTitle>
            <CardDescription>
              Configure your Stripe integration to accept payments. You can find your secret key in your Stripe dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="secretKey">Stripe Secret Key *</Label>
                <Input
                  id="secretKey"
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="sk_test_..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your secret key will be stored securely on the backend
                </p>
              </div>

              <div>
                <Label htmlFor="countries">Allowed Countries *</Label>
                <Input
                  id="countries"
                  value={countries}
                  onChange={(e) => setCountries(e.target.value)}
                  placeholder="US,CA,GB"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated list of 2-letter country codes (e.g., US, CA, GB)
                </p>
              </div>

              <div className="space-y-4">
                <Label>Payment Methods *</Label>
                <p className="text-xs text-muted-foreground">
                  Select which payment methods to enable at checkout. At least one method must be selected.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="creditCards"
                      checked={allowCreditCards}
                      onCheckedChange={(checked) => setAllowCreditCards(checked === true)}
                    />
                    <Label htmlFor="creditCards" className="font-normal cursor-pointer">
                      Card (Credit & Debit Cards)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="crypto"
                      checked={allowCryptoPayments}
                      onCheckedChange={(checked) => setAllowCryptoPayments(checked === true)}
                    />
                    <Label htmlFor="crypto" className="font-normal cursor-pointer">
                      Cryptocurrency
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cashApp"
                      checked={allowCashApp}
                      onCheckedChange={(checked) => setAllowCashApp(checked === true)}
                    />
                    <Label htmlFor="cashApp" className="font-normal cursor-pointer">
                      Cash App
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="directDebit"
                      checked={allowDirectDebit}
                      onCheckedChange={(checked) => setAllowDirectDebit(checked === true)}
                    />
                    <Label htmlFor="directDebit" className="font-normal cursor-pointer">
                      AU Bank Account (AU direct debit)
                    </Label>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={setConfiguration.isPending || setPaymentMethods.isPending}
              >
                {(setConfiguration.isPending || setPaymentMethods.isPending) 
                  ? 'Saving...' 
                  : isConfigured ? 'Update Configuration' : 'Save Configuration'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Getting Your Stripe Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Log in to your Stripe Dashboard at stripe.com</p>
            <p>2. Navigate to Developers → API keys</p>
            <p>3. Copy your Secret key (starts with sk_test_ for test mode or sk_live_ for live mode)</p>
            <p>4. Paste it in the form above</p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Method Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Note: Payment method availability depends on your Stripe account configuration, currency, and customer location.</p>
            <p>• Cryptocurrency requires Stripe Crypto to be enabled on your account</p>
            <p>• Cash App is available for USD transactions in the US</p>
            <p>• AU Bank Account (direct debit) is available for AUD transactions in Australia</p>
            <p>If a payment method is not available for a transaction, Stripe will automatically hide it from the checkout page.</p>
          </CardContent>
        </Card>
      </div>
    </AdminRouteGuard>
  );
}
