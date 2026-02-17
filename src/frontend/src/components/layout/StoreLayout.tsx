import { Outlet, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Store, Shield } from 'lucide-react';
import { useCartStore } from '../../state/cart';
import LoginButton from '../auth/LoginButton';
import ProfileSetupModal from '../auth/ProfileSetupModal';
import { useIsCallerAdmin, useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function StoreLayout() {
  const navigate = useNavigate();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            <Store className="h-6 w-6" />
            <span>Ocarina Store</span>
          </button>

          <nav className="flex items-center gap-6">
            {isAuthenticated && userProfile && (
              <span className="text-sm text-muted-foreground">
                Hello, {userProfile.name}
              </span>
            )}
            
            {isAdmin && (
              <button
                onClick={() => navigate({ to: '/admin' })}
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
              >
                <Shield className="h-4 w-4" />
                Admin
              </button>
            )}

            <button
              onClick={() => navigate({ to: '/cart' })}
              className="relative flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <LoginButton />
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-8 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Ocarina Store. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {showProfileSetup && <ProfileSetupModal />}
    </div>
  );
}
