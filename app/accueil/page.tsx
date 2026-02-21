import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccueilClient from './AccueilClient'

export default async function AccueilPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/connexion')

    // Récupérer les IDs des restaurants que l'utilisateur a recommandés (a laissé un avis)
    const { data: userReviews } = await supabase
        .from('reviews')
        .select('restaurant_id, rating')
        .eq('contributor_id', user.id)

    const myRestaurantIds = [...new Set(
        ((userReviews ?? []) as { restaurant_id: string | null; rating: number | null }[])
            .map(r => r.restaurant_id)
            .filter((id): id is string => id !== null)
    )]

    const [profileResult, myRestaurantsResult, communityRestaurantsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        myRestaurantIds.length > 0
            ? supabase
                .from('restaurants')
                .select('*')
                .in('id', myRestaurantIds)
                .limit(8)
            : Promise.resolve({ data: [] }),
        supabase
            .from('restaurants')
            .select('*, reviews(rating, contributor_id, profiles(full_name, avatar_url))')
            .order('created_at', { ascending: false })
            .limit(8),
    ])

    return (
        <AccueilClient
            profile={profileResult.data}
            myRestaurants={myRestaurantsResult.data ?? []}
            communityRestaurants={communityRestaurantsResult.data ?? []}
            reviewStats={userReviews ?? []}
        />
    )
}
