'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Settings, MessageSquare, Home, Star } from 'lucide-react'

export default function Navbar() {
    const pathname = usePathname()
    const { profile } = useAuth()

    const links = [
        { href: '/accueil', label: 'Accueil' },
        { href: '/recommandations', label: 'Recommandations' },
        { href: '/messagerie', label: 'Messagerie' },
    ]

    return (
        <header className="sticky top-0 z-50 bg-[#FDFBF0] border-b border-[#E8E3D0] shadow-sm">
            <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/accueil" className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-10 h-10 relative">
                        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="18" fill="#E36B39" fillOpacity="0.15" />
                            <path d="M20 8 C14 8 10 14 10 20 C10 28 20 34 20 34 C20 34 30 28 30 20 C30 14 26 8 20 8Z" fill="#E36B39" />
                            <path d="M17 18 L17 26 M23 18 L23 26 M14 20 L26 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="font-bold text-[#E36B39] leading-tight text-sm hidden sm:block">
                        Travel<br />Local Food
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                    {links.map(link => {
                        const isActive = pathname.startsWith(link.href)
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-[#00703C] text-white shadow-sm'
                                        : 'text-[#1A1A1A] hover:bg-[#E8F5EE] hover:text-[#00703C]'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        )
                    })}
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
                                        {profile?.full_name?.charAt(0) ?? profile?.username?.charAt(0) ?? 'U'}
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
