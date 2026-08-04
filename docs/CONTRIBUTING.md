# SmartGO Developer Contributing Guide

Welcome to the SmartGO development team! This document outlines coding standards, monorepo conventions, workflow guidelines, and the pull request process.

---

## 1. Monorepo Workflow

SmartGO uses `pnpm` workspace filters and `turbo` for build caching.

### Useful Commands
- **Start Development**:
  ```bash
  pnpm dev
  ```
- **Run Unit/API Tests**:
  ```bash
  pnpm test
  ```
- **Run Type Checks**:
  ```bash
  pnpm typecheck
  ```
- **Build All Projects**:
  ```bash
  pnpm build
  ```

---

## 2. Code Standards & Conventions

### A. TypeScript
- **No `any` or `@ts-ignore`**: Always use explicit interfaces or generic type bounds.
- **Zod Payloads**: Validate incoming HTTP requests using Zod schemas before passing payloads to service functions.
- **Shared Types**: Place domain entities in `@corecart/types` and shared utilities in `@corecart/shared`.

### B. React & Next.js
- **Server Components First**: Prefer Server Components for data fetching. Use Client Components (`"use client"`) only when interactive state, effects, or browser APIs are required.
- **Clean Component Extraction**: Keep components focused on a single responsibility. Extract reusable UI primitives to `@corecart/ui`.

### C. Error Handling
- Throw `AppError` from `@corecart/shared` inside services.
- Never swallow exceptions silently in catch blocks.

---

## 3. Pull Request Checklist

Before submitting a PR:
1. Ensure `pnpm typecheck` returns 0 errors.
2. Ensure `pnpm test` passes 100%.
3. Ensure `pnpm build` compiles cleanly without warnings.
