import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MessagerieClient from './MessagerieClient'

export default async function MessageriePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/connexion')

    const { data: conversations } = await supabase
        .from('conversations')
        .select(`
      *,
      p1:profiles!conversations_participant_1_fkey(id, full_name, username, avatar_url),
      p2:profiles!conversations_participant_2_fkey(id, full_name, username, avatar_url)
    `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

    return <MessagerieClient conversations={conversations ?? []} currentUserId={user.id} />
}
