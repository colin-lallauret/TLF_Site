import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfilClient from './ProfilClient'

export default async function ProfilPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/connexion')

    const [profileResult, reviewCountResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('contributor_id', user.id),
    ])

    return (
        <ProfilClient
            profile={profileResult.data}
            reviewCount={reviewCountResult.count ?? 0}
        />
    )
}
