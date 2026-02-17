# Specification

## Summary
**Goal:** Make Internet Identity login enable full admin functionality end-to-end for the requester, with correct role/admin checks across backend and frontend.

**Planned changes:**
- Add/align backend canister methods used by the frontend for admin/role queries (e.g., `isCallerAdmin()` and `getCallerUserRole()`), ensuring safe behavior for anonymous callers.
- Support configuring an initial admin Principal at deploy-time (or equivalent configuration) and persist/reflect that principal in backend access-control state.
- Fix frontend integration so Internet Identity login correctly updates admin state: show Admin navigation only for admins and gate admin pages with clear “Authentication Required” / “Access Denied” states.

**User-visible outcome:** After logging in with Internet Identity, the configured admin principal sees the Admin link and can access admin pages (dashboard, products CRUD, Stripe setup), while logged-out users and non-admin users are blocked with appropriate messages.
