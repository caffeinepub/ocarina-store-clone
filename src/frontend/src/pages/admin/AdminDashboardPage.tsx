import { useNavigate } from '@tanstack/react-router';
import AdminRouteGuard from '../../components/auth/AdminRouteGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Package, CreditCard } from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <AdminRouteGuard>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/admin/products' })}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Add, edit, and remove products</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Manage Products
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/admin/payments' })}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>Configure Stripe integration</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Payment Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
