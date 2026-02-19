import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-[#00703C] text-white mt-16">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-16">
                            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="32" cy="32" r="30" fill="white" fillOpacity="0.15" />
                                <path d="M32 10 C22 10 14 20 14 32 C14 46 32 56 32 56 C32 56 50 46 50 32 C50 20 42 10 32 10Z" fill="white" fillOpacity="0.9" />
                                <path d="M26 30 L26 42 M38 30 L38 42 M22 34 L42 34" stroke="#00703C" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="text-white font-bold text-xl leading-tight">
                            Travel<br />Local Food
                        </div>
                    </div>

                    {/* Découvrir */}
                    <div>
                        <h3 className="font-bold text-[#E36B39] mb-4 text-lg">Découvrir</h3>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li><Link href="#" className="hover:text-white transition-colors">Notre histoire</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Notre rapport d&apos;impact 2026</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Notre démarche qualité et nutrition</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Nos services</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Ressources */}
                    <div>
                        <h3 className="font-bold text-[#E36B39] mb-4 text-lg">Ressources</h3>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Votre avis</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Informations consommateurs</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">L&apos;application</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Le programme de fidélité</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-white/60">
                    <Link href="#" className="hover:text-white transition-colors">Centre de protection de la vie privée</Link>
                    <Link href="#" className="hover:text-white transition-colors">Politique de cookies</Link>
                    <Link href="#" className="hover:text-white transition-colors">Paramètre de cookies</Link>
                    <Link href="#" className="hover:text-white transition-colors">Terme et condition</Link>
                    <Link href="#" className="hover:text-white transition-colors">Notre plateforme</Link>
                </div>
            </div>
        </footer>
    )
}
