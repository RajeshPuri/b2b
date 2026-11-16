# 05. Application Architecture

## 5.1 Overall Architecture Pattern

### 5.1.1 Modular Monolith
- Single application codebase serving all users (admin, wholesalers, clients)
- Modules separated by feature area, not by technology layer
- Shared database, shared deployment, shared infrastructure
- Each module has clear boundaries and interfaces
- Advantages: simpler deployment, shared context, easier debugging vs microservices
- Disadvantages: harder to scale individual components, larger codebase over time

### 5.1.2 Layer Separation (Within Monolith)
```
/app/
  /auth/              # Authentication logic
  /business/          # Business management
  /products/          # Product catalog and inventory
  /marketplace/       # Multi-seller marketplace
  /cart/              # Shopping cart
  /enquiries/         # Product enquiries
  /quotations/        # Quotation management
  /orders/            # Order management
  /invoices/          # Invoice and payment management
  /ledger/            # Accounting and financial records
  /admin/             # Super admin panel
  /shared/            # Shared utilities, constants, types
  /lib/               # Core libraries (prisma, redis, storage)
  /styles/            # Tailwind and design system
  /components/        # Reusable UI components
  /hooks/             # Custom React hooks
  /actions/           # Server Actions
  /routes/            # Route Handlers
```

### 5.1.3 Feature-Based Import Structure
Each feature module imports only from:
- `@/shared/*` - shared types and constants
- `@/lib/*` - core services (prisma, storage, redis)
- `@/components/*` - reusable UI components
- `@/hooks/*` - custom hooks

No cross-feature module imports without going through shared layer.

## 5.2 Next.js App Router Structure

### 5.2.1 Directory Structure
```
/app/
  /auth/                # Auth routes: /login, /register, /verify, /reset-password
    page.tsx            # Landing/auth pages
    actions/            # Server Actions for auth
    route.tsx           # Route Handlers: POST /api/auth/...

  /b2b/                # Base namespace for all B2B routes
    /[businessId]/     # Dynamic business segment (resolved from session, not URL)
      /dashboard/       # Main dashboard (wholesaler or client depending on business type)
        page.tsx
        components/
      
      /products/        # Product management
        page.tsx
        [productId]/
          page.tsx
      
      /enquiries/       # Enquiry management
        page.tsx
        new/
          page.tsx
        [enquiryId]/
          page.tsx
      
      /quotations/      # Quotation management
        page.tsx
        [quotationId]/
          page.tsx
      
      /orders/          # Order management
        page.tsx
        [orderId]/
          page.tsx
      
      /invoices/        # Invoice management
        page.tsx
        [invoiceId]/
          page.tsx
      
      /ledger/          # Accounting ledger
        page.tsx
      
      /cart/            # Shopping cart
        page.tsx
        [...] 

    /admin/             # Super admin panel (bypasses business filtering)
      dashboard/
        page.tsx
      businesses/
        page.tsx
      products/
        page.tsx
      reports/
        page.tsx

  /marketplace/        # Public product browsing (authenticated clients)
    page.tsx          # Product catalog listing
    [category]/       # Category-filtered view
    search/           # Search functionality
    [productId]/      # Product detail page

  /profile/            # User profile and business membership management
    page.tsx
    settings/
      page.tsx

  /notifications/      # In-app notifications
    page.tsx

  /globals.css         # Tailwind base styles
  layout.tsx           # Root layout with auth check
  loading.tsx          # Global loading component
  not-found.tsx        # 404 page
```

### 5.2.2 Route Protection Pattern
All routes under `/b2b/` protected by middleware or middleware-like check in Server Components:

```typescript
// Middleware or layout.tsx pattern
import { getActiveBusiness } from '@/lib/auth';

export const metadata = {
  // ...
};

// Server Component wrapper
async function ProtectedLayout({
  children,
  businessType,
}: {
  children: React.ReactNode;
  businessType: 'wholesaler' | 'client';
}) {
  const activeBusiness = await getActiveBusiness();
  
  if (!activeBusiness || activeBusiness.type !== businessType) {
    return <Redirect to="/b2b/auth" />;
  }
  
  // Check user has required role
  const hasPermission = checkRolePermission(activeBusiness.userRole, requiredPermission);
  if (!hasPermission) {
    return <AccessDeniedPage />;
  }
  
  return <>{children}</>;
}
```

### 5.2.3 Server Components vs Server Actions
- **Server Components**: Used for dashboard pages, product lists, data-fetching UI
- **Server Actions**: Used for form submissions, API-like operations (create product, send enquiry, etc.)
- **Route Handlers**: Used for external APIs, webhooks, third-party integrations
- **Hybrid approach**: Pages mix Server Components with client-side interactivity via Client Components as needed

## 5.3 Authentication Architecture

### 5.3.1 Auth.js Configuration
- Providers: Email/password (primary), Google, GitHub (optional)
- Sessions: JWT-based, signed with secret
- Session timeout: 24 hours configurable
- Callback URLs: Configured per environment
- Email verification: mandatory on registration
- Password reset: secure token-based
- MFA: TOTP for administrators (future release)

### 5.3.2 Business Membership in Auth
```typescript
// Session user structure
interface UserSession {
  id: string;
  email: string;
  name?: string;
  image?: string;
  businesses: BusinessMembership[]; // Active memberships
  defaultBusinessId: string; // Currently active business
  role: 'OWNER' | 'MANAGER' | 'ACCOUNTANT' | 'SALES' | 'INVENTORY' | 'VIEWER';
}
```

### 5.3.3 Active Business Resolution
1. Check for `businessId` in session
2. If user has single business membership, use that
3. If multiple businesses, render selector UI
4. If no business membership, redirect to onboarding
5. Session refreshed on each request if near expiry

### 5.3.4 Middleware Protection
```typescript
// next-middlewares or route middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/navigation';

async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths - no auth required
  if (path.startsWith('/auth') || path === '/') {
    return NextResponse.next();
  }
  
  // Get session
  const session = await auth();
  if (!session?.user?.businesses?.length) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Get active business
  const activeBusiness = await getActiveBusinessFromSession(session);
  if (!activeBusiness) {
    return NextResponse.redirect(new URL('/b2b/onboard', request.url));
  }
  
  // Attach business to request for downstream use
  request.headers.set('x-business-id', activeBusiness.id);
  request.headers.set('x-business-type', activeBusiness.type);
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/b2b/:path*', '/marketplace/:path*'],
};
```

## 5.4 API Architecture

### 5.4.1 Route Handler Groups
```
/api/auth/              # Authentication endpoints
/api/businesses/        # Business management
/api/memberships/       # Business membership management
/api/products/          # Product CRUD, inventory operations
/api/inventory/         # Stock movements, adjustments, reservations
/api/marketplace/       # Product search, filtering, catalog
/api/cart/              # Cart operations
/api/enquiries/         # Enquiry creation, response, messages
/api/quotations/        # Quotation creation, acceptance, revision
/api/orders/            # Order creation, status updates, cancellation
/api/shipments/         # Shipment creation, tracking
/api/invoices/          # Invoice creation, payment recording, PDF generation
/api/payments/          # Payment recording, webhook handling, refunds
/api/ledger/            # Journal entries, ledger queries, balance calculations
/api/reports/           # Analytics data, chart data
/api/admin/             # Platform-wide administration endpoints
```

### 5.4.2 Consistent API Response Format
```typescript
// Success response
interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters?: Record<string, unknown>;
  };
  timestamp: string;
  requestId: string; // For tracing
}

// Error response
interface ApiError {
  success: false;
  error: {
    code: string; // e.g., 'VALIDATION_ERROR', 'AUTHORIZATION_ERROR', 'NOT_FOUND'
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
  requestId: string;
}

// Union type
type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

### 5.4.3 Query Parameters (Standardized)
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `sortBy` (field name)
- `sortOrder` ('asc' | 'desc')
- `filter[field]` (filter criteria)
- `search` (full-text search term)
- `relations` (comma-separated eager-loaded relations, Prisma)

### 5.4.4 Pagination Metadata
```typescript
interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

### 5.4.5 Idempotency
- Payment and order creation endpoints support `Idempotency-Key` header
- Server stores key + result, re-requests return cached result
- Prevents duplicate payments from retried webhooks

## 5.5 Server-Side Services Layer

### 5.5.1 Service Pattern
Each business area has a service layer separating business logic from:

- Controllers (Route Handlers)
- Views (Server Components)
- Direct Prisma queries

### 5.5.2 Service Examples
- `ProductService`: CRUD, pricing validation, inventory sync
- `OrderService`: Order creation with stock reservation, status transitions
- `InvoiceService`: Invoice generation, payment allocation, PDF creation
- `QuoteService`: Quotation creation, validity, conversion to order
- `AuthService`: Session management, business membership, permission checks
- `AccountingService`: Journal entries, ledger updates, balance calculations

### 5.5.3 Service Methods are Transaction-Safe
```typescript
// Example: Order creation transaction
async function createOrderFromQuotation(quotationId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get quotation with items
    const quotation = await tx.quotation.findUnique({
      where: { id: quotationId },
      include: { items: true },
    });
    
    // 2. Validate stock availability
    for (const item of quotation.items) {
      const stock = await tx.inventory.findFirst({
        where: { productVariantId: item.productVariantId, businessId: quotation.businessId },
      });
      if (stock.availableQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.productVariantId}`);
      }
    }
    
    // 3. Reserve stock
    for (const item of quotation.items) {
      await tx.inventory.update({
        where: { id: stockId },
        data: { 
          availableQuantity: { decrement: item.quantity },
          reservedQuantity: { increment: item.quantity },
        },
      });
    }
    
    // 4. Create orders (one per seller if multi-seller)
    const orders = await tx.order.createMany({
      data: quotation.items.map(item => ({
        businessId: quotation.businessId,
        sellerId: quotation.sellerId,
        status: 'PENDING',
        items: {
          create: item.data,
        },
      })),
      skipDuplicates: true,
    });
    
    // 5. Create invoices
    await tx.invoice.createMany({
      data: quotation.items.map(item => ({
        businessId: quotation.businessId,
        orderId: ...,
        status: 'UNPAID',
        totalAmount: quotation.totalAmount,
        // ... line items
      }));
    });
    
    // 6. Update quotation status
    await tx.quotation.update({
      where: { id: quotationId },
      data: { status: 'CONVERTED_TO_ORDER' },
    });
    
    return { success: true, orders };
  });
}
```

## 5.6 Form Validation Architecture

### 5.6.1 Zod Schemas
- Central Zod schemas defined in `@/schemas/` directory
- Shared between client (React Hook Form) and server (Server Action validation)
- Single source of truth for validation rules

### 5.6.2 Validation Layering
1. **Client-side**: React Hook Form with ZodResolver for UX feedback
2. **Server-side**: Same Zod schemas validated in Server Action
3. **Database-level**: Prisma schema constraints + CHECK constraints
4. **Business rule layer**: Service methods enforce business logic

### 5.6.3 Schema Example
```typescript
// schemas/product.ts
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().optional(),
  categoryId: z.string().uuid(),
  brand: z.string().optional(),
  fabric: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  mrp: z.number().positive().refine(val => Number(val) >= 0, {
    message: 'MRP must be positive',
  }),
  costPrice: z.number().positive(), // Wholesaler-visible only internally
  b2bSellingPrice: z.number().positive(),
  discount: z.number().min(0).max(100).default(0),
  minOrderQuantity: z.number().int().min(1).default(1),
  bulkPricing: z.array(z.object({
    quantity: z.number().int().min(1),
    price: z.number().positive(),
  })).optional(),
  productStatus: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

export type ProductFormValues = z.infer<typeof productSchema>;
```

### 5.6.4 Shared Schema Usage
```typescript
// Server Action
import { productSchema } from '@/schemas/product';
import { createTRPCRouter, protectedProcedure } from '@/trpc';

export const productRouter = createTRPCRouter({
  create: protectedProcedure
    .input(productSchema)
    .mutation(async ({ ctx, input }) => {
      // ctx contains: prisma, session, activeBusiness
      // Validation already done by Zod (input is validated)
      return await ctx.prisma.product.create({
        data: {
          ...input,
          businessId: ctx.activeBusiness.id,
          // costPrice internal handling
          costPrice: hideCostPrice(ctx.activeBusiness.userRole)? : input.costPrice,
        },
      });
    }),
});
```

## 5.7 Error Handling Strategy

### 5.7.1 Error Types
| Error Code | HTTP Status | Meaning | Handling |
|------------|-------------|---------|----------|
| `AUTHENTICATION_ERROR` | 401 | User not logged in | Redirect to login |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions | Show access denied page |
| `VALIDATION_ERROR` | 400 | Invalid input data | Show field errors |
| `NOT_FOUND` | 404 | Resource doesn't exist | Show 404 page |
| `CONFLICT` | 409 | Business rule violation (e.g., duplicate, stock) | Show error message |
| `UNPROCESSABLE_ENTITY` | 422 | Business logic error | Show detailed message |
| `PAYMENT_FAILED` | 402/4xx | Payment gateway error | Show retry option |
| `SERVICE_UNAVAILABLE` | 503 | External service down | Show degraded mode |
| `INTERNAL_ERROR` | 500 | Unexpected error | Log, show generic error |

### 5.7.2 Error Format (API)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fieldName": ["Error message"]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_abc123def456"
}
```

### 5.7.3 User-Facing Error Messages
- Translated/ localizable strings
- Specific to field when possible
- Actionable (tells user what to fix)
- No stack traces shown to end users
- Logged server-side with full context

### 5.7.4 Error Logging
- All errors logged with: request ID, user ID, business ID, endpoint, parameters, stack trace
- Sensitive data (passwords, tokens) redacted from logs
- Error tracking via sentry or similar
- Regular review of error patterns