'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Retourne le nombre total de messages non lus pour l'utilisateur connecté.
 * S'abonne en Realtime pour se mettre à jour instantanément.
 */
export function useUnreadMessages(userId: string | null) {
    const [supabase] = useState(() => createClient())
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (!userId) {
            setUnreadCount(0)
            return
        }

        // ── 1. Chargement initial ─────────────────────────────────────────────
        const fetchUnread = async () => {
            // On récupère les conversations de l'utilisateur
            const { data: convos } = await supabase
                .from('conversations')
                .select('id')
                .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)

            if (!convos || convos.length === 0) {
                setUnreadCount(0)
                return
            }

            const convoIds = convos.map(c => c.id)

            const { count } = await supabase
                .from('messages')
                .select('id', { count: 'exact', head: true })
                .in('conversation_id', convoIds)
                .eq('is_read', false)
                .neq('sender_id', userId)

            setUnreadCount(count ?? 0)
        }

        fetchUnread()

        // ── 2. Écoute Realtime — nouveaux messages entrants ───────────────────
        const channel = supabase
            .channel(`navbar-unread-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    const msg = payload.new as { sender_id: string; is_read: boolean }
                    // Ne compter que les messages reçus (pas les siens)
                    if (msg.sender_id !== userId) {
                        setUnreadCount(prev => prev + 1)
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                },
                () => {
                    // Quelqu'un a lu des messages → recalcul complet
                    fetchUnread()
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])

    return unreadCount
}
