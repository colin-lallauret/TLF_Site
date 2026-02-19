'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import StarRating from '@/components/StarRating'

const schema = z.object({
    annonce_type: z.string().min(1),
    food_type: z.string().min(1, 'Choisissez un type de plat'),
    name: z.string().min(2, 'Nom obligatoire (min 2 caractères)'),
    address: z.string().min(3, 'Adresse obligatoire'),
    city: z.string().min(1, 'Ville obligatoire'),
    postal_code: z.string().min(3, 'Code postal obligatoire'),
    review_title: z.string().optional(),
    review_text: z.string().min(10, 'Décrivez votre expérience (min 10 caractères)'),
    rating: z.number().min(1, 'Notez le restaurant').max(5),
    dietary_prefs: z.array(z.string()).optional(),
    services: z.array(z.string()).optional(),
    atmospheres: z.array(z.string()).optional(),
    budget_min: z.number().optional(),
    budget_max: z.number().optional(),
})

type FormData = z.infer<typeof schema>

const DIETARY = [
    { value: 'vegetarien', label: 'Végétarien', icon: '🥕' },
    { value: 'vegan', label: 'Vegan', icon: '🌿' },
    { value: 'sans-gluten', label: 'Sans gluten', icon: '🌾' },
    { value: 'halal', label: 'Halal', icon: '☪️' },
    { value: 'casher', label: 'Casher', icon: '✡️' },
]

const SERVICES = [
    { value: 'sur-place', label: 'Sur place', icon: '🍽️' },
    { value: 'a-emporter', label: 'À emporter', icon: '🛍️' },
    { value: 'livraison', label: 'Livraison', icon: '🚚' },
    { value: 'click-collect', label: 'Click & collect', icon: '🚗' },
]

const ATMOSPHERES = [
    { value: 'romantique', label: 'Romantique', icon: '💕' },
    { value: 'familial', label: 'Familial', icon: '👨‍👩‍👧' },
    { value: 'convivial', label: 'Convivial', icon: '🤝' },
    { value: 'festif', label: 'Festif', icon: '🎉' },
    { value: 'calme', label: 'Calme', icon: '🧘' },
]

const FOOD_TYPES = ['Italien', 'Japonais', 'Français', 'Mexicain', 'Indien', 'Libanais', 'Américain', 'Thaïlandais', 'Marocain', 'Autre']

function MultiSelect({ options, selected, onToggle, label }: {
    options: { value: string; label: string; icon: string }[]
    selected: string[]
    onToggle: (v: string) => void
    label: string
}) {
    return (
        <div>
            <label className="label text-base">{label}</label>
            <div className="flex gap-3 flex-wrap">
                {options.map(opt => {
                    const active = selected.includes(opt.value)
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onToggle(opt.value)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 w-20 transition-all duration-200 ${active
                                    ? 'border-[#00703C] bg-[#E8F5EE] text-[#00703C]'
                                    : 'border-[#E8E3D0] bg-white text-[#6B6B6B] hover:border-[#00703C]/50'
                                }`}
                        >
                            <span className="text-2xl">{opt.icon}</span>
                            <span className="text-xs font-medium leading-tight text-center">{opt.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default function AjouterAdressePage() {
    const router = useRouter()
    const supabase = createClient()
    const [rating, setRating] = useState(0)
    const [dietary, setDietary] = useState<string[]>([])
    const [services, setServices] = useState<string[]>([])
    const [atmospheres, setAtmospheres] = useState<string[]>([])
    const [budgetMin, setBudgetMin] = useState(15)
    const [budgetMax, setBudgetMax] = useState(80)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            annonce_type: 'Restaurant',
            food_type: '',
            rating: 0,
            dietary_prefs: [],
            services: [],
            atmospheres: [],
        }
    })

    const toggle = (arr: string[], val: string, setter: (a: string[]) => void) => {
        setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
    }

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setError('Vous devez être connecté.')
            setLoading(false)
            return
        }

        // 1. Insert restaurant
        const { data: restaurant, error: restError } = await supabase
            .from('restaurants')
            .insert({
                name: data.name,
                address: data.address,
                city: data.city,
                postal_code: data.postal_code,
                food_types: [data.food_type],
                dietary_prefs: dietary,
                services: services,
                atmospheres: atmospheres,
                budget_level: budgetMax <= 20 ? 1 : budgetMax <= 50 ? 2 : budgetMax <= 100 ? 3 : 4,
                meal_types: [data.annonce_type],
            })
            .select('id')
            .single()

        if (restError || !restaurant) {
            setError(restError?.message ?? 'Erreur lors de l\'ajout du restaurant.')
            setLoading(false)
            return
        }

        // 2. Insert review
        const { error: reviewError } = await supabase
            .from('reviews')
            .insert({
                restaurant_id: restaurant.id,
                contributor_id: user.id,
                title: data.review_title ?? data.name,
                description: data.review_text,
                rating: rating,
            })

        if (reviewError) {
            setError(reviewError.message)
            setLoading(false)
            return
        }

        setSuccess(true)
        setTimeout(() => router.push('/recommandations'), 2000)
        setLoading(false)
    }

    if (success) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-[#00703C]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Adresse publiée !</h2>
                <p className="text-[#6B6B6B]">Merci pour votre contribution. Redirection en cours...</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-10 animate-fade-in">
            <h1 className="text-3xl font-bold text-center text-[#1A1A1A] mb-10">
                C&apos;est à vous de jouer
            </h1>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Type d'annonce */}
                <div>
                    <label className="label">Type de l&apos;annonce</label>
                    <select {...register('annonce_type')} className="input-field">
                        <option>Restaurant</option>
                        <option>Café</option>
                        <option>Boulangerie</option>
                        <option>Épicerie fine</option>
                        <option>Marché</option>
                        <option>Bar</option>
                    </select>
                </div>

                {/* Type de plats */}
                <div>
                    <label className="label">Type de plats</label>
                    <select {...register('food_type')} className="input-field">
                        <option value="">Sélectionner...</option>
                        {FOOD_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    {errors.food_type && <p className="text-red-500 text-xs mt-1">{errors.food_type.message}</p>}
                </div>

                {/* Name */}
                <div>
                    <label className="label">Nom de l&apos;annonce :</label>
                    <input {...register('name')} placeholder="Restaurant La Papaya" className="input-field" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                {/* Address */}
                <div>
                    <label className="label">Adresse :</label>
                    <input {...register('address')} placeholder="15 avenue Jean Jaurès" className="input-field" />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Ville :</label>
                        <input {...register('city')} placeholder="Nice" className="input-field" />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                        <label className="label">Code postal :</label>
                        <input {...register('postal_code')} placeholder="06000" className="input-field" />
                        {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code.message}</p>}
                    </div>
                </div>

                {/* Review */}
                <div className="border-t border-[#E8E3D0] pt-8">
                    <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Partagerz votre expérience :</h2>
                    <div className="flex justify-center mb-4">
                        <StarRating rating={rating} size={40} interactive onChange={setRating} />
                    </div>
                    {errors.rating && <p className="text-red-500 text-xs text-center mb-2">{errors.rating.message}</p>}
                    <div>
                        <label className="label">Titre de votre avis :</label>
                        <input {...register('review_title')} placeholder="Un restaurant exceptionnel..." className="input-field mb-3" />
                    </div>
                    <textarea
                        {...register('review_text')}
                        rows={4}
                        placeholder="Écrivez quelque chose ici..."
                        className="input-field resize-none"
                    />
                    {errors.review_text && <p className="text-red-500 text-xs mt-1">{errors.review_text.message}</p>}
                </div>

                {/* Dietary */}
                <MultiSelect
                    label="Régimes & préférences"
                    options={DIETARY}
                    selected={dietary}
                    onToggle={v => toggle(dietary, v, setDietary)}
                />

                {/* Services */}
                <MultiSelect
                    label="Type de service :"
                    options={SERVICES}
                    selected={services}
                    onToggle={v => toggle(services, v, setServices)}
                />

                {/* Atmospheres */}
                <MultiSelect
                    label="Expérience & ambiance :"
                    options={ATMOSPHERES}
                    selected={atmospheres}
                    onToggle={v => toggle(atmospheres, v, setAtmospheres)}
                />

                {/* Budget slider */}
                <div>
                    <label className="label text-base">Budget :</label>
                    <div className="px-2">
                        <div className="flex justify-between text-sm font-medium text-[#6B6B6B] mb-2">
                            <span>Minimum</span>
                            <span>Maximum</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min={5}
                                max={500}
                                value={budgetMin}
                                onChange={e => setBudgetMin(Number(e.target.value))}
                                className="flex-1 accent-[#00703C]"
                            />
                            <input
                                type="range"
                                min={5}
                                max={500}
                                value={budgetMax}
                                onChange={e => setBudgetMax(Number(e.target.value))}
                                className="flex-1 accent-[#00703C]"
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="bg-[#E36B39] text-white rounded-lg px-3 py-1 text-sm font-bold">{budgetMin}€</span>
                            <span className="bg-[#E36B39] text-white rounded-lg px-3 py-1 text-sm font-bold">{budgetMax}€</span>
                        </div>
                    </div>
                </div>

                {/* Photos (UI only) */}
                <div>
                    <label className="label text-base">Ajouter des photos :</label>
                    <div className="border-2 border-dashed border-[#E8E3D0] rounded-2xl p-10 text-center bg-[#FAEEE6]/40 hover:bg-[#FAEEE6]/60 transition-colors cursor-pointer">
                        <Upload size={36} className="mx-auto text-[#E36B39] mb-3" />
                        <p className="text-[#6B6B6B] font-medium">Téléversez ou ajouter des images</p>
                        <p className="text-sm text-[#9A9A8A] mt-1">PNG, JPG jusqu&apos;à 10Mo</p>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="btn-primary min-w-40">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Publication...
                            </span>
                        ) : 'Publier'}
                    </button>
                </div>
            </form>
        </div>
    )
}
