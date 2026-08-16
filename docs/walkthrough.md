# Walkthrough — Storefront Regressions Fixed

This walkthrough outlines the fixes applied to restore the EllipMart storefront to its previous stable working state.

## Changes Made

### 1. Database Seeder Real Media Generation
- **File Modified**: [prisma/seed.ts](file:///c:/Users/Lenovo/Downloads/EllipMart/prisma/seed.ts)
- **Details**: Updated `seed.ts` to create 20 real database `Media` records pointing to local assets in `/images/` and map them via `ProductImage` relations for all 300 generated products.
- **Why it was broken**: Seeding originally generated products without any database `ProductImage` and `Media` mappings.
- **Why the fix is correct**: The storefront now retrieves real database-backed media listings for all products.

### 2. Next.js Edge Middleware setImmediate Warning/Crash
- **File Modified**: [apps/storefront/middleware.ts](file:///c:/Users/Lenovo/Downloads/EllipMart/apps/storefront/middleware.ts)
- **Details**: Changed `env` import in `middleware.ts` from the fat package entrypoint `@corecart/shared` to direct import `../../packages/shared/src/env`.
- **Why it was broken**: Edge runtimes do not support Node-specific APIs like `setImmediate`. The fat index `@corecart/shared` import pulled in `domain-event.bus.ts` which uses `setImmediate`, crashing the Edge Middleware compiler during active requests (leading to `ECONNRESET`).
- **Why the fix is correct**: Bypasses the index file, resolving compiler warnings/errors and allowing clean execution of session lookups.

### 3. Awaiting Dynamic Route Promise Parameters
- **Files Modified**: 
  - [apps/storefront/app/api/v1/products/[slug]/route.ts](file:///c:/Users/Lenovo/Downloads/EllipMart/apps/storefront/app/api/v1/products/[slug]/route.ts)
  - [apps/storefront/app/api/v1/pincode/[code]/route.ts](file:///c:/Users/Lenovo/Downloads/EllipMart/apps/storefront/app/api/v1/pincode/[code]/route.ts)
  - [apps/storefront/app/api/v1/orders/[id]/route.ts](file:///c:/Users/Lenovo/Downloads/EllipMart/apps/storefront/app/api/v1/orders/[id]/route.ts)
- **Details**: Updated route handlers to typify `params` as a `Promise` and await it before resolving properties.
- **Why it was broken**: In Next.js 15+, dynamic route `params` are asynchronous promises. Synchronous access of `params` properties evaluated to `undefined` and triggered database query validations to throw runtime 500 exceptions.
- **Why the fix is correct**: Awaiting dynamic parameters correctly resolves the actual route parameter value, restoring route handler functionality.

### 4. Consolidated Public Static Assets
- **Actions Taken**: Created symbolic junction from the monorepo root `public/` directory to `apps/storefront/public`. Also unified the merchant uploads folder by symlinking `apps/merchant/public/uploads` to the root `public/uploads` folder.
- **Why it was broken**: When storefront was moved to `apps/storefront/`, it no longer had a `public/` folder, causing all static assets, sitemaps, manifests, PWA files, and uploaded product images to return 404.
- **Why the fix is correct**: Unified the uploads pipeline so both client storefront assets and merchant uploaded images map to the exact same folder structure.

---

## Verification Results

A technical trace verification script was run to test all critical client flows (Login, Cart retrieval, Cart item additions, and Product page mapping):

```json
1. Logging in user p@gmail.com...
Login Status: 200
Login Response: {
  "success": true,
  "message": "Login successful",
  ...
}

2. Fetching cart...
Cart Status: 200
Cart Response: {
  "success": true,
  "data": {
    "items": [],
    ...
  }
}

3. Adding variant to cart...
Add to Cart Status: 200

4. Fetching product page API...
Product API Status: 200
Product API Response: {
  "success": true,
  "data": {
    "slug": "product-93-dsgq",
    "name": "Fantastic Concrete Chicken 93",
    "images": [
      "/images/p-candle.png",
      "/images/p-serum.png"
    ],
    ...
  }
}
```

Everything compiled and executed successfully!

---

## Turbopack NFT Tracing Warnings Fix
- **Files Modified**:
  - [packages/commerce/src/media/storage/local.storage.ts](file:///c:/Users/Lenovo/Music/EllipMart/packages/commerce/src/media/storage/local.storage.ts)
  - [packages/commerce/src/ai/ai.service.ts](file:///c:/Users/Lenovo/Music/EllipMart/packages/commerce/src/ai/ai.service.ts)
- **Details**: Added `/*turbopackIgnore: true*/` comments inside the dynamic filesystem lookups (e.g., `path.join`/`path.resolve`) using `process.cwd()`.
- **Why it was broken**: Dynamic filesystem operations referencing `process.cwd()` triggered Next.js/Turbopack's Next File Trace (NFT) scanner to trace the entire workspace directory, leading to compiler warnings about unexpected files tracked during builds.
- **Why the fix is correct**: Instructing Turbopack to ignore tracing those specific dynamic directory paths prevents the scanner from mapping the whole project and successfully resolves the build warnings.

### Prisma Client Generation Build Integration
- **File Modified**: [packages/database/package.json](file:///c:/Users/Lenovo/Music/EllipMart/packages/database/package.json)
- **Details**: Added a `"build": "prisma generate"` script.
- **Why it was broken**: In fresh containers/clean environments (such as Vercel builds), the Prisma Client does not pre-exist. Since `@corecart/database` lacked a `build` task, Next.js build compilation ran without the generated Client, failing with a compilation error: `Type error: Module '"@prisma/client"' has no exported member 'Prisma'`.
- **Why the fix is correct**: Because the main build task in Turborepo utilizes `"dependsOn": ["^build"]`, adding the build script guarantees that `@corecart/database` runs `prisma generate` before any application or library dependent on it starts compiling, resolving the build failure.


