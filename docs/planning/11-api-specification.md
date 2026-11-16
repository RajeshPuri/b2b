# 12. API Specification

## 12.1 API Base Path and Versioning

- **Base URL**: `/api/v1/`
- **All endpoints** prefixed with `/api/v1/`
- **Version in response header**: `X-API-Version: 1`
- **Deprecation**: Follow semantic versioning, 12-month notice for deprecations

## 12.2 Consistent Response Format

### 12.2.1 Success Response
```typescript
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters?: Record<string, unknown>;
  };
  timestamp: string; // ISO 8601
  requestId: string; // UUID for tracing
}
```

### 12.2.2 Error Response
```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string; // e.g., 'VALIDATION_ERROR', 'AUTHORIZATION_ERROR', 'NOT_FOUND'
    message: string; // User-friendly message
    details?: Record<string, string[]>; // Field-specific errors
  };
  timestamp: string;
  requestId: string;
}
```

### 12.2.3 Union Type
```typescript
type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

## 12.3 API Groups and Endpoints

### 12.3.1 Authentication API (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-------------|
| POST | `/register` | User registration with business type selection | No |
| POST | `/login` | Email/password login | No |
| POST | `/verify-email` | Email verification (with token) | No |
| POST | `/reset-password` | Initiate password reset | No |
| POST | `/confirm-reset-password` | Reset password with token | No |
| POST | `/refresh-session` | Refresh session expiry | Yes (access) |
| POST | `/logout` | Invalidate session | Yes |
| GET | `/me` | Get current user profile with businesses | Yes |
| GET | `/businesses/my` | Get all businesses user belongs to | Yes |

### 12.3.2 Businesses API (`/api/v1/businesses`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | List businesses (with pagination/filter) | Yes | OWNER, MANAGER, SUPER_ADMIN |
| POST | `/` | Create new business | Yes | OWNER (must have seat) |
| GET | `/[id]` | Get business details | Yes | Owner of business, SUPER_ADMIN |
| PATCH | `/[id]` | Update business info | Yes | OWNER, SUPER_ADMIN |
| POST | `/[id]/verify` | Start/approve verification | SUPER_ADMIN only | SUPER_ADMIN |
| POST | `/[id]/suspend` | Suspend business | SUPER_ADMIN only | SUPER_ADMIN |
| POST | `/[id]/activate` | Reactivate business | SUPER_ADMIN only | SUPER_ADMIN |

### 12.3.3 Memberships API (`/api/v1/memberships`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | List business memberships | Yes | Any active user |
| POST | `/invite` | Invite user to business | Yes | OWNER, MANAGER |
| GET | `/[userId]` | Get user's membership details | Yes | User, SUPER_ADMIN |
| PATCH | `/[id]` | Update user role in business | Yes | OWNER, MANAGER |
| POST | `/[id]/suspend` | Suspend user membership | Yes | OWNER, SUPER_ADMIN |
| POST | `/[id]/activate` | Reactivate user membership | Yes | OWNER, SUPER_ADMIN |

### 12.3.4 Products API (`/api/v1/products`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | List products with filtering/pagination | Yes | Any authenticated |
| POST | `/` | Create product | Yes | OWNER, MANAGER (of wholesaler) |
| GET | `/[id]` | Get product details | Yes | Any authenticated |
| PATCH | `/[id]` | Update product | Yes | OWNER, MANAGER |
| POST | `/[id]/archive` | Archive product | Yes | OWNER, MANAGER |
| GET | `/[id]/variants` | Get product variants | Yes | Any authenticated |
| POST | `/[id]/variants` | Create variant | Yes | OWNER, MANAGER |

### 12.3.5 Variants API (`/api/v1/variants`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | List variants with filtering | Yes | Any authenticated |
| POST | `/` | Create variant | Yes | OWNER, MANAGER |
| GET | `/[id]` | Get variant details | Yes | Any authenticated |
| PATCH | `/[id]` | Update variant | Yes | OWNER, MANAGER |
| PATCH | `/[id]/price` | Update pricing only | Yes | OWNER, MANAGER |
| POST | `/[id]/toggle-status` | Toggle active/inactive | Yes | OWNER, MANAGER |

### 12.3.6 Inventory API (`/api/v1/inventory`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | List inventory with stock levels | Yes | OWNER, MANAGER, INVENTORY |
| POST | `/adjust` | Adjust stock quantity | Yes | OWNER, MANAGER |
| POST | `/movement` | Record stock movement | Yes | OWNER, MANAGER |
| GET | `/low-stock` | Get low-stock alerts | Yes | OWNER, MANAGER |
| GET | `/reservations` | List active reservations | Yes | OWNER, MANAGER |
| PATCH | `/[id]/release` | Release reservation | Yes | OWNER, MANAGER |

### 12.3.7 Cart API (`/api/v1/cart`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get current client cart | Yes | Client business member |
| POST | `/items` | Add item to cart | Yes | Client business member |
| PATCH | `/items/[variantId]` | Update item quantity | Yes | Client business member |
| DELETE | `/items/[variantId]` | Remove item from cart | Yes | Client business member |
| POST | `/clear` | Clear cart | Yes | Client business member |

### 12.3.8 Marketplace API (`/api/v1/marketplace`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/products` | Browse products from all eligible wholesalers | Yes (client) or Public |
| GET | `/products/[id]` | Get product detail with seller info | Yes (client) or Public |
| GET | `/categories` | List all categories | Yes (client) or Public |
| GET | `/search` | Product search with filters | Yes (client) or Public |
| GET | `/wholesalers/[id]` | Get wholesaler storefront | Yes (client) |

### 12.3.9 Enquiries API (`/api/v1/enquiries`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | List client's enquiries | Yes | Client business member |
| POST | `/` | Create new enquiry | Yes | Client business member |
| GET | `/[id]` | Get enquiry details | Yes | Enquiry participants |
| GET | `/[id]/messages` | List enquiry messages | Yes | Enquiry participants |
| POST | `/[id]/messages` | Send message in enquiry | Yes | Enquiry participants |
| POST | `/[id]/respond` | Send quotation response | Yes | Wholeseller business member |

### 12.3.10 Quotations API (`/api/v1/quotations`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | List quotations for business | Yes | Business member |
| POST | `/` | Create quotation (respond to enquiry) | Yes | Wholeseller business member |
| GET | `/[id]` | Get quotation details | Yes | Quotation participants |
| GET | `/[id]/items` | List quotation items | Yes | Quotation participants |
| PATCH | `/[id]/accept` | Accept quotation | Yes | Client business member |
| PATCH | `/[id]/reject` | Reject quotation | Yes | Client business member |
| POST | `/[id]/request-revision` | Request quotation revision | Yes | Client business member |
| PATCH | `/[id]/items/[itemId]` | Modify quotation item | Yes | Wholeseller business member |

### 12.3.11 Orders API (`/api/v1/orders`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | List orders for business | Yes | Business member |
| POST | `/from-quotation/[quotationId]` | Create order from quotation | Yes | Client business member |
| GET | `/[id]` | Get order details | Yes | Order participants |
| GET | `/[id]/items` | List order items | Yes | Order participants |
| PATCH | `/[id]/status` | Update order status | Yes | OWNER, MANAGER (wholesale) or Client (own orders, eligible) |
| POST | `/[id]/cancel` | Cancel order | Yes | Client (eligible) or OWNER, MANAGER |
| GET | `/[id]/shipment` | Get shipment details | Yes | Order participants |
| POST | `/[id]/shipment` | Create shipment record | Yes | OWNER, MANAGER |

### 12.3.12 Shipments API (`/api/v1/shipments`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | List shipments for business | Yes | Wholeseller business member |
| GET | `/[id]` | Get shipment details | Yes | Shipment participants |
| PATCH | `/[id]/status` | Update shipment status | Yes | OWNER, MANAGER |
| POST | `/[id]/add-tracking` | Add tracking info | Yes | OWNER, MANAGER |

### 12.3.13 Invoices API (`/api/v1/invoices`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | List invoices for business | Yes | Business member |
| POST | `/` | Create invoice | Yes | OWNER, MANAGER (wholesale) |
| GET | `/[id]` | Get invoice details | Yes | Invoice participants |
| GET | `/[id]/items` | List invoice items | Yes | Invoice participants |
| GET | `/[id]/pdf` | Generate and download PDF | Yes | Invoice participants |
| PATCH | `/[id]/mark-paid` | Mark invoice paid (manual) | Yes | OWNER, MANAGER (wholesale) or Client (own) |
| GET | `/overdue` | List overdue invoices | Yes | OWNER, MANAGER |

### 12.3.14 Payments API (`/api/v1/payments`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | List payments for business | Yes | Business member |
| POST | `/` | Record payment (online or manual) | Yes | OWNER, MANAGER (wholesale) or Client (own) |
| POST | `/webhook` | Payment gateway webhook endpoint | No (signed payload) | - |
| GET | `/[id]` | Get payment details | Yes | Payment participants |
| POST | `/[id]/allocate` | Allocate payment to invoice(s) | Yes | OWNER, MANAGER |
| GET | `/method-distribution` | Payment method breakdown report | Yes | OWNER, ACCOUNTANT |

### 12.3.15 Ledger API (`/api/v1/ledger`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/accounts` | List ledger accounts | Yes | OWNER, ACCOUNTANT |
| POST | `/accounts` | Create ledger account | Yes | OWNER, ACCOUNTANT |
| GET | `/entries` | List journal entries | Yes | OWNER, ACCOUNTANT |
| POST | `/entries` | Create journal entry | Yes | OWNER, ACCOUNTANT |
| GET | `/balance` | Get account balance | Yes | OWNER, ACCOUNTANT |
| GET | `/trial-balance` | Trial balance report | Yes | OWNER, ACCOUNTANT |
| GET | `/fiscal-periods` | List fiscal periods | Yes | OWNER, ACCOUNTANT |

### 12.3.16 Reports API (`/api/v1/reports`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/admin/dashboard` | Admin dashboard overview | SUPER_ADMIN only | SUPER_ADMIN |
| GET | `/wholesaler/dashboard` | Wholesaler dashboard data | Yes | OWNER, MANAGER |
| GET | `/client/dashboard` | Client dashboard data | Yes | Any client member |
| GET | `/sales/monthly` | Monthly sales report | Yes | OWNER, MANAGER |
| GET | `/purchases/monthly` | Monthly purchase report | Yes | Any client member |
| GET | `/inventory/valuation` | Inventory valuation report | Yes | OWNER, MANAGER |
| GET | `/receivables` | Accounts receivable aging | Yes | OWNER, ACCOUNTANT |
| GET | `/payables` | Accounts payable aging | Yes | Any client member |
| GET | `/export/csv` | Export data as CSV | Yes | Appropriate roles |
| GET | `/export/excel` | Export data as Excel | Yes | Appropriate roles |

### 12.3.17 Admin API (`/api/v1/admin`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/dashboard` | Platform overview stats | SUPER_ADMIN only | SUPER_ADMIN |
| GET | `/businesses` | List all businesses | SUPER_ADMIN only | SUPER_ADMIN |
| GET | `/businesses/[id]` | Get business details | SUPER_ADMIN only | SUPER_ADMIN |
| POST | `/businesses/[id]/verify` | Verify/reject business | SUPER_ADMIN only | SUPER_ADMIN |
| POST | `/businesses/[id]/suspend` | Suspend business | SUPER_ADMIN only | SUPER_ADMIN |
| GET | `/users` | List all users | SUPER_ADMIN only | SUPER_ADMIN |
| GET | `/users/[id]` | Get user details | SUPER_ADMIN only | SUPER_ADMIN |
| GET | `/audit-logs` | Platform audit logs | SUPER_ADMIN only | SUPER_ADMIN |
| GET | `/system-settings` | View system settings | SUPER_ADMIN only | SUPER_ADMIN |
| PATCH | `/system-settings` | Update system settings | SUPER_ADMIN only | SUPER_ADMIN |

## 12.4 Query Parameters (Standardized)

All list/pagination endpoints support:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `limit` | integer | 20 | Items per page (max 100) |
| `sortBy` | string | `createdAt` | Field to sort by |
| `sortOrder` | enum | `desc` | `asc` or `desc` |
| `search` | string | - | Full-text search (applies to name/description fields) |
| `filter[field]` | string | - | Filter by exact field value |
| `filter[field][gte]` | decimal/date | - | Greater than or equal |
| `filter[field][lte]` | decimal/date | - | Less than or equal |
| `filter[field][gt]` | decimal/date | - | Greater than |
| `filter[field][lt]` | decimal/date | - | Less than |
| `relations` | comma-separated | - | Prisma relations to eager load (e.g., `category,images`) |
| `fields` | comma-separated | - | Only return specified fields (projection) |

Example: `GET /api/v1/products?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=shirt&filter[categoryId]=uuid&fields=name,sku,price`

## 12.5 Request Validation

- **Zod schemas** for all request bodies and query parameters
- **Shared schemas** between client (RHF) and server
- **Validation error format**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fieldName": ["Error message"]
    }
  }
}
```
- **400 status** for validation errors
- **500 status** for unexpected server errors (with requestId for tracking)

## 12.6 Rate Limiting

| Endpoint Type | Max Requests | Window |
|--------------|-------------|--------|
| Auth (login/register) | 5 attempts | 15 minutes |
| General API | 100 requests | 1 minute per IP |
| Payment webhooks | 10 requests | 1 minute per IP (trusted) |
| File upload | 5 uploads | 5 minutes per user |
| Admin endpoints | 20 requests | 1 minute per IP (super admin only) |

- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: maximum requests
  - `X-RateLimit-Remaining`: remaining requests
  - `X-RateLimit-Reset`: timestamp when limit resets

## 12.7 Idempotency

- **Payment creation** and **order creation** support `Idempotency-Key` header
- Server stores `key` + `result` mapping
- Re-requests with same key return cached result (200 with same data)
- Keys expire after 30 days automatically
- Prevents duplicate payments from retried webhooks

## 12.8 File Upload API

### 12.8.1 Upload Endpoint
```
POST /api/v1/upload
```
- **Multipart/form-data**: `file`, `purpose` (product_image, invoice, document, profile, other), `businessId`, `filename` (optional)
- **Response**: `{ success: true, data: { fileId, s3Key, s3Url, expiresAt } }`
- **File type validation**: By MIME type per purpose
- **File size limits**: 
  - Product images: 10MB
  - Invoices/documents: 25MB
  - Profile docs: 5MB

### 12.8.2 Chunked Upload (for large files)
- Support resumable uploads
- Progress endpoint: `GET /api/v1/upload/[id]/progress`

## 12.9 WebSocket / Real-Time Events

Optional for future enhancements:
- `POST /api/v1/notifications/read` - Mark notification as read
- `GET /api/v1/notifications/unread-count` - Get unread count
- Real-time order status updates
- Real-time inventory low-stock alerts

## 12.10 API Documentation

- **OpenAPI 3.1 specification** generated from code annotations
- **Interactive docs** via Swagger UI at `/api/docs`
- **Authentication**: Bearer token from Auth.js session
- **Test endpoints** with API keys in development