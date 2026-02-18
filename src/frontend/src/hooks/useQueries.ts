import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, UserProfile, UserRole, StripeConfiguration, ShoppingItem, StripeSessionStatus, PaymentMethodOptions } from '../backend';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from './useInternetIdentity';

export function useGetProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const query = useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        // Handle authorization errors gracefully - treat as non-admin
        console.error('Admin check error:', error);
        return false;
      }
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  return {
    ...query,
    // When not authenticated, immediately return false without loading
    data: isAuthenticated ? query.data : false,
    isLoading: isAuthenticated ? (actorFetching || query.isLoading) : false,
  };
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
    },
  });
}

export function useGetPaymentMethodOptions() {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentMethodOptions>({
    queryKey: ['paymentMethodOptions'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaymentMethodOptions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetPaymentMethodOptions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: PaymentMethodOptions) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPaymentMethodOptions(options);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethodOptions'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ items, successUrl, cancelUrl }: { items: ShoppingItem[]; successUrl: string; cancelUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
        
        // Harden JSON parsing with better error handling
        let session: { id: string; url: string };
        try {
          session = JSON.parse(result) as { id: string; url: string };
        } catch (parseError) {
          throw new Error(`Failed to parse checkout session response: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`);
        }
        
        if (!session?.url || session.url.trim() === '') {
          throw new Error('Stripe session response missing valid url field');
        }
        
        return session;
      } catch (error) {
        // Re-throw with enhanced context for debugging
        if (error instanceof Error) {
          throw new Error(`Checkout session creation failed: ${error.message}`);
        }
        throw new Error('Checkout session creation failed with unknown error');
      }
    },
  });
}

export function useGetStripeSessionStatus(sessionId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<StripeSessionStatus | null>({
    queryKey: ['stripeSessionStatus', sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return null;
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}
