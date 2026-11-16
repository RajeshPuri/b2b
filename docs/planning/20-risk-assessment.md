# 21. Risk Assessment

## 21.1 Technical Risks

### 21.1.1 Database Isolation Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Cross-tenant data leakage via Prisma query bug | Medium | Critical (data breach) | Multi-layer defense: Prisma WHERE + RLS + middleware validation; rigorous integration tests |
| Connection pooler RLS context loss | Medium | High (data leakage) | Application-level WHERE filter as primary; RLS as secondary; test with PgBouncer |
| Migration data loss | Low | Critical | Backup before every production migration; migration rollback tested in dev |
| Schema drift (production vs prod) | Low | Medium | CI/CD enforces `prisma migrate deploy`; schema auto-generated from code |

### 21.1.2 Financial Calculation Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Floating-point precision errors | High | High (financial loss/legal) | Decimal storage only; no float types anywhere; dedicated precision tests |
| Rounding discrepancies across calculations | Medium | High (ledger imbalance) | Single source of truth for rounding rules; test all calculation paths |
| Invoice total mismatch (subtotal + tax + delivery ≠ total) | Medium | High (accounting errors) | Computed field validation; generate invoice total from line items, not stored independently |
| Credit note + refund reconciliation errors | Medium | Medium | Single source of truth: outstanding balance = total invoices - sum(all payments + credit notes) |
| Payment allocation across multiple invoices | Medium | Medium | Allocation order matters (oldest first); test all allocation scenarios |

### 21.1.3 Performance Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Product catalog search performance at scale | Medium | Medium | Implement search index (Algolia/Meilisearch) after MVP; database indexes on frequently filtered fields |
| Dashboard chart rendering with large data | Low | Medium | Paginate data fed to charts; use client-side canvas for very large datasets |
| Concurrent order processing stock oversell | Medium | High (sell more than stock) | Database-level row locking or optimistic locking; single transaction for stock check + reserve |
| Webhook processing backlog | Low | Medium | BullMQ queue with concurrency limits; dead letter queue for failed jobs |

### 21.1.4 Security Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Authentication bypass (Auth.js misconfiguration) | Low | Critical | Regular Auth.js version updates; session secret rotation; penetration testing |
| CSRF attacks on state-changing forms | Medium | High | Next.js built-in CSRF protection; verify tokens on all POST/PUT/DELETE |
| XSS via user-generated content (product names, descriptions) | Medium | High | React auto-escaping; Content Security Policy; never use `dangerouslySetInnerHTML` |
| SQL injection via Prisma raw queries | Low | High | Prisma ORM only for data operations; no raw SQL with user input |
| Session fixation/hijacking | Medium | High | HttpOnly/Secure/SameSite cookies; session renewal on privilege changes |
| Payment gateway fraud (stolen cards) | Medium | Financial | Gateway fraud detection; transaction velocity limits; IDempotency keys; 3D Secure support |

### 21.1.5 Operational Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Docker compose failure in production | Low | High | Health checks; orchestration (K8s) as scale-up; documented restart procedure |
| SSL certificate expiry | Low | High (site down) | Auto-renewal via Certbot/Cert manager; 30-day advance renewal reminders |
| Database backup corruption | Low | Critical | Test restores quarterly; multiple backup copies (local + off-site); checksum verification |
| Key rotation forgotten (JWT, encryption) | Medium | Medium | Schedule in calendar; automated rotation scripts; secrets manager with versioning |
| Team member departure with knowledge gap | Medium | Medium | Documentation requirement; knowledge sharing sessions; code review bus factor |

---

## 21.2 Business Risks

### 21.2.1 Market/Execution Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Low Nepal wholesale marketplace adoption | Medium | High | Validate market need before full build; MVP with minimal features first; talk to potential wholesalers/clients |
| Wholesalers unwilling to digitize catalogs | Medium | High | Provide value beyond marketplace (inventory management, enquiry system); low entry barrier |
| Clients prefer existing supplier relationships | Medium | High | Highlight savings/transparency; offer introductory pricing; free onboarding |
| Nepal payment gateway limitations | Medium | High | Research gateway capabilities early; have manual payment fallback; consider credit terms initially |
| Currency expansion delays (beyond NPR) | Low | Medium | Build architecture configurable for multiple currencies from start; NPR-first but designed for expansion |

### 21.2.2 Regulatory/Compliance Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Nepal tax compliance (VAT/GST) | Medium | High | Consult Nepal tax advisor; configure tax rates in system settings; generate tax-compliant invoices |
| Data privacy laws (personal data in ledger/customers) | Medium | Medium | Data minimization; privacy policy; user consent for data processing; data retention policy |
| Audit requirements for financial records | Medium | Medium | 7-year record retention; audit-ready report generation; immutable journal entries |
| Business verification compliance | Low | Medium | Clear verification criteria; document verification process; maintain audit logs for verification decisions |

### 21.2.3 Competition Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Established competitors already in market | Low | Medium | Differciate on B2B focus, Nepal focus, no commission, deep features; niche focus |
| Larger e-commerce platforms add B2B features | Medium | Medium | Focus on wholesale-specific features (MOQ, bulk pricing, credit, inventory); deep domain expertise |
| Race to bottom on pricing | Low | Medium | No platform commission; value on tools/features not price; educate on total cost of ownership |

---

## 21.3 Mitigation Priority Matrix

| Priority | Risk Category | Address In | Mitigation Cost | Notes |
|----------|--------------|------------|-----------------|-------|
| P1 | Financial precision | Milestone 1 | Low | Use Decimal from day 1; add tests early |
| P2 | Tenant isolation | Milestone 1 | Medium | Multi-layer defense; test every feature |
| P3 | Payment webhook idempotency | Milestone 6 | Medium | Idempotency key infrastructure from start |
| P4 | Database migration safety | Milestone 1 | Low | Backup before every prod migration |
| P5 | RLS + Prisma interaction | Milestone 1 | Medium | Test with connection pooler; apply WHERE filter primarily |
| P6 | SEO / marketplace discoverability | Milestone 4 | Low | Basic SEO from start; expand later |
| P7 | Nepal payment gateway integration | Milestone 6 | High | Early research; have manual fallback |
| P8 | Regulatory tax compliance | Milestone 6 | Medium | Consult advisor; configure system from start |
| P9 | Team capacity/scaling | Throughout | Variable | Regular roadmap reviews; adjust scope |
| P10 | Feature creep | Throughout | Low | Strict milestone gates; only add if critical |

---

## 21.4 Open Questions and Decision Points

| # | Decision | Options | Default/Recommended | Owner | Decision Required By |
|---|----------|---------|--------------------|-------|---------------------|
| 1 | Nepal payment gateway | Stripe, Razorpay, local gateway, manual only | Manual + credit terms initially; gateway later | Architect | Before Milestone 6 |
| 2 | Tax rate for Nepal | 13% VAT standard, configurable per business | 13% default, configurable | Accountant | Before Milestone 6 |
| 3 | Credit terms default | Net 30 days, configurable | Net 30 days | Architect | Before Milestone 6 |
| 4 | Search implementation | Database LIKE + pagination, Algolia/Meilisearch later | Database index + pagination for MVP; upgrade later | Architect | Before Milestone 4 |
| 5 | Report fiscal year | Calendar year (Jan-Dec), Nepal fiscal (Jul-Jun) | Calendar year Jan-Dec for MVP; configurable | Accountant | Before Milestone 7 |
| 6 | Email provider | Resend, SendGrid, Mailgun, SMTP | Resend for simplicity and deliverability | CTO | Before Milestone 7 |
| 7 | MFA rollout | Admin-only (Phase 1), All users (Phase 2), Optional | SUPER_ADMIN only for Phase 1 | CTO | Before Milestone 8 |
| 8 | Dark mode support | From Day 1, later release | From Day 1 (design system includes) | UI/UX Lead | Before Milestone 1 |
| 9 | Mobile responsiveness | Mobile-first, desktop-first, responsive | Responsive (desktop-primary, mobile-browsing) | UI/UX Lead | Before Milestone 1 |
|10 | Admin authentication flow | Email/password only, + social, + passwordless | Email/password mandatory; social optional later | CTO | Before Milestone 1 |

---

## 21.5 Risk Review Schedule

| Frequency | Audience | Focus |
|-----------|----------|-------|
| **Daily** | Development team | New risks from code changes; check task board |
| **Weekly** | Project lead | Open risks status; new risks identified; mitigation progress |
| **Monthly** | Steering committee | Risk exposure summary; resource reallocation if needed |
| **Per milestone** | All stakeholders | Milestone-specific risks; go/no-go decision |
| **Before each release** | Security team | Final vulnerability review; penetration test summary |
| **On incident** | All stakeholders | Post-mortem; update risk register with lessons learned |

---

## 21.6 Final Risk Assessment Summary

**Overall Risk Level**: MEDIUM-HIGH

**Primary Risk Areas**:
1. **Financial precision** (critical - must get right from start)
2. **Tenant isolation** (critical - data privacy law compliance)
3. **Payment processing** (high - core revenue flow)
4. **Database RLS + Prisma interaction** (high - isolation mechanism)

**Key Success Factors**:
1. Decimal precision for all monetary calculations from Day 1
2. Tenant isolation by design, not by afterthought
3. Payment webhook idempotency implementation
4. Comprehensive test coverage for financial and isolation logic
5. Regular risk review and mitigation tracking

**Go/No-Go Criteria**:
- ✅ Decimal type used for all money fields in Prisma schema
- ✅ Tenant isolation middleware tested and working
- ✅ Payment idempotency key infrastructure in place
- ✅ No critical security vulnerabilities found in penetration testing
- ✅ Backup/restore procedure tested successfully
- ✅ All milestone acceptance criteria met

If any go/criteria are not met, pause implementation and resolve before proceeding.