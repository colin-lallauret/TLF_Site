'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import StarRating from '@/components/StarRating'
import type { Restaurant } from '@/lib/supabase/types'

interface RestaurantWithReviews extends Restaurant {
    reviews: { rating: number | null; contributor_id: string | null }[]
}

interface Props {
    restaurants: RestaurantWithReviews[]
    currentUserId: string
}

const ITEMS_PER_PAGE = 9

export default function RecommandationsClient({ restaurants, currentUserId }: Props) {
    const [page, setPage] = useState(1)
    const [tab, setTab] = useState<'mes' | 'communaute'>('mes')

    const myRestaurants = restaurants.filter(r =>
        r.reviews.some(rev => rev.contributor_id === currentUserId)
    )
    const communityRestaurants = restaurants.filter(r =>
        !r.reviews.some(rev => rev.contributor_id === currentUserId)
    )

    const data = tab === 'mes' ? myRestaurants : communityRestaurants
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE)
    const paginated = data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    const getAvgRating = (r: RestaurantWithReviews) => {
        if (!r.reviews.length) return 0
        return r.reviews.reduce((acc, rev) => acc + (rev.rating ?? 0), 0) / r.reviews.length
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[#1A1A1A]">Mes recommandations</h1>
                <Link href="/ajouter-adresse" className="btn-primary">
                    <Plus size={18} />
                    Ajouter une adresse
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
                <button
                    onClick={() => { setTab('mes'); setPage(1) }}
                    className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${tab === 'mes' ? 'bg-[#00703C] text-white' : 'bg-[#E8E3D0] text-[#6B6B6B] hover:bg-[#E8F5EE]'
                        }`}
                >
                    Mes adresses ({myRestaurants.length})
                </button>
                <button
                    onClick={() => { setTab('communaute'); setPage(1) }}
                    className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${tab === 'communaute' ? 'bg-[#00703C] text-white' : 'bg-[#E8E3D0] text-[#6B6B6B] hover:bg-[#E8F5EE]'
                        }`}
                >
                    Communauté ({communityRestaurants.length})
                </button>
            </div>

            {/* Grid */}
            {paginated.length === 0 ? (
                <div className="text-center py-20 text-[#9A9A8A]">
                    <p className="text-lg font-medium mb-2">Aucune adresse</p>
                    {tab === 'mes' && (
                        <Link href="/ajouter-adresse" className="btn-primary inline-flex mt-4">
                            <Plus size={18} /> Ajouter ma première adresse
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginated.map(restaurant => {
                        const avg = getAvgRating(restaurant)
                        return (
                            <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} className="block">
                                <div className="card animate-fade-in">
                                    <div className="h-48 bg-[#E8E3D0] overflow-hidden">
                                        <img
                                            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=70"
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h2 className="font-bold text-[#1A1A1A] leading-tight mb-1">{restaurant.name}</h2>
                                        <p className="text-xs text-[#9A9A8A] flex items-center gap-1 mb-3">
                                            <MapPin size={12} />
                                            {[restaurant.address, restaurant.city].filter(Boolean).join(', ')}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[#1A1A1A]">{avg.toFixed(1)}</span>
                                            <StarRating rating={avg} size={14} />
                                            <span className="text-xs text-[#9A9A8A]">({restaurant.reviews.length})</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8E3D0] hover:bg-[#E8F5EE] disabled:opacity-30"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${page === i + 1
                                    ? 'bg-[#E36B39] text-white'
                                    : 'border border-[#E8E3D0] text-[#6B6B6B] hover:bg-[#E8F5EE]'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8E3D0] hover:bg-[#E8F5EE] disabled:opacity-30"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    )
}
