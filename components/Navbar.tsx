'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'
import { Settings } from 'lucide-react'

export default function Navbar() {
    const pathname = usePathname()
    const { profile, user } = useAuth()
    const unreadCount = useUnreadMessages(user?.id ?? null)

    return (
        <header className="sticky top-0 z-50 bg-[#FDFBF0] border-b border-[#E8E3D0] shadow-sm">
            <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/accueil" className="flex items-center flex-shrink-0">
                    <Image
                        src="/tlf_full_orange.svg"
                        alt="Travel Local Food"
                        width={140}
                        height={40}
                        priority
                        className="h-9 w-auto"
                    />
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                    {/* Accueil */}
                    <Link
                        href="/accueil"
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${pathname.startsWith('/accueil')
                            ? 'bg-[#00703C] text-white shadow-sm'
                            : 'text-[#1A1A1A] hover:bg-[#E8F5EE] hover:text-[#00703C]'
                            }`}
                    >
                        Accueil
                    </Link>

                    {/* Recommandations */}
                    <Link
                        href="/recommandations"
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${pathname.startsWith('/recommandations')
                            ? 'bg-[#00703C] text-white shadow-sm'
                            : 'text-[#1A1A1A] hover:bg-[#E8F5EE] hover:text-[#00703C]'
                            }`}
                    >
                        Recommandations
                    </Link>

                    {/* Messagerie avec badge non-lu */}
                    <Link
                        href="/messagerie"
                        className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${pathname.startsWith('/messagerie')
                            ? 'bg-[#00703C] text-white shadow-sm'
                            : 'text-[#1A1A1A] hover:bg-[#E8F5EE] hover:text-[#00703C]'
                            }`}
                    >
                        Messagerie
                        {unreadCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#E36B39] text-white text-[10px] font-bold flex items-center justify-center shadow">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Right: Avatar + Settings */}
                <div className="flex items-center gap-3">
                    <Link href="/profil" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#E8E3D0] group-hover:border-[#E36B39] transition-colors">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#E8F5EE] flex items-center justify-center">
                                    <span className="text-[#00703C] font-bold text-sm">
                                        {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Link>
                    <Link
                        href="/parametres"
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#FAEEE6] transition-colors"
                    >
                        <Settings size={20} className="text-[#E36B39]" />
                    </Link>
                </div>
            </nav>
        </header>
    )
}
