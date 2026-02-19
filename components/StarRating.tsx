'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
    rating: number
    max?: number
    size?: number
    interactive?: boolean
    onChange?: (rating: number) => void
}

export default function StarRating({ rating, max = 5, size = 16, interactive = false, onChange }: StarRatingProps) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: max }).map((_, i) => {
                const filled = i < Math.round(rating)
                return (
                    <Star
                        key={i}
                        size={size}
                        fill={filled ? '#E36B39' : 'none'}
                        stroke={filled ? '#E36B39' : '#D4CEB8'}
                        className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
                        onClick={() => interactive && onChange?.(i + 1)}
                    />
                )
            })}
        </div>
    )
}
