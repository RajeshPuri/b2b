--
-- PostgreSQL database dump
--


-- Dumped from database version 15.20
-- Dumped by pg_dump version 15.20

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: AccountType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AccountType" AS ENUM (
    'ASSET',
    'LIABILITY',
    'REVENUE',
    'EXPENSE',
    'EQUITY',
    'TAX'
);


--
-- Name: BusinessType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BusinessType" AS ENUM (
    'WHOLESALER',
    'CLIENT'
);


--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'UNPAID',
    'PARTIALLY_PAID',
    'PAID',
    'OVERDUE',
    'CANCELLED',
    'CREATED'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'PROCESSING',
    'READY_FOR_DISPATCH',
    'DISPATCHED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'RETURNED'
);


--
-- Name: PaymentArrangement; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentArrangement" AS ENUM (
    'ONLINE',
    'MANUAL',
    'CREDIT'
);


--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'ACTIVE',
    'ARCHIVED'
);


--
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'UNVERIFIED',
    'PENDING_VERIFICATION',
    'VERIFIED',
    'REJECTED',
    'SUSPENDED'
);


--
-- Name: businesstype; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.businesstype AS ENUM (
    'WHOLESALER',
    'CLIENT'
);


--
-- Name: verificationstatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.verificationstatus AS ENUM (
    'UNVERIFIED',
    'PENDING_VERIFICATION',
    'VERIFIED',
    'REJECTED',
    'SUSPENDED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "businessId" uuid,
    "userId" uuid,
    action character varying(30) NOT NULL,
    "entityType" character varying(50) NOT NULL,
    "entityId" uuid NOT NULL,
    changes json NOT NULL,
    "ipAddress" character varying(50),
    "userAgent" character varying(128),
    createdat timestamp without time zone
);


--
-- Name: Business; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Business" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    type public."BusinessType" NOT NULL,
    "verificationStatus" public."VerificationStatus" DEFAULT 'UNVERIFIED'::public."VerificationStatus",
    currency character varying(3) DEFAULT 'NPR'::character varying,
    country character varying(2) DEFAULT 'NP'::character varying,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    createdat timestamp without time zone,
    updatedat timestamp without time zone,
    suspendedat timestamp without time zone,
    suspendedby uuid
);


--
-- Name: BusinessMembership; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BusinessMembership" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    "businessId" uuid NOT NULL,
    role character varying(20) DEFAULT 'VIEWER'::character varying NOT NULL,
    "permissionOverrides" json,
    "invitedBy" uuid,
    "invitedAt" timestamp without time zone,
    "joinedAt" timestamp without time zone DEFAULT now(),
    "leftAt" timestamp without time zone,
    status character varying(20) DEFAULT 'ACTIVE'::character varying
);


--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255),
    slug character varying(255),
    parentid uuid,
    description text,
    isactive boolean DEFAULT true,
    sortorder integer DEFAULT 0,
    createdat timestamp without time zone,
    updatedat timestamp without time zone
);


--
-- Name: ClientProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ClientProfile" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "businessId" uuid NOT NULL,
    companygstnumber character varying(50),
    pannumber character varying(50),
    contactpersonname character varying(255),
    contactpersontitle character varying(100),
    annualpurchasevolume numeric(12,2) DEFAULT 0,
    creditlimit numeric(12,2) DEFAULT 0,
    paymentterms character varying(10) DEFAULT 'NET_30'::character varying,
    createdat timestamp without time zone,
    updatedat timestamp without time zone
);


--
-- Name: Inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Inventory" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "productVariantId" uuid NOT NULL,
    "productBusiness" uuid NOT NULL,
    totalquantity integer DEFAULT 0,
    availablequantity integer DEFAULT 0,
    reservedquantity integer DEFAULT 0,
    instockquantity integer DEFAULT 0,
    lowstockalertthreshold integer DEFAULT 10,
    damagequantity integer DEFAULT 0,
    returnquantity integer DEFAULT 0,
    laststocktake timestamp without time zone,
    lastupdated timestamp without time zone DEFAULT now(),
    createdat timestamp without time zone
);


--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Invoice" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "sellerBusiness" uuid NOT NULL,
    "sellerBusinessId" uuid NOT NULL,
    "clientBusiness" uuid NOT NULL,
    "clientBusinessId" uuid NOT NULL,
    "invoiceNumber" character varying(50) NOT NULL,
    "fiscalYear" character varying(10) NOT NULL,
    status public."InvoiceStatus" DEFAULT 'UNPAID'::public."InvoiceStatus",
    "discountAmount" numeric DEFAULT 0,
    "taxAmount" numeric DEFAULT 0,
    "deliveryCharges" numeric DEFAULT 0,
    "totalAmount" numeric,
    currency character varying(3) DEFAULT 'NPR'::character varying,
    "dueDate" timestamp without time zone,
    issuedat timestamp without time zone DEFAULT now(),
    paidat timestamp without time zone,
    cancelledat timestamp without time zone
);


--
-- Name: InvoiceItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InvoiceItem" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "invoiceId" uuid NOT NULL,
    "productVariantSnapshot" json NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric NOT NULL,
    discount numeric DEFAULT 0,
    "totalPrice" numeric NOT NULL,
    "taxRate" numeric(5,2) DEFAULT 0,
    "taxAmount" numeric(12,2) DEFAULT 0
);


--
-- Name: JournalEntry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."JournalEntry" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "businessId" uuid NOT NULL,
    "entryDate" timestamp without time zone NOT NULL,
    description text NOT NULL,
    "referenceType" character varying(30) NOT NULL,
    "referenceId" uuid,
    status character varying(20) DEFAULT 'POSTED'::character varying,
    "createdBy" uuid,
    "createdAt" timestamp without time zone
);


--
-- Name: JournalLine; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."JournalLine" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "journalEntryId" uuid NOT NULL,
    "accountId" uuid NOT NULL,
    debit numeric DEFAULT 0,
    credit numeric DEFAULT 0,
    description text,
    "sortOrder" integer DEFAULT 0
);


--
-- Name: LedgerAccount; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LedgerAccount" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "businessId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(20),
    "accountType" public."AccountType" NOT NULL,
    balance numeric(12,2) DEFAULT 0,
    currency character varying(3) DEFAULT 'NPR'::character varying,
    isactive boolean DEFAULT true,
    createdat timestamp without time zone,
    updatedat timestamp without time zone
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userBusiness" uuid,
    type character varying(30) DEFAULT 'SYSTEM'::character varying,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    data json,
    isread boolean DEFAULT false,
    "readAt" timestamp without time zone,
    createdat timestamp without time zone
);


--
-- Name: Order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Order" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "sellerBusiness" uuid NOT NULL,
    "sellerBusinessId" uuid NOT NULL,
    "clientBusiness" uuid NOT NULL,
    "clientBusinessId" uuid NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus",
    "discountAmount" numeric DEFAULT 0,
    "taxAmount" numeric DEFAULT 0,
    "deliveryCharges" numeric DEFAULT 0,
    "totalAmount" numeric,
    currency character varying(3) DEFAULT 'NPR'::character varying,
    "clientPoNumber" character varying(100),
    deliveredat timestamp without time zone,
    completedat timestamp without time zone,
    cancelledat timestamp without time zone,
    "cancelledBy" uuid,
    createdat timestamp without time zone,
    updatedat timestamp without time zone
);


--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderItem" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "orderId" uuid NOT NULL,
    "productVariantId" uuid NOT NULL,
    "productSnapshot" json NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric NOT NULL,
    "totalPrice" numeric NOT NULL,
    discount numeric DEFAULT 0,
    "moqMet" boolean DEFAULT false
);


--
-- Name: OrderStatusHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderStatusHistory" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "orderId" uuid NOT NULL,
    fromstatus public."OrderStatus",
    tostatus public."OrderStatus",
    "changedBy" uuid,
    "changedAt" timestamp without time zone DEFAULT now(),
    notes text
);


--
-- Name: Payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payment" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "businessIdPayer" uuid NOT NULL,
    "sellerBusiness" uuid NOT NULL,
    "sellerBusinessId" uuid NOT NULL,
    "invoiceId" uuid,
    "orderId" uuid,
    amount numeric NOT NULL,
    currency character varying(3) DEFAULT 'NPR'::character varying,
    "paymentArrangement" public."PaymentArrangement" NOT NULL,
    status character varying(30) DEFAULT 'PENDING'::character varying,
    "gatewayReference" character varying(255),
    "proofUrl" character varying(500),
    "verifiedAt" timestamp without time zone,
    "verifiedBy" uuid,
    "transactionId" character varying(255),
    "idempotencyKey" character varying(255),
    createdat timestamp without time zone,
    updatedat timestamp without time zone
);


--
-- Name: PaymentAllocation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PaymentAllocation" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "paymentId" uuid NOT NULL,
    "invoiceId" uuid NOT NULL,
    "amountAllocated" numeric NOT NULL,
    "remainingPaymentAmount" numeric DEFAULT 0,
    "allocationOrder" integer DEFAULT 1,
    createdat timestamp without time zone
);


--
-- Name: Product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Product" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "businessId" uuid NOT NULL,
    "categoryId" uuid,
    name character varying(255) NOT NULL,
    slug character varying(255),
    sku character varying(50),
    description text,
    brand character varying(255),
    fabricmaterial character varying(255),
    productstatus public."ProductStatus" DEFAULT 'ACTIVE'::public."ProductStatus",
    createdat timestamp without time zone,
    updatedat timestamp without time zone
);


--
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductImage" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "productVariantId" uuid,
    "productId" uuid NOT NULL,
    "businessId" uuid NOT NULL,
    s3key character varying(500) NOT NULL,
    s3url character varying(500),
    ismain boolean DEFAULT false,
    sortorder integer DEFAULT 0,
    alttext character varying(255),
    createdat timestamp without time zone,
    updatedat timestamp without time zone
);


--
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductVariant" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "productId" uuid NOT NULL,
    sku character varying(50),
    size character varying(50),
    color character varying(50),
    "costPrice" numeric(12,2) NOT NULL,
    "b2bSellingPrice" numeric(12,2) NOT NULL,
    mrp numeric(12,2) NOT NULL,
    discount numeric DEFAULT 0,
    "minOrderQuantity" integer DEFAULT 1,
    "bulkPricing" json,
    "inventoryTracked" boolean DEFAULT true,
    productstatus public."ProductStatus" DEFAULT 'ACTIVE'::public."ProductStatus",
    createdat timestamp without time zone,
    updatedat timestamp without time zone
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    expiresat timestamp without time zone NOT NULL,
    createdat timestamp without time zone DEFAULT now(),
    ipaddress character varying(255),
    useragent character varying(255)
);


--
-- Name: Tenant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Tenant" (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    ownerid uuid,
    plan character varying(20) DEFAULT 'free'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    createdat timestamp without time zone DEFAULT now(),
    updatedat timestamp without time zone DEFAULT now()
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    "passwordHash" character varying(255) NOT NULL,
    name character varying(255),
    "emailVerified" timestamp without time zone,
    image character varying(255),
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VerificationToken" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    expiresat timestamp without time zone NOT NULL,
    createdat timestamp without time zone DEFAULT now()
);


--
-- Name: WholesalerProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WholesalerProfile" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "businessId" uuid NOT NULL,
    cinnumber character varying(50),
    pannumber character varying(50),
    bankaccountname character varying(255),
    bankaccountnumber character varying(50),
    bankname character varying(255),
    bankbranch character varying(255),
    ifsccode character varying(20),
    approvedlimit numeric(12,2) DEFAULT 0,
    createdat timestamp without time zone,
    updatedat timestamp without time zone
);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BusinessMembership BusinessMembership_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BusinessMembership"
    ADD CONSTRAINT "BusinessMembership_pkey" PRIMARY KEY (id);


--
-- Name: Business Business_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Business"
    ADD CONSTRAINT "Business_name_key" UNIQUE (name);


--
-- Name: Business Business_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Business"
    ADD CONSTRAINT "Business_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_slug_key" UNIQUE (slug);


--
-- Name: ClientProfile ClientProfile_businessId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ClientProfile"
    ADD CONSTRAINT "ClientProfile_businessId_key" UNIQUE ("businessId");


--
-- Name: ClientProfile ClientProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ClientProfile"
    ADD CONSTRAINT "ClientProfile_pkey" PRIMARY KEY (id);


--
-- Name: Inventory Inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY (id);


--
-- Name: Inventory Inventory_productVariantId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_productVariantId_key" UNIQUE ("productVariantId");


--
-- Name: InvoiceItem InvoiceItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: JournalEntry JournalEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JournalEntry"
    ADD CONSTRAINT "JournalEntry_pkey" PRIMARY KEY (id);


--
-- Name: JournalLine JournalLine_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JournalLine"
    ADD CONSTRAINT "JournalLine_pkey" PRIMARY KEY (id);


--
-- Name: LedgerAccount LedgerAccount_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LedgerAccount"
    ADD CONSTRAINT "LedgerAccount_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: OrderStatusHistory OrderStatusHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PaymentAllocation PaymentAllocation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentAllocation"
    ADD CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_idempotencyKey_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_idempotencyKey_key" UNIQUE ("idempotencyKey");


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key" UNIQUE (slug);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_userId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_key" UNIQUE ("userId");


--
-- Name: Tenant Tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tenant"
    ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY (id);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VerificationToken VerificationToken_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VerificationToken"
    ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY (id);


--
-- Name: VerificationToken VerificationToken_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VerificationToken"
    ADD CONSTRAINT "VerificationToken_token_key" UNIQUE (token);


--
-- Name: WholesalerProfile WholesalerProfile_businessId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WholesalerProfile"
    ADD CONSTRAINT "WholesalerProfile_businessId_key" UNIQUE ("businessId");


--
-- Name: WholesalerProfile WholesalerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WholesalerProfile"
    ADD CONSTRAINT "WholesalerProfile_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id);


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id);


--
-- Name: BusinessMembership BusinessMembership_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BusinessMembership"
    ADD CONSTRAINT "BusinessMembership_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON DELETE CASCADE;


--
-- Name: BusinessMembership BusinessMembership_invitedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BusinessMembership"
    ADD CONSTRAINT "BusinessMembership_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES public."User"(id);


--
-- Name: BusinessMembership BusinessMembership_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BusinessMembership"
    ADD CONSTRAINT "BusinessMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: Business Business_suspendedby_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Business"
    ADD CONSTRAINT "Business_suspendedby_fkey" FOREIGN KEY (suspendedby) REFERENCES public."User"(id);


--
-- Name: Category Category_parentid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentid_fkey" FOREIGN KEY (parentid) REFERENCES public."Category"(id);


--
-- Name: ClientProfile ClientProfile_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ClientProfile"
    ADD CONSTRAINT "ClientProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON DELETE CASCADE;


--
-- Name: Inventory Inventory_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariant"(id);


--
-- Name: InvoiceItem InvoiceItem_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON DELETE CASCADE;


--
-- Name: Invoice Invoice_clientBusinessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_clientBusinessId_fkey" FOREIGN KEY ("clientBusinessId") REFERENCES public."Business"(id);


--
-- Name: Invoice Invoice_clientBusiness_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_clientBusiness_fkey" FOREIGN KEY ("clientBusiness") REFERENCES public."Business"(id);


--
-- Name: Invoice Invoice_sellerBusinessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_sellerBusinessId_fkey" FOREIGN KEY ("sellerBusinessId") REFERENCES public."Business"(id);


--
-- Name: Invoice Invoice_sellerBusiness_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_sellerBusiness_fkey" FOREIGN KEY ("sellerBusiness") REFERENCES public."Business"(id);


--
-- Name: JournalEntry JournalEntry_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JournalEntry"
    ADD CONSTRAINT "JournalEntry_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id);


--
-- Name: JournalEntry JournalEntry_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JournalEntry"
    ADD CONSTRAINT "JournalEntry_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."User"(id);


--
-- Name: JournalEntry JournalEntry_referenceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JournalEntry"
    ADD CONSTRAINT "JournalEntry_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES public."Invoice"(id);


--
-- Name: JournalLine JournalLine_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JournalLine"
    ADD CONSTRAINT "JournalLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public."LedgerAccount"(id);


--
-- Name: JournalLine JournalLine_journalEntryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JournalLine"
    ADD CONSTRAINT "JournalLine_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES public."JournalEntry"(id);


--
-- Name: LedgerAccount LedgerAccount_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LedgerAccount"
    ADD CONSTRAINT "LedgerAccount_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id);


--
-- Name: Notification Notification_userBusiness_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userBusiness_fkey" FOREIGN KEY ("userBusiness") REFERENCES public."BusinessMembership"(id);


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariant"(id);


--
-- Name: OrderStatusHistory OrderStatusHistory_changedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES public."User"(id);


--
-- Name: OrderStatusHistory OrderStatusHistory_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON DELETE CASCADE;


--
-- Name: Order Order_cancelledBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_cancelledBy_fkey" FOREIGN KEY ("cancelledBy") REFERENCES public."User"(id);


--
-- Name: Order Order_clientBusinessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_clientBusinessId_fkey" FOREIGN KEY ("clientBusinessId") REFERENCES public."Business"(id);


--
-- Name: Order Order_clientBusiness_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_clientBusiness_fkey" FOREIGN KEY ("clientBusiness") REFERENCES public."Business"(id);


--
-- Name: Order Order_sellerBusinessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_sellerBusinessId_fkey" FOREIGN KEY ("sellerBusinessId") REFERENCES public."Business"(id);


--
-- Name: Order Order_sellerBusiness_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_sellerBusiness_fkey" FOREIGN KEY ("sellerBusiness") REFERENCES public."Business"(id);


--
-- Name: PaymentAllocation PaymentAllocation_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentAllocation"
    ADD CONSTRAINT "PaymentAllocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id);


--
-- Name: PaymentAllocation PaymentAllocation_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentAllocation"
    ADD CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public."Payment"(id);


--
-- Name: Payment Payment_businessIdPayer_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_businessIdPayer_fkey" FOREIGN KEY ("businessIdPayer") REFERENCES public."Business"(id);


--
-- Name: Payment Payment_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id);


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id);


--
-- Name: Payment Payment_sellerBusinessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_sellerBusinessId_fkey" FOREIGN KEY ("sellerBusinessId") REFERENCES public."Business"(id);


--
-- Name: Payment Payment_sellerBusiness_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_sellerBusiness_fkey" FOREIGN KEY ("sellerBusiness") REFERENCES public."Business"(id);


--
-- Name: Payment Payment_verifiedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES public."User"(id);


--
-- Name: ProductImage ProductImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id);


--
-- Name: ProductImage ProductImage_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariant"(id);


--
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON DELETE CASCADE;


--
-- Name: Product Product_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON DELETE CASCADE;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id);


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: Tenant Tenant_ownerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tenant"
    ADD CONSTRAINT "Tenant_ownerid_fkey" FOREIGN KEY (ownerid) REFERENCES public."User"(id);


--
-- Name: WholesalerProfile WholesalerProfile_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WholesalerProfile"
    ADD CONSTRAINT "WholesalerProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


