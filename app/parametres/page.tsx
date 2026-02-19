'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { LogOut, User, Lock, Bell, Shield, ChevronRight } from 'lucide-react'

export default function ParametresPage() {
    const { profile, signOut } = useAuth()
    const router = useRouter()
    const supabase = createClient()
    const [saving, setSaving] = useState(false)
    const [fullName, setFullName] = useState(profile?.full_name ?? '')
    const [bio, setBio] = useState(profile?.bio ?? '')
    const [city, setCity] = useState(profile?.city ?? '')
    const [saved, setSaved] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase.from('profiles').update({
                full_name: fullName,
                bio,
                city,
            }).eq('id', user.id)
        }
        setSaved(true)
        setSaving(false)
        setTimeout(() => setSaved(false), 3000)
    }

    const handleSignOut = async () => {
        await signOut()
        router.push('/connexion')
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-10 animate-fade-in">
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-8">Paramètres</h1>

            {/* Profile section */}
            <div className="bg-white rounded-2xl border border-[#E8E3D0] p-6 mb-6">
                <div className="flex items-center gap-2 mb-6">
                    <User size={20} className="text-[#00703C]" />
                    <h2 className="font-bold text-[#1A1A1A]">Mon profil</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="label">Nom complet</label>
                        <input
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="input-field"
                            placeholder="Votre nom"
                        />
                    </div>
                    <div>
                        <label className="label">Ville / Région</label>
                        <input
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            className="input-field"
                            placeholder="Paris, Île-de-France"
                        />
                    </div>
                    <div>
                        <label className="label">Bio</label>
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            rows={3}
                            className="input-field resize-none"
                            placeholder="Parlez-nous de vous..."
                        />
                    </div>
                    <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
                        {saved ? '✓ Enregistré !' : saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </div>

            {/* Links section */}
            <div className="bg-white rounded-2xl border border-[#E8E3D0] overflow-hidden mb-6">
                {[
                    { icon: Lock, label: 'Sécurité & Mot de passe' },
                    { icon: Bell, label: 'Notifications' },
                    { icon: Shield, label: 'Confidentialité' },
                ].map(({ icon: Icon, label }) => (
                    <button key={label} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#F5F0DC] transition-colors border-b border-[#E8E3D0] last:border-0">
                        <Icon size={18} className="text-[#6B6B6B]" />
                        <span className="flex-1 text-left text-sm font-medium text-[#1A1A1A]">{label}</span>
                        <ChevronRight size={16} className="text-[#9A9A8A]" />
                    </button>
                ))}
            </div>

            {/* Sign out */}
            <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl border-2 border-red-200 text-red-500 font-semibold hover:bg-red-50 transition-colors"
            >
                <LogOut size={18} />
                Se déconnecter
            </button>
        </div>
    )
}
