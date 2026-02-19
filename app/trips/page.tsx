'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Map, Trash2, ChevronRight, Calendar } from 'lucide-react'
import type { Trip } from '@/lib/supabase/types'

export default function TripsPage() {
    const supabase = createClient()
    const [trips, setTrips] = useState<Trip[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [creating, setCreating] = useState(false)

    const loadTrips = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
            .from('trips')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        setTrips(data ?? [])
        setLoading(false)
    }

    useEffect(() => { loadTrips() }, [])

    const createTrip = async () => {
        if (!name.trim()) return
        setCreating(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase.from('trips').insert({
            user_id: user.id,
            name: name.trim(),
            description: description.trim() || null,
            status: 'draft',
        })
        setName('')
        setDescription('')
        setShowForm(false)
        setCreating(false)
        loadTrips()
    }

    const deleteTrip = async (id: string) => {
        if (!confirm('Supprimer ce parcours ?')) return
        await supabase.from('trips').delete().eq('id', id)
        setTrips(prev => prev.filter(t => t.id !== id))
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-10">
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton h-24 rounded-2xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Map size={28} className="text-[#00703C]" />
                    <h1 className="text-3xl font-bold text-[#1A1A1A]">Mes parcours</h1>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    <Plus size={18} />
                    Créer un parcours
                </button>
            </div>

            {/* Create form */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-[#E8E3D0] p-6 mb-8 animate-fade-in shadow-sm">
                    <h2 className="font-bold text-[#1A1A1A] mb-4">Nouveau parcours</h2>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nom du parcours (ex: Week-end à Nice)"
                        className="input-field mb-3"
                    />
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Description (optionnel)"
                        rows={3}
                        className="input-field resize-none mb-4"
                    />
                    <div className="flex gap-3 justify-end">
                        <button onClick={() => setShowForm(false)} className="btn-secondary">
                            Annuler
                        </button>
                        <button onClick={createTrip} disabled={!name.trim() || creating} className="btn-primary">
                            {creating ? 'Création...' : 'Créer'}
                        </button>
                    </div>
                </div>
            )}

            {/* Trips list */}
            {trips.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto mb-4">
                        <Map size={36} className="text-[#00703C]" />
                    </div>
                    <p className="text-xl font-bold text-[#1A1A1A] mb-2">Aucun parcours</p>
                    <p className="text-[#9A9A8A] mb-6">Créez votre premier itinéraire food !</p>
                    <button onClick={() => setShowForm(true)} className="btn-primary">
                        <Plus size={18} /> Créer mon premier parcours
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {trips.map(trip => (
                        <div key={trip.id} className="card p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#E8F5EE] flex items-center justify-center flex-shrink-0">
                                <Map size={22} className="text-[#00703C]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-[#1A1A1A] truncate">{trip.name}</h3>
                                    <span className={`badge text-xs ${trip.status === 'published' ? 'badge-green' : 'badge-terracotta'
                                        }`}>
                                        {trip.status === 'published' ? 'Publié' : 'Brouillon'}
                                    </span>
                                </div>
                                {trip.description && (
                                    <p className="text-sm text-[#9A9A8A] truncate mt-0.5">{trip.description}</p>
                                )}
                                <p className="text-xs text-[#C8C0A8] mt-1 flex items-center gap-1">
                                    <Calendar size={11} />
                                    {new Date(trip.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/trips/${trip.id}`}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#E8F5EE] hover:bg-[#00703C] hover:text-white text-[#00703C] transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </Link>
                                <button
                                    onClick={() => deleteTrip(trip.id)}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-400 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
