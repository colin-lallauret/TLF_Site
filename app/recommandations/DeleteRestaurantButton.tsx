'use client'

import { useState } from 'react'
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react'
import { deleteRestaurant } from './actions'

interface DeleteRestaurantButtonProps {
    restaurantId: string
    restaurantName: string
}

export default function DeleteRestaurantButton({ restaurantId, restaurantName }: DeleteRestaurantButtonProps) {
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        setLoading(true)
        setError(null)
        const result = await deleteRestaurant(restaurantId)
        if (result.error) {
            setError(result.error)
            setLoading(false)
        }
        // Si success : revalidatePath() rafraîchit la liste automatiquement
    }

    return (
        <>
            {/* Bouton déclencheur — positionné sur la card */}
            <button
                onClick={(e) => {
                    e.preventDefault() // évite de naviguer sur le lien parent
                    e.stopPropagation()
                    setShowModal(true)
                }}
                title="Supprimer ce restaurant"
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-red-600 text-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
            >
                <Trash2 size={14} />
            </button>

            {/* Modal de confirmation */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
                    onClick={() => !loading && setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 animate-fade-in"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Icône warning */}
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                            <AlertTriangle size={28} className="text-red-500" />
                        </div>

                        <h3 className="text-lg font-bold text-[#1A1A1A] text-center mb-2">
                            Supprimer cette adresse ?
                        </h3>
                        <p className="text-sm text-[#6B6B6B] text-center mb-1">
                            <span className="font-semibold text-[#1A1A1A]">"{restaurantName}"</span> sera définitivement supprimé.
                        </p>
                        <p className="text-xs text-[#9A9A8A] text-center mb-6">
                            Tous les avis associés seront également supprimés. Cette action est irréversible.
                        </p>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 mb-4 text-xs">
                                <AlertTriangle size={13} />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl border border-[#E8E3D0] text-[#6B6B6B] hover:bg-[#F7F3E8] font-medium text-sm transition-colors disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <><Loader2 size={14} className="animate-spin" /> Suppression...</>
                                ) : (
                                    <><Trash2 size={14} /> Supprimer</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
