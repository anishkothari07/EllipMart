# SmartGO Monorepo Architecture & Enterprise Guide

SmartGO is built as a high-performance e-commerce monorepo managed by `pnpm` and `turbo`. It follows modular, domain-driven architecture to enforce strict isolation between business logic, database models, shared utilities, and UI portals.

---

## 1. Monorepo Package Topology

```
SmartGO Monorepo Root
├── apps/
│   ├── storefront/    # Next.js Customer Portal (Port 3001)
│   ├── merchant/      # Next.js Merchant Operations Dashboard (Port 3002)
│   └── admin/         # Next.js Platform Administration Portal (Port 3003)
└── packages/
    ├── database/      # Prisma ORM Schema & Database Client (@corecart/database)
    ├── shared/        # Shared Utilities, JWT, Validation Schemas & Errors (@corecart/shared)
    ├── commerce/      # Core Domain Business Logic & Services (@corecart/commerce)
    ├── types/         # Domain TypeScript Interfaces & API DTOs (@corecart/types)
    ├── ui/            # Shared Design System Components (@corecart/ui)
    └── compiler/      # Specialized Template & CMS Compilers (@corecart/compiler)
```

---

## 2. Package Dependency Flow

```
apps (storefront, merchant, admin)
       │
       ▼
@corecart/commerce (Services: Checkout, Payment, Cart, Order, Inventory, Media)
       │
       ├──────────────────────────┐
       ▼                          ▼
@corecart/database       @corecart/shared (JWT, AppError, Logger)
(Prisma Client / MySQL)           │
       │                          │
       └──────────┬───────────────┘
                  ▼
          @corecart/types (Domain Interfaces & DTOs)
```

---

## 3. Core Architectural Patterns

### A. Separation of Concerns (SOLID)
- **Database Layer (`packages/database`)**: Exposes the Prisma client singleton wrapped with MariaDB/MySQL drivers. No business rules are present in this layer.
- **Service Layer (`packages/commerce`)**: Encapsulates pure business rules (order calculation, inventory reservation, COD state machine transitions, Cloudinary media processing).
- **Presentation Layer (`apps/*`)**: Next.js App Router routes act purely as request handlers—parsing incoming JSON, validating payloads using `zod`, delegating to service methods, and serializing responses.

### B. Error Handling Standard
- All operational errors inherit from `AppError` in `@corecart/shared`.
- API route handlers catch `AppError` and convert them into standardized JSON error payloads:
  ```json
  {
    "success": false,
    "message": "Human readable error description",
    "error": {
      "code": "ERROR_CODE_IDENTIFIER"
    }
  }
  ```

### C. Security & Authorization
- **Role Guards**: Merchant and Admin actions enforce role-based access control (RBAC) via session headers (`x-user-id`, `x-user-role`).
- **Session Isolation**: Storefront and Merchant portals use distinct cookie stores to prevent cross-portal token leakage.

---

## 4. Performance & Caching

- **Database Queries**: Multi-entity operations are bundled in Prisma transactions (`prisma.$transaction`).
- **Query Interceptor**: Integration tests log warnings for any database queries taking longer than 100ms.
- **Image Optimization**: Cloudinary CDN URLs (`res.cloudinary.com`) handle dynamic variant generation, responsive resizing, and format optimization (WebP/AVIF).
