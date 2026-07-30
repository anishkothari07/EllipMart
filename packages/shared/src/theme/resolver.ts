import { ThemeSource } from './types'
import { RegistryThemeSource } from './registry-source'

// In the future, this can dynamically return DatabaseThemeSource
export function getThemeResolver(): ThemeSource {
  return new RegistryThemeSource()
}
