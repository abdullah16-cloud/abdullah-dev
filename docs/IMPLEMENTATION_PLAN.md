# Honda Bikes Store — Implementation Plan

Unofficial Honda motorcycle e-commerce website for Pakistan.

## Implementation Roadmap

| Phase | Phase Name | Description | Status |
|---|---|---|---|
| **Phase 1** | **Frontend Setup** | React + Vite app initialization, plain CSS design tokens, modern reset, semantic homepage shell, router setup, and quality tools (Vitest, ESLint, Prettier). | **Completed** |
| **Phase 2** | **Navbar & Layout** | Main navigation bar, footer, responsive mobile menu drawer, search bar, cart icon, account navigation, and core route shells. | **Completed** |
| **Phase 3** | **Homepage** | Complete 7-section homepage (Hero, Featured, Categories, Benefits, COD, FAQ, CTA), clean plain CSS, accessible accordions, and design tokens. | **Completed** |
| **Phase 4** | **Bike Catalog** | Dynamic catalog page (`/bikes`), URL-driven filters (search, category, availability, sort), debounced search, empty/loading/error states, and unit test suite. | **Completed** |
| **Phase 5** | **Product Details & Comparison** | Dedicated product page (`/bikes/:id`), specs table, image gallery, and multi-bike comparison tool. | Pending |
| **Phase 6** | **Cart & Checkout** | LocalStorage cart management, quantity adjustments, and booking request system. | Pending |
| **Phase 7** | **Customer Account Frontend** | Public auth pages (`/login`, `/register`, `/forgot-password`, `/terms`, `/privacy`), protected account area (`/account`, `/account/orders`, `/account/orders/:id`), honest disconnected messages, zero password persistence, and test suite. | **Completed** |
| **Phase 8** | **Database Design** | PostgreSQL schema design in separate `database/` directory, strict integrity constraints, unverified demo seed data matching frontend, constraint rejection tests, and architecture guide. | **Completed** |
| **Phase 9** | **Backend API** | REST API service (Express, pg, JWT httpOnly cookie, Zod validation, helmet, cors, originCheck), public catalog, customer auth, order checkout, admin management, and automated test suite. | **Completed** |
| **Phase 10** | **Integration & Launch** | Connecting frontend services to backend APIs, live session management, and deployment. | Upcoming |

---

## Phase 9 Deliverables Summary

- [x] Independent `backend/` directory with its own `package.json`, `.env.example`, ESLint, Prettier, and Vitest test runner (zero frontend imports).
- [x] Fail-fast environment configuration in `src/config/env.js` with Zod validation (strictly refusing production startup on missing/weak/placeholder `JWT_SECRET`).
- [x] Security middleware stack: Helmet, CORS allowlist with credentials, 20kb JSON body ceiling, tiered rate limiters (general, auth, orders), and CSRF Origin check guard.
- [x] Standardized API response format (`{ success, data, meta }` and `{ success: false, error: { code, message, details } }`) with centralized `errorHandler.js` masking stack traces and internal queries.
- [x] Public read-only catalog endpoints (`/api/categories`, `/api/products`, `/api/products/:slug`) with case-insensitive search, availability filters, safe sort whitelist (NULL prices sorted last), and pagination.
- [x] Customer authentication endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`) using secure `httpOnly` JWT cookies, timing-attack protection via dummy hash, and database active-state verification on every request.
- [x] Cash-on-Delivery order processing (`/api/orders`, `/api/orders/mine`, `/api/orders/mine/:orderNumber`) with single-transaction execution, server-authoritative price lookup (ignoring client prices), integer-safe money calculations, item snapshots, and atomic stock decrements.
- [x] Admin management endpoints (`/api/admin/products`, `/api/admin/inventory/:id`, `/api/admin/orders`, `/api/admin/orders/:orderNumber/status`) guarded by `authenticateJwt` and `requireRole('admin')`.
- [x] Automated test suite in `tests/`: Group A tests (config, pricing, validators, originCheck, requireRole, middleware 404/invalid JSON) 100% passing (21/21 tests); Group B integration tests marked NOT RUN due to absence of local PostgreSQL runtime.
- [x] Verified manual server startup and `/api/health` returning 503 degraded status without crashing or leaking connection details.
- [x] Comprehensive documentation in `backend/README.md`, `docs/API.md`, and `docs/BACKEND_SECURITY.md`.
- [x] Frontend verification: 48/48 frontend tests passing and production build passing in 406ms.

---

## Phase 8 Deliverables Summary

- [x] Separate `database/` directory containing only PostgreSQL scripts and documentation (no backend or frontend changes).
- [x] Production-ready schema in `database/schema.sql` wrapped in a single transaction with `BIGINT GENERATED ALWAYS AS IDENTITY` primary keys, `NUMERIC(12,2)` currency types, and `set_updated_at()` auto-update triggers.
- [x] Unverified reference seed data in `database/seed.sql` for categories and all 9 bike models matching `frontend/src/data/bikes.js` with unverified null prices/specs, `track_inventory = false`, zero fabricated data, and zero fake users/orders.
- [x] Integrity test suite in `database/tests/constraints_test.sql` executing inside a rollback transaction to verify rejection of negative prices, invalid phone numbers, invalid emails, and invalid order statuses.
- [x] Safe developer reset script in `database/scripts/reset_dev.sql` with prominent warnings.
- [x] Comprehensive architecture document in `docs/DATABASE_SCHEMA.md` with Mermaid ERD and design decisions.
- [x] Beginner-friendly guide in `database/README.md` explaining PostgreSQL concepts and CLI commands.
- [x] Explicit testing disclosure: Marked as **NOT TESTED ON LOCAL HOST** due to absence of local PostgreSQL/Docker runtime.

---

## Phase 7 Deliverables Summary

- [x] Abstracted service boundary in `src/services/authService.js` that throws `NotConnectedError` without making mock network calls.
- [x] Zero-persistence `AuthContext.jsx` with secure password handling (passwords are cleared from state on submission; never logged or saved to storage).
- [x] Tested account validation utilities in `src/utils/accountValidation.js` with honest strength hints and Pakistani mobile number validation.
- [x] Accessible `LoginPage.jsx` and `RegisterPage.jsx` featuring show/hide password toggles, accessible error summaries, and honest disconnected notices.
- [x] Protected account area with `ProtectedRoute.jsx`, `AccountLayout.jsx`, `ProfilePage.jsx`, `OrderHistoryPage.jsx`, and `OrderDetailsPage.jsx`.
- [x] Reusable order presentation components (`OrderCard.jsx`, `OrderList.jsx`, `OrderDetails.jsx`) with realistic status timeline (`pending`, `confirmed`, `dispatched`, `delivered`, `cancelled`).
- [x] Transparent legal and password reset placeholders (`TermsPage.jsx`, `PrivacyPage.jsx`, `ForgotPasswordPage.jsx`).
- [x] Optional development-only preview mode via `VITE_ACCOUNT_UI_PREVIEW=true` documented in `.env.example`.
- [x] Comprehensive documentation in `docs/ACCOUNT_FRONTEND.md` and `docs/IMAGE_GUIDE.md`.
