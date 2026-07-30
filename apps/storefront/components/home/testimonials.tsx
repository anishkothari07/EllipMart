'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { Container } from '@corecart/ui'
import { SectionHeader } from '@corecart/ui'
import { StarRating } from '@corecart/ui'
import { testimonials } from '@corecart/shared'

export function Testimonials() {
  return (
    <section className="bg-secondary/40 py-16 sm:py-20">
      <Container>
        <SectionHeader
          eyebrow="Loved by thousands"
          title="What our customers are saying"
          align="center"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col rounded-[var(--radius-lg)] border border-border/60 bg-card p-7 shadow-[var(--shadow-soft)]"
            >
              <Quote className="size-8 text-primary/30" />
              <StarRating rating={t.rating} size={14} className="mt-4" />
              <blockquote className="mt-4 flex-1 text-pretty leading-relaxed text-foreground">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                  {t.author.charAt(0)}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{t.author}</span>
                  <span className="text-xs text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </Container>
    </section>
  )
}
