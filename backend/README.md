# Honda Bikes Store — Backend API

RESTful API backend for the unofficial Honda motorcycle e-commerce store in Pakistan.  
Built with Node.js, Express, PostgreSQL (`pg`), Zod validation, and JWT authentication via `httpOnly` cookies.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or later (Tested on Node.js v26.11.1).
- **npm**: v9.0.0 or later.
- **PostgreSQL**: v13+ (Optional for local development if running only Group A unit/middleware tests).

---

## 2. Installation & Quick Start

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create your local environment file from example template
cp .env.example .env

# 4. Start development server with auto-reload (Node native watch)
npm run dev

# 5. Run tests
npm test

# 6. Run linter and formatting checks
npm run lint
npm run format
```

---

## 3. Environment Variables Reference

Configure these in `backend/.env` (never commit `.env` to git):

| Variable | Description | Example / Default | Required in Production |
|---|---|---|---|
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` | Yes |
| `PORT` | HTTP port server listens on | `5000` | No (defaults to 5000) |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/honda_bikes_store` | Yes |
| `DB_POOL_MAX` | Maximum concurrent connections in pool | `10` | No |
| `JWT_SECRET` | Secret key for signing authentication JWTs | Random string (min 32 chars) | **Yes (Fails startup if weak/placeholder)** |
| `JWT_EXPIRES_IN` | Token validity duration | `2h` | No |
| `COOKIE_NAME` | Name of the authentication cookie | `honda_auth_token` | No |
| `COOKIE_SECURE` | Set `true` when running on HTTPS in production | `false` | Yes (in production) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend URLs | `http://localhost:5173,http://127.0.0.1:5173` | Yes |
| `DELIVERY_CHARGE_PKR` | Standard delivery fee in PKR (empty = unverified / confirmed before dispatch) | *(empty)* | No |
| `MAX_ITEMS_PER_ORDER` | Maximum distinct motorcycle items per order | `10` | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 minutes) | No |
| `RATE_LIMIT_MAX_REQUESTS` | General API request ceiling per IP | `100` | No |
| `AUTH_RATE_LIMIT_MAX_REQUESTS`| Strict ceiling for register/login per IP | `10` | No |
| `ORDER_RATE_LIMIT_MAX_REQUESTS`| Strict ceiling for order creation per IP | `5` | No |

---

## 4. Directory Structure Explanation

```text
backend/
├── package.json               # Independent package manifest (no frontend imports)
├── .env.example               # Placeholder template
├── .gitignore                 # Ignores .env and node_modules
├── eslint.config.js           # Modern ESLint configuration
├── .prettierrc                # Formatting standards
├── README.md                  # This file
├── src/
│   ├── server.js              # Server process entrypoint & graceful shutdown handlers
│   ├── app.js                 # Express app builder (configured with helmet, cors, json limit)
│   ├── config/
│   │   ├── env.js             # Zod environment validation (fails fast if secrets invalid)
│   │   └── constants.js       # Domain constants (roles, order statuses, sort keys)
│   ├── db/
│   │   ├── pool.js            # pg.Pool singleton with connection error handlers
│   │   └── transaction.js     # Reusable withTransaction() helper
│   ├── middleware/
│   │   ├── auth.js            # JWT verification & database active state verification
│   │   ├── requireRole.js     # RBAC role guard middleware
│   │   ├── errorHandler.js    # Centralized error mapping (prevents stack trace leaks)
│   │   ├── notFound.js        # Standard JSON 404 handler
│   │   ├── validate.js        # Zod validation middleware for body/query/params
│   │   ├── rateLimiters.js    # General, Auth, and Order rate limiters
│   │   └── originCheck.js     # CSRF Origin header guard for mutating requests
│   ├── routes/
│   │   ├── index.js           # Aggregated /api router
│   │   ├── health.routes.js   # /api/health
│   │   ├── catalog.routes.js  # /api/categories, /api/products
│   │   ├── auth.routes.js     # /api/auth (register, login, logout, me)
│   │   ├── orders.routes.js   # /api/orders (create, mine)
│   │   └── admin.routes.js    # /api/admin (protected products, inventory, orders)
│   ├── controllers/           # Thin controllers: extracts input, calls service, returns JSON
│   ├── services/              # Business logic, SQL queries, integer currency math
│   ├── validators/            # Zod input schemas matching frontend constraints
│   └── utils/
│       ├── AppError.js        # Operational error class
│       ├── asyncHandler.js    # Async exception wrapper
│       ├── response.js        # Standard { success, data, meta } formatter
│       ├── pricing.js         # Integer paisa currency math
│       └── normalize.js       # Phone & email sanitization
└── tests/
    ├── unit/                  # Group A tests (config, pricing, validators, originCheck, roles, middleware)
    └── integration/           # Group B tests (health check, database endpoints)
```

---

## 5. Troubleshooting Common Issues

### 1. `ECONNREFUSED 127.0.0.1:5432`
- **Cause:** PostgreSQL server is not running on your machine or is running on a different port.
- **Solution:** Verify your PostgreSQL service is started (`services.msc` on Windows or `docker ps`) and verify your `DATABASE_URL` in `.env`. Note that `/api/health` will return status `503` with `database: "down"` when the database is unreachable, but the application server stays online.

### 2. `FATAL: Environment validation failed: JWT_SECRET`
- **Cause:** `NODE_ENV=production` is set, but `JWT_SECRET` is shorter than 32 characters or still contains placeholder text.
- **Solution:** Provide a cryptographically secure random string with at least 32 characters in your `.env`.

### 3. `CORS request blocked by security policy`
- **Cause:** Your frontend is making requests from a domain or port not included in `CORS_ALLOWED_ORIGINS`.
- **Solution:** Add your frontend origin (e.g. `http://localhost:5173`) to the comma-separated `CORS_ALLOWED_ORIGINS` variable in `.env`.

### 4. `Auth Cookie Not Set / Missing in Browser`
- **Cause:** In local development without HTTPS, setting `COOKIE_SECURE=true` causes browsers to reject the cookie.
- **Solution:** Ensure `COOKIE_SECURE=false` in local development (`.env`). Only set `COOKIE_SECURE=true` when running under HTTPS.
