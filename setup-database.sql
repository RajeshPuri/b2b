-- Setup database for B2B Wholesale Marketplace
-- Run: psql -U postgres -f setup-database.sql

-- Create database
CREATE DATABASE b2b_platform;

\c b2b_platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE "BusinessType" AS ENUM ('WHOLESALER', 'CLIENT');
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ACCEPTED', 'PROCESSING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'RETURNED');
CREATE TYPE "PaymentArrangement" AS ENUM ('ONLINE', 'MANUAL', 'CREDIT');
CREATE TYPE "InvoiceStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'CREATED');
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE', 'EQUITY', 'TAX');

-- ========== IDENTITY TABLES ==========

CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  emailVerified TIMESTAMP,
  image VARCHAR(255),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW
);

CREATE TABLE IF NOT EXISTS "Session" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  ipAddress VARCHAR(255),
  userAgent VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- ========== BUSINESS TABLES ==========

CREATE TABLE IF NOT EXISTS "Business" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  type "BusinessType" NOT NULL,
  "verificationStatus" "VerificationStatus" DEFAULT 'UNVERIFIED',
  currency VARCHAR(3) DEFAULT 'NPR',
  country VARCHAR(2) DEFAULT 'NP',
  status VARCHAR(20) DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW,
  suspendedAt TIMESTAMP,
  suspendedBy UUID REFERENCES "User"(id)
);

CREATE TABLE IF NOT EXISTS "BusinessMembership" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "businessId" UUID NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'VIEWER',
  "permissionOverrides" JSON,
  "invitedBy" UUID REFERENCES "User"(id),
  "invitedAt" TIMESTAMP DEFAULT NOW(),
  "joinedAt" TIMESTAMP DEFAULT NOW(),
  "leftAt" TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- ========== PROFILE TABLES ==========

CREATE TABLE IF NOT EXISTS "WholesalerProfile" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessId" UUID UNIQUE NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  cinNumber VARCHAR(50),
  panNumber VARCHAR(50),
  bankAccountName VARCHAR(255),
  bankAccountNumber VARCHAR(50),
  bankName VARCHAR(255),
  bankBranch VARCHAR(255),
  ifscCode VARCHAR(20),
  approvedLimit DECIMAL(12,2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW
);

CREATE TABLE IF NOT EXISTS "ClientProfile" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessId" UUID UNIQUE NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  companyGSTNumber VARCHAR(50),
  panNumber VARCHAR(50),
  contactPersonName VARCHAR(255),
  contactPersonTitle VARCHAR(100),
  annualPurchaseVolume DECIMAL(12,2) DEFAULT 0,
  creditLimit DECIMAL(12,2) DEFAULT 0,
  paymentTerms VARCHAR(10) DEFAULT 'NET_30',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW
);

-- ========== PRODUCT TABLES ==========

CREATE TABLE IF NOT EXISTS "Category" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  parentId UUID REFERENCES "Category"(id),
  description TEXT,
  isActive BOOLEAN DEFAULT true,
  sortOrder INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW
);

CREATE TABLE IF NOT EXISTS "Product" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessId" UUID NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  "categoryId" UUID REFERENCES "Category"(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  sku VARCHAR(50),
  description TEXT,
  brand VARCHAR(255),
  fabricMaterial VARCHAR(255),
  productStatus "ProductStatus" DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW
);

CREATE TABLE IF NOT EXISTS "ProductVariant" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  sku VARCHAR(50),
  size VARCHAR(50),
  color VARCHAR(50),
  "costPrice" DECIMAL(12,2) NOT NULL, -- Private to wholesaler
  "b2bSellingPrice" DECIMAL(12,2) NOT NULL, -- Visible to eligible clients
  "mrp" DECIMAL(12,2) NOT NULL, -- Maximum Retail Price
  "discount" DECIMAL DEFAULT 0, -- Percentage 0-100
  "minOrderQuantity" INTEGER DEFAULT 1,
  "bulkPricing" JSON,
  "inventoryTracked" BOOLEAN DEFAULT true,
  productStatus "ProductStatus" DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW
);

CREATE TABLE IF NOT EXISTS "ProductImage" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productVariantId" UUID REFERENCES "ProductVariant"(id),
  "productId" UUID NOT NULL REFERENCES "Product"(id),
  "businessId" UUID NOT NULL,
  s3Key VARCHAR(500) NOT NULL,
  s3Url VARCHAR(500),
  isMain BOOLEAN DEFAULT false,
  sortOrder INTEGER DEFAULT 0,
  altText VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW
);

-- ========== INVENTORY TABLES ==========

CREATE TABLE IF NOT EXISTS "Inventory" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productVariantId" UUID UNIQUE NOT NULL REFERENCES "ProductVariant"(id),
  "productBusiness" UUID NOT NULL,
  totalQuantity INTEGER DEFAULT 0,
  availableQuantity INTEGER DEFAULT 0,
  reservedQuantity INTEGER DEFAULT 0,
  inStockQuantity INTEGER DEFAULT 0,
  lowStockAlertThreshold INTEGER DEFAULT 10,
  damageQuantity INTEGER DEFAULT 0,
  returnQuantity INTEGER DEFAULT 0,
  lastStockTake TIMESTAMP,
  lastUpdated TIMESTAMP DEFAULT NOW(),
  createdAt TIMESTAMP DEFAULT NOW()
);

-- ========== ORDER TABLES ==========

CREATE TABLE IF NOT EXISTS "Order" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sellerBusiness" UUID NOT NULL REFERENCES "Business"(id),
  "sellerBusinessId" UUID NOT NULL REFERENCES "Business"(id),
  "clientBusiness" UUID NOT NULL REFERENCES "Business"(id),
  "clientBusinessId" UUID NOT NULL REFERENCES "Business"(id),
  status "OrderStatus" DEFAULT 'PENDING',
  "paymentArrangement" "PaymentArrangement" DEFAULT 'ONLINE',
  "discountAmount" DECIMAL DEFAULT 0,
  "taxAmount" DECIMAL DEFAULT 0,
  "deliveryCharges" DECIMAL DEFAULT 0,
  "totalAmount" DECIMAL,
  "currency" VARCHAR(3) DEFAULT 'NPR',
  "clientPoNumber" VARCHAR(100),
  deliveredAt TIMESTAMP,
  completedAt TIMESTAMP,
  cancelledAt TIMESTAMP,
  "cancelledBy" UUID REFERENCES "User"(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  "productVariantId" UUID NOT NULL REFERENCES "ProductVariant"(id),
  "productSnapshot" JSON NOT NULL,
  quantity INTEGER NOT NULL,
  "unitPrice" DECIMAL NOT NULL,
  "totalPrice" DECIMAL NOT NULL,
  "discount" DECIMAL DEFAULT 0,
  "moqMet" BOOLEAN DEFAULT false,

  CONSTRAINT fk_order_item_order FOREIGN KEY ("orderId") REFERENCES "Order"(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_item_variant FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"(id)
);

CREATE TABLE IF NOT EXISTS "OrderStatusHistory" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  fromStatus "OrderStatus",
  toStatus "OrderStatus",
  "changedBy" UUID REFERENCES "User"(id),
  "changedAt" TIMESTAMP DEFAULT NOW(),
  notes TEXT,

  CONSTRAINT fk_order_status_order FOREIGN KEY ("orderId") REFERENCES "Order"(id) ON DELETE CASCADE
);

-- ========== INVOICE TABLES ==========

CREATE TYPE "InvoiceStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'CREATED');

CREATE TABLE IF NOT EXISTS "Invoice" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sellerBusiness" UUID NOT NULL REFERENCES "Business"(id),
  "sellerBusinessId" UUID NOT NULL REFERENCES "Business"(id),
  "clientBusiness" UUID NOT NULL REFERENCES "Business"(id),
  "clientBusinessId" UUID NOT NULL REFERENCES "Business"(id),
  "invoiceNumber" VARCHAR(50) NOT NULL,
  "fiscalYear" VARCHAR(10) NOT NULL,
  status "InvoiceStatus" DEFAULT 'UNPAID',
  "discountAmount" DECIMAL DEFAULT 0,
  "taxAmount" DECIMAL DEFAULT 0,
  "deliveryCharges" DECIMAL DEFAULT 0,
  "totalAmount" DECIMAL,
  "currency" VARCHAR(3) DEFAULT 'NPR',
  "dueDate" TIMESTAMP,
  issuedAt TIMESTAMP DEFAULT NOW(),
  paidAt TIMESTAMP,
  cancelledAt TIMESTAMP,

  CONSTRAINT fk_invoice_seller FOREIGN KEY ("sellerBusinessId") REFERENCES "Business"(id),
  CONSTRAINT fk_invoice_client FOREIGN KEY ("clientBusinessId") REFERENCES "Business"(id)
);

CREATE TABLE IF NOT EXISTS "InvoiceItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoiceId" UUID NOT NULL REFERENCES "Invoice"(id) ON DELETE CASCADE,
  "productVariantSnapshot" JSON NOT NULL,
  quantity INTEGER NOT NULL,
  "unitPrice" DECIMAL NOT NULL,
  "discount" DECIMAL DEFAULT 0,
  "totalPrice" DECIMAL NOT NULL,
  "taxRate" DECIMAL(5,2) DEFAULT 0,
  "taxAmount" DECIMAL(12,2) DEFAULT 0,

  CONSTRAINT fk_invoice_item_invoice FOREIGN KEY ("invoiceId") REFERENCES "Invoice"(id) ON DELETE CASCADE
);

-- ========== PAYMENT TABLES ==========

CREATE TABLE IF NOT EXISTS "Payment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessIdPayer" UUID NOT NULL REFERENCES "Business"(id),
  "sellerBusiness" UUID NOT NULL REFERENCES "Business"(id),
  "sellerBusinessId" UUID NOT NULL REFERENCES "Business"(id),
  "invoiceId" UUID REFERENCES "Invoice"(id),
  "orderId" UUID REFERENCES "Order"(id),
  amount DECIMAL NOT NULL,
  "currency" VARCHAR(3) DEFAULT 'NPR',
  "paymentArrangement" "PaymentArrangement" NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING',
  "gatewayReference" VARCHAR(255),
  "proofUrl" VARCHAR(500),
  "verifiedAt" TIMESTAMP,
  "verifiedBy" UUID REFERENCES "User"(id),
  "transactionId" VARCHAR(255),
  "idempotencyKey" VARCHAR(255) UNIQUE,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW
);

CREATE TABLE IF NOT EXISTS "PaymentAllocation" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "paymentId" UUID NOT NULL REFERENCES "Payment"(id),
  "invoiceId" UUID NOT NULL REFERENCES "Invoice"(id),
  "amountAllocated" DECIMAL NOT NULL,
  "remainingPaymentAmount" DECIMAL DEFAULT 0,
  "allocationOrder" INTEGER DEFAULT 1,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- ========== LEDGER / ACCOUNTING TABLES ==========

CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE', 'EQUITY', 'TAX');

CREATE TABLE IF NOT EXISTS "LedgerAccount" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessId" UUID NOT NULL REFERENCES "Business"(id),
  name VARCHAR(255) NOT NULL,
  "code" VARCHAR(20),
  "accountType" "AccountType" NOT NULL,
  balance DECIMAL(12,2) DEFAULT 0,
  "currency" VARCHAR(3) DEFAULT 'NPR',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW
);

CREATE TABLE IF NOT EXISTS "JournalEntry" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessId" UUID NOT NULL REFERENCES "Business"(id),
  "entryDate" TIMESTAMP NOT NULL,
  description TEXT NOT NULL,
  "referenceType" VARCHAR(30) NOT NULL,
  "referenceId" UUID REFERENCES "Invoice"(id),
  status VARCHAR(20) DEFAULT 'POSTED',
  "createdBy" UUID REFERENCES "User"(id),
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "JournalLine" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "journalEntryId" UUID NOT NULL REFERENCES "JournalEntry"(id),
  "accountId" UUID NOT NULL REFERENCES "LedgerAccount"(id),
  "debit" DECIMAL DEFAULT 0,
  "credit" DECIMAL DEFAULT 0,
  "description" TEXT,
  "sortOrder" INTEGER DEFAULT 0,

  CONSTRAINT fk_journal_line_entry FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"(id) ON DELETE CASCADE,
  CONSTRAINT fk_journal_line_account FOREIGN KEY ("accountId") REFERENCES "LedgerAccount"(id)
);

-- ========== NOTIFICATIONS & AUDIT ==========

CREATE TABLE IF NOT EXISTS "Notification" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userBusiness" UUID REFERENCES "BusinessMembership"(id),
  type VARCHAR(30) DEFAULT 'SYSTEM',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  "data" JSON,
  isRead BOOLEAN DEFAULT false,
  "readAt" TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessId" UUID REFERENCES "Business"(id),
  "userId" UUID REFERENCES "User"(id),
  action VARCHAR(30) NOT NULL,
  "entityType" VARCHAR(50) NOT NULL,
  "entityId" UUID NOT NULL,
  "changes" JSON NOT NULL,
  "ipAddress" VARCHAR(50),
  "userAgent" VARCHAR(128),
  createdAt TIMESTAMP DEFAULT NOW()
);

-- ========== INDEXES ==========

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"(email);
CREATE INDEX IF NOT EXISTS "Business_type_idx" ON "Business"(type);
CREATE INDEX IF NOT EXISTS "Business_status_idx" ON "Business"(status);
CREATE INDEX IF NOT EXISTS "BusinessMembership_user_idx" ON "BusinessMembership"("userId");
CREATE INDEX IF NOT EXISTS "BusinessMembership_business_idx" ON "BusinessMembership"("businessId");
CREATE INDEX IF NOT EXISTS "BusinessMembership_role_idx" ON "BusinessMembership"(role);
CREATE INDEX IF NOT EXISTS "Product_business_idx" ON "Product"("businessId");
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "ProductVariant_product_idx" ON "ProductVariant"("productId");
CREATE INDEX IF NOT EXISTS "Inventory_variant_idx" ON "Inventory"("productVariantId");
CREATE INDEX IF NOT EXISTS "Order_seller_idx" ON "Order"("sellerBusinessId");
CREATE INDEX IF NOT EXISTS "Order_client_idx" ON "Order"("clientBusinessId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"(status);
CREATE INDEX IF NOT EXISTS "Invoice_seller_idx" ON "Invoice"("sellerBusinessId");
CREATE INDEX IF NOT EXISTS "Invoice_client_idx" ON "Invoice"("clientBusinessId");
CREATE INDEX IF NOT EXISTS "Invoice_status_idx" ON "Invoice"(status);
CREATE INDEX IF NOT EXISTS "Payment_seller_idx" ON "Payment"("sellerBusinessId");
CREATE INDEX IF NOT EXISTS "Payment_arrangement_idx" ON "Payment"("paymentArrangement");
CREATE INDEX IF NOT EXISTS "LedgerAccount_business_idx" ON "LedgerAccount"("businessId");
CREATE INDEX IF NOT EXISTS "JournalEntry_business_idx" ON "JournalEntry"("businessId");
CREATE INDEX IF NOT EXISTS "AuditLog_entity_idx" ON "AuditLog"("entityType", "entityId");

-- ============================================
-- SUMMARY
-- ============================================
SELECT 'Database setup completed successfully' as status;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';