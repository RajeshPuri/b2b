# 17. UI/UX Dashboard Specifications

## 17.1 Design System Overview

### 17.1.1 Design Principles
- **Professional B2B**: Clean, business-focused, not consumer-focused
- **Productivity-first**: Quick access to key data, efficient workflows
- **Trust-inspiring**: Stable, reliable, authoritative visual design
- **Data-dense**: Show meaningful information without overwhelming
- **Responsive**: Work across desktop (primary), tablet, mobile (browsing only)

### 17.1.2 Design Tokens (Tailwind CSS)
```css
/* Color Palette */
:root {
  --b2b-primary: #18181b;       /* Dark navy, primary actions */
  --b2b-primary-light: #27272a; /* Lighter primary */
  --b2b-secondary: #f3f4f6;     /* Light gray, backgrounds */
  --b2b-success: #22c55e;       /* Green, positive actions */
  --b2b-warning: #eab308;       /* Yellow, warnings */
  --b2b-error: #ef4444;         /* Red, errors/alerts */
  --b2b-info: #3b82f6;          /* Blue, info links */
  --b2b-text-primary: #18181b;  /* Primary text */
  --b2b-text-secondary: #6b7280; /* Secondary text */
  --b2b-border: #d1d5db;        /* Borders */
  --b2b-background: #ffffff;     /* Page background */
  --b2b-sidebar-bg: #18181b;    /* Sidebar */
  --b2b-sidebar-text: #f3f4f6;  /* Sidebar text */
}

/* Typography */
font-family: 'Inter', system-ui, -apple-system, sans-serif;
h1-h6 scales with proper vertical rhythm;
monospace: 'Fira Code', 'JetBrains Mono', monospace;

/* Spacing Scale */
spacing: 4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px, 64px;

/* Border Radius */
radius: 4px, 8px, 12px, 16px;

/* Shadow */
shadow: none, sm (4px 4px 8px rgba(0,0,0,0.05)), md, lg;
```

### 17.1.3 Component Library
- **shadcn/ui** components as base: buttons, inputs, dialogs, tables, tabs, accordion, etc.
- **Custom extensions**: Data tables with sorting/filtering, charts with Recharts, cards with summary stats
- **Icon system**: Lucide React
- **Form components**: React Hook Form + Zod integration, error display patterns

## 17.2 Admin Dashboard Specification

### 17.2.1 Layout
- **Sidebar navigation** (collapsible on mobile)
- **Top bar**: Notifications, user menu, search
- **Main content**: Grid of summary cards + detailed sections

### 17.2.2 Summary Cards (Dashboard Home)
| Card | Description | Key Metrics |
|------|-------------|-------------|
| Total Businesses | Count of all registered businesses | Number, trend arrow |
| Total Wholesalers | Count of verified wholesalers | Number, trend |
| Total Clients | Count of business clients | Number, trend |
| Pending Verification | Businesses awaiting verification | Number |
| Total Products | Products across all wholesalers | Number |
| Total Orders | Orders in all statuses | Number |
| Platform Revenue | Total invoiced amount | NPR, trend |
| Overdue Payments | Total overdue amount | NPR, count |

### 17.2.3 Business Moderation Queue
- Table with columns: Business name, Type, Verification status, Registered date, Actions
- Filterable: All, Verified, Pending, Rejected, Suspended
- Bulk actions: Verify selected, Suspend selected, Activate selected
- Individual action: View business details, View products, Suspend/Activate

### 17.2.4 Product Moderation
- Queue of products flagged for review
- Columns: Product name, Wholesaler, Category, Status, Issue, Actions
- Actions: Approve, Reject, Request modifications
- Filter by category, wholesaler, issue type

### 17.2.5 Global Reports
- **Date range picker**: Custom range or preset (last 7 days, last 30 days, this year)
- **Export**: CSV/Excel button on each report
- **Sortable column headers**
- **Pagination** with page size selector

### 17.2.6 Audit Logs
- Paginated list of all platform-wide actions
- Columns: Timestamp, User, Business, Action, Entity, Details
- Searchable by action type, entity, business
- Exportable for compliance review
- Immutable display (read-only)

### 17.2.7 System Settings
- Key-value pairs with JSON values where needed
- Business scope toggle (global vs business-specific)
- Save and validate changes
- Change history tracked

## 17.3 Wholesaler Dashboard Specification

### 17.3.1 Layout
- **Fixed sidebar** with navigation items specific to wholesaler role
- **Breadcrumb trail** showing: Dashboard → [Section]
- **Responsive**: Sidebar collapses to hamburger on narrow screens

### 17.3.2 Dashboard Overview Cards
| Card | Description |
|------|-------------|
| Total Products | Count of active products |
| Active Products | Count currently available |
| Total Stock | Total units across all variants |
| Total Orders | Count of orders (all statuses) |
| Total Invoiced | NPR amount invoiced to clients |
| Amount Received | NPR total received from clients |
| Amount Receivable | NPR outstanding from clients |
| Overdue Amount | NPR overdue, past due date |
| Monthly Sales Chart | Line chart: last 12 months |
| Top Products | Bar chart: top 10 by sales quantity |

### 17.3.3 Product Management UI
**Product Form Sections**:
1. **Basic Info**: Name, SKU, Category, Subcategory, Description, Brand
2. **Product Media**: Multiple image upload, main image thumbnail preview
3. **Variant Configuration**: 
   - Add variant row: Size, Color, SKU (per variant)
   - Cost price (internal, not visible to clients)
   - B2B selling price (visible to eligible clients)
   - MRP (visible to clients)
   - Discount percentage
   - Minimum Order Quantity (MOQ)
   - Bulk pricing tiers (quantity breakpoints)
4. **Product Settings**: Status (Active/Archived), Inventory tracking

**Variant Table** (editable inline):
| Size | Color | Cost Price | B2B Price | MRP | MOQ | Stock | Actions |
|------|-------|------------|-----------|-----|-----|-------|---------|

**Image Management**:
- Drag-and-drop upload
- Main image toggle per variant
- Thumbnail grid preview
- Remove individual images
- Support WebP, JPEG, PNG formats

### 17.3.4 Inventory Management UI
**Stock Level Display**:
- Per-variant stock level with color coding:
  - Green: > 20 units
  - Yellow: 5-20 units (low stock warning)
  - Red: < 5 units (critical)

**Stock Operations**:
- **Stock In**: Form to add quantity, reference order/PO, notes
- **Stock Out**: Form to remove quantity, reason, notes
- **Stock Adjustment**: Form to set new quantity, reason (damage, count adjustment, return)
- **Reserve Stock**: When confirming order, auto-reserve; manual override if needed

**Stock Movement History** table:
| Date | Type | Quantity | Reference | Balance | Moved By |
|------|------|----------|-----------|---------|----------|

**Low-Stock Alerts**:
- Banner at top of dashboard when any variant below threshold
- Clickable to navigate to low-stock products list
- Configurable threshold per product/variant

### 17.3.5 Customer Management UI
**Customer Table** with inline editing:
| Customer Name | Contact | Order History | Outstanding | Credit Limit | Terms | Actions |
|---------------|---------|---------------|-------------|--------------|-------|---------|

**Customer Profile Page**:
- Basic info: Company name, GST number, contact person, email, phone, address
- Payment profile: Credit limit, payment terms, current outstanding
- Order history: Paginated list of all orders with totals
- Payment history: All payments received with dates and amounts
- Communication log: Notes from previous interactions

**Credit Limit Management**:
- Input field for credit limit
- Current outstanding auto-calculated
- Utilization percentage displayed
- Warning when utilization > 80%
- Override reason required for exceeding limit

### 17.3.6 Enquiry Management UI
**Enquiry List** with filters:
- Status: Open, Responded, Closed
- Wholesaler: Filter by specific wholesaler
- Date range: Created date

**Enquiry Detail Page**:
- Enquiry information: Client business, products requested, quantities, message
- Message thread: Wholesaler-client messages
- Action buttons: Send quotation, Send message, Close enquiry
- Quick action: Create quotation from this enquiry (pre-fills form)

**Quotation Quick Action**:
- Modal form from enquiry
- Pre-populated with enquiry products/quantities
- Adjustable pricing, MOQ, validity date
- Send to client with one click

### 17.3.7 Order Management UI
**Order List** with status badges and filters:
- Status filter: All, Pending, Accepted, Processing, Ready, Dispatched, Delivered, Completed, Cancelled
- Date range filter
- Client filter (if multiple clients)

**Order Detail Page** (tabs):
1. **Order Summary**: Client info, totals, payment status, dates
2. **Order Items**: Product variants, quantities, prices, subtotals
3. **Shipment**: Tracking number, provider, status, estimated delivery
4. **Payment Status**: Invoice details, payment status, amounts paid/received
5. **Return Requests**: Any returns associated with this order

**Status Transition** (from order detail):
- Dropdown with valid next statuses based on current status
- Required notes for some transitions (e.g., "Cancelled - reason")
- Audit log entry automatic

### 17.3.8 Delivery Management UI
**Shipment Creation Form**:
- Carrier/dropdown selection
- Tracking number input
- Dispatch date (calendar picker)
- Estimated delivery date (auto-calculated or manual)
- Shipping address (from order or override)
- Delivery charges (editable if needed)
- Insurance option (checkbox)

**Shipment Tracking Page**:
- Current status indicator
- Timeline of status changes
- Tracking number link (to carrier's site)
- Estimated vs actual delivery
- Proof of delivery upload (signature photo, etc.)

### 17.3.9 Financial Management UI
**Sales Invoice Creation**:
- Select client from customer list
- Auto-populate from order items or add manually
- Discount percentage field
- Tax rate selection (configurable per business)
- Delivery charges input
- Preview before issuance

**Payment Recording**:
- Two tabs: Online payment, Manual payment
- Online: Gateway reference, transaction ID
- Manual: Proof upload, verified by (user), verification date
- Allocate payment to specific invoices
- Partial payment support with remaining balance display

**Customer Ledger**:
- Running balance: Starting + All payments - All invoices
- Transaction list: Date, type (invoice/payment/credit note), description, amount, balance after
- Filter by date range, invoice, payment
- Export to CSV/Excel

**Sales Reports**:
- Monthly sales chart (line chart)
- Top products by quantity/revenue
- Customer purchase patterns
- Payment method distribution
- Date range picker
- Export functionality

## 17.4 Client Dashboard Specification

### 17.4.1 Layout
- **Sidebar navigation** with sections: Dashboard, Marketplace, Cart, Enquiries, Orders, Invoices, Profile
- **Top bar**: Business name, notification count, user menu
- **Responsive**: Full sidebar on desktop, collapsible/hamburger on mobile

### 17.4.2 Dashboard Overview Cards
| Card | Description |
|------|-------------|
| Total Purchases | Count of all orders |
| Total Orders | Count (all statuses) |
| Total Paid | NPR amount paid to suppliers |
| Total Payable | NPR amount still owed |
| Outstanding Balance | NPR net amount owed |
| Overdue Payments | NPR overdue, count of overdue invoices |
| Number of Suppliers | Count of different wholesalers purchased from |
| Recent Invoices | List of most recent invoices |

### 17.4.3 Marketplace Browsing UI
**Product Grid** (responsive):
- Desktop: 4 columns, Tablet: 2 columns, Mobile: 1 column
- Each card: Product image, name, wholesaler name, MRP, B2B price (if authenticated)
- Hover effects: Quick view, compare action

**Product Filters Sidebar**:
- Categories (collapsible tree)
- Price range slider
- MOQ filter
- Stock availability toggle
- Size filter (multi-select)
- Color filter (multi-select)
- Brand filter (if applicable)
- Sort by: Relevance, Price low-high, Price high-low, Newest, Best-selling

**Product Detail Page**:
- Product images gallery (thumbnail carousel)
- Product name, SKU, brand
- Description
- **Two price displays**: MRP (always visible), B2B price (requires auth/eligibility)
- Variant selector: Size + Color
- MOQ display: "Minimum order: X units"
- Bulk pricing tiers: "Buy 5+, get 10% off"
- Stock availability: "In stock (Y units)"
- Wholesaler storefront: Name, follow/ contact button
- Add to cart button with quantity selector
- Send enquiry button (opens modal with pre-filled form)
- Compare button (add to comparison list)

**Marketplace Search**:
- Full-text search across product names, descriptions, SKUs
- Search results page with same grid layout
- No results state: "No products found. Try different keywords or filters."

### 17.4.4 Cart UI
**Cart Drawer/Page**:
- Product summary with variant (size/color)
- Quantity selector (+/- buttons)
- Remove item button
- **Seller grouping**: Display which wholesaler each item comes from
- Subtotal calculation
- Discount code input (if applicable)
- Tax estimate display
- Delivery charges estimation per wholesaler
- **Final payable amount** prominently displayed
- **Split order warning**: "Items from 2 sellers will create separate orders"

**Cart Persistence**:
- Local storage cart for anonymous users
- Persistent cart when user logs in (merge with stored cart)
- Cart expires after 30 days of inactivity
- Clear cart button

### 17.4.5 Enquiries and Quotations UI
**Send Enquiry Modal**:
- Select product(s) and variants
- Enter requested quantity
- Add message/special requirements
- Select target wholesaler (or let platform suggest)
- Submit inquiry

**Receive Quotation**:
- Notification when wholesaler sends quotation
- Quotation detail page with tabs:
  - Quotation summary (products, quantities, pricing)
  - Validity period countdown
  - Terms (MOQ, delivery, payment)
  - Message thread with wholesaler
  - Accept/Reject buttons
- **Accept Quotation** flow:
  - Confirm quantities one more time
  - Select shipping address (or use cart address)
  - Proceed to checkout (creates order(s))
  - Quotation status: ACCEPTED

**Request Quotation**:
- Similar to send enquiry but specifically priced
- May include bulk pricing request
- Wholesaler responds with quotation

### 17.4.6 Order Management UI
**Order List** with status filters and search:
- Status: All, Pending, Processing, Dispatched, Delivered, Completed, Cancelled
- Date range filter
- Supplier filter (wholesaler)
- Search by order number

**Order Detail Page** (similar to wholesaler but client-facing):
- Order summary with seller grouping
- Itemized product list with variant info
- Status tracker with visual progression
- Shipment tracking information
- Download invoice button
- Request return button (if eligible)
- Cancel order button (if eligible)
- Add to compare list

**Return Request** flow:
- Select items to return
- Enter reason (defective, wrong item, changed mind)
- Enter quantity to return
- Submit request
- Wholesaler approval/rejection
- If approved: Return shipping label or instructions
- Refund processing time communication

### 17.4.7 Invoice and Payment UI
**Purchase Invoice List** with filters:
- Status: All, Unpaid, Partially Paid, Paid, Overdue
- Date range
- Supplier filter

**Invoice Detail Page**:
- Invoice number and date
- Supplier information
- Line items: Product, quantity, unit price, total per line
- Subtotal, discount, tax, delivery charges, total
- Payment status badge
- Due date with overdue indicator
- **Pay now** button (online payment initiation)
- **Mark as paid** (manual payment recording)
- Payment history: All payments received against this invoice
- **Download PDF** button
- **Export to Excel** button

**Payment History** (client-side):
- All payments made listed chronologically
- Filter by invoice, date range
- Receipt download
- Partial payment tracking

**Outstanding Balance**:
- Calculation: Total owed across all suppliers - Total paid
- Per-supplier breakdown
- Overdue summary
- Credit limit info (if applicable)

## 17.5 Public Marketplace Specification (Unauthenticated)

### 17.5.1 Browsing Experience
- Visitors can browse product catalog without authentication
- **B2B pricing hidden**: Show "Login to see wholesale price" or "Contact wholesaler"
- MRP always visible
- Basic product info: Name, category, images
- Limited filtering (category only, no price/stock filters without login)

### 17.5.2 Product Detail (Public)
- Product information visible
- MRP displayed
- "Contact wholesaler" or "Send enquiry" CTA
- "Login for wholesale price" notice
- No add to cart without authentication
- No quotation/request without authentication

### 17.5.3 Search (Public)
- Basic search functionality
- Filter by category only
- No price/stock filters visible without login
- Pagination with limited results (e.g., first 10 products)

## 17.6 UI/UX Interaction Patterns

### 17.6.1 Loading States
- **Skeleton loaders** on all data-fetching pages
- **Spinners** for inline operations
- **Page-level loader** with progress percentage for long operations
- **Empty states** when no data available (illustrative + action trigger)

### 17.6.2 Error States
- **404 Page**: Friendly message, link to dashboard/home
- **403 Access Denied**: Clear message "You don't have access to this resource", link to dashboard
- **API Error**: User-friendly message + error code, option to retry
- **Network Error**: Retry button, check connection message
- **Validation Error**: Inline field highlighting, error summary at top of form

### 17.6.3 Confirmation Dialogs
- **Delete/Archive actions**: "Are you sure you want to [action]?" with Cancel/Confirm
- **Order cancellation**: "This will cancel the order and release stock. Continue?"
- **Payment actions**: "Are you sure you want to mark this as paid?" 
- **Return initiation**: "This will initiate a return. Continue?"
- **Modal with**: Question text, secondary Cancel button, primary action button (danger style)

### 17.6.4 Form Validation Patterns
- **Real-time validation**: On blur or on submit (configurable)
- **Error messages**: Specific to each field, displayed below field
- **Error summary**: At top of form, list all errors with links to fields
- **Success state**: Green checkmark, success message, auto-close after 3 seconds (optional)
- **Disabled submit**: While validation pending or form saving

### 17.6.5 Empty States
- **No products**: "No products found. Try adjusting your filters." + CTA to add product (for wholesalers) or browse marketplace
- **No orders**: "No orders yet. Start by browsing products." 
- **No invoices**: "No invoices yet. Make your first purchase."
- **No customers**: "Add customers to track their orders and balances."
- **Illustrative graphics** + secondary CTAs

### 17.6.6 Dark/Light Theme
- **Tailwind CSS dark mode** with `class` strategy (e.g., `class="dark"` on `<html>`)
- **Color palette** adjusted for both themes
- **Shadcn/ui** components support dark mode out of box
- **Key colors** in both light and dark:
  - Primary: Same hue, adjusted lightness
  - Success: `#22c55e` light mode, `#16a34a` dark mode
  - Warning: `#eab308` light mode, `#a855f6` dark mode
  - Error: `#ef4444` light mode, `#f87171` dark mode
  - Background: `#fff` light, `#18181b` dark

### 17.6.7 Responsive Breakpoints
| Screen | Width | Layout |
|--------|-------|--------|
| Mobile | < 640px | Single column, stacked, full-width touch targets min 44px |
| Tablet | 640px - 1024px | 2-column layout where possible, collapsible sidebar |
| Laptop | 1024px - 1536px | Full dashboard with sidebar, 2-4 column grids |
| Desktop | > 1536px | Full features, multi-pane layouts possible |

### 17.6.8 Accessibility (WCAG 2.1 AA)
- **Keyboard navigation**: Tab order logical, Escape closes modals/dialogs
- **Focus visible**: Outline or background change on focus
- **Color contrast**: Minimum 4.5:1 for text, 3:1 for large text/UI components
- **Screen reader**: Semantic HTML, aria-labels on interactive elements, roles where needed
- **Resize text**: Up to 200% zoom without loss of functionality
- **Skip links**: "Skip to main content" at top of sidebar-heavy pages

### 17.6.9 Motion and Animation
- **Subtle only**: No auto-playing, motion-reducing preferred
- **Transition durations**: 150ms (fast), 250ms (normal), 400ms (slow)
- **Easing**: ease-out for most transitions
- **Reduce motion**: `prefers-reduced-motion` media query respects user preference
- **Loading skeletons**: Instead of spinners where possible for content appearance

### 17.6.10 Confirmation and Feedback
- **Success toasts** (Sonner or similar): "Quotation sent!", "Invoice generated!", "Order placed!"
- **Error toasts**: "Failed to send quotation", "Insufficient stock"
- **Warning notifications**: "3 invoices overdue", "Low stock on 5 variants"
- **Progress feedback**: For multi-step forms, progress indicator
- **Inline success**: "Saved!" next to field, disappears after 2 seconds

## 17.7 Dashboard Specifications Summary

| Section | Key Pages | Primary Audience |
|---------|-----------|-----------------|
| **Admin** | 1. Dashboard, 2. Business moderation, 3. Product moderation, 4. Global reports, 5. Audit logs, 6. System settings | Super admin |
| **Wholesaler** | 1. Dashboard overview, 2. Product management, 3. Inventory, 4. Customers, 5. Enquiries/Quotations, 6. Orders, 7. Delivery, 8. Financial (invoices/payments/ledger) | Wholesaler OWNER/MANAGER/ACCOUNTANT |
| **Client** | 1. Dashboard overview, 2. Marketplace browse/search, 3. Product details, 4. Cart, 5. Enquiries/Quotations, 6. Orders, 7. Invoices/Payments, 8. Return requests, 9. Ledger/Outstanding | Client business OWNER/MANAGER/SALES |
| **Public** | 1. Product browse, 2. Product detail (limited), 3. Search | Visitors ( unauthenticated) |

## 17.8 UI Component Library Specification

| Component | shadcn/ui Base | Customizations | Usage |
|-----------|---------------|----------------|-------|
| Button | Button | Size variants (sm, md, lg, icon), loading state, disabled styling | Throughout all pages |
| Input | Input | Size variants, prefix/suffix icons, error message placement | Forms, search filters |
| Dialog | Dialog | Size variants (sm, md, lg), footer actions, backdrop click-to-close | Modals, confirmation dialogs |
| Dropdown Menu | Dropdown Menu | Command palette style, keyboard navigation, separator items | Account switcher, role menus |
| Card | Card | Header/footer slots, shadow variants, border radius | Summary cards, product grids |
| Table | Table | Horizontal scrolling, sticky header, sortable columns | Data tables (orders, invoices, inventory) |
| Progress | Progress | Strip vs bar, animated, min/max values | Order processing progress, invoice generation |
| Alert | Alert | Variants (default, destructive, warning, success) | Inline messages, error summaries |
| Toast | Not originally | Sonner integration | Global notifications, success/error |
| Separator | Separator | Horizontal/vertical, dashed option | Section dividers |
| Avatar | Avatar | Initials generation, size variants | User initials in headers, tables |
| Badge | Badge | Variants, pill shape, count badges | Status badges (ACTIVE, OVERDUE, etc.) |
| Avatar Group | Not originally | Group avatar for multiple sellers | Cart item seller indicators |
| Calendar | Pickers | Date range, date selection, week/month view | Date pickers throughout |
| Switch | Switch | Track styles, checked/unchecked colors | Toggle features, dark mode toggle |

## 17.9 UI/UX Workflow Specifications

### 17.9.1 Multi-Seller Checkout Workflow
1. Cart contains items from multiple wholesalers
2. Checkout page shows aggregated total
3. **Warning**: "Items from 2 sellers will create separate orders"
4. Client confirms proceeds
5. System splits into separate order flows
6. Each seller gets their own order, invoice, shipment
7. Client sees: "Order placed with 2 wholesalers, total: Rs. 50,000"
8. Individual order confirmations and tracking from each wholesaler

### 17.9.2 Quotation Negotiation Workflow
1. Client sends enquiry → Wholesaler receives
2. Wholesaler sends quotation with pricing, MOQ, terms
3. Client receives quotation → Reviews validity period
4. Client can: Accept, Reject, or Request Revision
5. If Revision: Wholesaler modifies and resends
6. If Accept: Client confirms, order created
7. If Reject: Quotation preserved in history, client can re-enquire

### 17.9.3 Order Status Tracking Workflow
1. Order created → Status: PENDING
2. Wholesaler accepts → Status: ACCEPTED
3. Warehouse prepares → Status: PROCESSING
4. Ready to dispatch → Status: READY_FOR_DISPATCH
5. Dispatched with tracking → Status: DISPATCHED
6. In transit → In transit (updates from shipment tracking)
7. Delivered → Status: DELIVERED
8. Completed after confirmation → Status: COMPLETED
9. Any point: Cancelled if client/wholesaler requests

Each status transition has:
- Visual indicator (progress bar or stepper)
- Valid next statuses based on current
- Required notes for some transitions
- Email notification on status change