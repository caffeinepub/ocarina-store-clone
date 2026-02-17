# Specification

## Summary
**Goal:** Recreate the referenced Ocarina store storefront with a Motoko-backed product catalog, add Stripe Checkout purchasing for authenticated users, and provide an admin role with admin-only product management.

**Planned changes:**
- Rebuild the storefront UI to match the referenced store’s core browsing and purchase-start interactions (product list/grid, product details or equivalent, cart/order summary).
- Add Motoko backend canister query methods to list products and fetch product details by stable product id; wire the frontend to load catalog data from the backend.
- Implement Stripe Checkout flow for authenticated users: create checkout session from cart items, redirect to Stripe, handle success/cancel return pages, and store order records in the backend (including purchaser principal, line items, totals, Stripe session id, payment status).
- Add admin role with configurable initial admin Principal; enforce admin-only access in backend and hide/disable admin UI for non-admin users.
- Provide admin UI for product CRUD and price updates, persisted via backend methods.
- Apply a coherent store theme (non-blue/purple primary palette) consistently across storefront, cart/checkout, and admin pages.

**User-visible outcome:** Users can browse products loaded from the backend, add items to a cart, and complete payment through Stripe Checkout with clear success/cancel pages; the configured admin can sign in with Internet Identity and manage products and prices via an admin-only interface.
