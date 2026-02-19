'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'

const schema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Minimum 6 caractères'),
})

type FormData = z.infer<typeof schema>

export default function ConnexionPage() {
    const router = useRouter()
    const supabase = createClient()
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema)
    })

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        setError(null)
        setSuccessMsg(null)

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })
            if (error) {
                setError('Email ou mot de passe incorrect.')
            } else {
                router.push('/accueil')
                router.refresh()
            }
        } else {
            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            })
            if (error) {
                setError(error.message)
            } else {
                setSuccessMsg('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.')
            }
        }
        setLoading(false)
    }

    const handleMagicLink = async () => {
        const email = (document.getElementById('magic-email') as HTMLInputElement)?.value
        if (!email) {
            setError('Entrez votre email pour recevoir un lien magique.')
            return
        }
        setLoading(true)
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) {
            setError(error.message)
        } else {
            setSuccessMsg('Un lien de connexion a été envoyé à votre email !')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-stretch relative overflow-hidden">
            {/* Background food image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80')`,
                }}
            />
            <div className="absolute inset-0 bg-black/30" />

            {/* Card */}
            <div className="relative z-10 ml-auto mr-auto md:mr-20 lg:mr-32 flex items-center px-4 py-8">
                <div className="w-full max-w-md bg-[#FDFBF0] rounded-3xl shadow-2xl p-10 animate-fade-in">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 6C16 6 10 14 10 24C10 34 24 44 24 44C24 44 38 34 38 24C38 14 32 6 24 6Z" fill="#E36B39" />
                                <path d="M20 22 L20 32 M28 22 L28 32 M16 26 L32 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-[#1A1A1A]">
                            Manger avec <span className="italic">simpicité</span>
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">
                        {mode === 'login' ? 'Connexion' : 'Inscription'}
                    </h1>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="bg-[#E8F5EE] border border-[#00703C]/30 text-[#00703C] rounded-xl px-4 py-3 mb-4 text-sm">
                            {successMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="label">Adresse e-mail</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A8A]" />
                                <input
                                    id="magic-email"
                                    {...register('email')}
                                    type="email"
                                    placeholder="votre@email.com"
                                    className="input-field pl-11"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="label mb-0">Mot de passe</label>
                                {mode === 'login' && (
                                    <button
                                        type="button"
                                        className="text-xs text-[#6B6B6B] hover:text-[#00703C] transition-colors"
                                        onClick={() => setError('Fonctionnalité en cours de développement.')}
                                    >
                                        Mot de passe perdu
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A8A]" />
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input-field pl-11 pr-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A9A8A] hover:text-[#1A1A1A]"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Chargement...
                                </span>
                            ) : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-[#E8E3D0]" />
                        <span className="text-sm text-[#9A9A8A]">Ou se connecter avec</span>
                        <div className="flex-1 h-px bg-[#E8E3D0]" />
                    </div>

                    {/* Social-style buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleMagicLink}
                            className="flex items-center justify-center gap-2 bg-[#00703C] text-white rounded-2xl py-3 text-sm font-medium hover:bg-[#005A30] transition-colors"
                        >
                            <Mail size={18} />
                            Email
                        </button>
                        <button
                            className="flex items-center justify-center gap-2 bg-[#00703C] text-white rounded-2xl py-3 text-sm font-medium hover:bg-[#005A30] transition-colors opacity-60 cursor-not-allowed"
                            disabled
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                            Apple
                        </button>
                    </div>

                    {/* Switch mode */}
                    <p className="text-center text-sm text-[#6B6B6B] mt-6">
                        {mode === 'login' ? (
                            <>Je n&apos;ai pas de compte ?{' '}
                                <button onClick={() => setMode('signup')} className="text-[#00703C] font-semibold hover:underline">
                                    Inscrivez-vous
                                </button>
                            </>
                        ) : (
                            <>Déjà un compte ?{' '}
                                <button onClick={() => setMode('login')} className="text-[#00703C] font-semibold hover:underline">
                                    Se connecter
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
}
