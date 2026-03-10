'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteReview(reviewId: string, restaurantId: string) {
    const supabase = await createClient()

    // Vérifier que l'utilisateur est connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Vous devez être connecté.' }
    }

    // Supprimer l'avis (la policy RLS vérifie que contributor_id = auth.uid())
    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('contributor_id', user.id) // double sécurité côté code

    if (error) {
        return { error: error.message }
    }

    // Revalider la page pour rafraîchir les avis
    revalidatePath(`/restaurant/${restaurantId}`)
    return { success: true }
}
