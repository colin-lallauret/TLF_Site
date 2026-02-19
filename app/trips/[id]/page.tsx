'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Trash2, GripVertical, MapPin, CheckCircle } from 'lucide-react'
import type { Trip, TripStep, Restaurant } from '@/lib/supabase/types'

interface StepWithRestaurant extends TripStep {
    restaurant: Restaurant | null
}

const MEAL_TYPES = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Goûter', 'Apéritif', 'Brunch']

export default function TripDetailPage() {
    const params = useParams()
    const router = useRouter()
    const tripId = params.id as string
    const supabase = createClient()

    const [trip, setTrip] = useState<Trip | null>(null)
    const [steps, setSteps] = useState<StepWithRestaurant[]>([])
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddStep, setShowAddStep] = useState(false)
    const [selectedRestaurant, setSelectedRestaurant] = useState('')
    const [mealType, setMealType] = useState('')
    const [adding, setAdding] = useState(false)

    const loadData = async () => {
        const [tripRes, stepsRes, restRes] = await Promise.all([
            supabase.from('trips').select('*').eq('id', tripId).single(),
            supabase
                .from('trip_steps')
                .select('*, restaurant:restaurants(*)')
                .eq('trip_id', tripId)
                .order('step_order'),
            supabase.from('restaurants').select('id, name, city, address').order('name'),
        ])
        setTrip(tripRes.data)
        setSteps((stepsRes.data ?? []) as StepWithRestaurant[])
        setRestaurants(restRes.data ?? [])
        setLoading(false)
    }

    useEffect(() => { loadData() }, [tripId])

    const addStep = async () => {
        if (!selectedRestaurant) return
        setAdding(true)
        await supabase.from('trip_steps').insert({
            trip_id: tripId,
            restaurant_id: selectedRestaurant,
            step_order: steps.length + 1,
            meal_type: mealType || null,
        })
        setSelectedRestaurant('')
        setMealType('')
        setShowAddStep(false)
        loadData()
        setAdding(false)
    }

    const removeStep = async (stepId: string) => {
        await supabase.from('trip_steps').delete().eq('id', stepId)
        setSteps(prev => prev.filter(s => s.id !== stepId))
    }

    const publishTrip = async () => {
        await supabase.from('trips').update({ status: 'published' }).eq('id', tripId)
        setTrip(prev => prev ? { ...prev, status: 'published' } : null)
    }

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-10">
                <div className="skeleton h-10 w-48 rounded-xl mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
                </div>
            </div>
        )
    }

    if (!trip) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-10 text-center">
                <p className="text-[#9A9A8A]">Parcours introuvable.</p>
                <Link href="/trips" className="btn-primary mt-4">← Retour</Link>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
            {/* Header */}
            <Link href="/trips" className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#00703C] mb-6 text-sm transition-colors">
                <ArrowLeft size={16} /> Retour aux parcours
            </Link>

            <div className="flex items-start justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1A1A1A]">{trip.name}</h1>
                    {trip.description && <p className="text-[#6B6B6B] mt-1">{trip.description}</p>}
                    <span className={`badge mt-2 ${trip.status === 'published' ? 'badge-green' : 'badge-terracotta'}`}>
                        {trip.status === 'published' ? '✓ Publié' : 'Brouillon'}
                    </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    {trip.status !== 'published' && (
                        <button onClick={publishTrip} className="btn-primary text-sm py-2 px-4">
                            <CheckCircle size={16} /> Publier
                        </button>
                    )}
                    <button onClick={() => setShowAddStep(!showAddStep)} className="btn-secondary text-sm py-2 px-4">
                        <Plus size={16} /> Ajouter une étape
                    </button>
                </div>
            </div>

            {/* Add step form */}
            {showAddStep && (
                <div className="bg-white rounded-2xl border border-[#E8E3D0] p-6 mb-8 animate-fade-in shadow-sm">
                    <h3 className="font-bold text-[#1A1A1A] mb-4">Ajouter une étape</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="label">Restaurant</label>
                            <select
                                value={selectedRestaurant}
                                onChange={e => setSelectedRestaurant(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Choisir un restaurant...</option>
                                {restaurants.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} — {r.city}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Type de repas (optionnel)</label>
                            <select
                                value={mealType}
                                onChange={e => setMealType(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Sélectionner...</option>
                                {MEAL_TYPES.map(m => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end mt-4">
                        <button onClick={() => setShowAddStep(false)} className="btn-secondary text-sm py-2">Annuler</button>
                        <button onClick={addStep} disabled={!selectedRestaurant || adding} className="btn-primary text-sm py-2">
                            {adding ? 'Ajout...' : 'Ajouter'}
                        </button>
                    </div>
                </div>
            )}

            {/* Steps */}
            {steps.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E3D0]">
                    <div className="w-16 h-16 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto mb-4">
                        <MapPin size={28} className="text-[#00703C]" />
                    </div>
                    <p className="font-bold text-[#1A1A1A] mb-1">Aucune étape</p>
                    <p className="text-sm text-[#9A9A8A]">Ajoutez des restaurants à votre itinéraire</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="card p-4 flex items-center gap-4">
                            {/* Order */}
                            <div className="w-8 h-8 rounded-full bg-[#00703C] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {idx + 1}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#1A1A1A] truncate">
                                    {step.restaurant?.name ?? 'Restaurant inconnu'}
                                </p>
                                <div className="flex items-center gap-3 mt-0.5">
                                    {step.restaurant?.city && (
                                        <span className="text-xs text-[#9A9A8A] flex items-center gap-1">
                                            <MapPin size={11} /> {step.restaurant.city}
                                        </span>
                                    )}
                                    {step.meal_type && (
                                        <span className="badge-terracotta badge text-xs">{step.meal_type}</span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/restaurant/${step.restaurant_id}`}
                                    className="text-xs text-[#00703C] hover:underline font-medium"
                                >
                                    Voir
                                </Link>
                                <button
                                    onClick={() => removeStep(step.id)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
