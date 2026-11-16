# 02. Business Requirements

## 2.1 Organizational Requirements

### 2.1.1 Business Types
The platform supports two primary business types:
- **WHOLESALER**: Clothing manufacturers and distributors who list products, manage inventory, and fulfill orders
- **CLIENT**: Business buyers (retail shops, resellers, clothing stores) who purchase wholesale clothing

### 2.1.2 Registration and Verification
- Instant registration upon account creation
- Separate business verification process
- Verification statuses: UNVERIFIED, PENDING_VERIFICATION, VERIFIED, REJECTED, SUSPENDED
- Different feature access levels based on verification status
- Business documents can be submitted for verification

### 2.1.3 Employee Management
- Each business can have multiple employees/users
- Business roles: OWNER, MANAGER, ACCOUNTANT, SALES, INVENTORY, VIEWER
- Granular RBAC with permissions per role
- Users can belong to multiple businesses through BusinessMembership

### 2.1.4 Currency
- Default currency: NPR (Nepalese Rupee)
- All monetary values stored in smallest unit (paisa/poise) or Decimal for precision
- Currency configuration per business, but default NPR for initial release
- Future: configurable currency per business

### 2.1.5 Legal and Compliance
- Business registration required for both wholesalers and clients
- Email verification mandatory
- Password hashing with Argon2id
- Session management with secure cookies
- Audit logging for sensitive operations

## 2.2 Financial Requirements

### 2.2.1 Payment Arrangements
Three payment types supported:
1. **Online payment**: Gateway integration, webhook validation, idempotent processing
2. **Manual payment**: Buyer submits proof, wholesaler verifies, payment recorded after confirmation
3. **Credit terms**: Wholesaler-configured credit limits, payment terms, due dates, outstanding balance tracking

### 2.2.2 Invoicing
- Unique seller-specific invoice numbering
- Financial year support
- Seller and buyer information
- Product details with quantities and agreed unit prices
- Discounts, tax, and delivery charges
- PDF generation for all invoices
- Invoice immutability after issuance (corrections via credit notes)
- Payment status tracking: UNPAID, PARTIALLY_PAID, PAID, OVERDUE, REFUNDED

### 2.2.3 Payment Methods
- Online: Gateway-initiated (to be selected based on Nepal provider capabilities)
- Manual: Buyer-submitted with proof upload
- Credit: Post-delivery payment terms configured by wholesaler

### 2.2.4 Accounting
- Double-entry accounting system
- Immutable journal entries after posting
- Reversal and adjustment entries for corrections
- Per-business ledger accounts
- Consistent transaction references across both parties

## 2.3 Product and Inventory Requirements

### 2.3.1 Product Structure
- Products separated from ProductVariants
- Product: common information (name, description, brand, etc.)
- ProductVariant: size/color combinations with individual pricing and stock
- Each variant: SKU, size, color, cost price, B2B selling price, MRP, discount, MOQ, quantity

### 2.3.2 Pricing Rules
- Cost price private to wholesaler, never leaks to client APIs
- B2B selling price visible to eligible clients
- MRP visible to clients
- Discounts calculated consistently
- Bulk pricing tiers supported
- Prices snapshotted into order items on confirmation

### 2.3.3 Inventory Management
- Variant-level stock tracking
- Stock in/out operations
- Stock adjustment and movement history
- Reserved and available quantity
- Low-stock alerts
- Damaged and returned stock tracking
- Inventory valuation

## 2.4 Marketplace Requirements

### 2.4.1 Multi-Seller Checkout
- Cart may contain products from multiple sellers
- Checkout splits products into separate seller-specific orders
- Aggregated purchase summary shown to client
- Separate orders, invoices, and shipments per seller

### 2.4.2 Product Discovery
- Product catalog from all eligible wholesalers
- Categories and subcategories
- Product search and filtering
- Size, color, and price filters
- Stock availability filtering
- MRP and B2B price display
- Bulk pricing and MOQ display

### 2.4.3 Enquiries and Quotations
- Client sends product enquiries
- Wholesaler responds with quotations
- Quotations support validity dates, quantities, discounts, MOQ, tax, delivery and payment terms
- Quotation revision history
- Accepted quotations convert to orders
- Rejected quotations preserved in history

## 2.5 Order Management Requirements

### 2.5.1 Order Lifecycle
- New, Pending, Accepted, Processing, Ready for dispatch, Dispatched, Delivered, Completed, Cancelled, Returned

### 2.5.2 Order Items
- Per-seller order items
- Product variant information
- Quantities and pricing at time of order
- Seller-specific shipping information

### 2.5.3 Delivery Management
- Delivery address per order
- Delivery charges per wholesaler
- Shipment records with tracking reference
- Dispatch and estimated delivery dates
- Delivery status updates
- Proof of delivery (optional)

## 2.6 Client Dashboard Requirements

### 2.6.1 Purchase Overview
- Total purchases and orders
- Pending orders count
- Total paid and payable amounts
- Outstanding balance and overdue payments
- Supplier-wise purchase breakdown
- Monthly purchase analytics

### 2.6.2 Financial Tracking
- Purchase invoices
- Payment history
- Partial payments
- Outstanding balances per supplier
- Due dates tracking
- Overdue payment monitoring
- PDF and Excel exports

### 2.6.3 Return Management
- Request returns for eligible orders
- Return item tracking
- Return reason recording

## 2.7 Wholesaler Dashboard Requirements

### 2.7.1 Business Overview
- Total products, active products
- Total stock, low-stock alerts
- Total orders, total sales
- Total invoiced amount, amount received, amount receivable, overdue amount
- Monthly sales charts
- Top-selling products
- Low-stock products
- Recent transactions

### 2.7.2 Product Management
- CRUD operations on products and variants
- Image management (multiple product images)
- Variant SKU and pricing per variant
- MOQ and bulk pricing tiers
- Product status (active, archived)

### 2.7.3 Inventory Management
- Stock level monitoring per variant
- Stock movement history
- Stock adjustment entries
- Reserved stock for pending orders
- Available stock calculation
- Damaged and returned stock tracking

### 2.7.4 Customer Management
- Customer list per wholesaler
- Customer profiles with contact information
- Customer order history
- Customer-wise outstanding balances
- Credit limits per customer
- Payment terms per customer
- Customer ledgers

### 2.7.5 Enquiry Management
- Receive product enquiries from clients
- Respond to client enquiries
- Send messages to clients
- Prepare and send quotations
- Modify quantity and pricing in quotations
- Accept or reject quotation requests
- Convert accepted quotations into orders

### 2.7.6 Financial Management
- Sales invoices with unique seller-specific numbering
- Invoice items with product details
- Payment records (online, manual, credit)
- Partial payments
- Outstanding invoices
- Overdue invoices
- Customer-wise ledger
- Accounts receivable reporting
- Sales reports
- PDF invoices and Excel exports

## 2.8 Admin Requirements

### 2.8.1 Platform Overview
- Total registered businesses
- Total wholesalers and clients
- Business verification overview
- Product moderation queue
- Global order and invoice monitoring
- Payment monitoring
- Dispute and complaint management
- Business suspension and activation
- Global reports
- Audit logs

### 2.8.2 Configuration
- Tax and currency configuration
- System settings
- Security monitoring
- Notification management

### 2.8.3 Moderation
- Business verification approval/rejection
- Product moderation
- User suspension and activation
- Platform-wide setting changes