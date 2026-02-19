import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccueilClient from './AccueilClient'

export default async function AccueilPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/connexion')

    const [profileResult, myRestaurantsResult, communityRestaurantsResult, statsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
            .from('restaurants')
            .select('*, reviews(*)')
            .eq('reviews.contributor_id', user.id)
            .limit(8),
        supabase
            .from('restaurants')
            .select('*, reviews(rating, contributor_id, profiles(full_name, avatar_url))')
            .order('created_at', { ascending: false })
            .limit(8),
        supabase
            .from('reviews')
            .select('restaurant_id, rating')
            .eq('contributor_id', user.id),
    ])

    return (
        <AccueilClient
            profile={profileResult.data}
            myRestaurants={myRestaurantsResult.data ?? []}
            communityRestaurants={communityRestaurantsResult.data ?? []}
            reviewStats={statsResult.data ?? []}
        />
    )
}
