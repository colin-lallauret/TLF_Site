'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase/types'

interface AuthContextType {
    user: User | null
    profile: Profile | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    // ✅ Client Supabase stable — géré via state
    const [supabase] = useState(() => createClient())

    useEffect(() => {
        const fetchProfile = async (userId: string) => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()
            setProfile(data)
        }

        // Charge la session initiale une seule fois
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user ?? null)
            if (user) await fetchProfile(user.id)
            setLoading(false)
        }

        init()

        // ✅ INITIAL_SESSION ignoré pour éviter le double-appel avec init()
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'INITIAL_SESSION') return
            setUser(session?.user ?? null)
            if (session?.user) {
                await fetchProfile(session.user.id)
            } else {
                setProfile(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const signOut = async () => {
        try {
            // Se déconnecter de tous les channels pour éviter un blocage (hang)
            await supabase.removeAllChannels()

            // Timeout de 2s au cas où signOut bloque côté réseau/realtime
            const result = await Promise.race([
                supabase.auth.signOut(),
                new Promise<{ error: Error }>((resolve) =>
                    setTimeout(() => resolve({ error: new Error('timeout') }), 2000)
                )
            ])

            // Si timeout ou erreur, on force la déconnexion locale pour bien vider les cookies
            if (result && result.error) {
                console.warn("SignOut api bloqué ou erreur, on force en local :", result.error)
                await supabase.auth.signOut({ scope: 'local' })
            }
        } catch (error) {
            console.error('Erreur inattendue lors de la déconnexion Supabase:', error)
            await supabase.auth.signOut({ scope: 'local' })
        } finally {
            setUser(null)
            setProfile(null)
        }
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
