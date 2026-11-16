# 15. Authentication and Security Plan

## 15.1 Authentication Architecture

### 15.1.1 Auth.js Configuration

**Provider Setup**:
- **Primary**: Email/password credentials
- **Social (optional)**: Google, GitHub for convenience login
- **Passwordless**: Not initially (email + password is primary)

**Password Policy**:
- Minimum 8 characters
- Recommended: 12+ characters
- Must contain: mixed case, at least one number, at least one special character
- Password history: remember last 5 passwords (prevent reuse)
- Password expiry: None initially (review periodically)
- Breach check: Optional via Have I Been Pwned API (future)

**Email Verification**:
- Mandatory on registration
- Verification token expires after 24 hours
- Resend verification link after 5 minutes
- Unverified users: limited access (can't create products, access dashboard)
- Verification email template: brandable, contains verification link

**Password Reset**:
- Token-based flow
- Token expires after 2 hours
- Single-use token (invalidated after use)
- Rate-limited: 3 attempts per hour per IP
- New password must differ from last 3 passwords
- Reset email: contains secure reset link, brandable

**MFA (Multi-Factor Authentication)**:
- **Initially**: TOTP (Google Authenticator, Authy) for SUPER_ADMIN only
- **Future**: MFA for all administrator roles, optional for business OWNERS
- Backup codes: 8 single-use codes provided on setup
- Recovery flow: Email verification + support ticket if MFA device lost

### 15.1.2 Session Management

| Attribute | Value |
|-----------|-------|
| Session cookie name | `next-auth.session-token` (Auth.js default) |
| Cookie attributes | `HttpOnly`, `Secure` (HTTPS only), `SameSite=Strict` |
| Session timeout | 24 hours maximum |
| Remember me | Not initially (always re-auth after 24h) |
| Concurrent sessions | Max 3 per user |
| Session refresh | On each request if < 2 hours remaining |
| Invalidated on | Password change, business suspension, role change, manual logout |

### 15.1.3 User Session Structure

```typescript
interface UserSession {
  id: string; // User UUID
  email: string;
  name?: string;
  image?: string;
  businesses: BusinessMembership[]; // All active memberships
  activeBusinessId: string; // Currently selected
  activeBusinessType: 'WHOLESALER' | 'CLIENT';
  role: 'OWNER' | 'MANAGER' | 'ACCOUNTANT' | 'SALES' | 'INVENTORY' | 'VIEWER';
  permissions: string[]; // Effective for active business
  mfaEnabled: boolean;
  mfaLastVerified: DateTime | null;
  createdAt: DateTime;
  lastIp: string; // For suspicious activity detection
  lastUserAgent: string;
}
```

## 15.2 Security Requirements

### 15.2.1 RBAC (Role-Based Access Control)

**Role Hierarchy**:
```
SUPER_ADMIN
    ↓
OWNER (per business)
    ↓
MANAGER (per business)
    ↓
ACCOUNTANT (per business)
    ↓
SALES (per business)
    ↓
INVENTORY (per business)
    ↓
VIEWER (per business)
```

**Permission Check Flow**:
1. Resolve user's active business from session
2. Check user has active membership in that business
3. Check user's role within that business
4. Verify specific permission for the operation
5. Check resource ownership (if applicable)
6. Return authorized or throw authorization error

**Permission Enforcement** (in every Server Action/Route Handler):
```typescript
// Pseudocode used in every handler
function verifyAccess(requiredPermission: string) {
  const { anActiveBusiness } = await getActiveBusiness();
  const user = await getUserSession();
  
  if (!anActiveBusiness) {
    throw new Error('NO_ACTIVE_BUSINESS');
  }
  
  if (anActiveBusiness.type === 'WHOLESALER' && user.role === 'OWNER') {
    // OWNER has all wholesale permissions
    return true;
  }
  
  if (user.permissions.includes(requiredPermission)) {
    return true;
  }
  
  // Check for SUPER_ADMIN bypass
  if (user.isSuperAdmin) {
    auditLog('SUPER_ADMIN_BYPASS', { permission: requiredPermission });
    return true;
  }
  
  throw new AuthorizationError('MISSING_PERMISSION', 'You do not have permission to perform this action');
}
```

### 15.2.2 Tenant Isolation Security

**Core Rules (reiteration from architecture doc)**:
1. Never trust `businessId` from browser
2. Resolve active business from authenticated server-side session
3. Validate membership status for every request
4. Verify business ownership for every resource operation
5. Apply tenant filters to every database query
6. Prevent cross-business access on all resources
7. Use database foreign-key constraints
8. Evaluate PostgreSQL RLS as defense-in-depth
9. Use safe transaction-scoped tenant context with Prisma connection pooling
10. Maintain audit logs for sensitive operations

**IDOR Prevention**:
- All API endpoints validate resource ownership
- Resource ID never used directly without business context check
- Example: `GET /api/v1/products/[id]` first verifies product belongs to active business
- URL parameters reviewed but not trusted

**CSRF Protection**:
- Next.js App Router forms use `csrfToken` from `next/action-response`
- Route Handlers verify `next/csrf` token for state-changing POST/PUT/DELETE
- Exempt: GET requests, webhook endpoints (use signature validation instead)
- Double-submit cookie pattern for form submissions

**XSS Protection**:
- All user-generated content escaped through React rendering
- `dangerouslySetInnerHTML` not used except for trusted internal content
- Content Security Policy (CSP) header:
  ```
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self';
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  ```
- HTML escaping library used for any inline content

### 15.2.3 SQL Injection Prevention

- **Prisma ORM** used for all database queries (parameterized queries)
- **Never** use raw `$executeRaw` or `$queryRaw` for user-supplied data
- If raw SQL absolutely necessary, use Prisma's `queryRaw` with validated parameters
- Input validation via Zod before any database operation
- Database-level CHECK constraints as secondary defense
- Prisma schema uses proper types (UUID, Decimal, String) preventing type-juggling attacks

**Example Safe Query**:
```typescript
// ❌ UNSAFE: String interpolation
const products = await prisma.$queryRaw`SELECT * FROM product WHERE name = '${name}'`;

// ✅ SAFE: Prisma ORM (parameterized)
const products = await prisma.product.findMany({
  where: { name: contains(name), businessId: activeBusiness.id },
});

// ✅ SAFE: Prisma raw with explicit parameters
const products = await prisma.$queryRaw`
  SELECT * FROM product WHERE name = ${name} AND business_id = ${activeBusinessId}
`;
```

### 15.2.4 File Upload Security

**MIME Type Validation**:
- Whitelist allowed types per purpose:
  - Product images: `image/jpeg`, `image/png`, `image/webp`
  - Documents: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument`
  - Profile photos: `image/jpeg`, `image/png`
- File extension checked against MIME type
- Server-side validation (client-side can be bypassed)

**File Size Limits**:
- Product images: max 10MB
- Invoice PDFs: max 25MB
- Profile documents: max 5MB
- General uploads: max 5MB
- Reject files exceeding limits with clear error message

**Virus Scanning** (future):
- Optional: ClamAV or third-party API on uploaded files
- Quarantine flagged files for manual review
- Not initially implemented (MVP)

**S3 Storage Security**:
- Bucket private, no public read access
- Signed URLs generated per access (valid 24 hours)
- No direct bucket URLs in responses
- CORS configured only for specific origins
- Server-side encryption (SSE-S3 or SSE-KMS) enabled

**Upload Flow**:
1. Client requests pre-signed URL from backend
2. Backend validates file type/size
3. Backend generates pre-signed URL (S3 PUT)
4. Client uploads directly to S3
5. Backend verifies metadata via `openart_upload_metadata_get`
6. File referenced by visualReference (key + bucket)
7. URL generated for display (time-limited signed URL)

### 15.2.5 Payment Security

**Webhook Signature Validation**:
- Payment gateway signs webhook events with secret key
- Verify signature before processing any payment
- Reject webhooks with invalid signatures (5xx response)
- Log rejected webhooks for security review
- Only one processing per event (idempotency key check)

**Idempotency Keys**:
- Client provides `Idempotency-Key` header on payment creation
- Server stores `key` + `payment` mapping
- Re-requests with same key return cached result
- Keys expire after 30 days
- Prevents duplicate payments from network retries

**Gateway Reference**:
- Never store full payment card details if avoidable
- Store only gateway-provided reference (tokenized)
- PCI-DSS compliance if storing any payment data
- Regular PCI compliance scans (quarterly)

**Payment Reconciliation**:
- Match webhook events to invoices/orders
- Verify amounts match exactly
- Partial payments allocated proportionally
- Failed payments retried with exponential backoff
- Reconciliation report generated daily

### 15.2.6 Audit Logging

**Logged Events** (all sensitive operations):
| Event Category | Specific Actions |
|---------------|-----------------|
| Authentication | Login, logout, password change, MFA enroll/disenroll, session revocation |
| Business | Create, update, suspend, activate, verification status changes |
| User | Create, update, role change, suspend, activate, invitation accept |
| Product | Create, update, archive, restore, price change |
| Order | Create, status change, cancel, return initiation |
| Invoice | Create, mark paid, cancel, credit note issuance |
| Payment | Create, allocate, refund, status change, webhook receipt |
| Ledger | Journal entry creation, reversal, adjustment, balance change |
| Permission | Role assignment, permission grant, revocation |
| System | Setting changes, admin actions, configuration updates |

**Audit Log Entry Structure**:
```typescript
interface AuditLogEntry {
  id: string;
  businessId: UUID | null; // null for platform-level actions
  userId: UUID | null; // null for system/admin actions
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'PERMISSION_CHANGE' | 'LOGIN' | 'LOGOUT' | 'SUSPEND' | 'ACTIVATE';
  entityType: 'User' | 'Business' | 'Product' | 'Order' | 'Invoice' | 'Payment' | 'LedgerEntry' | 'Permission';
  entityId: UUID;
  changes: Record<string, unknown>; // before/after values or change summary
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string;
  timestamp: DateTime;
}
```

**Audit Log Storage**:
- Separate table in PostgreSQL
- Append-only (no updates/deletes to existing entries)
- Indexed on: entityType, entityId, action, timestamp
- Retention: 2+ years (configurable)
- Export capability: CSV/JSON for compliance review
- Immutable: database triggers prevent modification/deletion

**Access Control**:
- SUPER_ADMIN can view all audit logs
- Business OWNER can view audit logs for their business
- Other roles: no access to audit logs
- All access to audit logs itself logged

### 15.2.7 Data Encryption

**At Rest**:
- PostgreSQL data directory: encrypted via OS-level (LUKS) or cloud provider
- S3 buckets: SSE-S3 (AWS) or SSE-KMS enabled
- Database backups: encrypted before storage
- TLS for all connections (postgres://...?sslmode=require)

**In Transit**:
- All external-facing: HTTPS/TLS 1.3+
- Internal service communication: TLS (Docker internal networking)
- Database connections: `sslmode=require`
- Redis connections: TLS (optional, enabled in production)
- API endpoints: only accessible via HTTPS

**Key Management**:
- Encryption keys stored in environment variables (never in code)
- Production: use cloud secret manager (AWS Secrets Manager, HashiCorp Vault)
- Rotation: keys rotated quarterly
- Separate keys for: database encryption, S3, JWT signing, session signing

### 15.2.8 Rate Limiting

| Endpoint Category | Max Requests | Window | Response Headers |
|------------------|-------------|--------|-----------------|
| Auth (login/register) | 5 attempts | 15 min | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| General API | 100 requests | 1 min | Same headers |
| Payment webhooks | 10 requests | 1 min | Same headers (trusted IPs exempt) |
| File upload | 5 uploads | 5 min | Same headers |
| Admin endpoints | 20 requests | 1 min | Same headers |
| GraphQL (if used) | 50 requests | 1 min | Same headers |

- Rate limit middleware applied at Next.js middleware level
- Per-IP tracking, plus per-user (authenticated) tracking for stricter limits
- `429 Too Many Requests` response when exceeded
- Retry-After header with reset timestamp

### 15.2.9 Security Headers

All responses include these security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: (see CSP above)
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 15.2.10 Security Testing Strategy

**Unit Tests**:
- Permission check functions return correct results
- Validation schemas reject invalid input
- Rate limiting counts correctly
- JWT token validation

**Integration Tests**:
- Authentication flow (register, login, verify, reset)
- Business membership management
- Cross-business access attempts blocked
- Payment webhook idempotency
- File upload validation

**Penetration Testing**:
- IDOR attempts via URL manipulation
- Cross-business data access attempts
- SQL injection attempts (all endpoints)
- XSS attempts in all user-generated content fields
- CSRF token validation
- Rate limit bypass attempts
- Session fixation/resumption attacks
- MFA bypass attempts (if enabled)

**Security Scanning**:
- Dependabot/renovate for dependency updates
- `npm audit` for known vulnerabilities
- Snyk or similar for container image scanning
- Annual third-party security assessment
- CSP validation tools
- SSL/TLS configuration audit

## 15.3 Open Security Decisions

| Decision | Options | Recommendation | Status |
|----------|---------|----------------|--------|
| Payment gateway | Stripe, Razorpay, local Nepal gateway | Evaluate Nepal providers first; favor gateway with seller payout support | Open |
| MFA rollout | Admin-only first, then all users, optional | Start with SUPER_ADMIN only, expand later | Open |
| Data residency | Nepal-based hosting, global | Start global, consider Nepal region later | Open |
| Email provider | Resend, SendGrid, Mailgun, SMTP | Resend for simplicity and deliverability | Open |
| RLS reliance | Primary isolation + RLS, or Prisma WHERE only | Prisma WHERE as primary, RLS as defense-in-depth | Recommended: Both |
| Password hashing | Argon2id, bcrypt, PBKDF2 | Argon2id (modern, recommended) | Recommended |
| Cookie SameSite | Strict, Lax, Lax for cross-site | Strict for B2B (internal usage) | Recommended: Strict |

## 15.4 Threat Model Summary

| Threat | Likelihood | Impact | Mitigation |
|--------|-----------|--------|------------|
| Unauthorized business access (IDOR) | High (if isolation broken) | Critical (data breach) | Multi-layer isolation, audits, penetration testing |
| Payment webhook replay | Medium | Financial loss | Idempotency keys, signature validation |
| Cross-site scripting (XSS) | Medium | Data theft, account takeover | Input escaping, CSP, HTML sanitization |
| SQL injection | Medium | Data breach | Prisma ORM only, no raw SQL with user data |
| Session hijacking | Medium | Account takeover | HttpOnly/Secure cookies, rate limiting, MFA |
| Business suspension bypass | Low | Unauthorized access | Session invalidation on suspension, re-verification |
| Data leakage in logs | Low | Compliance violation | Redact sensitive data, truncate logs, no PII in audit logs |
| File upload attacks | Low | Server compromise | MIME type validation, size limits, virus scanning (future) |
| Rate limit exhaustion | Low | DoS | Rate limiting with exponential backoff, captcha on exceed |
| Credential stuffing | Low | Account compromise | Rate limiting, MFA, password breach checks (future) |