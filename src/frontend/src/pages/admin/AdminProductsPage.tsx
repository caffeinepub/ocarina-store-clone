import { useState } from 'react';
import AdminRouteGuard from '../../components/auth/AdminRouteGuard';
import { useGetProducts, useAddProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../../backend';
import { ExternalBlob } from '../../backend';
import { formatPrice } from '../../lib/utils';

export default function AdminProductsPage() {
  const { data: products } = useGetProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    priceInCents: '',
    currency: 'USD',
    imageFile: null as File | null,
  });

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      priceInCents: '',
      currency: 'USD',
      imageFile: null,
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents.toString(),
      currency: product.currency,
      imageFile: null,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.priceInCents) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!editingProduct && !formData.imageFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      let imageBlob: ExternalBlob;

      if (formData.imageFile) {
        const arrayBuffer = await formData.imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(uint8Array);
      } else if (editingProduct) {
        imageBlob = editingProduct.image;
      } else {
        throw new Error('No image provided');
      }

      const product: Product = {
        id: editingProduct ? editingProduct.id : `product-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        priceInCents: BigInt(formData.priceInCents),
        currency: formData.currency,
        image: imageBlob,
      };

      if (editingProduct) {
        await updateProduct.mutateAsync(product);
        toast.success('Product updated successfully');
      } else {
        await addProduct.mutateAsync(product);
        toast.success('Product added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct.mutateAsync(productId);
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  return (
    <AdminRouteGuard>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (in cents) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.priceInCents}
                    onChange={(e) => setFormData({ ...formData, priceInCents: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Product Image {!editingProduct && '*'}</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, imageFile: e.target.files?.[0] || null })}
                    required={!editingProduct}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={addProduct.isPending || updateProduct.isPending}>
                    {addProduct.isPending || updateProduct.isPending ? 'Saving...' : editingProduct ? 'Update' : 'Add'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const imageUrl = product.image.getDirectURL();
              return (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="aspect-square overflow-hidden rounded-lg bg-muted mb-3">
                      <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                    <p className="text-lg font-bold">{formatPrice(Number(product.priceInCents), product.currency)}</p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No products yet. Add your first product to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminRouteGuard>
  );
}
