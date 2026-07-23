export type NavLink = {
  label: string
  href: string
  badge?: string
}

export type MegaMenuColumn = {
  title: string
  links: { label: string; href: string }[]
}

export type MegaMenuSection = {
  label: string
  href: string
  columns: MegaMenuColumn[]
  featured?: {
    title: string
    subtitle: string
    image: string
    href: string
  }
}

export type Category = {
  id: string
  name: string
  slug: string
  image: string
  productCount: number
  description?: string
}

export type Brand = {
  id: string
  name: string
  logoText: string
  href: string
}

export type ProductVariant = {
  type: 'color' | 'size'
  label: string
  options: {
    id: string
    label: string
    value?: string // hex for color swatches
    available: boolean
  }[]
}

export type Review = {
  id: string
  author: string
  avatar?: string
  rating: number
  date: string
  title: string
  body: string
  verified: boolean
  helpful: number
}

export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  price: number
  oldPrice?: number
  currency: string
  rating: number
  reviewCount: number
  images: string[]
  colors?: string[]
  badge?: string
  inStock: boolean
  stockCount?: number
  freeDelivery?: boolean
  isNew?: boolean
  isBestSeller?: boolean
  description?: string
  highlights?: string[]
  specifications?: { label: string; value: string }[]
  variants?: ProductVariant[]
  rawVariants?: { id: string, name: string, price: number, inStock: boolean, color?: string, size?: string }[]
  reviews?: Review[]
}

export type HeroSlide = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  image: string
  ctaLabel: string
  ctaHref: string
  align?: 'left' | 'center'
  theme?: 'light' | 'dark'
}

export type Collection = {
  id: string
  title: string
  subtitle: string
  image: string
  href: string
  size?: 'wide' | 'tall' | 'normal'
}

export type Testimonial = {
  id: string
  author: string
  role: string
  quote: string
  rating: number
  avatar?: string
}

export type CartItem = {
  product: Product
  quantity: number
  selectedColor?: string
  selectedSize?: string
}

export type Coupon = {
  code: string
  label: string
  discountPct: number
}
