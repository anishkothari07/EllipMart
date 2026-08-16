# Phase 3 Architecture Correction — Migrate Existing EllipMart Website to Database

## Goal

The objective of this phase is **not** to introduce multiple websites, templates, cloning, or demonstrations.

The objective is to migrate **the existing EllipMart storefront** into the CoreCart Website Definition so that **every website-specific value is stored in the database**, while the engine becomes completely website-agnostic.

The visual appearance and behavior of the current EllipMart storefront must remain unchanged.

---

## Core Principles

> [!IMPORTANT]
>
> * Seed **only one Website instance**.
> * Do **not** create demonstration websites.
> * Do **not** create template websites.
> * Do **not** clone websites.
> * Do **not** introduce ElectroMart, Reference Commerce Model, Fashion Store, Demo Store, or any other tenant.
>
> Multi-website support already exists in the architecture and will be exercised later through the Super Admin application.

---

# Zero Hardcoded Website Definition Policy

> [!CRITICAL]
>
> The objective of this migration is **not** simply to move data into the database.
>
> The objective is to ensure that **the CoreCart engine contains zero website definition**.
>
> After this migration, if a Super Admin should be able to change something without opening VS Code, it **must not exist in the engine**.
>
> The renderer must never contain website-specific defaults, placeholder content, fallback branding, marketing copy, navigation labels, section titles, or configuration values.
>
> Every website-specific value must originate from:
>
> ```
> Normalized Database Tables
>         ↓
> Compiler
>         ↓
> RuntimeManifest
>         ↓
> Generic Renderer
> ```
>
> React components must never contain defaults such as:
>
> ```tsx
> title = "Curated collections"
> subtitle = "Shop by category"
> buttonText = "Shop Now"
> placeholder = "Search products..."
> href = "/category/all"
> ```
>
> Instead, components must receive those values exclusively through props resolved from the compiled Runtime Manifest.
>
> The only permissible hardcoded values in the engine are implementation details, including:
>
> * Rendering logic
> * Routing logic
> * Validation rules
> * Component registration
> * Animations
> * Utility functions
> * API infrastructure
> * Authentication
> * Payment processing
> * Commerce engine logic
> * Analytics engine
> * AI engine infrastructure
>
> These values describe **HOW** the platform works, never **WHAT** a website looks like.

---

## Seeder

Modify `prisma/seed-cms.ts`

### Remove

* Reference Commerce Model
* ElectroMart
* cloneWebsite()
* duplicateWebsite()
* template website generation
* demo tenants

### Seed only

```
Website

id:
ellipmart-storefront

domain:
localhost

name:
EllipMart
```

Then seed under this website:

* WebsiteSettings
* Theme
* ThemeTokens
* Navigation
* NavigationItems
* Pages
* Layouts
* Sections
* ComponentInstances
* ComponentProperties
* SEO
* AIConfiguration

using **the exact website that already exists today**.

Do **not** invent placeholder content.

Do **not** replace existing copy.

Do **not** simplify layouts.

Do **not** generate demo content.

The seed must represent the current EllipMart storefront exactly.

---

## Runtime

Compile exactly one Runtime Manifest.

```
Website

↓

Compiler

↓

WebsiteVersion.payload

↓

Storefront
```

---

## Verification

After seeding:

```sql
SELECT COUNT(*) FROM Website;
```

Expected

```
1
```

```sql
SELECT COUNT(*) FROM WebsiteDraft;
```

Expected

```
1
```

```sql
SELECT COUNT(*) FROM WebsiteVersion;
```

Expected

```
1
```

```sql
SELECT name, domain
FROM Website;
```

Expected

| name    | domain    |
| ------- | --------- |
| EllipMart | localhost |

There must be **no**:

* ElectroMart
* Reference Commerce
* Demo Store
* Sample Store
* Template Store

---

## Hardcoded Audit

Continue extracting every remaining website-definition value from the codebase until the following are true:

* Header labels come from the database.
* Footer links come from the database.
* Hero titles and CTAs come from the database.
* Section titles come from the database.
* Search placeholders come from the database.
* AI greetings come from the database.
* Marketing copy comes from the database.
* Navigation comes from the database.
* Theme tokens come from the database.
* SEO metadata comes from the database.

The only remaining hardcoded values in the repository should be **engine logic** (rendering, validation, compilation, routing, animation, utilities, and infrastructure), never website-specific content.

---

### Engine Audit

Perform a repository-wide audit before considering the migration complete.

Search the production codebase for remaining website-definition defaults such as:

```text
title =
subtitle =
label =
placeholder =
buttonText =
href =
description =
eyebrow =
announcement =
hero =
testimonial =
collection =
promotion =
```

Any string representing website content, branding, marketing copy, navigation, or presentation must be removed from the engine and sourced from the database.

The audit passes only when:

* `app/layout.tsx` contains no website-definition constants.
* `components/layout/*` contains no website-definition defaults.
* `components/home/*` contains no website-definition defaults.
* `storefront-renderer` renders only manifest data.
* `lib/data.ts` contains only temporary commerce fixtures (until products are fully DB-driven).
* The storefront can be modified entirely through database updates and publishing, without changing React or TypeScript code.

---

**Success is achieved when changing any visible website content (branding, navigation, hero text, footer links, section titles, AI greetings, search placeholders, etc.) requires only a database update and a publish operation, with zero source code changes or application rebuilds.**
