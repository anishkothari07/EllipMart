import { Container } from '@/components/shared/container'
import { RotateCcw, ShieldCheck, Truck, Headphones } from 'lucide-react'

const items = [
  { icon: Truck, title: 'Free delivery', desc: 'On orders over ₹999' },
  { icon: RotateCcw, title: '30-day returns', desc: 'Hassle-free refunds' },
  { icon: ShieldCheck, title: 'Secure checkout', desc: '256-bit encryption' },
  { icon: Headphones, title: '24/7 support', desc: 'Here whenever you need' },
]

export function TrustBar() {
  return (
    <section className="border-y border-border/60 bg-secondary/40">
      <Container className="py-6">
        <ul className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.title} className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background text-foreground shadow-[var(--shadow-soft)]">
                <item.icon className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {item.title}
                </span>
                <span className="text-xs text-muted-foreground">{item.desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
