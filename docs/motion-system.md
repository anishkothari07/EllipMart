# Motion Governance Document - EllipMart Motion System

This document outlines the design decisions, patterns, accessibility, and governance rules of the EllipMart Motion Design System to ensure premium, high-performance interactions across the entire ecommerce commerce application.

---

## 1. Design Tokens

Every component in the workspace must use standard design tokens instead of custom/ad-hoc duration or easing settings.

### A. Timing Scales
- **`veryFast: 0.1s`**: Microinteractions, button clicks, tiny toggle shifts.
- **`fast: 0.2s`**: Icons hover effects, fade states, tabs selection.
- **`normal: 0.35s`**: Modals, dropdown lists, page route transitions, card highlights.
- **`slow: 0.6s`**: Large hero animations, complete drawer expansions.

### B. Easing & Spring Physics
- **Ease Out Expo (`[0.16, 1, 0.3, 1]`)**: Fluid easing matching premium consumer experience (Apple/Stripe).
- **Ease Out Quart (`[0.25, 1, 0.5, 1]`)**: Snappy easing for short translations.
- **Gentle Spring (`stiffness: 120, damping: 14`)**: Used for drawer openings and sliding overlays.
- **Snap Spring (`stiffness: 180, damping: 12`)**: Used for alert dialog bounds and toast notices.
- **Luxury Ease (`stiffness: 80, damping: 15`)**: Very smooth, fluid transition for checkout success checkmarks and hero page elements.

---

## 2. Reusable Presets

Define custom animations by utilizing standard presets from `lib/motion/presets.ts`:
- `{...motionPresets.fadeIn}`: Basic backdrop/mask fades.
- `{...motionPresets.fadeUp}`: Dialog boxes and content blocks entries.
- `{...motionPresets.drawer}`: Side drawers (Cart/Wishlist/AI Drawer).
- `{...motionPresets.modal}`: Middle overlays / search dialog cards.
- `{...motionPresets.stagger(staggerChildren, delayChildren)}`: Staggered lists layout entry.

```tsx
import { motionPresets } from '@/lib/motion/presets';

<motion.div {...motionPresets.fadeUp}>
  Premium UI Content
</motion.div>
```

---

## 3. Performance Governance Rules

Animations must never induce layout shifts or CPU bottlenecks.

### ✅ Do:
- Animate only GPU-accelerated attributes: `transform` (e.g. translate, scale, rotate) and `opacity`.
- Use Next.js templates for route entries.
- Use `layoutId` for matching components transitions.

### ❌ Do Not:
- Do not animate non-GPU layout boundaries: `height`, `width`, `top`, `bottom`, `left`, `right`, or padding metrics unless absolutely necessary (for instance, list height collapsing on dismissals).
- Avoid chaining overlapping spring triggers which results in frame drops.

---

## 4. Accessibility & Reduced Motion

- All components must respect the `prefers-reduced-motion` settings.
- The global `MotionProvider` automatically forces all nested Framer Motion animators to run with `reducedMotion: "always"` when reduced motion is detected in OS/browser environments.
- Non-essential animations must be paused/stopped when the active browser tab is hidden or when the window goes out of focus.

---

## 5. When Animation Should NOT Be Used

Do not apply animations in the following scenarios to preserve speed and avoid visual exhaustion:
- **Navigation menus**: Should snap immediately or only use subtle hover underlines.
- **Form errors validation**: Focus states should be sharp; do not bounce labels or input boxes.
- **Bulk data / Admin tables**: Instant feedback is required. Never animate list updates or filters inside tables.
