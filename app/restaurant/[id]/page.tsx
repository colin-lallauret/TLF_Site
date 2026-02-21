import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Star, Euro } from 'lucide-react'
import StarRating from '@/components/StarRating'
import type { Restaurant } from '@/lib/supabase/types'

type ReviewWithProfile = {
    id: string
    title: string | null
    description: string | null
    rating: number | null
    created_at: string | null
    profiles: { full_name: string | null; username: string | null; avatar_url: string | null } | null
}

type RestaurantWithReviews = Restaurant & { reviews: ReviewWithProfile[] }

export default async function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: rawRestaurant } = await supabase
        .from('restaurants')
        .select(`
      *,
      reviews(
        id, title, description, rating, created_at,
        profiles(full_name, username, avatar_url)
      )
    `)
        .eq('id', id)
        .single()

    if (!rawRestaurant) notFound()

    const restaurant = rawRestaurant as unknown as RestaurantWithReviews
    const reviews = restaurant.reviews ?? []

    const avgRating = reviews.length > 0
        ? reviews.reduce((acc: number, r: any) => acc + (r.rating ?? 0), 0) / reviews.length
        : 0

    const budgetLabels = ['', '€', '€€', '€€€', '€€€€']

    return (
        <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">
            <Link href="/recommandations" className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#00703C] mb-6 text-sm transition-colors">
                <ArrowLeft size={16} /> Retour aux recommandations
            </Link>

            {/* Hero image */}
            <div className="rounded-3xl overflow-hidden h-64 mb-8">
                {restaurant.image_url ? (
                    <img
                        src={restaurant.image_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#E8E3D0] text-[#9A9A8A] text-2xl font-bold">
                        {restaurant.name.charAt(0)}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-col md:flex-row md:items-start gap-6 mb-10">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">{restaurant.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-[#6B6B6B] mb-3">
                        {restaurant.city && (
                            <span className="flex items-center gap-1">
                                <MapPin size={15} className="text-[#E36B39]" />
                                {[restaurant.address, restaurant.city, restaurant.postal_code].filter(Boolean).join(', ')}
                            </span>
                        )}
                        {restaurant.budget_level && (
                            <span className="flex items-center gap-1 font-medium text-[#00703C]">
                                <Euro size={14} />
                                {budgetLabels[restaurant.budget_level]}
                            </span>
                        )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl font-bold text-[#E36B39]">{avgRating.toFixed(1)}</span>
                        <div>
                            <StarRating rating={avgRating} size={20} />
                            <p className="text-xs text-[#9A9A8A] mt-1">{reviews.length} avis</p>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {restaurant.food_types?.map((t: string) => (
                            <span key={t} className="badge-green badge">{t}</span>
                        ))}
                        {restaurant.dietary_prefs?.map((d: string) => (
                            <span key={d} className="badge-terracotta badge">{d}</span>
                        ))}
                        {restaurant.atmospheres?.map((a: string) => (
                            <span key={a} className="badge bg-[#F5F0DC] text-[#6B6B6B]">{a}</span>
                        ))}
                    </div>
                </div>

                {/* Services */}
                {restaurant.services && restaurant.services.length > 0 && (
                    <div className="bg-white rounded-2xl border border-[#E8E3D0] p-5 min-w-48">
                        <h3 className="font-bold text-[#1A1A1A] mb-3 text-sm">Services</h3>
                        <ul className="space-y-2">
                            {restaurant.services.map((s: string) => (
                                <li key={s} className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                                    <span className="w-2 h-2 rounded-full bg-[#00703C] flex-shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Reviews */}
            <div>
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">
                    Avis des contributeurs ({reviews.length})
                </h2>
                {reviews.length === 0 ? (
                    <p className="text-[#9A9A8A]">Aucun avis pour l&apos;instant.</p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review: any) => (
                            <div key={review.id} className="bg-white rounded-2xl border border-[#E8E3D0] p-5">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center flex-shrink-0">
                                        {review.profiles?.avatar_url ? (
                                            <img src={review.profiles.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                                        ) : (
                                            <span className="text-[#00703C] font-bold text-sm">
                                                {(review.profiles?.full_name ?? review.profiles?.username ?? '?').charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm text-[#1A1A1A]">
                                            {review.profiles?.full_name ?? review.profiles?.username ?? 'Contributeur'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <StarRating rating={review.rating ?? 0} size={13} />
                                            <span className="text-xs text-[#9A9A8A]">
                                                {review.created_at ? new Date(review.created_at).toLocaleDateString('fr-FR') : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {review.title && <p className="font-semibold text-[#1A1A1A] mb-1">{review.title}</p>}
                                {review.description && <p className="text-sm text-[#6B6B6B] leading-relaxed">{review.description}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
