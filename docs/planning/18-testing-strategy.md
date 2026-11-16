# 19. Testing Strategy

## 19.1 Testing Philosophy

- **Test Pyramid**: 70% unit tests, 20% integration tests, 10% end-to-end tests
- **Tenant Isolation First**: Every new feature must include isolation tests
- **Financial Safety**: All financial calculations extensively tested; no assumptions
- **Idempotency**: Payment and retry scenarios tested thoroughly
- **Accessibility**: Core workflows tested for WCAG compliance

## 19.2 Test Layers

### 19.2.1 Unit Tests (70% of test coverage)

**Target**: Individual functions, calculations, utilities, pure logic

**Pricing Calculations**:
- Subtotal with discount: `unitPrice × quantity × (1 - discount/100)`
- Tax calculation: `subtotal × taxRate/100`
- Total: `subtotal + tax + delivery`
- Bulk pricing tiers: Tiered discount application
- MOQ validation: Minimum order check

**Discount Scenarios**:
- Percentage discount on line item
- Fixed amount discount (future)
- Bulk tier discount (quantity-based)
- Early payment discount (future)
- Combination discounts (validate precedence)

**Tax Calculations**:
- NPR standard rate (13% or configurable)
- Zero-rated items (if applicable)
- Tax on discounted amount (vs pre-discount)
- Rounding to 2 decimal places

**Ledger and Accounting**:
- Journal entry balance: `SUM(debits) = SUM(credits)`
- Payment allocation: Partial payments across invoices
- Outstanding balance: `totalInvoice - sum(all allocations)`
- Credit note effect: Reduces outstanding balance
- Reversal entry: Balances original entry

**Stock Calculations**:
- Available quantity: `total - reserved - damaged - returned`
- Low-stock threshold check
- Stock movement impact on available quantity
- Reservation expiry and release

**Utility Functions** (to test individually):
- `calculateSubtotal(price, quantity, discount%)`
- `calculateTax(subtotal, taxRate%)`
- `formatCurrency(amount, currency)`
- `parseCurrency(string)`
- `validateMOQ(quantity, moq)`
- `checkLowStock(available, threshold)`

**Test Framework**: Vitest
```typescript
// Example: pricing.test.ts
import { describe, it, expect } from 'vitest';
import { calculateSubtotal, calculateTax } from '@/lib/pricing';

describe('Pricing calculations', () => {
  describe('calculateSubtotal', () => {
    it('applies discount correctly', () => {
      expect(calculateSubtotal(100, 2, 10)).toBe(180); // 100*2*0.9 = 180
    });
    
    it('handles zero discount', () => {
      expect(calculateSubtotal(50, 1, 0)).toBe(50);
    });
    
    it('handles 100% discount', () => {
      expect(calculateSubtotal(20, 3, 100)).toBe(0);
    });
  });
  
  describe('calculateTax', () => {
    it('calculates 13% tax', () => {
      expect(calculateTax(1000, 13)).toBe(130);
    });
    
    it('rounds to 2 decimal places', () => {
      expect(calculateTax(999, 13)).toBe(129.87); // 999 * 0.13 = 129.87
    });
  });
});
```

### 19.2.2 Integration Tests (20% of test coverage)

**Target**: API endpoints, Server Actions, database operations, workflows

**Authentication Integration**:
- Register with valid/invalid data
- Login with correct/incorrect credentials
- Email verification flow (send token, verify, login)
- Password reset flow (request, reset, login)
- Session persistence across requests

**Business Membership Integration**:
- Create business as wholesaler/client
- Invite user to business
- Accept invitation, set role
- Switch between multiple businesses
- Permission checks per role

**Product CRUD Integration**:
- Create product with variants
- Update product price/stock
- Archive product, verify it's hidden from clients
- Restore archived product

**Order and Invoice Integration**:
- Create order from quotation
- Stock reservation and release
- Invoice generation from order
- Payment recording (online/manual)
- Payment allocation across multiple invoices
- Overdue invoice detection

**Enquiry and Quotation Integration**:
- Client creates enquiry
- Wholesaler receives and responds
- Quotation created with items
- Validity date enforcement
- Accept/reject quotation
- Convert accepted quotation to order

**Tenant Isolation Integration Tests** (critical):
```typescript
// Example: cross-business product access test
import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma';
import { setupTestBusiness, cleanupTestBusiness } from '@/test/setup';

describe('Tenant isolation - products', () => {
  let wholesalerA, wholesalerB, client;
  
  beforeAll(async () => {
    [wholesalerA, wholesalerB, client] = await setupTestBusiness(
      'wholesaler', 'wholesaler', 'client'
    );
  });
  
  afterAll(async () => {
    await cleanupTestBusiness(wholesalerA, wholesalerB, client);
  });
  
  it('Wholesaler A cannot view Wholesaler B products', async () => {
    // Create a product under Wholesaler B
    const productB = await prisma.product.create({
      data: {
        businessId: wholesalerB.id,
        name: 'Product B',
        categoryId: ...,
      },
    });
    
    // Wholesaler A tries to list products
    const products = await prisma.product.findMany({
      where: { businessId: wholesalerA.id }, // Should filter by A's business
    });
    
    // Should NOT contain Product B
    const productBExists = products.some(p => p.id === productB.id);
    expect(productBExists).toBe(false);
  });
  
  it('Client A cannot view Client B orders', async => {
    // ... similar pattern for orders
  });
});
```

### 19.2.3 End-to-End Tests (10% of test coverage)

**Target**: Complete user workflows from UI, through API, to database

**E2E Test Framework**: Playwright

**Primary User Flows**:
1. **Business Registration Flow**:
   - User navigates to register
   - Selects business type (wholesaler/client)
   - Completes registration
   - Email verification
   - Business profile completion
   - Login and dashboard access

2. **Product Publication Flow** (Wholesaler):
   - Login to wholesaler dashboard
   - Navigate to product management
   - Create product with variants
   - Upload product images
   - Set pricing and MOQ
   - Product appears in marketplace

3. **Marketplace Browse and Purchase** (Client):
   - Login to client dashboard
   - Browse products with filters
   - Select variants (size/color)
   - Add to cart (multi-seller)
   - Proceed to checkout
   - Split orders by seller
   - Payment (manual/online simulation)
   - Order tracking

4. **Quotation Negotiation Flow**:
   - Client sends enquiry
   - Wholesaler responds with quotation
   - Client accepts quotation
   - Order created from quotation
   - Stock reserved
   - Invoice generated

5. **Invoice and Payment Flow**:
   - View invoices
   - Make payment (manual recording)
   - Receive confirmation
   - Outstanding balance updates
   - Overdue detection and reminders

6. **Return and Refund Flow**:
   - Client requests return
   - Wholesaler approves
   - Items shipped back
   - Refund processed
   - Journal entries reversed
   - Credit note issued (if applicable)

**Playwright Test Example**:
```typescript
// e2e/registration.test.ts
import { test, expect } from '@playwright/test';

test('complete business registration flow', async ({ page }) => {
  // Navigate to register
  await page.goto('/register');
  
  // Select wholesaler type
  await page.selectOption('#business-type', 'wholesaler');
  await page.fill('#business-name', 'Test Wholesaler Pvt Ltd');
  await page.fill('#email', 'test@wholesaler.com');
  await page.fill('#password', 'Password123!');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Email verification page
  await page.waitForURL('/verify-email');
  await page.click('a[href="mailto:test@wholesaler.com"]'); // or use test mailbox
  
  // Complete onboarding
  await page.waitForURL('/b2b/wholesaler');
  await page.url().should('include', '/b2b/wholesaler');
  
  // Verify dashboard loads
  await expect(page).toHaveTitle(/Wholesaler Dashboard/);
});
```

## 19.3 Tenant Isolation Test Suite

### 19.3.1 Mandatory Tests for Every Feature

Each new feature must include these isolation tests:

1. **Product Isolation**:
   - Wholesaler A creates product → Wholesaler B cannot list/view it
   - Client A cannot see Wholesaler A's cost price
   - Admin can see all products (with audit)

2. **Order Isolation**:
   - Client A's orders invisible to Client B
   - Wholesaler A's orders invisible to Wholesaler B
   - Client cannot access internal cost price in order items

3. **Invoice Isolation**:
   - Wholesaler A's invoices invisible to Wholesaler B
   - Client A's invoices invisible to Client B
   - Payment records isolated per business

4. **Enquiry/Quotation Isolation**:
   - Enquiries only between specific client/wholesaler pair
   - Quotation visible only to involved parties
   - Cross-quotation data leakage prevented

5. **Payment Isolation**:
   - Payments ledger per business
   - Payment allocations cannot cross businesses
   - Webhook idempotency per business

6. **Ledger Isolation**:
   - Ledger accounts per business
   - Journal entries scoped to business
   - Balance calculations per business only

### 19.3.2 Test Isolation Pattern

```typescript
// test/isolation.pattern.ts
import { describe, it, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

describe('Tenant isolation pattern', () => {
  let businessA, businessB, userA, userB;
  
  beforeAll(async () => {
    // Setup: Create two separate businesses with separate users
    [businessA, businessB] = await Promise.all([
      createTestBusiness('wholesaler', 'Business A'),
      createTestBusiness('wholesaler', 'Business B'),
    ]);
    
    [userA, userB] = await Promise.all([
      createTestUser('userA', businessA),
      createTestUser('userB', businessB),
    ]);
  });
  
  afterAll(async () => {
    // Cleanup: Delete all test data
    await prisma.$transaction([
      prisma.payment.deleteMany(),
      prisma.invoice.deleteMany(),
      prisma.order.deleteMany(),
      prisma.quotation.deleteMany(),
      prisma.enquiry.deleteMany(),
      prisma.productVariant.deleteMany(),
      prisma.product.deleteMany(),
      prisma.inventory.deleteMany(),
      prisma.businessMembership.deleteMany(),
      prisma.business.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });
  
  beforeEach(async () => {
    // Reset database state between tests if needed
    // Prisma transaction rollback or cleanup
  });
  
  it('isolated business A cannot access business B resources', async () => {
    // 1. Create resource under business B
    const product = await prisma.product.create({
      data: { businessId: businessB.id, name: 'B-Product', ... },
    });
    
    // 2. Try to access via business A's context
    const result = await prisma.product.findFirst({
      where: { businessId: businessA.id, name: 'B-Product' },
    });
    
    // 3. Assert isolation
    expect(result).toBeNull(); // Should not find B's product in A's business
  });
  
  it('isolated user A cannot access user B's orders', async () => {
    // 1. Create order under business B
    const order = await prisma.order.create({
      data: { 
        businessId: businessB.id, 
        sellerBusinessId: businessB.id, 
        clientBusinessId: businessB.id, 
        status: 'PENDING',
        // ... items
      },
    });
    
    // 2. Query orders for business A
    const orders = await prisma.order.findMany({
      where: { businessId: businessA.id },
    });
    
    // 3. Assert isolation
    const orderExists = orders.some(o => o.id === order.id);
    expect(orderExists).toBe(false);
  });
  
  it('isolated user A cannot create payment for business B invoice', async () => {
    // 1. Create invoice under business B
    const invoice = await prisma.invoice.create({
      data: { 
        businessId: businessB.id, 
        clientBusinessId: businessB.id, 
        totalAmount: 5000,
        // ... items
      },
    });
    
    // 2. Try to create payment from business A
    const payment = await prisma.payment.create({
      data: { 
        businessIdPayer: businessA.id,
        sellerBusinessId: businessB.id,
        invoiceId: invoice.id,
        amount: 5000,
        paymentArrangement: 'MANUAL',
      },
    });
    
    // 3. Assert isolation - this should fail/be blocked
    // The test verifies the prevention mechanism works
    const createdPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
    });
    
    // If the system allows it (bug), the payment exists
    // If the system blocks it (feature), the payment was never created
    // We test that it was blocked at the API/Service level
    expect(createdPayment).toBeNull(); // Payment was never created due to authorization check
  });
});
```

## 19.4 Financial Test Scenarios

### 19.4.1 Core Financial Integrity Tests

Every test suite must include:

1. **Journal Entry Balance**:
   - Create journal entry with multiple lines
   - Verify `SUM(debits) = SUM(credits)` within tolerance (0.01 for rounding)
   - Test with 2 lines, 3 lines, 5+ lines
   - Test reversal maintains balance

2. **Payment Allocation**:
   - Payment of Rs. 7,500 across 3 invoices: Rs. 3,000 + Rs. 2,500 + Rs. 2,000
   - Verify remaining amounts on each invoice
   - Verify remaining payment amount (should be 0 when fully allocated)
   - Test partial payment: Rs. 3,000 on Rs. 5,000 invoice
   - Verify outstanding balance updates correctly

3. **Invoice Total Consistency**:
   - Create invoice with 3 line items
   - Verify: `subtotal + tax + delivery = total`
   - Test partial payment: Rs. 2,000 on Rs. 5,000 invoice
   - Verify outstanding balance: Rs. 3,000
   - Test full payment: Rs. 5,000 on Rs. 5,000 invoice
   - Verify invoice status: PAID

4. **Credit Note Effect**:
   - Create invoice Rs. 10,000
   - Client returns goods, issue credit note Rs. 3,000
   - Apply credit note to invoice
   - Verify new outstanding balance: Rs. 7,000
   - Issue another credit note Rs. 2,000
   - Verify final outstanding: Rs. 5,000

5. **MOQ Enforcement**:
   - Product with MOQ = 10
   - Attempt order with quantity 5 → blocked
   - Attempt order with quantity 10 → allowed
   - Attempt order with quantity 15 → allowed (MOQ met, extra allowed)

### 19.4.2 Floating-Point Prevention Tests

```typescript
// test/financial.precision.test.ts
import { describe, it, expect } from 'vitest';
import { calculateSubtotal, calculateTax, calculateTotal } from '@/lib/pricing';

describe('Financial precision - no floating point', () => {
  describe('calculateSubtotal', () => {
    it('avoids floating point errors', () => {
      // 100.50 × 3 = 301.50, not 301.49999999999997
      const result = calculateSubtotal(100.50, 3, 0);
      // Must be exactly 301.50 (using Decimal or BigInt internally)
      expect(result).toBe(301.50);
    });
    
    it('discount calculation avoids floating point', () => {
      // 100 × 2 × 0.10 = 20, not 19.999999999999996
      const result = calculateSubtotal(100, 2, 10);
      expect(result).toBe(180); // 100 * 2 * 0.9
    });
  });
  
  describe('calculateTax', () => {
    it('13% of 301.50 = 39.195, rounded to 39.20', () => {
      const result = calculateTax(301.50, 13);
      // Must round properly: 301.50 * 0.13 = 39.195 → 39.20
      expect(result).toBe(39.20);
    });
  });
  
  describe('calculateTotal', () => {
    it('subtotal + tax + delivery = total exactly', () => {
      const subtotal = calculateSubtotal(200, 2, 0); // 400
      const tax = calculateTax(subtotal, 13); // 52
      const delivery = 50;
      const total = calculateTotal(subtotal, tax, delivery);
      expect(total).toBe(400 + 52 + 50); // 502
    });
  });
});
```

## 19.5 Accessibility Tests

### 19.5.1 WCAG 2.1 AA Core Tests

1. **Keyboard Navigation**:
   - Tab key moves focus logically through interactive elements
   - Shift+Tab moves backwards
   - Enter activates buttons, links
   - Escape closes modals/drawers
   - Focus visible indicator present on all focusable elements

2. **Color Contrast**:
   - Text contrast: 4.5:1 minimum against background
   - Large text (18pt+ or 14pt bold+): 3:1 minimum
   - UI components (buttons, inputs): 3:1 minimum
   - Use `color-contrast-checker` or automated tool

3. **Screen Reader**:
   - All images have `alt` text (decorative images have empty alt)
   - Form labels associated with inputs via `htmlFor`/`id`
   - Meaningful link text (not "click here")
   - Landmark regions (header, nav, main, aside) marked semantically
   - Dynamic content announcements (live region for notifications)

4. **Resize Text**:
   - Page zoom to 200% doesn't break layout
   - Content reflows gracefully
   - No horizontal scrolling at 200% zoom
   - Interactive elements still reachable

5. **Touch Targets**:
   - Minimum 44px × 44px on mobile/touch
   - Adequate spacing between touch targets
   - No overlapping interactive elements

### 19.5.2 Accessibility Test Tools

- **axe-core** via Playwright: `await page.accessibility.snapshot()`
- **Lighthouse** CI integration
- **Wave** browser extension for manual checks
- **NVDA** (Windows) or **VoiceOver** (Mac) manual testing
- **color contrast checker** tools

## 19.6 Test Data Management

### 19.6.1 Test Factories/Helpers

```typescript
// test/factories.ts
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export const createTestUser = (overrides = {}) => {
  const email = `test-${uuidv4()}@example.com`;
  return prisma.user.create({
    data: {
      email,
      name: overrides.name || faker.person.fullName(),
      passwordHash: '$2b$10$randomhash', // dummy, not actually hashed in test env
      emailVerified: new Date(),
    },
  });
};

export const createTestBusiness = (type: 'wholesaler' | 'client', overrides = {}) => {
  const businessName = `${type.toUpperCase()} Test ${uuidv4().slice(0, 8)}`;
  return prisma.business.create({
    data: {
      name: businessName,
      type,
      verificationStatus: 'VERIFIED',
      currency: 'NPR',
      country: 'NP',
      ...overrides,
    },
  });
};

export const createTestProduct = (businessId, overrides = {}) => {
  return prisma.product.create({
    data: {
      businessId,
      name: overrides.name || `Test Product ${uuidv4().slice(0, 4)}`,
      slug: overrides.slug || `test-product-${uuidv4().slice(0, 4)}`,
      categoryId: overrides.categoryId || uuidv4(),
      sku: overrides.sku || `SKU-${uuidv4().slice(0, 4)}`,
      b2bSellingPrice: overrides.price || 1000,
      mrp: overrides.mrp || 1200,
      minOrderQuantity: overrides.moq || 1,
      ...overrides,
    },
  });
};

export const createTestInvoice = (overrides = {}) => {
  return prisma.invoice.create({
    data: {
      sellerBusinessId: overrides.sellerId || uuidv4(),
      clientBusinessId: overrides.clientId || uuidv4(),
      invoiceNumber: overrides.number || `INV-${uuidv4().slice(0, 8)}`,
      totalAmount: overrides.total || 5000,
      dueDate: overrides.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: overrides.status || 'UNPAID',
      ...overrides,
    },
  });
};
```

### 19.6.2 Test Database Setup

```typescript
// test/setup.ts
import { prisma } from '@/lib/prisma';
import { Teardown } from 'violation'; // hypothetical

beforeAll(async () => {
  // Generate test schema or use existing with prefix
  // Option: use a separate test database
  await prisma.$connect();
});

afterAll(async () => {
  // Clean up: truncate all tables or drop schema
  await prisma.$executeRaw`TRUNCATE TABLE
    "Payment", "Invoice", "Order", "Quotation", "Enquiry",
    "ProductVariant", "Product", "Inventory", "StockMovement",
    "StockReservation", "JournalLine", "JournalEntry",
    "LedgerAccount", "PaymentAllocation", "CreditNote",
    "User", "BusinessMembership", "Business", "Session" CASCADE`;
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Optionally reset sequences, check constraints
  // For each test, start with clean state
});
```

## 19.7 Continuous Integration

### 19.7.1 GitHub Actions Test Workflow

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: b2b_user
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: b2b_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U b2b_user -d b2b_test"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 3
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      - run: pnpm lint
      
      - run: pnpm test:unit --coverage
      
      - run: pnpm test:integration
      
      - run: pnpm test:e2e
      
      - run: pnpm test:typecheck
      
      - name: Upload test coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
```

### 19.7.2 Coverage thresholds (recommended):
- **Statements**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Branches**: 70%

**Note**: Financial modules and tenant isolation must have 100% coverage for critical paths.

## 19.8 Test Environment Matrix

| Environment | Database | Redis | Purpose |
|-------------|----------|-------|---------|
| `test` | Separate test DB | Separate instance | Unit + integration tests CI |
| `development` | Local Docker PG | Local Redis | Developer local testing |
| `staging` | Separate staging DB | Separate Redis | Pre-production QA |
| `production` | Production PG | Production Redis | Never run tests directly |

**Never run destructive tests against production** - always use separate test databases.

## 19.9 Risk-Based Testing Prioritization

**Critical (run on every commit)**:
- Tenant isolation tests (cross-business access)
- Authentication flows
- Payment webhook idempotency
- Core pricing calculations
- Critical financial calculations

**High (run on PR merge)**:
- Full unit test suite
- Integration test suite
- E2E critical paths
- Accessibility smoke test

**Medium (run on tag/release)**:
- Full E2E test suite
- Performance tests
- Load testing
- All accessibility tests

**Low (run on schedule)**:
- Comprehensive regression suite
- Visual regression tests
- Documentation validation
- Dependency vulnerability scans