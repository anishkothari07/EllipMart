import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

const perks = [
  'Free delivery on orders over ₹999',
  'Members-only early access drops',
  'Effortless 30-day returns',
]

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  image = '/images/hero-fashion.png',
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
  image?: string
}) {
  return (
    <div className="grid min-h-[calc(100vh-6.25rem)] lg:grid-cols-2">
      {/* Form column */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
              <ShoppingBag className="size-4" />
            </span>
            <span className="text-xl font-semibold tracking-tight">EllipMart</span>
          </Link>

          <h1 className="font-serif text-3xl font-medium tracking-tight text-balance">{title}</h1>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>

      {/* Visual column */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src={image || '/placeholder.svg'}
          alt=""
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-background">
          <p className="font-serif text-3xl font-medium leading-tight text-balance">
            Elevated everyday commerce, curated for modern living.
          </p>
          <ul className="mt-6 flex flex-col gap-2">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5 text-sm text-background/90">
                <span className="size-1.5 rounded-full bg-accent" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
