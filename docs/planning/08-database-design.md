# 09. Detailed Database ERD

## 9.1 Entity Relationship Diagram

```mermaid
erDiagram
    %% ========== IDENTITY TABLES ==========
    
    User {
        id UUID [PK]
        email String [Unique]
        passwordHash String
        name String
        emailVerified DateTime
        image String
        status Enum {ACTIVE, SUSPENDED, DELETED}
        createdAt DateTime
        updatedAt DateTime
    }
    
    Session {
        id String [PK]
        userId UUID [FK→User]
        expiresAt DateTime
        createdAt DateTime
        ipAddress String
        userAgent String
    }
    
    VerificationToken {
        id String [PK]
        identifier String [Not Null]
        token String [Unique]
        expiresAt DateTime [Not Null]
        createdAt DateTime [Not Null]
    }
    
    %% ========== BUSINESS TABLES ==========
    
    Business {
        id UUID [PK]
        name String [Not Null]
        type Enum {WHOLESALER, CLIENT} [Not Null]
        verificationStatus Enum {UNVERIFIED, PENDING_VERIFICATION, VERIFIED, REJECTED, SUSPENDED} [default: UNVERIFIED]
        registrationNumber String
        taxId String
        primaryContactName String
        primaryContactEmail String
        primaryContactPhone String
        country String [default: "NP"]
        currency String [default: "NPR"]
        address String
        website String
        status Enum {ACTIVE, SUSPENDED, ARCHIVED} [default: ACTIVE]
        createdAt DateTime
        updatedAt DateTime
        suspendedAt DateTime
        suspendedBy UUID [FK→User]
    }
    
    BusinessRole {
        id UUID [PK]
        name String [Unique]
        description String
        isSystemRole Boolean [default: true]
        createdAt DateTime
        updatedAt DateTime
    }
    
    Permission {
        id UUID [PK]
        name String [Unique]
        description String
        category String
    }
    
    RolePermission {
        roleId UUID [PK, FK→BusinessRole]
        permissionId UUID [PK, FK→Permission]
        PRIMARY KEY (roleId, permissionId)
        grantedAt DateTime [default: now()]
    }
    
    %% ========== MEMBERSHIP TABLES ==========
    
    BusinessMembership {
        id UUID [PK]
        userId UUID [FK→User, Not Null]
        businessId UUID [FK→Business, Not Null]
        role Enum {OWNER, MANAGER, ACCOUNTANT, SALES, INVENTORY, VIEWER} [Not Null]
        permissionOverrides JSON
        invitedBy UUID [FK→User]
        invitedAt DateTime
        joinedAt DateTime [default: now()]
        leftAt DateTime
        status Enum {ACTIVE, PENDING, REJECTED, EXPELLED} [default: ACTIVE]
    }
    
    %% ========== PROFILE TABLES ==========
    
    WholesalerProfile {
        id UUID [PK, Also FK→Business {1:1}]
        businessId UUID [PK, Unique]
        cinNumber String
        panNumber String
        bankAccountName String
        bankAccountNumber String
        bankName String
        bankBranch String
        ifscCode String
        approvedLimit Decimal [10,2] [default: 0]
        createdAt DateTime
        updatedAt DateTime
    }
    
    ClientProfile {
        id UUID [PK, Also FK→Business {1:1}]
        businessId UUID [PK, Unique]
        companyGSTNumber String
        panNumber String
        contactPersonName String
        contactPersonTitle String
        annualPurchaseVolume Decimal [10,2] [default: 0]
        creditLimit Decimal [10,2] [default: 0]
        paymentTerms Enum {NET_7, NET_15, NET_30, NET_60, COD} [default: "NET_30"]
        createdAt DateTime
        updatedAt DateTime
    }
    
    %% ========== PRODUCT TABLES ==========
    
    Category {
        id UUID [PK]
        name String [Not Null]
        slug String [Unique]
        parentId UUID [FK→Category, Self-referencing]
        description String
        sortOrder Integer [default: 0]
        isActive Boolean [default: true]
        createdAt DateTime
        updatedAt DateTime
    }
    
    Product {
        id UUID [PK]
        businessId UUID [FK→Business, Not Null]
        categoryId UUID [FK→Category, Not Null]
        name String [Not Null]
        slug String [Unique]
        sku String [Optional, Unique per business]
        description String
        brand String
        fabricMaterial String
        productStatus Enum {ACTIVE, ARCHIVED} [default: ACTIVE]
        createdAt DateTime
        updatedAt DateTime
    }
    
    ProductVariant {
        id UUID [PK]
        productId UUID [FK→Product, Not Null]
        businessId UUID [FK→Business, Not Null]
        sku String [Optional]
        size String [Optional]
        color String [Optional]
        costPrice Decimal [10,2] [Not Null] "Private to wholesaler"
        b2bSellingPrice Decimal [10,2] [Not Null] "Visible to eligible clients"
        mrp Decimal [10,2] [Not Null] "Maximum retail price"
        discount Decimal [default: 0, min: 0, max: 100]
        minOrderQuantity Integer [default: 1, min: 1]
        bulkPricing JSON
        inventoryTracked Boolean [default: true]
        productStatus Enum {ACTIVE, ARCHIVED} [default: ACTIVE]
        createdAt DateTime
        updatedAt DateTime
    }
    
    ProductImage {
        id UUID [PK]
        productVariantId UUID [FK→ProductVariant, Optional]
        productId UUID [FK→Product, Optional]
        businessId UUID [FK→Business, Not Null]
        s3Key String [Not Null]
        s3Url String
        isMain Boolean [default: false]
        sortOrder Integer [default: 0]
        altText String
        createdAt DateTime
        updatedAt DateTime
    }
    
    %% ========== INVENTORY TABLES ==========
    
    Inventory {
        id UUID [PK]
        productVariantId UUID [FK→ProductVariant, Not Null]
        businessId UUID [FK→Business, Not Null]
        totalQuantity Integer [default: 0]
        availableQuantity Integer [default: 0]
        reservedQuantity Integer [default: 0]
        inStockQuantity Integer [default: 0]
        lowStockAlertThreshold Integer [default: 10]
        damageQuantity Integer [default: 0]
        returnQuantity Integer [default: 0]
        lastStockTake DateTime
        lastUpdated DateTime [default: now()]
        createdAt DateTime
        updatedAt DateTime
    }
    
    StockMovement {
        id UUID [PK]
        inventoryId UUID [FK→Inventory, Not Null]
        movementType Enum {STOCK_IN, STOCK_OUT, ADJUSTMENT, DAMAGED, RETURNED, TRANSFER} [Not Null]
        quantity Integer [Not Null]
        referenceType Enum {ORDER, QUOTATION, INVOICE, RETURN, ADJUSTMENT} [Optional]
        referenceId UUID [Optional]
        notes String
        movedBy UUID [FK→User, Optional]
        movedAt DateTime [default: now()]
        createdAt DateTime
    }
    
    StockReservation {
        id UUID [PK]
        inventoryId UUID [FK→Inventory, Not Null]
        orderId UUID [FK→Order, Optional]
        quantity Integer [Not Null, > 0]
        reservedAt DateTime [default: now()]
        expiresAt DateTime [Not Null]
        releasedAt DateTime
        reason Enum {ORDER, QUOTATION, MANUAL} [default: "ORDER"]
    }
    
    %% ========== MARKETPLACE TABLES ==========
    
    Cart {
        id UUID [PK]
        clientBusinessId UUID [FK→Business, Type=CLIENT, Not Null]
        createdAt DateTime
        updatedAt DateTime
        expiresAt DateTime
    }
    
    CartItem {
        id UUID [PK]
        cartId UUID [FK→Cart, Not Null]
        productVariantId UUID [FK→ProductVariant, Not Null]
        quantity Integer [Not Null, > 0]
        priceAtAddition Decimal [10,2] [Not Null]
        sellerId UUID [FK→Business, Type=WHOLESALER, Not Null]
        notes String
    }
    
    Wishlist {
        id UUID [PK]
        clientBusinessId UUID [FK→Business, Type=CLIENT, Not Null]
        name String
        isDefault Boolean [default: false]
        createdAt DateTime
    }
    
    WishlistItem {
        id UUID [PK]
        wishlistId UUID [FK→Wishlist, Not Null]
        productVariantId UUID [FK→ProductVariant, Not Null]
        addedAt DateTime [default: now()]
    }
    
    %% ========== ENQUIRY & QUOTATION TABLES ==========
    
    Enquiry {
        id UUID [PK]
        businessId UUID [FK→Business, Type=CLIENT, Not Null] "Client who created"
        sellerBusinessId UUID [FK→Business, Type=WHOLESALER, Not Null] "Target wholesaler"
        status Enum {OPEN, RESPONDED, CLOSED} [default: OPEN]
        title String [Optional]
        message String [Optional]
        validityUntil DateTime [Optional]
        createdAt DateTime
        updatedAt DateTime
    }
    
    EnquiryItem {
        id UUID [PK]
        enquiryId UUID [FK→Enquiry, Not Null]
        productVariantId UUID [FK→ProductVariant, Not Null]
        requestedQuantity Integer [Not Null, > 0]
        acceptedQuantity Integer [default: 0]
        unitPrice Decimal [10,2] [Not Null]
        discount Decimal [default: 0, min: 0, max: 100]
    }
    
    EnquiryMessage {
        id UUID [PK]
        enquiryId UUID [FK→Enquiry, Not Null]
        senderBusinessId UUID [FK→Business, Not Null]
        senderRole Enum {OWNER, MANAGER, SALES, INVENTORY, VIEWER} [Not Null]
        message Text [Not Null]
        createdAt DateTime [default: now()]
    }
    
    Quotation {
        id UUID [PK]
        enquiryId UUID [FK→Enquiry, Optional]
        sellerBusinessId UUID [FK→Business, Type=WHOLESALER, Not Null]
        buyerBusinessId UUID [FK→Business, Type=CLIENT, Not Null]
        status Enum {PENDING, ACCEPTED, REJECTED, EXPIRED, CONVERTED_TO_ORDER} [default: PENDING]
        validityUntil DateTime [Not Null]
        notes String
        createdAt DateTime
        updatedAt DateTime
    }
    
    QuotationItem {
        id UUID [PK]
        quotationId UUID [FK→Quotation, Not Null]
        productVariantId UUID [FK→ProductVariant, Not Null]
        quantity Integer [Not Null, > 0]
        unitPrice Decimal [10,2] [Not Null]
        discount Decimal [default: 0, min: 0, max: 100]
        totalPrice Decimal [Calculated]
        moqMet Boolean [default: false]
    }
    
    QuotationRevision {
        id UUID [PK]
        quotationId UUID [FK→Quotation, Not Null]
        revisionNumber Integer [Not Null, starting from 1]
        parentQuotationItemId UUID [Optional]
        changedFields JSON
        newValues JSON
        changedByBusinessId UUID [FK→Business, Not Null]
        changedAt DateTime [default: now()]
        notes String
        status Enum {PENDING, ACCEPTED, REJECTED} [default: PENDING]
    }
    
    %% ========== ORDER TABLES ==========
    
    Order {
        id UUID [PK]
        sellerBusinessId UUID [FK→Business, Type=WHOLESALER, Not Null]
        clientBusinessId UUID [FK→Business, Type=CLIENT, Not Null]
        status Enum {PENDING, ACCEPTED, PROCESSING, READY_FOR_DISPATCH, DISPATCHED, DELIVERED, COMPLETED, CANCELLED, RETURNED} [default: PENDING]
        paymentStatus Enum {UNPAID, PARTIALLY_PAID, PAID, OVERDUE, REFUNDED, FAILED} [default: UNPAID]
        paymentArrangement Enum {ONLINE, MANUAL, CREDIT} [default: ONLINE]
        discountAmount Decimal [10,2] [default: 0]
        taxAmount Decimal [10,2] [default: 0]
        deliveryCharges Decimal [10,2] [default: 0]
        totalAmount Decimal [Calculated]
        currency String [default: "NPR"]
        clientPoNumber String [Optional]
        deliveredAt DateTime
        completedAt DateTime
        cancelledAt DateTime
        cancelledBy UUID [FK→User, Optional]
        createdAt DateTime
        updatedAt DateTime
    }
    
    OrderItem {
        id UUID [PK]
        orderId UUID [FK→Order, Not Null]
        productVariantId UUID [FK→ProductVariant, Not Null]
        productSnapshot JSON [Snapshot at order time]
        quantity Integer [Not Null, > 0]
        unitPrice Decimal [10,2] [Not Null]
        totalPrice Decimal [Calculated: unitPrice × quantity]
        discount Decimal [default: 0, min: 0, max: 100]
        taxRate Decimal [5,2] [default: 0]
        moqMet Boolean [default: false]
    }
    
    OrderStatusHistory {
        id UUID [PK]
        orderId UUID [FK→Order, Not Null]
        fromStatus Enum {PENDING, ACCEPTED, PROCESSING, READY_FOR_DISPATCH, DISPATCHED, DELIVERED, COMPLETED, CANCELLED, RETURNED} [Not Null]
        toStatus Enum {PENDING, ACCEPTED, PROCESSING, READY_FOR_DISPATCH, DISPATCHED, DELIVERED, COMPLETED, CANCELLED, RETURNED} [Not Null]
        changedByBusinessId UUID [FK→Business, Not Null]
        changedByUserId UUID [FK→User, Optional]
        changedAt DateTime [default: now()]
        notes String
    }
    
    %% ========== SHIPMENT & RETURN TABLES ==========
    
    Shipment {
        id UUID [PK]
        orderId UUID [FK→Order, Not Null]
        sellerBusinessId UUID [FK→Business, Type=WHOLESALER, Not Null]
        clientBusinessId UUID [FK→Business, Type=CLIENT, Not Null]
        trackingNumber String [Optional]
        shipmentProvider String [Optional]
        shippingAddress Text
        dispatchDate DateTime
        estimatedDeliveryDate DateTime
        actualDeliveryDate DateTime
        status Enum {PENDING, DISPATCHED, IN_TRANSIT, DELIVERED, EXCEPTION} [default: PENDING]
        deliveryCharge Decimal [10,2] [default: 0]
        insuranceAmount Decimal [Optional]
        notes String
        createdAt DateTime
        updatedAt DateTime
    }
    
    ReturnRequest {
        id UUID [PK]
        orderId UUID [FK→Order, Not Null]
        clientBusinessId UUID [FK→Business, Type=CLIENT, Not Null]
        sellerBusinessId UUID [FK→Business, Type=WHOLESALER, Not Null]
        status Enum {PENDING, APPROVED, REJECTED, IN_PROGRESS, COMPLETED, REFUNDED} [default: PENDING]
        returnType Enum {REFUND, EXCHANGE} [Not Null]
        reason Text
        requestedQuantity Integer [Not Null]
        approvedQuantity Integer [default: 0]
        returnShippingAddress Text
        returnTrackingNumber String [Optional]
        refundAmount Decimal [10,2]
        refundStatus Enum {PENDING, PROCESSED, FAILED} [default: PENDING]
        returnedAt DateTime
        completedAt DateTime
        createdAt DateTime
        updatedAt DateTime
    }
    
    ReturnItem {
        id UUID [PK]
        returnRequestId UUID [FK→ReturnRequest, Not Null]
        orderItemId UUID [FK→OrderItem, Not Null]
        quantity Integer [Not Null]
        condition Enum {GOOD, DAMAGED, WRONG_ITEM} [Not Null]
        inspectionResult Enum {PASS, FAIL}
        notes String
        createdAt DateTime
    }
    
    %% ========== INVOICE & PAYMENT TABLES ==========
    
    Invoice {
        id UUID [PK]
        sellerBusinessId UUID [FK→Business, Type=WHOLESALER, Not Null]
        clientBusinessId UUID [FK→Business, Type=CLIENT, Not Null]
        invoiceNumber String [Not Null]
        fiscalYear String [Format: "FY{year}"]
        status Enum {UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED, CREATED} [default: UNPAID]
        discountAmount Decimal [10,2] [default: 0]
        taxAmount Decimal [10,2] [default: 0]
        deliveryCharges Decimal [10,2] [default: 0]
        totalAmount Decimal [Calculated]
        currency String [default: "NPR"]
        dueDate DateTime
        issuedAt DateTime [default: now()]
        paidAt DateTime
        cancelledAt DateTime
        createdAt DateTime
        updatedAt DateTime
    }
    
    InvoiceItem {
        id UUID [PK]
        invoiceId UUID [FK→Invoice, Not Null]
        productVariantSnapshot JSON [Snapshot at invoice time]
        quantity Integer [Not Null]
        unitPrice Decimal [10,2] [Not Null]
        discount Decimal [default: 0, min: 0, max: 100]
        totalPrice Decimal [Calculated: unitPrice × quantity × (1 - discount/100)]
        taxRate Decimal [5,2] [default: 0]
        taxAmount Decimal [Calculated tax]
    }
    
    Payment {
        id UUID [PK]
        businessIdPayer UUID [FK→Business, Type=CLIENT, Not Null] "Who paid"
        sellerBusinessId UUID [FK→Business, Type=WHOLESALER, Not Null] "Who received"
        invoiceId UUID [FK→Invoice, Optional]
        orderId UUID [FK→Order, Optional]
        paymentArrangement Enum {ONLINE, MANUAL, CREDIT} [Not Null]
        amount Decimal [10,2] [Not Null]
        currency String [default: "NPR"]
        paymentMethod String [Optional]
        gatewayReference String [Optional]
        gatewayStatus String [Optional]
        status Enum {PENDING, COMPLETED, FAILED, REFUNDED, PARTIALLY_APPLIED} [default: PENDING]
        proofUrl String [Optional]
        verifiedAt DateTime [Optional]
        verifiedByBusinessId UUID [FK→Business, Optional]
        verifiedByUserId UUID [FK→User, Optional]
        transactionId String [Optional]
        ipAddress String [Optional]
        userAgent String [Optional]
        idempotencyKey String [Unique, Optional]
        createdAt DateTime
        updatedAt DateTime
    }
    
    PaymentAllocation {
        id UUID [PK]
        paymentId UUID [FK→Payment, Not Null]
        invoiceId UUID [FK→Invoice, Not Null]
        amountAllocated Decimal [10,2] [Not Null]
        remainingPaymentAmount Decimal [10,2]
        allocationOrder Integer [Sequence: 1, 2, 3...]
        createdAt DateTime [default: now()]
    }
    
    CreditNote {
        id UUID [PK]
        businessIdIssuer UUID [FK→Business, Type=WHOLESALER, Not Null] "Issuing wholesaler"
        clientBusinessId UUID [FK→Business, Type=CLIENT, Not Null] "Receiving client"
        referenceInvoiceId UUID [FK→Invoice, Not Null]
        creditNoteNumber String [Not Null, Unique per issuer]
        reason Enum {RETURN, DISCOUNT, CORRECTION, GOODWILL} [Not Null]
        amount Decimal [10,2] [Not Null]
        status Enum {ISSUED, APPLIED, EXPIRED} [default: ISSUED]
        validUntil DateTime [Optional]
        issuedAt DateTime [default: now()]
        appliedAt DateTime [Optional]
        notes String
        createdAt DateTime
        updatedAt DateTime
    }
    
    %% ========== ACCOUNTING TABLES ==========
    
    LedgerAccount {
        id UUID [PK]
        businessId UUID [FK→Business, Not Null]
        name String [Not Null]
        code String [Optional]
        accountType Enum {RECEIVABLE, PAYABLE, ASSET, EXPENSE, REVENUE, EQUITY, TAX} [Not Null]
        subtype Enum {Optional}
        balance Decimal [12,2] [default: 0]
        currency String [default: "NPR"]
        isActive Boolean [default: true]
        createdAt DateTime
        updatedAt DateTime
    }
    
    JournalEntry {
        id UUID [PK]
        businessId UUID [FK→Business, Not Null]
        entryDate DateTime [Not Null]
        description Text [Not Null]
        referenceType Enum {INVOICE, PAYMENT, CREDIT_NOTE, ADJUSTMENT, REVERSAL} [Not Null]
        referenceId UUID [FK→referencing record, Not Null]
        status Enum {POSTED, REVERSED, DRAFT} [default: POSTED]
        createdAt DateTime
        createdByUserId UUID [FK→User, Optional]
    }
    
    JournalLine {
        id UUID [PK]
        journalEntryId UUID [FK→JournalEntry, Not Null]
        accountId UUID [FK→LedgerAccount, Not Null]
        debit Decimal [12,2] [default: 0]
        credit Decimal [12,2] [default: 0]
        description String [Optional]
        sortOrder Integer [default: 0]
    }
    
    FiscalPeriod {
        id UUID [PK]
        businessId UUID [FK→Business, Not Null]
        name String [Not Null]
        startDate DateTime [Not Null]
        endDate DateTime [Not Null]
        isClosed Boolean [default: false]
        createdAt DateTime
    }
    
    %% ========== SYSTEM TABLES ==========
    
    Notification {
        id UUID [PK]
        userBusinessId UUID [FK→BusinessMembership, Not Null]
        type Enum {INVOICE, ORDER, QUOTATION, PAYMENT, SYSTEM, LOW_STOCK} [Not Null]
        title String [Not Null]
        message String [Not Null]
        data JSON [Optional]
        isRead Boolean [default: false]
        readAt DateTime
        createdAt DateTime [default: now()]
    }
    
    AuditLog {
        id UUID [PK]
        businessId UUID [FK→Business, Optional]
        userId UUID [FK→User, Optional]
        action Enum {CREATE, UPDATE, DELETE, STATUS_CHANGE, PERMISSION_CHANGE, LOGIN, LOGOUT, SUSPEND, ACTIVATE} [Not Null]
        entityType String [Not Null] "e.g., Product, Invoice, User, Payment"
        entityId UUID [Not Null]
        changes JSON [Change summary or before/after]
        ipAddress String [Optional]
        userAgent String [Optional]
        createdAt DateTime [default: now()]
    }
    
    FileAsset {
        id UUID [PK]
        businessId UUID [FK→Business, Optional]
        uploaderUserId UUID [FK→User, Optional]
        s3Key String [Not Null]
        s3Url String
        mimeType String [Not Null]
        fileName String
        fileSize Integer
        purpose Enum {PRODUCT_IMAGE, INVOICE, DOCUMENT, PROFILE, OTHER} [Not Null]
        isPublic Boolean [default: false]
        createdAt DateTime [default: now()]
    }
    
    SystemSetting {
        id UUID [PK]
        key String [Unique]
        value JSON [Not Null]
        description String
        businessScope Boolean [default: false]
        createdAt DateTime
        updatedAt DateTime
    }
```

## 9.2 ERD Key Relationship Summary

| Parent Table | Child Table | Relationship Type | Cascade |
|-------------|-------------|------------------|---------|
| User | Session | 1:N | Cascade on user delete (set null optional) |
| User | BusinessMembership | 1:N | Cascade on user delete (set null optional) |
| Business | BusinessMembership | 1:N | Cascade on business delete (set null optional) |
| Business | WholesalerProfile | 1:1 | Restrict (cannot delete business with profile) |
| Business | ClientProfile | 1:1 | Restrict (cannot delete business with profile) |
| Business | Product | 1:N | Restrict (cannot delete business with products) |
| Business | Inventory | 1:1 per variant | Restrict |
| Business | Enquiry | 1:N (as client) | Set null on business delete |
| Business | Quotation | 1:N (as seller) | Set null on business delete |
| Business | Invoice | 1:N (as seller) | Set null on business delete |
| Business | Payment (payer) | 1:N | Set null on business delete |
| Business | Payment (seller) | 1:N | Set null on business delete |
| Business | CreditNote (issuer) | 1:N | Set null on business delete |
| Business | LedgerAccount | 1:N | Cascade (accounts with business) |
| Business | JournalEntry | 1:N | Cascade on business delete |
| Business | JournalLine | 1:N | Cascade on journal entry |
| Business | FiscalPeriod | 1:N | Restrict |
| Business | Notification (userBusinessId) | 1:N | Set null |
| Business | SystemSetting (businessScope) | 1:N | Restrict |
| Category | Category (parentId) | 1:1 self-referencing | Restrict |
| Product | ProductVariant | 1:N | Cascade on product delete (set null variant.businessId) |
| Product | ProductImage | 1:N | Set null on product/variant delete |
| ProductVariant | Inventory | 1:1 | Restrict |
| ProductVariant | StockMovement | 1:N | Restrict |
| ProductVariant | StockReservation | 1:N | Restrict |
| Order | OrderItem | 1:N | Cascade on order delete |
| Order | OrderStatusHistory | 1:N | Restrict |
| Order | Shipment | 1:0-1 | Set null on order update |
| Order | ReturnRequest | 1:0-1 | Restrict |
| Invoice | InvoiceItem | 1:N | Cascade on invoice delete |
| Invoice | Payment | 1:N (as referenced) | Restrict |
| Invoice | CreditNote | 1:1 reference | Restrict |
| Payment | PaymentAllocation | 1:N | Restrict on payment |
| CreditNote | (standalone) | - | Restrict |
| ClientBusiness | Cart | 1:1 | Cascade on business delete (clear cart) |
| ClientBusiness | Wishlist | 1:1 | Cascade on business delete |
| ClientBusiness | WishlistItem | 1:N via wishlist | Cascade |
| Enquiry | EnquiryItem | 1:N | Restrict |
| Enquiry | EnquiryMessage | 1:N | Restrict |
| Quotation | QuotationItem | 1:N | Restrict |
| Quotation | QuotationRevision | 1:N | Restrict |
| Order | ReturnRequest | 1:0-1 | Restrict |
| ReturnRequest | ReturnItem | 1:N | Cascade on return request delete |
| Payment | PaymentAllocation | 1:N | Restrict on payment |
| LedgerAccount | JournalLine | 1:N | Restrict |
| JournalEntry | JournalLine | 1:N | Cascade on journal entry delete |

## 9.3 Soft Delete Policy

### 8.3.1 Entities with Soft Delete
- **Business**: `status` field (ACTIVE, SUSPENDED, ARCHIVED); `suspendedAt`, `suspendedBy`; never hard delete
- **Product**: `productStatus` (ACTIVE, ARCHIVED); retain for history, reference in old orders/invoices
- **ProductVariant**: `productStatus` inheritance from product; never hard delete
- **Order**: `status` enum covers all states including CANCELLED; `cancelledAt`, `cancelledBy`; never hard delete
- **Invoice**: `status` enum (UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED, CREATED); `cancelledAt`; never hard delete
- **Payment**: `status` enum includes FAILED, REFUNDED; never hard delete
- **CreditNote**: `status` (ISSUED, APPLIED, EXPIRED); never hard delete
- **ReturnRequest**: `status` (PENDING, APPROVED, REJECTED, IN_PROGRESS, COMPLETED, REFUNDED); never hard delete
- **Quotation**: `status` (PENDING, ACCEPTED, REJECTED, EXPIRED, CONVERTED_TO_ORDER); never hard delete
- **Category**: `isActive` boolean; retain for historical reporting
- **User**: `status` (ACTIVE, SUSPENDED, DELETED); `deletedAt` optional for admin-removed users

### 8.3.2 Entities with No Soft Delete (Audit Retention Only)
- **Session**: Expired sessions cleaned up periodically
- **VerificationToken**: Tokens expired, cleaned up after use
- **StockReservation**: Auto-expires; cleaned up by job
- **Cart**: Auto-expires (TTL); cleared on checkout
- **WishlistItem**: Retained while wishlist active

### 8.3.3 Deletion Restrictions
1. **Never hard-delete** financial entities: Invoice, Payment, JournalEntry, JournalLine, PaymentAllocation, CreditNote
2. **Never hard-delete** orders related to completed transactions
3. **Never hard-delete** business records; use suspension/archival instead
4. **Product/Variant archival** retains data for 7+ years for audit/compliance
5. **User deletion** only for explicit request, with data anonymization per privacy laws
6. **Database-level**: Use triggers to prevent accidental hard deletes on protected tables

### 8.3.4 Archive Strategy
- Annually archive old records to separate schema/backup
- Retain 7 years minimum for tax/compliance
- Index archived tables for historical queries
- Do not include archived data in active dashboard counts
- Provide search for historical records