# EllipMart Mobile Shell (Capacitor)

Dedicated, lightweight native shell for **EllipMart** built with [Capacitor](https://capacitorjs.com/).

This shell wraps the unified EllipMart Customer Shopping Experience (`https://ellipmart.com` in production / local dev URL during development) into native Android and iOS applications.

---

## 🏗️ Architecture

```text
apps/storefront
   ↓
Unified EllipMart Web App
   ├── / (Customer Storefront)
   ├── /seller (Seller Portal - Web only)
   └── /admin (Super Admin - Web only)

apps/mobile
   ↓
Capacitor Native Shell (Android & iOS)
   ↓ (loads customer experience)
https://ellipmart.com / Local Dev URL
```

---

## 🚀 Development Quickstart

### 1. Configure the Target Storefront URL

By default, in development mode:
- **Android Emulator**: connects to `http://10.0.2.2:3000` (host machine alias).
- **Physical Device**: set `CAPACITOR_LIVE_URL` to your computer's LAN IP:
  ```bash
  # Windows PowerShell
  $env:CAPACITOR_LIVE_URL="http://192.168.1.50:3000"
  ```
- **Production**: defaults to `https://ellipmart.com` (with `cleartext: false`).

### 2. Sync Native Projects

Whenever `capacitor.config.ts` or plugins change:

```bash
pnpm --filter mobile run cap:sync
```

### 3. Open in IDEs

- **Android Studio**:
  ```bash
  pnpm --filter mobile run cap:android
  ```
- **Xcode** *(requires macOS)*:
  ```bash
  pnpm --filter mobile run cap:ios
  ```

---

## 📱 Features Included

- **Native Back Button Handling**: Hardware and gesture back buttons traverse the WebView history before exiting the app at the home screen.
- **Dynamic Live Server Connection**: Full support for Next.js SSR, cookies, authentication sessions, and dynamic shopping carts.
- **Tight Navigation Allowances**: Restricted to `ellipmart.com` and required payment gateway hosts (`api.razorpay.com`, `checkout.razorpay.com`).
- **Splash Screen & Status Bar**: Native splash duration and dark theme status bar configurations.
