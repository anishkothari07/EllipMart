# EllipMart Automated Testing Guide

EllipMart utilizes a two-layer automated testing strategy complemented by Playwright End-to-End (E2E) verification.

---

## 1. Testing Pyramid Architecture

```
            / \
           /   \     Playwright E2E Tests (Browser-based Production Flows)
          /-----\
         /       \    Layer 2 Integration Tests (Real MySQL Database)
        /---------\
       /           \   Layer 1 Fast API & Unit Tests (Mocked Prisma & External Services)
      /-------------\
```

---

## 2. Test Execution Commands

### Layer 1: Fast API & Unit Tests
- Fast unit tests using mocked Prisma. Runs in under 5 seconds.
- **Command**:
  ```bash
  pnpm test
  ```
- **Coverage Command**:
  ```bash
  pnpm test:coverage
  ```

### Layer 2: Real Database Integration Tests
- Tests Prisma queries, transactions, foreign keys, and DB constraints against an isolated test database (`.env.test`).
- **Command**:
  ```bash
  pnpm test:integration
  ```

### Layer 3: Playwright End-to-End (E2E) Tests
- Runs browser automation tests across Chromium, Firefox, and WebKit targeting storefront, merchant, and admin portals.
- **Command**:
  ```bash
  pnpm test:e2e
  ```
- **Interactive UI Mode**:
  ```bash
  pnpm test:e2e:ui
  ```

---

## 3. Test Coverage Thresholds

The project enforces minimum coverage quality gates during `pnpm test:coverage`:

| Metric | Required Minimum | Current Suite Result |
|---|---|---|
| **Statements** | $\ge 80\%$ | **92.41%** |
| **Branches** | $\ge 75\%$ | **79.28%** |
| **Functions** | $\ge 80\%$ | **100%** |
| **Lines** | $\ge 80\%$ | **95.31%** |
