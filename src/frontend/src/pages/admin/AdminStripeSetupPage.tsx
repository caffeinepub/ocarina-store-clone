import { useState, useEffect } from 'react';
import AdminRouteGuard from '../../components/auth/AdminRouteGuard';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStripeSetupPage() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfiguration = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');

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

    try {
      await setConfiguration.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      toast.success('Stripe configuration saved successfully');
      setSecretKey('');
    } catch (error) {
      console.error('Error saving Stripe configuration:', error);
      toast.error('Failed to save Stripe configuration');
    }
  };

  if (isLoading) {
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
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button type="submit" disabled={setConfiguration.isPending}>
                {setConfiguration.isPending ? 'Saving...' : isConfigured ? 'Update Configuration' : 'Save Configuration'}
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
      </div>
    </AdminRouteGuard>
  );
}
