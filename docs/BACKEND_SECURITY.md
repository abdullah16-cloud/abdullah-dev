# Honda Bikes Store — Backend Security & Architecture Guide

This document outlines the security controls implemented in the Phase 9 Express + PostgreSQL backend, followed by documented system boundaries and known limitations.

---

## 1. Security Controls & Protections

| Threat Vector | Mitigation Strategy | Implementation Details |
|---|---|---|
| **SQL Injection** | Parameterized Queries | All queries use `$1, $2, ...` placeholders via `pg.Pool`. No user input is ever concatenated into SQL query strings. Sort keys are strictly checked against a whitelist. |
| **XSS & Token Theft** | `httpOnly` Session Cookie | JWT tokens are sent exclusively via an `httpOnly`, `SameSite=Lax` cookie (`honda_auth_token`). Tokens are never sent in JSON response bodies or accepted from `localStorage`. |
| **CSRF (Cross-Site Request Forgery)** | `SameSite=Lax` + Origin Guard | For state-changing methods (`POST`, `PUT`, `PATCH`, `DELETE`), `originCheck` middleware verifies the `Origin` / `Referer` against `CORS_ALLOWED_ORIGINS` and enforces `application/json`. |
| **Brute-Force & Denial-of-Service** | Tiered Rate Limiting & Body Limits | General IP limit (`100 req/15min`), strict auth limit (`10 req/15min`), and order creation limit (`5 req/15min`). Body size is strictly capped at `20kb`. |
| **Timing Attacks / User Enumeration** | Constant-Time Password Checks | When an unknown email attempts to log in, a pre-computed dummy bcrypt hash is compared so response timing is identical whether an email exists or not. Both wrong email and wrong password return identical generic error messages. |
| **Client Price Tampering** | Server-Side Authoritative Pricing | The server completely ignores any prices or totals sent by the client in `/api/orders`. Product prices are locked and read directly from the database inside a single SQL transaction. |
| **Concurrency / Overselling** | Atomic Inventory Conditional Updates | When inventory tracking is enabled (`track_inventory = true`), stock decrement executes `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND stock_quantity >= $1`. If concurrent orders exceed stock, the second request fails with 409 Conflict. |
| **Information Disclosure** | Centralized Error Masking | Stack traces, database connection strings, internal query fragments, and password hashes are never returned in HTTP responses. Server errors log to console only and return generic 500 error envelopes. |
| **Privilege Escalation** | Fresh Database User Verification | Protected routes re-verify `is_active` and user `role` from the database on every authenticated request. Deactivated accounts or demoted staff immediately lose access. |

---

## 2. Documented System Boundaries & Known Limitations

1. **No Real-Time JWT Revocation (No Sessions Table):**  
   Because the database schema does not currently include a `user_sessions` or token revocation blocklist table, logging out clears the client-side cookie, but cannot instantly invalidate the stateless JWT signature if an attacker captured the token beforehand.  
   *Mitigation:* Token expiration is kept short (`2h`), and user active status is checked from the database on every request. Stateful token revocation is planned for future backend enhancements.

2. **No Email Verification / Password Reset Flow:**  
   No SMTP server or email delivery provider (e.g. SendGrid, SES) is connected. In keeping with our zero-fabrication and transparency rules, `/api/auth/forgot-password` has not been implemented with fake emails or fake tokens.

3. **No Guest Order Tracking Endpoint:**  
   Orders placed by unauthenticated guests require phone confirmation by dealership staff. In Phase 9, there is no public guest order lookup endpoint to prevent order scraping via guessed order numbers.

4. **Cash on Delivery (COD) Exclusivity:**  
   Online credit card, debit card, or mobile wallet payment gateways (e.g. JazzCash, Nayapay) are not connected. All orders default to `'cod'`.

