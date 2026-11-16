# 01. Executive Summary

## Project Overview
A multi-vendor B2B wholesale clothing marketplace connecting clothing wholesalers/manufacturers with retail shops, clothing stores, and resellers. The platform operates as a central B2B platform with no platform commission or subscription fees initially.

## Core Business Value
- Enable wholesalers to list and manage clothing products, inventory, pricing, quotations, orders, invoices, payments, and customer ledgers
- Allow business buyers to discover products from multiple wholesalers, request quotations, negotiate prices, and purchase products
- Provide administrators with complete platform oversight and moderation capabilities
- Support Nepal (NPR) as the default currency with configurable architecture for future expansion

## Key Decisions (Confirmed)
- **Business registration**: Instant, separate from verification
- **Payment**: Online, manual, and credit terms supported
- **Platform commission**: None initially
- **Platform subscription**: None initially
- **Multiple employees**: Supported per business
- **Delivery**: Managed by individual wholesalers
- **Currency**: NPR initially, configurable for expansion
- **Database**: PostgreSQL with Prisma ORM
- **Application**: Next.js full-stack with App Router
- **Deployment**: Docker with modular monolith architecture
- **Tenancy**: Shared database with strict tenant isolation

## Scope (Initial MVP)
- Product catalog browsing and search
- Multi-wholesaler quotation and enquiry management
- Order processing with seller-separated checkout
- Invoice generation (online, manual, credit)
- Basic accounting and ledger
- User authentication and business membership
- Tenant isolation across businesses

## Out of Scope (Future)
- Platform commission or subscription fees
- Advanced analytics and machine learning
- Mobile native applications
- Integration with ERP systems beyond basic accounting
- Multi-currency support (initial: NPR only)
- Regional taxation beyond basic GST/VAT

## Target Market
- Nepal-based wholesale clothing manufacturers and distributors
- Nepal-based retail shops, clothing stores, and resellers
- Potential for SAARC and international expansion later

## Success Metrics
- Number of registered wholesalers
- Number of active business clients
- Product listing count
- Order volume (NPR)
- Payment collection rate
- Customer retention