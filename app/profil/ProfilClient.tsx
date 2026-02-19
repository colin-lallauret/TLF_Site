'use client'

import { MapPin, Calendar, Award, Gift } from 'lucide-react'
import type { Profile } from '@/lib/supabase/types'

interface Props {
    profile: Profile | null
    reviewCount: number
}

const MILESTONES = [
    { pts: 100, label: '100 pts', icon: '✅' },
    { pts: 150, label: '150 pts', icon: '🎂' },
    { pts: 200, label: '200 pts', icon: '🎁' },
    { pts: 250, label: '250 pts', icon: '🏆' },
]

export default function ProfilClient({ profile, reviewCount }: Props) {
    // Compute points: 10 pts per review (simplified logic)
    const points = reviewCount * 10
    const memberYear = profile?.created_at
        ? new Date(profile.created_at).getFullYear()
        : new Date().getFullYear()

    const progressMax = MILESTONES[MILESTONES.length - 1].pts
    const progressPct = Math.min((points / progressMax) * 100, 100)

    return (
        <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#E8E3D0] p-8 mb-10">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#E8E3D0] shadow-md">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#E8F5EE] to-[#C8E6D8] flex items-center justify-center">
                                    <span className="text-5xl font-bold text-[#00703C]">
                                        {profile?.full_name?.charAt(0) ?? profile?.username?.charAt(0) ?? 'U'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-[#E36B39] mb-4">
                            {profile?.full_name ?? profile?.username ?? 'Utilisateur'}
                        </h1>

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start gap-8 mb-5">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-[#1A1A1A]">{reviewCount}</p>
                                <p className="text-sm text-[#6B6B6B]">Adresses</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-[#1A1A1A]">–</p>
                                <p className="text-sm text-[#6B6B6B]">Likes</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-[#1A1A1A]">{memberYear}</p>
                                <p className="text-sm text-[#6B6B6B]">membre depuis</p>
                            </div>
                        </div>

                        {/* Meta */}
                        {profile?.city && (
                            <div className="flex items-center gap-2 text-sm text-[#6B6B6B] mb-2 justify-center md:justify-start">
                                <MapPin size={15} className="text-[#E36B39]" />
                                <span>
                                    <span className="font-semibold text-[#E36B39]">Pays/Région : </span>
                                    {profile.city}
                                </span>
                            </div>
                        )}
                        {profile?.bio && (
                            <div className="flex items-start gap-2 text-sm text-[#6B6B6B] justify-center md:justify-start">
                                <span className="font-semibold text-[#E36B39] shrink-0">Bio : </span>
                                <span>{profile.bio}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#E8E3D0] mb-10" />

            {/* Engagement Points */}
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <Award size={24} className="text-[#E36B39]" />
                    <h2 className="text-2xl font-bold text-[#1A1A1A]">Mes points d&apos;engagement</h2>
                </div>

                {/* Milestone icons */}
                <div className="relative mb-3">
                    <div className="flex justify-between items-end">
                        {MILESTONES.map(m => (
                            <div key={m.pts} className="flex flex-col items-center gap-1">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm border-2 ${points >= m.pts
                                        ? 'bg-[#E36B39] border-[#E36B39] text-white'
                                        : 'bg-[#FAEEE6] border-[#E8E3D0]'
                                    }`}>
                                    {m.icon}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-4 bg-[#FAEEE6] rounded-full overflow-hidden mb-2">
                    <div
                        className="h-full bg-gradient-to-r from-[#E36B39] to-[#C8562B] rounded-full transition-all duration-1000"
                        style={{ width: `${progressPct}%` }}
                    />
                    {/* Milestone dots */}
                    {MILESTONES.map(m => (
                        <div
                            key={m.pts}
                            className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow ${points >= m.pts ? 'bg-[#E36B39]' : 'bg-[#D4CEB8]'
                                }`}
                            style={{ left: `calc(${(m.pts / progressMax) * 100}% - 10px)` }}
                        />
                    ))}
                </div>

                {/* Labels */}
                <div className="flex justify-between">
                    {MILESTONES.map(m => (
                        <span key={m.pts} className="text-sm text-[#6B6B6B] font-medium">{m.label}</span>
                    ))}
                </div>

                {/* Points display */}
                <div className="text-center mt-4">
                    <span className="text-5xl font-bold text-[#E36B39]">{points}</span>
                    <span className="text-xl text-[#6B6B6B] ml-2">pts</span>
                </div>

                {/* CTA */}
                <div className="flex justify-center mt-8">
                    <button className="btn-terracotta flex items-center gap-2">
                        <Gift size={18} />
                        Réclamer mes offres
                    </button>
                </div>
            </div>
        </div>
    )
}
