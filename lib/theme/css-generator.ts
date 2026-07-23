import { Theme } from './types'

export function generateThemeVariables(theme: Theme): React.CSSProperties {
  const vars: Record<string, string> = {}
  
  // Set all colors as css variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    vars[`--${key}`] = value
  })
  
  // Also map them for backwards compatibility with Shadcn variables that lack prefixes
  // Wait, the shadcn UI uses these variables without `--color-` prefix on the root, 
  // but tailwind v4 sets them inside the `@theme` block.
  // Actually, Shadcn Tailwind configuration reads from these custom properties.
  
  vars['--radius'] = `${theme.radius}rem`
  
  // Note: Since this will be passed to a React `style` object or injected into a <style> tag,
  // we return it as an object suitable for React.CSSProperties.
  return vars as React.CSSProperties
}

/**
 * Returns a raw CSS string of variables for a given theme, useful for injecting via <style> tag.
 */
export function generateThemeCSS(theme: Theme, selector: string = ':root'): string {
  const vars = generateThemeVariables(theme)
  const cssLines = Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`)
  
  return `${selector} {
${cssLines.join('\n')}
}`
}
