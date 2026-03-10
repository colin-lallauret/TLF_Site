'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteRestaurant(restaurantId: string) {
    const supabase = await createClient()

    // Vérification auth côté serveur
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Vous devez être connecté.' }
    }

    // Vérifier que l'utilisateur est bien le créateur
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('created_by')
        .eq('id', restaurantId)
        .single()

    if (!restaurant) {
        return { error: 'Restaurant introuvable.' }
    }

    if (restaurant.created_by !== user.id) {
        return { error: 'Vous n\'êtes pas autorisé à supprimer ce restaurant.' }
    }

    // Supprimer les avis associés d'abord (pas de CASCADE configuré)
    await supabase
        .from('reviews')
        .delete()
        .eq('restaurant_id', restaurantId)

    // Supprimer le restaurant (la RLS vérifie aussi created_by = auth.uid())
    const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurantId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/recommandations')
    return { success: true }
}
