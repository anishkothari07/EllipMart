# SmartGO Production Deployment & Operating Guide

This guide details the step-by-step procedure for deploying SmartGO to **Vercel** (Next.js Apps) and **Railway** (MySQL Database).

---

## 1. Prerequisites

- **Vercel Account** (Connected to GitHub repository)
- **Railway Project** (MySQL 8 / MariaDB service provisioned)
- **Cloudinary Account** (Media storage cloud name & API credentials)

---

## 2. Infrastructure Setup

### A. Railway Database Setup
1. Provision a MySQL or MariaDB database on Railway.
2. Copy the `DATABASE_URL` connection string from Railway variables.
3. Run schema migration on the database:
   ```bash
   DATABASE_URL="mysql://root:password@containers-us-west-xxx.railway.app:7988/railway" pnpm --filter @corecart/database exec prisma db push
   ```
4. Optionally seed essential localization & initial CMS data:
   ```bash
   DATABASE_URL="mysql://..." pnpm seed
   ```

### B. Cloudinary Media Storage Setup
1. Create a Cloudinary account.
2. Obtain `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
3. Verify remote patterns are allowed in `next.config.mjs` (pre-configured for `res.cloudinary.com`).

---

## 3. Vercel Project Configurations

You will create 3 Vercel projects (or subdomains under 1 team) for the monorepo:

### Project 1: Storefront (`apps/storefront`)
- **Framework Preset**: Next.js
- **Root Directory**: `apps/storefront`
- **Build Command**: `cd ../.. && pnpm build --filter storefront`
- **Output Directory**: `.next`

### Project 2: Merchant Portal (`apps/merchant`)
- **Framework Preset**: Next.js
- **Root Directory**: `apps/merchant`
- **Build Command**: `cd ../.. && pnpm build --filter merchant`
- **Output Directory**: `.next`

### Project 3: Admin Portal (`apps/admin`)
- **Framework Preset**: Next.js
- **Root Directory**: `apps/admin`
- **Build Command**: `cd ../.. && pnpm build --filter admin`
- **Output Directory**: `.next`

---

## 4. Required Production Environment Variables

Add the following environment variables in Vercel settings for each project:

| Variable Name | Scope | Description |
|---|---|---|
| `DATABASE_URL` | Server | Railway MySQL connection string |
| `JWT_ACCESS_SECRET` | Server | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Server | Secret for signing refresh tokens |
| `CLOUDINARY_CLOUD_NAME` | Server | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Server | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Server | Cloudinary API Secret |
| `RAZORPAY_KEY_ID` | Server/Client | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Server | Razorpay Secret |

---

## 5. Post-Deployment Verification Checklist

After Vercel completes deployment:

- [ ] **Health Endpoint**: Ping `https://<storefront-url>/api/health` and verify `{"status":"ok","checks":{"database":"healthy"}}`.
- [ ] **Auth Flow**: Perform Register & Login to verify JWT cookie persistence.
- [ ] **Images**: Upload a product image from Merchant portal and verify it renders from `https://res.cloudinary.com/`.
- [ ] **Checkout**: Create a test COD order on Storefront and confirm status updates in Merchant portal.
- [ ] **Role Protection**: Attempt to open `/admin` without admin credentials and confirm redirect to login.

---

## 6. Emergency Rollback Procedure

If a breaking issue occurs post-deploy:

1. **Vercel Rollback**: Navigate to Vercel Project -> **Deployments** -> select the previous stable deployment -> Click **Promote to Production**.
2. **Database Rollback**: If schema changes occurred, run migration rollback scripts or restore Railway point-in-time backup.
