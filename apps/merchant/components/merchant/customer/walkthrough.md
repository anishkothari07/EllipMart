# Sprint 5 – Customer Management & CRM Walkthrough

This walkthrough outlines the implementation of the customer management and CRM module built directly inside the repository.

## 1. Folder Tree

```
├── app/
│   └── merchant/
│       └── customers/
│           ├── actions.ts (Server actions for profiles, addresses, tags)
│           ├── page.tsx (Customer List Directory)
│           └── [id]/
│               └── page.tsx (Customer Profile Details)
├── components/
│   └── merchant/
│       └── customer/
│           ├── CustomerAddress.tsx (Shipping/billing cards and forms)
│           ├── CustomerCommunication.tsx (Mock emails: welcome, promo, support)
│           ├── CustomerNotes.tsx (Staff note threads)
│           ├── CustomerSegmentBadge.tsx (Dynamic CRM segment badges)
│           ├── CustomerStats.tsx (lifetime values, orders, averages stats)
│           ├── CustomerTable.tsx (Directories tables)
│           ├── CustomerTags.tsx (VIP, Wholesale tags manager)
│           └── CustomerTimeline.tsx (chronological activity logger)
├── lib/
│   ├── modules/
│   │   └── user/
│   │       └── customer-merchant.service.ts (CRM analytics calculations)
│   └── services/
│       └── merchant-customer-client.ts (Client facade)
├── scripts/
│   └── seed-crm-data.ts (Seed data generator for CRM testing)
```

---

## 2. Files Created

1. **`lib/modules/user/customer-merchant.service.ts`**: Customer-focused data mapping layer that queries `prisma.user` (with `role: 'CUSTOMER'`) and aggregates:
   - Lifetime Spend, Total Orders, Average Order Value (AOV).
   - Saved addresses, purchase histories.
   - Tags, staff notes, activity timeline logs mapped cleanly into the user's `savedPreferences` database column.
2. **`app/merchant/customers/actions.ts`**: Next.js Server Actions for fetching list pages, getting detail profiles, logging CRM notes, updating client tags, mutating addresses, and doing bulk status activations.
3. **`lib/services/merchant-customer-client.ts`**: Facade exposing user server actions to UI components.
4. **`components/merchant/customer/`**: 9 premium reusable CRM components (detailed below).
5. **`app/merchant/customers/page.tsx`**: Customer Directory view featuring search, sort options, segment tabs (VIP, Returning, Inactive, Wholesale), status filters, checklist bulk updates, and paginated table.
6. **`app/merchant/customers/[id]/page.tsx`**: Detailed Customer profile containing spend metrics widgets, historical transactions lists, default address configurations, timelines, internal comments, and tag editors.
7. **`scripts/seed-crm-data.ts`**: Seed generator scripting realistic customer records, order payments, address cards, tag groups, notes, and user timelines for testing.

---

## 3. Reusable Components Created

- **`CustomerTable`**: Directory table showcasing customer details, spent amounts, count logs, registration dates, and checkboxes.
- **`CustomerSegmentBadge`**: Colored tags representing dynamic customer groups (VIP, Wholesale, Inactive, etc.).
- **`CustomerStats`**: Spent totals, order counts, average order values, and last purchase date summary cards.
- **`CustomerAddress`**: Interactive layout showing shipping/billing details and form modals to add/edit/delete or set default addresses.
- **`CustomerTimeline`**: Dot-connector timeline listing customer milestones: Login events, account registrations, order confirmations, address modifications.
- **`CustomerOrders`**: Customer's transaction ledger linking directly to order fulfillments.
- **`CustomerNotes`**: Internal staff memo log.
- **`CustomerTags`**: Interactive tag groups allowing manual metadata assignments.
- **`CustomerCommunication`**: Simulated transactional email previews.

---

## 4. API Integration Summary

CRM operations leverage Server Actions to interact with database records dynamically:
- **Prisma Queries**: Joins `User`, `Order`, `Payment`, and `Address` tables dynamically to calculate CRM stats on the fly.
- **`savedPreferences` JSON Persistence**: Tags, staff notes, and timelines are parsed and persisted in the JSON-compatible `savedPreferences` DB column, enabling full data persistence without modifying database tables.

---

## 5. Verification Checklist

1. **Seed Data**: Run `npx tsx scripts/seed-crm-data.ts` to ensure 12 test customer records, addresses, and transaction histories are populated in your local DB.
2. **Customer Directory**: Verify filters (VIP, Wholesale, Inactive segments), search (name, email, ID), paginations, and bulk status triggers (activate/suspend).
3. **Saved Addresses**: Go to a customer profile, test adding new shipping cards, set defaults, edit fields, and verify deletion.
4. **Staff CRM Notes**: Append internal client notes and verify they save and update the timeline log immediately.
5. **Timeline & Purchase Logs**: Verify chronological timeline entries and order histories link properly to order fulfillments.
