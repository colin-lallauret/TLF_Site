'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { LogOut, User, Lock, Bell, Shield, ChevronRight, X } from 'lucide-react'

export default function ParametresPage() {
    const { profile, signOut } = useAuth()
    const supabase = createClient()
    const [saving, setSaving] = useState(false)
    const [fullName, setFullName] = useState(profile?.full_name ?? '')
    const [bio, setBio] = useState(profile?.bio ?? '')
    const [city, setCity] = useState(profile?.city ?? '')
    const [saved, setSaved] = useState(false)
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

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
        setIsLoggingOut(true)
        try {
            await signOut()
            // ✅ Rechargement complet pour que le proxy côté serveur
            // voie bien les cookies de session effacés
            window.location.href = '/connexion'
        } catch (error) {
            console.error("Erreur de déconnexion:", error)
            setIsLoggingOut(false)
        }
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
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl border-2 border-red-200 text-red-500 font-semibold hover:bg-red-50 transition-colors"
            >
                <LogOut size={18} />
                Se déconnecter
            </button>

            {/* Modal de Déconnexion */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center mt-2">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <LogOut size={28} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Se déconnecter</h3>
                            <p className="text-[#6B6B6B] mb-8 text-sm px-2">
                                Êtes-vous sûr de vouloir vous déconnecter de votre compte TravelLocalFood ?
                            </p>

                            <div className="flex w-full gap-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 py-3 px-4 rounded-xl border border-[#E8E3D0] text-[#1A1A1A] font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    disabled={isLoggingOut}
                                    className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex justify-center items-center"
                                >
                                    {isLoggingOut ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Confirmer'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
