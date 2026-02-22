'use client'

import Link from 'next/link'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ChevronLeft, ChevronRight, MapPin, Plus, TrendingUp } from 'lucide-react'
import StarRating from '@/components/StarRating'
import type { Profile, Restaurant } from '@/lib/supabase/types'

// Chargement dynamique pour éviter les erreurs SSR de Leaflet
const RestaurantMap = dynamic(() => import('@/components/RestaurantMap'), { ssr: false })

interface MapRestaurant {
    id: string
    name: string
    address: string | null
    city: string | null
    lat: number | null
    lng: number | null
    image_url: string | null
}

interface Props {
    profile: Profile | null
    myRestaurants: Restaurant[]
    communityRestaurants: Restaurant[]
    reviewStats: { restaurant_id: string | null; rating: number | null }[]
    mapRestaurants: MapRestaurant[]
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
    const avgRating = 3.7
    return (
        <Link href={`/restaurant/${restaurant.id}`} className="block">
            <div className="card min-w-[220px] max-w-[220px] flex-shrink-0">
                <div className="h-36 bg-[#E8E3D0] overflow-hidden">
                    {restaurant.image_url ? (
                        <img
                            src={restaurant.image_url}
                            alt={restaurant.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#D4C9A8] text-[#9A9A8A] text-xs font-medium">
                            {restaurant.name.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="p-3">
                    <h3 className="font-bold text-sm text-[#1A1A1A] leading-tight line-clamp-2">{restaurant.name}</h3>
                    <p className="text-xs text-[#9A9A8A] mt-1 flex items-center gap-1">
                        <MapPin size={11} />
                        {restaurant.address ? `${restaurant.address}, ${restaurant.city}` : restaurant.city}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-sm font-bold text-[#1A1A1A]">{avgRating}</span>
                        <StarRating rating={avgRating} size={13} />
                    </div>
                </div>
            </div>
        </Link>
    )
}

function RestaurantCarousel({ restaurants, title, cta }: { restaurants: Restaurant[], title: string, cta: { label: string, href: string } }) {
    const [offset, setOffset] = useState(0)
    const visible = 4
    const max = Math.max(0, restaurants.length - visible)

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">{title}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setOffset(o => Math.max(0, o - 1))}
                        disabled={offset === 0}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E8E3D0] hover:bg-[#E8F5EE] disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setOffset(o => Math.min(max, o + 1))}
                        disabled={offset >= max}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E8E3D0] hover:bg-[#E8F5EE] disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
            <div className="overflow-hidden">
                <div
                    className="flex gap-4 transition-transform duration-300"
                    style={{ transform: `translateX(-${offset * 236}px)` }}
                >
                    {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
                </div>
            </div>
            <div className="flex justify-center mt-6">
                <Link href={cta.href} className="btn-secondary">
                    {cta.label}
                </Link>
            </div>
        </div>
    )
}

export default function AccueilClient({ profile, myRestaurants, communityRestaurants, reviewStats, mapRestaurants }: Props) {
    const firstName = profile?.full_name?.split(' ')[0] ?? profile?.username ?? 'Explorateur'
    const totalAddresses = new Set(reviewStats.map(r => r.restaurant_id).filter(Boolean)).size
    const avgRating = reviewStats.length > 0
        ? (reviewStats.reduce((acc, r) => acc + (r.rating ?? 0), 0) / reviewStats.length).toFixed(1)
        : '—'

    return (
        <div className="animate-fade-in">
            {/* Hero Banner */}
            <div className="relative h-72 md:h-96 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80"
                    alt="Food"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        Bonjour {firstName},
                    </h1>
                    <p className="text-white/80 text-lg mb-6">
                        Quel restaurant avez-vous découvert aujourd&apos;hui ?
                    </p>
                    <Link href="/ajouter-adresse" className="w-fit btn-primary">
                        <Plus size={18} />
                        Ajouter une adresse
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
                {/* Dashboard Card */}
                <div className="bg-[#E36B39] text-white rounded-3xl p-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={20} />
                            <h2 className="font-bold text-lg">Votre tableau de bord</h2>
                            <span className="ml-auto text-sm text-white/70">13 janv. - 11 fév. →</span>
                        </div>
                        <div className="flex gap-8">
                            <div>
                                <p className="text-3xl font-bold">{totalAddresses}</p>
                                <p className="text-white/70 text-sm">Adresses</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">–</p>
                                <p className="text-white/70 text-sm">Likes</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">–</p>
                                <p className="text-white/70 text-sm">Vues</p>
                            </div>
                        </div>
                        <p className="text-white/80 text-sm mt-3">Note moyenne : {avgRating}/5</p>
                    </div>
                    <div className="hidden md:block w-32 h-24 opacity-70">
                        <svg viewBox="0 0 128 80" className="w-full h-full">
                            <polyline
                                points="0,60 20,50 40,55 60,30 80,40 100,20 128,35"
                                fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            />
                            <polyline
                                points="0,70 20,65 40,70 60,50 80,55 100,45 128,50"
                                fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                {/* My Recommendations */}
                {myRestaurants.length > 0 && (
                    <RestaurantCarousel
                        restaurants={myRestaurants}
                        title="Mes recommandations"
                        cta={{ label: 'Voir toutes mes adresses', href: '/recommandations' }}
                    />
                )}

                {/* Community */}
                <RestaurantCarousel
                    restaurants={communityRestaurants}
                    title="Découvert par la communauté"
                    cta={{ label: 'Voir les autres adresses', href: '/recommandations?tab=communaute' }}
                />

                {/* Interactive Map */}
                <div>
                    <h2 className="section-title mb-4">Votre carte interactive</h2>
                    <div className="rounded-3xl overflow-hidden border border-[#E8E3D0] h-72 bg-[#E8E3D0] relative">
                        {mapRestaurants.length > 0 ? (
                            <RestaurantMap restaurants={mapRestaurants} />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <MapPin size={40} className="mx-auto text-[#00703C] mb-2" />
                                    <p className="text-[#6B6B6B] font-medium">Carte interactive</p>
                                    <p className="text-sm text-[#9A9A8A]">Ajoutez des adresses pour les voir ici</p>
                                </div>
                            </div>
                        )}
                        <Link
                            href="/recommandations"
                            className="absolute top-4 right-4 btn-primary text-sm py-2 px-4 z-[1000]"
                        >
                            Voir mes adresses
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
