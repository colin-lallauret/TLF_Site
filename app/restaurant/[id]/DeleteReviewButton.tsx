'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteReview } from './actions'

interface DeleteReviewButtonProps {
    reviewId: string
    restaurantId: string
}

export default function DeleteReviewButton({ reviewId, restaurantId }: DeleteReviewButtonProps) {
    const [confirming, setConfirming] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        setLoading(true)
        setError(null)
        const result = await deleteReview(reviewId, restaurantId)
        if (result.error) {
            setError(result.error)
            setLoading(false)
            setConfirming(false)
        }
        // Si success : revalidatePath() fait se rafraîchir la page automatiquement
    }

    if (error) {
        return (
            <span className="text-xs text-red-500 ml-2">{error}</span>
        )
    }

    if (confirming) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B6B6B]">Supprimer cet avis ?</span>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center gap-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-60"
                >
                    {loading ? (
                        <Loader2 size={11} className="animate-spin" />
                    ) : (
                        <Trash2 size={11} />
                    )}
                    Confirmer
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    disabled={loading}
                    className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A] px-2 py-1 rounded-lg transition-colors"
                >
                    Annuler
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            title="Supprimer mon avis"
            className="flex items-center gap-1 text-xs text-[#9A9A8A] hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 group"
        >
            <Trash2 size={13} className="group-hover:scale-110 transition-transform" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">Supprimer</span>
        </button>
    )
}
