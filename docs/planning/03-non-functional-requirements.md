# 03. Non-Functional Requirements

## 3.1 Performance Requirements

### 3.1.1 Page Load Times
- Dashboard pages: < 2 seconds on initial load
- Product catalog pages: < 3 seconds with filter applied
- Product details page: < 2 seconds
- Invoice and PDF generation: background process, user notification upon completion

### 3.1.2 API Response Times
- CRUD operations: < 500ms
- Search and filter operations: < 1 second
- Invoice/Payment queries: < 1 second with pagination
- Authentication endpoints: < 200ms

### 3.1.3 Concurrent Users
- Support minimum 100 concurrent businesses
- Support 500+ concurrent users during peak hours
- Database queries optimized with proper indexes

### 3.1.4 Background Job Processing
- Email notifications: processed within 5 seconds
- PDF invoice generation: processed within 10 seconds
- Export operations: progress-based, completion notification

## 3.2 Scalability Requirements

### 3.2.1 Horizontal Scaling
- Docker containers stateless where possible
- Redis for session sharing and cache
- PostgreSQL connection pooling with PgBouncer
- Background jobs via BullMQ with separate worker processes

### 3.2.2 Data Volume
- Initial: moderate product catalog (thousands of SKUs)
- Expected: support 10,000+ active products in first year
- Order volume: support 1,000+ orders per day per wholesaler at scale
- Invoice history: retained 7+ years per compliance

### 3.2.3 Tenant Isolation at Scale
- Each business's data clearly partitioned
- No cross-tenant data leakage under load
- Connection pooling per-tenant or shared with RLS

## 3.3 Reliability and Availability Requirements

### 3.3.1 Uptime Target
- 99.5% monthly uptime target (initial)
- Graceful degradation of non-critical features
- Health checks on all Docker services
- Automated recovery where possible

### 3.3.2 Data Integrity
- Database transactions ACID-compliant
- Financial operations: double-entry accounting balance verification
- Payment webhook idempotency (reprocessing safe)
- Journal entries always balance (total debits = total credits)

### 3.3.3 Backup and Recovery
- Daily automated PostgreSQL backups
- Point-in-time recovery capability
- Minimum 30-day backup retention
- Disaster recovery test quarterly

## 3.4 Security Requirements

### 3.4.1 Authentication
- Auth.js with email/password authentication
- Argon2id password hashing
- Email verification on registration
- Password reset with secure tokens
- MFA support for administrators
- Session management with HttpOnly, Secure, SameSite cookies
- Rate limiting on authentication endpoints (100 requests/minute per IP)

### 3.4.2 Authorization (Tenant Isolation)
- Every API endpoint and Server Action verifies business membership
- Never trust browser-supplied businessId/tenantId
- Resolve active business from server-side session
- Validate membership status for every request
- Database-level RLS as defense in depth
- Audit log for all sensitive operations

### 3.4.3 Input Validation
- Zod schema validation on all client and server inputs
- File upload validation (type, size, dimensions)
- SQL injection prevention via Prisma (parameterized queries)
- XSS protection through proper escaping
- CSRF protection for state-changing requests

### 3.4.4 Payment Security
- Webhook signature validation for online payments
- Idempotency keys for payment processing
- Gateway transaction verification
- Never store full payment details if avoidable
- PCI-DSS compliance for any payment gateway integration

### 3.4.5 File Security
- S3-compatible storage with private buckets
- Signed URLs for file access
- MIME type validation on uploads
- Virus scanning on uploaded files (optional, future)
- Size limits per file type

## 3.5 Usability Requirements

### 3.5.1 Responsive Design
- Desktop-first approach for dashboards
- Tablet-compatible view for most pages
- Mobile-acceptable for client-facing browsing (not full dashboard)

### 3.5.2 Accessibility
- WCAG 2.1 AA compliance for core interfaces
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios minimum 4.5:1

### 3.5.3 Error Handling
- Graceful error pages (404, 500)
- User-friendly error messages (no stack traces to end users)
- Operation retry where appropriate
- Save draft state on form errors

### 3.5.4 Loading States
- Skeleton loaders on all data-fetching pages
- Progress indicators for long-running operations (PDF generation, exports)
- Empty states for data-less screens

## 3.6 Maintainability Requirements

### 3.6.1 Code Organization
- Modular monolith architecture
- Separation of concerns: UI, services, repositories, validations
- Type-safe code throughout (TypeScript)
- Documented API specifications
- Clear folder structure conventions

### 3.6.2 Testing
- Unit test coverage minimum 80% for business logic
- Integration test coverage for critical workflows
- Tenant isolation tests for every new feature
- End-to-end tests for primary user flows

### 3.6.3 Documentation
- All planning documents maintained in docs/planning/
- API specifications versioned
- Database ERD updated with each schema change
- Deployment and operations runbooks

## 3.7 Technology-Specific Requirements

### 3.7.1 Next.js Compatibility
- App Router compatible patterns
- Server Components where appropriate
- Route Handlers for APIs and webhooks
- No use of deprecated middleware patterns

### 3.7.2 Prisma ORM
- Schema versioned via Prisma migrations
- Connection pooling configured (pgbouncer)
- Raw SQL avoided for financial operations
- Explicit transaction management for money movements

### 3.7.3 Docker
- Multi-stage builds for production images
- Small base images (node:alpine, python:alpine)
- Non-root user execution
- Health checks on all services
- Environment-based configuration

### 3.7.4 Redis and BullMQ
- Redis for session store and cache
- BullMQ for background job processing
- Job retry policies for transient failures
- Dead letter queue for failed jobs

### 3.7.5 S3 Storage
- S3-compatible storage (MinIO or cloud provider)
- Bucket per environment (dev, staging, prod)
- Prefix-based organization: product-images/, invoices/, documents/, uploads/
- CORS configuration for browser access where needed

### 3.7.6 Email Delivery
- Resend or SMTP for transactional emails
- Email template engine (Handlebars or EJS)
- DKIM, SPF, DMARC configured
- Welcome, verification, password reset, invoice receipt notifications

## 3.8 Data Integrity Requirements

### 3.8.1 Monetary Precision
- All money values: Decimal(10, 2) or stored in smallest currency unit
- No floating-point arithmetic for calculations
- Database CHECK constraints for positive amounts
- Rounding rules defined (ROUND_HALF_UP for display)

### 3.8.2 Transaction Balance
- Every journal entry: total debits = total credits
- Payment allocations: allocated amounts <= invoice total
- Order totals: sum of order items = order total + tax + delivery
- Invoice totals consistent with line items

### 3.8.3 Soft Delete Policy
- Business-soft-delete: mark as SUSPENDED/ARCHIVED, not physical delete
- Product soft-delete: mark inactive, retain for history
- Order/Invoice: never hard delete, retain for audit
- Cascade deletes only for non-financial entities

### 3.8.4 Audit Trail
- All sensitive operations logged: create, update, delete, status changes
- User ID, business ID, timestamp, operation type, affected resource
- Immutable audit logs (append-only)
- Retention: 2+ years for compliance