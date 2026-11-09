# Honda Bikes Store — REST API Documentation

Base URL: `/api`  
Content-Type: `application/json`  
Authentication: Session token stored in `httpOnly` cookie (`honda_auth_token`).

---

## 1. Field Mapping & Data Format Standards

### 1.1 Database (`snake_case`) to API (`camelCase`) Mapping
The database schema uses PostgreSQL standard `snake_case` while the frontend and JSON API use `camelCase`:

| Database Column | JSON API Property | Type | Description |
|---|---|---|---|
| `p.slug` | `id` / `slug` | `string` | Public motorcycle identifier (e.g. `'honda-cd-70'`) |
| `p.name` | `name` | `string` | Official model name |
| `c.slug` | `category` | `string` | Category slug (`'commuter'`, `'standard'`, `'sport'`) |
| `c.title` | `categoryTitle` | `string` | Display category title |
| `p.engine_cc` | `engineCc` | `number \| null` | Displacement in cc |
| `p.price_pkr` | `pricePkr` | `number \| null` | Price in Pakistani Rupees |
| `p.is_verified` | `isVerified` | `boolean` | Official data verification flag |
| `p.is_demo_data` | `isDemoData` | `boolean` | Unverified demo model indicator |
| `p.last_verified` | `lastVerified` | `string \| null` | ISO timestamp of verification |
| `p.track_inventory`| `trackInventory` | `boolean` | Whether stock levels are enforced |
| `p.stock_quantity` | `stockQuantity` | `number` | Warehouse inventory count |
| `o.order_number` | `orderNumber` | `string` | Public order booking reference (`PK-YYYYMMDD-XXXX`) |

### 1.2 Currency & Money Representation
- **Decision:** All monetary amounts (`pricePkr`, `subtotalPkr`, `deliveryFeePkr`, `totalPkr`) are returned as JSON `number` values (floats rounded to 2 decimals) or `null`.
- **Rationale:** The PostgreSQL driver (`pg`) returns `NUMERIC` columns as strings (e.g. `"157900.00"`). The service layer parses these strings into numbers or `null`. In integer math on the server, all monetary operations are calculated using paisas (`rupees * 100`) to completely eliminate floating-point precision errors.
- **Unverified Prices:** If a price or delivery charge is unverified, it is strictly returned as `null` with `isPriceFinal: false`.

---

## 2. Standard Response Envelope

### Success Response Format:
```json
{
  "success": true,
  "data": { ... },
  "meta": { ...optional pagination or metadata }
}
```

### Error Response Format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed. Please correct the highlighted errors.",
    "details": [
      {
        "field": "customer.phone",
        "message": "Enter a valid 11-digit Pakistani phone number (e.g. 03001234567)."
      }
    ]
  }
}
```

---

## 3. Endpoints Catalog

### 3.1 System Health

#### `GET /api/health`
Checks server and database availability. Never reveals connection strings.
- **Auth:** None (Public)
- **Status:** `200 OK` (when database is connected) or `503 Service Unavailable` (when database is down).
- **Response Example:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 128.45,
    "database": "up"
  }
}
```

---

### 3.2 Public Motorcycle Catalog

#### `GET /api/categories`
Retrieves all active motorcycle segments.
- **Auth:** None (Public)
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "commuter",
      "slug": "commuter",
      "title": "Commuter",
      "description": "Fuel-efficient daily riders.",
      "badgeText": "High Efficiency"
    }
  ]
}
```

#### `GET /api/products`
Lists products with URL-driven filtering, sorting, and pagination.
- **Auth:** None (Public)
- **Query Parameters:**
  - `search` (optional string): Case-insensitive search on name or category.
  - `category` (optional string): Category slug.
  - `availability` (optional string): `'in_stock' | 'out_of_stock' | 'coming_soon' | 'unknown'`.
  - `maxPrice` (optional number): Maximum price filter (excludes unpriced items).
  - `sort` (optional string): `'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'` (NULL prices always sorted last).
  - `page` (optional number, default 1).
  - `limit` (optional number, default 12, max 50).
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "honda-cd-70",
      "slug": "honda-cd-70",
      "name": "Honda CD 70",
      "category": "commuter",
      "engineCc": null,
      "pricePkr": null,
      "availability": "unknown",
      "isVerified": false,
      "isDemoData": true,
      "featured": true
    }
  ],
  "meta": {
    "total": 9,
    "page": 1,
    "limit": 12,
    "totalPages": 1
  }
}
```

#### `GET /api/products/:slug`
Fetches a single motorcycle model by slug. Returns 404 for unknown or deactivated models.
- **Auth:** None (Public)
- **Response:**
```json
{
  "success": true,
  "data": {
    "id": "honda-cd-70",
    "slug": "honda-cd-70",
    "name": "Honda CD 70",
    "category": "commuter",
    "categoryTitle": "Commuter",
    "engineCc": null,
    "pricePkr": null,
    "colors": [],
    "specs": {},
    "images": [],
    "availability": "unknown",
    "isVerified": false,
    "isDemoData": true,
    "featured": true,
    "trackInventory": false,
    "stockQuantity": 0
  }
}
```

---

### 3.3 Customer Authentication

#### `POST /api/auth/register`
Creates a customer account and sets `httpOnly` authentication cookie.
- **Auth:** None
- **Rate Limit:** Strict (10 requests per 15 minutes per IP).
- **Request Body:**
```json
{
  "fullName": "Ahmed Bilal",
  "email": "ahmed.bilal@example.com",
  "phone": "03001234567",
  "password": "SecretPassword123"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "fullName": "Ahmed Bilal",
      "email": "ahmed.bilal@example.com",
      "phone": "03001234567",
      "role": "customer",
      "city": null,
      "shippingAddress": null
    }
  }
}
```

#### `POST /api/auth/login`
Authenticates with email and password. Sets `httpOnly` cookie.
- **Auth:** None
- **Rate Limit:** Strict (10 requests per 15 minutes per IP).
- **Request Body:**
```json
{
  "email": "ahmed.bilal@example.com",
  "password": "SecretPassword123"
}
```
- **Response (200 OK):** Sets `Set-Cookie: honda_auth_token=...; HttpOnly; Path=/; SameSite=Lax`.

#### `POST /api/auth/logout`
Clears authentication cookie.
- **Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully."
  }
}
```

#### `GET /api/auth/me`
Retrieves current authenticated profile.
- **Auth:** Required (Customer or Admin)
- **Error if unauthenticated:** `401 UNAUTHORIZED`.

#### `PATCH /api/auth/me`
Updates customer profile (email is read-only).
- **Request Body:**
```json
{
  "fullName": "Ahmed Bilal Updated",
  "phone": "03009876543",
  "city": "Lahore",
  "shippingAddress": "Model Town, Block C"
}
```

---

### 3.4 Orders & Checkout (Cash on Delivery)

#### `POST /api/orders`
Submits a motorcycle booking request. Guest checkout is allowed; if logged in, order is automatically attached to user.
- **Rate Limit:** 5 requests per 15 minutes per IP.
- **Security Rule:** Ignores any client-sent prices, totals, or order statuses. All pricing and snapshots are evaluated from the database inside a single SQL transaction.
- **Request Body:**
```json
{
  "customer": {
    "fullName": "Tariq Mehmood",
    "phone": "03001234567",
    "email": "tariq@example.com",
    "city": "Lahore",
    "address": "Gulberg III, Street 5, House 14",
    "notes": "Please deliver during afternoon hours."
  },
  "items": [
    {
      "productSlug": "honda-cd-70",
      "selectedColor": "Red",
      "quantity": 1
    }
  ],
  "paymentMethod": "cod",
  "acceptedDealershipConfirmation": true
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "orderNumber": "PK-20261029-7812",
    "status": "pending",
    "items": [
      {
        "id": "1",
        "productName": "Honda CD 70",
        "productSlug": "honda-cd-70",
        "selectedColor": "Red",
        "unitPricePkr": null,
        "quantity": 1,
        "lineTotalPkr": null
      }
    ],
    "subtotalPkr": null,
    "deliveryChargePkr": null,
    "totalPkr": null,
    "isPriceFinal": false,
    "message": "Your order request has been received. The dealership will contact you to confirm price, delivery and registration details."
  }
}
```

#### `GET /api/orders/mine`
Retrieves authenticated customer's own order history.
- **Auth:** Required (Customer)
- **Response:** Paginated list of orders with item snapshots.

#### `GET /api/orders/mine/:orderNumber`
Fetches a single order belonging to the logged-in user.
- **Auth:** Required (Customer)
- **Security Note:** If the order exists but belongs to a different user, returns `404 NOT_FOUND` (never 403) to prevent order existence enumeration.

---

### 3.5 Admin Management Endpoints
*All admin endpoints require an authenticated user with `role = 'admin'`.*

- `GET /api/admin/products`: List all products including deactivated models.
- `POST /api/admin/products`: Create a new motorcycle model.
- `PATCH /api/admin/products/:id`: Update model fields.
- `POST /api/admin/products/:id/deactivate`: Soft-deactivate a product (`is_active = false`).
- `POST /api/admin/products/:id/reactivate`: Reactivate a product (`is_active = true`).
- `PATCH /api/admin/inventory/:id`: Update `stockQuantity` and toggle `trackInventory`.
- `GET /api/admin/orders`: List all orders across all customers with status filtering.
- `GET /api/admin/orders/:orderNumber`: Inspect order details, line items, and status transition history.
- `PATCH /api/admin/orders/:orderNumber/status`: Update order lifecycle status. Validates allowed state transitions (`pending` -> `confirmed` -> `dispatched` -> `delivered` / `cancelled`) and appends an audit record to `order_status_history`.

