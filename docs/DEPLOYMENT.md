# Production Deployment Guide: EllipMart

This guide details the step-by-step procedure for deploying EllipMart to **Vercel** (Next.js Apps) and **Supabase** (PostgreSQL Database & Storage).

---

## 1. Prerequisites Checklist

- **Vercel Account** (Connected to your Git repository)
- **Supabase Project** (PostgreSQL database + `media` Storage bucket provisioned)
- **Upstash Redis Database** (REST URL and Token for edge rate limiting)
- **Razorpay Account** (Live Key ID, Key Secret, and Webhook Secret)

---

## 2. Infrastructure Setup & Provisioning

### A. Supabase Database & Storage Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** → **Database** → **Connection string** → **URI**.
3. Copy:
   - **Transaction Pooler (`DATABASE_URL`)**: Port `6543` with `?pgbouncer=true`.
   - **Direct URL (`DIRECT_URL`)**: Port `5432`.
4. Go to **Storage** tab, create a new public bucket named **`media`**.
5. Push schema and seed from your terminal:
   ```bash
   pnpm --filter @corecart/database exec prisma db push
   pnpm exec tsx scripts/seed-users.ts
   pnpm exec tsx packages/database/prisma/seed-localization.ts
   ```

### B. Upstash Redis Setup
1. Create a Redis database on [Upstash](https://console.upstash.com).
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

---

## 3. Environment Variables Reference

| Variable Name | Target | Purpose / Format |
|---|---|---|
| `DATABASE_URL` | Server | Supabase PostgreSQL Transaction Pooler connection string (Port 6543) |
| `DIRECT_URL` | Server | Supabase PostgreSQL Direct connection string (Port 5432) |
| `JWT_ACCESS_SECRET` | Server | Minimum 32-character random string |
| `JWT_REFRESH_SECRET` | Server | Minimum 32-character random string |
| `UPSTASH_REDIS_REST_URL` | Edge/Server | Upstash REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Edge/Server | Upstash REST auth token |
| `NEXT_PUBLIC_SUPABASE_URL` | Client/Server | Supabase project URL (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | Supabase public anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase secret service role key |
| `RAZORPAY_KEY_ID` | Client/Server | Razorpay public key ID |
| `RAZORPAY_KEY_SECRET` | Server | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Server | Razorpay webhook signature secret |
| `NEXT_PUBLIC_STOREFRONT_URL` | Client | Production Storefront URL |
| `NEXT_PUBLIC_MERCHANT_URL` | Client | Production Merchant Dashboard URL |
| `NEXT_PUBLIC_ADMIN_URL` | Client | Production Admin Portal URL |
| `NEXT_PUBLIC_API_URL` | Client | Production API base URL (`https://<domain>/api/v1`) |
