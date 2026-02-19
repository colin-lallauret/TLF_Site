import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RecommandationsClient from './RecommandationsClient'

export default async function RecommandationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/connexion')

    const { data: restaurants } = await supabase
        .from('restaurants')
        .select('*, reviews(rating, contributor_id)')
        .order('created_at', { ascending: false })

    return (
        <RecommandationsClient
            restaurants={restaurants ?? []}
            currentUserId={user.id}
        />
    )
}
