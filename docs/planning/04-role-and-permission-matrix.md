# 04. Role and Permission Matrix

## 4.1 Role Hierarchy

### 4.1.1 Business Roles (Per Business)

| Role | Description | Permissions |
|------|-------------|-------------|
| **OWNER** | Business founder/primary accountable person | Full access to all business features: product management, inventory, orders, customers, enquiries, quotations, invoices, payments, ledger, business settings, user management, suspension |
| **MANAGER** | Operational management role | Product management, inventory, orders, enquiries, quotations, customer view, invoice view, basic reports, cannot change business settings or suspend users |
| **ACCOUNTANT** | Financial management role | Invoices, payments, ledger, accounts receivable/payable, financial reports, PDF/Excel exports, cannot modify product or inventory |
| **SALES** | Sales and customer interaction | Enquiries, quotations, customer list (view only), orders, basic sales reports, cannot modify inventory or financial settings |
| **INVENTORY** | Stock management role | Inventory tracking, stock movements, stock adjustments, product view, low-stock alerts, cannot modify pricing or orders |
| **VIEWER** | Read-only access | View dashboards, products, orders, invoices, reports, cannot create or modify anything |

### 4.1.2 Platform Super Admin Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **SUPER_ADMIN** | Platform-wide administrator | All features across all businesses: user management, business verification, product moderation, platform settings, tax/configuration, audit logs, suspensions, global reports |
| **PLATFORM_SUPPORT** | Limited support access | View business data with business scope, limited modification rights, cannot suspend other admins, cannot change platform settings |

## 4.2 Permission Granularity

### 4.2.1 Product Permissions
| Permission | OWNER | MANAGER | ACCOUNTANT | SALES | INVENTORY | VIEWER |
|------------|-------|---------|------------|-------|-----------|--------|
| product_create | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| product_view | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| product_edit | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| product_archive | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| variant_create | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| variant_edit | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| cost_price_view | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | *(private to wholesaler staff)*

### 4.2.2 Inventory Permissions
| Permission | OWNER | MANAGER | ACCOUNTANT | SALES | INVENTORY | VIEWER |
|------------|-------|---------|------------|-------|-----------|--------|
| stock_view | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| stock_adjust | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| stock_movement_view | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| stock_reserve | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| low_stock_alert_view | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |

### 4.2.3 Order Permissions
| Permission | OWNER | MANAGER | ACCOUNTANT | SALES | INVENTORY | VIEWER |
|------------|-------|---------|------------|-------|-----------|--------|
| order_create (via quotation) | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| order_view | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| order_edit_status | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| order_cancel | ✓ | ✓ (own orders) | ✗ | ✗ | ✗ | ✗ |
| shipment_view | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| delivery_status_update | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |

### 4.2.4 Enquiry and Quotation Permissions
| Permission | OWNER | MANAGER | ACCOUNTANT | SALES | INVENTORY | VIEWER |
|------------|-------|---------|------------|-------|-----------|--------|
| enquiry_create | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| enquiry_view | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| enquiry_response | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| quotation_create | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| quotation_view | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| quotation_accept | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| quotation_reject | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |

### 4.2.5 Invoice and Payment Permissions
| Permission | OWNER | MANAGER | ACCOUNTANT | SALES | INVENTORY | VIEWER |
|------------|-------|---------|------------|-------|-----------|--------|
| invoice_create | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| invoice_view | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| invoice_edit (post-issue) | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | *(only via credit note)*
| payment_record | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| payment_view | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| payment_allocation_view | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| credit_note_create | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| ledger_view | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| ledger_edit | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |

### 4.2.6 Customer and Business Permissions
| Permission | OWNER | MANAGER | ACCOUNTANT | SALES | INVENTORY | VIEWER |
|------------|-------|---------|------------|-------|-----------|--------|
| customer_view | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| customer_edit | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| customer_create | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| business_settings_edit | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| user_invite_invite | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| user_suspend | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| business_suspend | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

### 4.2.7 Admin Permissions (Platform-Wide)
| Permission | SUPER_ADMIN | PLATFORM_SUPPORT |
|------------|-------------|-------------------|
| user_manage | ✓ | ✗ (view only) |
| business_verify | ✓ | ✗ |
| business_suspend | ✓ | ✓ (own only) |
| product_moderate | ✓ | ✗ |
| platform_settings_edit | ✓ | ✗ |
| audit_log_view | ✓ | ✓ (limited) |
| report_global | ✓ | ✗ |
| view_any_business | ✓ | ✓ (assigned scope) |

## 4.3 Permission Enforcement Rules

### 4.3.1 Core Rules
1. **Never trust browser-supplied role/permissions** - always resolve from server-side session
2. **Business membership check** - user must have active membership in the business before role-based checks
3. **Resource ownership** - for resource-specific operations, verify the resource belongs to the user's business
4. **Admin override** - SUPER_ADMIN can access any business data, but actions are audit-logged
5. **Default deny** - if permission not explicitly granted, access is denied
6. **Session validation** - verify session is active and not expired for every request
7. **Rate limiting** - apply per-endpoint rate limits independent of role

### 4.3.2 Cross-Business Access Prevention
- Every database query includes business/tenant filter from active session
- Prisma queries use `.where({ businessId: activeBusinessId })` or RLS policies
- API routes validate business membership before processing
- Server Actions verify `getActiveBusiness()` returns valid business before execution
- Response data filtered to exclude data outside user's business

### 4.3.3 Session Management
- Active business resolved from: session cookie, JWT, or query param (last is never trusted)
- If user belongs to multiple businesses, UI presents selector; single business uses default
- Session expiry: 24 hours maximum, configurable per business settings
- Concurrent session limit: 3 active sessions per user (configurable)
- Session revocation on password change or business suspension

### 4.3.4 Role Assignment
- OWNER can assign/remove any role within their business
- SUPER_ADMIN can assign any role across any business
- Self-assignment restricted: users cannot assign themselves SUPER_ADMIN
- Role assignment audit logged
- Permission cache refreshed on role change (invalidate after 60 seconds max)

## 4.4 RBAC Implementation Approach

### 4.4.1 Recommended Implementation
1. **Role-Permission Table**: `roles` table with JSON column `permissions` listing all permitted actions
2. **Business-Mapped Roles**: `business_roles` junction table: `businessId` + `roleId` + `userId`
3. **Permission Check Function**: `hasPermission(user, businessId, permission)` that:
   - Checks active business membership
   - Checks business-specific role assignment
   - Returns boolean
4. **Middleware/Interceptor**: Next.js middleware or session middleware that validates permissions on protected routes
5. **Server Action Guard**: Every Server Action begins with `if (!hasPermission(...)) throw new Error('Forbidden')`
6. **Route Handler Guard**: Every API route begins with permission verification

### 4.4.2 Alternative: Relation-Based Permissions
- Instead of hardcoded permissions, use resource-level ownership
- `hasResourceAccess(user, businessId, resourceId, action)` 
- More flexible but more complex to administer
- Recommended for initial release: role-based with resource ownership checks layered on top

### 4.4.3 Prisma Integration
```prisma
model Role {
  id        String    @id @default(uuid())
  name      String    @unique
  permissions Json     // e.g., ["product_create", "product_view", ...]
  businessMemberships BusinessMembership[]
}

model BusinessMembership {
  id        String   @id @default(uuid())
  user      User     @relation(onDelete: Cascade)
  business  Business @relation(onDelete: Cascade)
  role      Role     @relation(onDelete: Cascade)
  grantedAt DateTime @default(now())
  expiresAt DateTime? // for temporary roles
}
```

## 4.5 Permission Matrix Summary Table

```
ROLE:       OWNER   MANAGER   ACCOUNTANT   SALES   INVENTORY   VIEWER
---------------------------------------------------------------
product_create    ✓        ✓         ✗          ✗       ✗           ✗
product_view      ✓        ✓         ✓          ✓       ✓           ✓
product_edit      ✓        ✓         ✗          ✗       ✗           ✗
variant_create    ✓        ✓         ✗          ✗       ✗           ✗
variant_edit      ✓        ✓         ✗          ✗       ✗           ✗
stock_view               ✗         ✗         ✗        ✓           ✓
stock_adjust             ✓        ✓         ✗          ✗       ✓           ✗
order_create             ✓        ✓         ✗          ✓       ✗           ✗
order_view               ✓        ✓         ✓          ✓       ✓           ✓
invoice_create           ✓        ✓         ✓          ✗       ✗           ✗
invoice_view             ✓        ✓         ✓          ✓       ✗           ✓
payment_record           ✓        ✓         ✓          ✗       ✗           ✗
payment_view             ✓        ✓         ✓          ✓       ✗           ✓
ledger_view              ✓        ✓         ✓          ✗       ✗           ✗
enquiry_create           ✓        ✓         ✗          ✓       ✗           ✗
enquiry_response         ✓        ✓         ✗          ✓       ✗           ✗
quotation_create         ✓        ✓         ✗          ✓       ✗           ✗
quotation_accept         ✓        ✓         ✗          ✓       ✗           ✗
business_settings_edit   ✓        ✗         ✗          ✗       ✗           ✗
user_invite              ✓        ✓         ✗          ✗       ✗           ✗
user_suspend             ✓        ✗         ✗          ✗       ✗           ✗
```