'use client'

import { AppLogoLoader } from '@/components/shared/logo-loader'

/**
 * Renders the EllipMart logo animation splash screen on first app load.
 * Unmounts itself automatically when the animation minimum duration passes.
 * Place this inside the root layout body so it overlays all content initially.
 */
export function AppLoaderProvider() {
  return <AppLogoLoader />
}
