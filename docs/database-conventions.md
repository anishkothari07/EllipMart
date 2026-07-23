# Database Conventions

Before proceeding to Sprint 1 (Database Design), please review and adhere to these conventions for the SmartGO schema.

## 1. Primary Keys
- Use **UUIDs** (specifically `@default(uuid())`) for all primary keys to ensure global uniqueness and prevent enumerable IDs.
- *Example:* `id String @id @default(uuid())`

## 2. Timestamps
- Every table must have `createdAt` and `updatedAt`.
- *Example:*
  ```prisma
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ```

## 3. Soft Deletes
- Use `deletedAt DateTime?` for entities where historical integrity is required (e.g., `Product`, `Category`, `User`).
- Do not apply soft deletes to join tables or low-value analytical logs.

## 4. Status Flags
- Use `isActive Boolean @default(true)` to quickly toggle visibility for entities like Products, Users, and Promotions without soft-deleting.

## 5. Relationships & Foreign Keys
- All relations must be explicitly defined with foreign keys.
- Prefer `@relation(fields: [xyzId], references: [id])`.
- Handle cascading deletes thoughtfully (e.g., deleting a User might cascade to Carts, but should `Restrict` or `SetNull` on Orders).

## 6. Data Types
- Avoid JSON blobs for relational data. Use proper relational tables unless storing highly dynamic, schema-less data (like webhook payloads).
- Use `Decimal` (e.g., `@db.Decimal(10,2)`) for monetary values instead of `Float` to avoid precision issues.

## 7. Naming Conventions
- **Prisma Models:** PascalCase (e.g., `User`, `OrderItem`).
- **Prisma Fields:** camelCase (e.g., `firstName`, `orderStatus`).
- **Database Mapping:** Map models and fields to `snake_case` in MySQL using `@@map` and `@map` if you want strict DB naming conventions, OR stick to Prisma defaults (camelCase) universally. Pick one and stick to it.
- *Recommendation for SmartGO:* Stick to standard Prisma defaults (camelCase) to reduce mapping boilerplate, unless integrating with legacy systems.

## 8. Indexing
- Use `@@index([columnName])` on frequently queried fields, foreign keys, and fields used for sorting/filtering.
- Use composite indexes where appropriate (e.g., `@@index([userId, status])`).

## 9. Auditing
- Admin-managed tables should include `createdBy String?` and `updatedBy String?` to track which staff member made changes.
