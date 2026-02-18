# Specification

## Summary
**Goal:** Let admins enable additional Stripe Checkout payment methods (card, cryptocurrency, Cash App, AU bank account/AU direct debit) and ensure checkout sessions use those settings.

**Planned changes:**
- Extend backend Stripe configuration to store enabled payment methods (card, cryptocurrency, Cash App, AU bank account) alongside existing secret key and allowed countries, and use these settings when creating Stripe Checkout Sessions.
- Add backend validation/error handling to clearly surface when an enabled payment method is unavailable for the Stripe account/region.
- Update the admin Payment Settings UI to include clear English toggles/checkboxes for the four payment methods, validate selection (at least one method or an explicit default behavior), and save via the existing `setStripeConfiguration` mutation with success/failure toasts.
- Ensure the storefront checkout flow uses the updated configuration and fails gracefully (user toast + useful logged error) if session creation fails due to ineligible/unsupported methods.

**User-visible outcome:** Admins can choose which Stripe payment methods are enabled (including crypto, Cash App, and AU direct debit), and buyers see eligible enabled methods on the hosted Stripe Checkout page during checkout.
