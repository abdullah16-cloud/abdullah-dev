# Customer Account Frontend Architecture (Phase 7)

## 1. Overview & Security Foundation

> **CRITICAL SECURITY NOTE:**
> Frontend-only authentication is fundamentally insecure. In Phase 7, there is no real account database or backend session authority.
> - No fake sessions or tokens are created.
> - Passwords and personal data are never stored in `localStorage`, `sessionStorage`, or cookies.
> - Password state is wiped from memory immediately upon form submission.
> - Real password hashing (Argon2 / bcrypt), CSRF protection, and session cookie validation take place on the backend in Phase 9–10.

---

## 2. Pages & Route Architecture

| Route | Component | Access Control | Purpose |
|---|---|---|---|
| `/login` | `LoginPage.jsx` | Public | Customer login with accessible validation. Surfaces honest disconnected message upon submit. |
| `/register` | `RegisterPage.jsx` | Public | Account creation form (name, email, phone, password, terms agreement). No fake "account created" claims. |
| `/forgot-password` | `ForgotPasswordPage.jsx` | Public | Honest placeholder stating password reset will be connected in a later phase. |
| `/terms` | `TermsPage.jsx` | Public | Draft placeholder for legal terms before production launch. |
| `/privacy` | `PrivacyPage.jsx` | Public | Draft placeholder for privacy policy. |
| `/account` | `ProfilePage.jsx` | Protected | Customer profile editor (name, phone, default city, address, read-only email). |
| `/account/orders` | `OrderHistoryPage.jsx` | Protected | EmptyState when unfulfilled; renders `OrderList` when connected to live orders. |
| `/account/orders/:id` | `OrderDetailsPage.jsx` | Protected | Itemized order review with status timeline and delivery notes. |

---

## 3. Service Layer Contract (`src/services/authService.js`)

All functions in Phase 7 throw `NotConnectedError`. In Phase 9–10, backend engineers will implement these endpoints:

### `register(payload)`
- **Input:** `{ fullName: string, email: string, phone: string, password: string }`
- **Expected Backend Behavior:** Validate payload, hash password with Argon2, create user record, return session cookie.

### `login(payload)`
- **Input:** `{ email: string, password: string }`
- **Expected Backend Behavior:** Verify credentials, issue `httpOnly`, `Secure`, `SameSite=Lax` session cookie.

### `logout()`
- **Expected Backend Behavior:** Invalidate server session, clear session cookie.

### `getCurrentUser()`
- **Expected Backend Behavior:** Validate session cookie, return `{ id, fullName, email, phone, defaultCity, defaultAddress }`.

### `updateProfile(payload)`
- **Input:** `{ fullName, phone, defaultCity, defaultAddress }`
- **Expected Backend Behavior:** Persist user profile updates.

### `getMyOrders()`
- **Expected Backend Behavior:** Return array of order summaries `{ id, orderNumber, createdAt, status, totalPkr, itemsCount }`.

### `getMyOrderById(id)`
- **Expected Backend Behavior:** Return full order details `{ id, orderNumber, createdAt, status, paymentMethod, totalPkr, customer, items }`.

---

## 4. UI Preview Mode (Dev Only)

To review logged-in account layouts without a backend:
- Set `VITE_ACCOUNT_UI_PREVIEW=true` in `.env.local`.
- Guarded by `import.meta.env.DEV && import.meta.env.VITE_ACCOUNT_UI_PREVIEW === 'true'`.
- Production builds (`npm run build`) automatically ignore and strip this mode.

