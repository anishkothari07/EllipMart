export interface ThemeColors {
  background: string
  foreground: string
  card: string
  'card-hover': string
  surface: string
  'surface-2': string
  primary: string
  'primary-foreground': string
  secondary: string
  'secondary-foreground': string
  accent: string
  'accent-foreground': string
  success: string
  warning: string
  danger: string
  border: string
  input: string
  ring: string
  shadow: string
  navbar: string
  hero: string
  footer: string
  button: string
  'button-hover': string
  
  // Backwards compatibility with Shadcn globals
  muted: string
  'muted-foreground': string
  popover: string
  'popover-foreground': string
  'card-foreground': string
  'destructive': string
  'destructive-foreground': string
}

export interface Theme {
  id: string
  name: string
  description: string
  category: 'SmartGO' | 'Light' | 'Dark' | 'Luxury' | 'Modern'
  isDark: boolean
  colors: ThemeColors
  radius: number // base radius in rem
}

export interface ThemeSource {
  getThemes(): Promise<Theme[]>
  getTheme(id: string): Promise<Theme | null>
  getDefaultTheme(): Promise<Theme>
}
