'use client'

import { CheckCircle2, ThumbsUp } from 'lucide-react'
import type { Review } from '@/lib/types'
import { StarRating } from '@/components/shared/star-rating'

export function ProductReviews({
  rating,
  reviewCount,
  reviews = [],
}: {
  rating: number
  reviewCount: number
  reviews?: Review[]
}) {
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const pct =
      star === 5 ? 68 : star === 4 ? 22 : star === 3 ? 6 : star === 2 ? 3 : 1
    return { star, pct }
  })

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      {/* Summary */}
      <div>
        <div className="flex items-end gap-3">
          <span className="font-serif text-5xl font-medium text-foreground">{rating.toFixed(1)}</span>
          <div className="pb-1">
            <StarRating rating={rating} size={16} />
            <p className="mt-1 text-sm text-muted-foreground">{reviewCount} reviews</p>
          </div>
        </div>
        <ul className="mt-6 flex flex-col gap-2">
          {distribution.map((d) => (
            <li key={d.star} className="flex items-center gap-2 text-sm">
              <span className="w-3 text-muted-foreground">{d.star}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-accent" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="w-8 text-right text-xs text-muted-foreground">{d.pct}%</span>
            </li>
          ))}
        </ul>
        <button className="mt-6 flex h-11 w-full items-center justify-center rounded-full border border-border text-sm font-medium transition-colors hover:bg-muted">
          Write a review
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col divide-y divide-border">
        {reviews.map((review) => (
          <article key={review.id} className="py-6 first:pt-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-muted text-sm font-semibold text-foreground">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    {review.author}
                    {review.verified && (
                      <span className="flex items-center gap-1 text-xs font-normal text-success">
                        <CheckCircle2 className="size-3.5" /> Verified
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              </div>
              <StarRating rating={review.rating} size={13} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">{review.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
            <button className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
              <ThumbsUp className="size-3.5" /> Helpful ({review.helpful})
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}
