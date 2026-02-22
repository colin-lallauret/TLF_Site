'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Settings } from 'lucide-react'

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
