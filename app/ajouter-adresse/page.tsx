'use client'

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Upload, AlertCircle, CheckCircle, Link2, X, Image as ImageIcon } from 'lucide-react'
import StarRating from '@/components/StarRating'

// ─── Valeurs exactes de la BDD ────────────────────────────────────────────────

const MEAL_TYPES = [
    { value: 'Petit-déjeuner', label: 'Petit-déjeuner', icon: '🌅' },
    { value: 'Déjeuner', label: 'Déjeuner', icon: '☀️' },
    { value: 'Pause sucrée', label: 'Pause sucrée', icon: '🍰' },
    { value: 'Dîner', label: 'Dîner', icon: '🌙' },
]

const FOOD_TYPES = [
    { value: 'Italian', label: 'Italien', icon: '🍝' },
    { value: 'Chinois', label: 'Chinois', icon: '🥢' },
    { value: 'Japonais', label: 'Japonais', icon: '🍣' },
    { value: 'Mexicain', label: 'Mexicain', icon: '🌮' },
    { value: 'Thai', label: 'Thaïlandais', icon: '🍜' },
    { value: 'Indien', label: 'Indien', icon: '🍛' },
    { value: 'Libanais', label: 'Libanais', icon: '🧆' },
    { value: 'American', label: 'Américain', icon: '🍔' },
]

const DIETARY = [
    { value: 'Standard', label: 'Standard', icon: '🍽️' },
    { value: 'Végan', label: 'Végan', icon: '🌿' },
    { value: 'Végétarien', label: 'Végétarien', icon: '🥕' },
    { value: 'Sans gluten', label: 'Sans gluten', icon: '🌾' },
    { value: 'Halal', label: 'Halal', icon: '☪️' },
    { value: 'Casher', label: 'Casher', icon: '✡️' },
]

const SERVICES = [
    { value: 'Sur place', label: 'Sur place', icon: '🍽️' },
    { value: 'À emporter', label: 'À emporter', icon: '🛍️' },
    { value: 'Livraison', label: 'Livraison', icon: '🚚' },
    { value: 'Click & Collect', label: 'Click & Collect', icon: '🚗' },
]

const ATMOSPHERES = [
    { value: 'Romantique', label: 'Romantique', icon: '💕' },
    { value: 'Familial', label: 'Familial', icon: '👨‍👩‍👧' },
    { value: 'Conviviale', label: 'Conviviale', icon: '🤝' },
    { value: 'Animé', label: 'Animé', icon: '🎉' },
    { value: 'Calme', label: 'Calme', icon: '🧘' },
]

// ─── Schéma de validation ─────────────────────────────────────────────────────

const schema = z.object({
    name: z.string().min(2, 'Nom obligatoire (min 2 caractères)'),
    address: z.string().min(3, 'Adresse obligatoire'),
    city: z.string().min(1, 'Ville obligatoire'),
    postal_code: z.string().min(3, 'Code postal obligatoire'),
    review_title: z.string().optional(),
    review_text: z.string().min(10, 'Décrivez votre expérience (min 10 caractères)'),
    // rating géré via useState + validateSelections(), pas via react-hook-form
})

type FormData = z.infer<typeof schema>

// ─── Composant MultiSelect ────────────────────────────────────────────────────

function MultiSelect({ options, selected, onToggle, label, error }: {
    options: { value: string; label: string; icon: string }[]
    selected: string[]
    onToggle: (v: string) => void
    label: string
    error?: string
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
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 w-24 transition-all duration-200 ${active
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
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AjouterAdressePage() {
    const router = useRouter()
    const supabase = createClient()
    const [rating, setRating] = useState(0)
    const [mealTypes, setMealTypes] = useState<string[]>([])
    const [foodTypes, setFoodTypes] = useState<string[]>([])
    const [dietary, setDietary] = useState<string[]>([])
    const [services, setServices] = useState<string[]>([])
    const [atmospheres, setAtmospheres] = useState<string[]>([])
    const [budgetMin, setBudgetMin] = useState(9)
    const [budgetMax, setBudgetMax] = useState(50)
    const [error, setError] = useState<string | null>(null)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    // ── Photos ──────────────────────────────────────────────────────────────
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [photoUrl, setPhotoUrl] = useState('')
    const [isDragging, setIsDragging] = useState(false)
    const [photoTab, setPhotoTab] = useState<'upload' | 'url'>('upload')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) return
        setPhotoFile(file)
        setPhotoPreview(URL.createObjectURL(file))
        setPhotoUrl('')
    }, [])

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFileSelect(file)
    }

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFileSelect(file)
    }

    const clearPhoto = () => {
        setPhotoFile(null)
        setPhotoPreview(null)
        setPhotoUrl('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const toggle = (arr: string[], val: string, setter: (a: string[]) => void) => {
        setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
    }

    const validateSelections = () => {
        const newErrors: Record<string, string> = {}
        if (mealTypes.length === 0) newErrors.mealTypes = 'Sélectionnez au moins un type de repas'
        if (foodTypes.length === 0) newErrors.foodTypes = 'Sélectionnez au moins un type de cuisine'
        if (rating === 0) newErrors.rating = 'Notez le restaurant'
        setFormErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const onSubmit = async (data: FormData) => {
        if (!validateSelections()) return

        setLoading(true)
        setError(null)

        // Vérification de la session
        const { data: sessionData, error: sessionError } = await supabase.auth.getUser()
        const user = sessionData?.user

        if (sessionError || !user) {
            setError('Vous devez être connecté pour ajouter une adresse. Veuillez vous reconnecter.')
            setLoading(false)
            return
        }

        // Calcul du budget_level : valeur moyenne entre min et max (9–200)
        const budgetLevel = Math.round((budgetMin + budgetMax) / 2)

        // Image : URL saisie manuellement (le fichier drag & drop nécessite Supabase Storage)
        const resolvedImageUrl = photoUrl.trim() || null

        // ── 1. Insérer le restaurant ──────────────────────────────────────────
        const restaurantPayload = {
            name: data.name,
            address: data.address,
            city: data.city,
            postal_code: data.postal_code,
            meal_types: mealTypes,
            food_types: foodTypes,
            dietary_prefs: dietary.length > 0 ? dietary : null,
            services: services.length > 0 ? services : null,
            atmospheres: atmospheres.length > 0 ? atmospheres : null,
            budget_level: budgetLevel,
            image_url: resolvedImageUrl,
            created_by: user.id,
        }

        console.log('[AjouterAdresse] Payload restaurant :', restaurantPayload)

        const { data: restaurant, error: restError } = await supabase
            .from('restaurants')
            .insert(restaurantPayload)
            .select('id')
            .single()

        if (restError) {
            console.error('[AjouterAdresse] Erreur restaurant :', restError)
            const msg = restError.code === '42501'
                ? 'Permission refusée. Assurez-vous d\'être bien connecté.'
                : restError.message
            setError(`Erreur restaurant : ${msg}`)
            setLoading(false)
            return
        }

        if (!restaurant?.id) {
            setError('Restaurant créé mais ID manquant. Contactez le support.')
            setLoading(false)
            return
        }

        console.log('[AjouterAdresse] Restaurant créé :', restaurant.id)

        // ── 2. Insérer l'avis ────────────────────────────────────────────────
        const reviewPayload = {
            restaurant_id: restaurant.id,
            contributor_id: user.id,
            title: data.review_title?.trim() || data.name,
            description: data.review_text,
            rating: rating,
        }

        console.log('[AjouterAdresse] Payload avis :', reviewPayload)

        const { error: reviewError } = await supabase
            .from('reviews')
            .insert(reviewPayload)

        if (reviewError) {
            console.error('[AjouterAdresse] Erreur avis :', reviewError)
            setError(`Erreur lors de l'ajout de l'avis : ${reviewError.message}`)
            setLoading(false)
            return
        }

        console.log('[AjouterAdresse] ✅ Succès !')
        setSuccess(true)
        setTimeout(() => router.push('/recommandations'), 2500)
        setLoading(false)
    }

    // ── Écran de succès ──────────────────────────────────────────────────────
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

    // ── Formulaire ───────────────────────────────────────────────────────────
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

                {/* ── Informations de base ── */}
                <div>
                    <label className="label">Nom de l&apos;établissement :</label>
                    <input {...register('name')} placeholder="Restaurant La Papaya" className="input-field" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

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

                {/* ── Types de repas ── */}
                <MultiSelect
                    label="Types de repas :"
                    options={MEAL_TYPES}
                    selected={mealTypes}
                    onToggle={v => toggle(mealTypes, v, setMealTypes)}
                    error={formErrors.mealTypes}
                />

                {/* ── Types de cuisine ── */}
                <MultiSelect
                    label="Types de cuisine :"
                    options={FOOD_TYPES}
                    selected={foodTypes}
                    onToggle={v => toggle(foodTypes, v, setFoodTypes)}
                    error={formErrors.foodTypes}
                />

                {/* ── Budget ── */}
                <div>
                    <label className="label text-base">Budget moyen par personne :</label>
                    <div className="px-2">
                        <div className="flex justify-between text-sm font-medium text-[#6B6B6B] mb-3">
                            <span>Min : <strong className="text-[#1A1A1A]">{budgetMin}€</strong></span>
                            <span>Max : <strong className="text-[#1A1A1A]">{budgetMax}€</strong></span>
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                            <input
                                type="range"
                                min={9}
                                max={200}
                                value={budgetMin}
                                onChange={e => {
                                    const v = Number(e.target.value)
                                    setBudgetMin(Math.min(v, budgetMax - 1))
                                }}
                                className="flex-1 accent-[#00703C]"
                            />
                            <input
                                type="range"
                                min={9}
                                max={200}
                                value={budgetMax}
                                onChange={e => {
                                    const v = Number(e.target.value)
                                    setBudgetMax(Math.max(v, budgetMin + 1))
                                }}
                                className="flex-1 accent-[#00703C]"
                            />
                        </div>
                        <div className="flex justify-between">
                            <span className="bg-[#E36B39] text-white rounded-lg px-3 py-1 text-sm font-bold">
                                {budgetMin}€
                            </span>
                            <span className="text-xs text-[#9A9A8A] self-center">
                                Moy. ~{Math.round((budgetMin + budgetMax) / 2)}€
                            </span>
                            <span className="bg-[#E36B39] text-white rounded-lg px-3 py-1 text-sm font-bold">
                                {budgetMax}€
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Régimes & préférences ── */}
                <MultiSelect
                    label="Régimes & préférences :"
                    options={DIETARY}
                    selected={dietary}
                    onToggle={v => toggle(dietary, v, setDietary)}
                />

                {/* ── Services ── */}
                <MultiSelect
                    label="Types de service :"
                    options={SERVICES}
                    selected={services}
                    onToggle={v => toggle(services, v, setServices)}
                />

                {/* ── Ambiance ── */}
                <MultiSelect
                    label="Expérience & ambiance :"
                    options={ATMOSPHERES}
                    selected={atmospheres}
                    onToggle={v => toggle(atmospheres, v, setAtmospheres)}
                />

                {/* ── Avis ── */}
                <div className="border-t border-[#E8E3D0] pt-8">
                    <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Partagez votre expérience :</h2>
                    <div className="flex justify-center mb-4">
                        <StarRating rating={rating} size={40} interactive onChange={r => {
                            setRating(r)
                            setFormErrors(prev => ({ ...prev, rating: '' }))
                        }} />
                    </div>
                    {formErrors.rating && (
                        <p className="text-red-500 text-xs text-center mb-2">{formErrors.rating}</p>
                    )}
                    <div className="mb-3">
                        <label className="label">Titre de votre avis :</label>
                        <input
                            {...register('review_title')}
                            placeholder="Un restaurant exceptionnel..."
                            className="input-field"
                        />
                    </div>
                    <textarea
                        {...register('review_text')}
                        rows={4}
                        placeholder="Décrivez votre expérience (ambiance, service, plats...)..."
                        className="input-field resize-none"
                    />
                    {errors.review_text && (
                        <p className="text-red-500 text-xs mt-1">{errors.review_text.message}</p>
                    )}
                </div>

                {/* ── Photos ── */}
                <div>
                    <label className="label text-base">Photo du restaurant :</label>

                    {/* Onglets */}
                    <div className="flex border border-[#E8E3D0] rounded-xl overflow-hidden mb-4">
                        <button
                            type="button"
                            onClick={() => setPhotoTab('upload')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${photoTab === 'upload'
                                ? 'bg-[#E36B39] text-white'
                                : 'bg-white text-[#6B6B6B] hover:bg-[#FAEEE6]'
                                }`}
                        >
                            <Upload size={15} />
                            Glisser / Déposer
                        </button>
                        <button
                            type="button"
                            onClick={() => setPhotoTab('url')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${photoTab === 'url'
                                ? 'bg-[#E36B39] text-white'
                                : 'bg-white text-[#6B6B6B] hover:bg-[#FAEEE6]'
                                }`}
                        >
                            <Link2 size={15} />
                            Lien URL
                        </button>
                    </div>

                    {/* Prévisualisation active */}
                    {(photoPreview || photoUrl.trim()) && (
                        <div className="relative mb-4 rounded-2xl overflow-hidden border border-[#E8E3D0] bg-[#F7F3E8]">
                            <img
                                src={photoPreview || photoUrl}
                                alt="Prévisualisation"
                                className="w-full h-56 object-cover"
                                onError={e => { (e.target as HTMLImageElement).src = '' }}
                            />
                            <button
                                type="button"
                                onClick={clearPhoto}
                                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                            >
                                <X size={14} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
                                <p className="text-white text-xs truncate">
                                    {photoFile ? photoFile.name : photoUrl}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Contenu selon l'onglet actif */}
                    {photoTab === 'upload' ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 select-none ${isDragging
                                ? 'border-[#E36B39] bg-[#FAEEE6]/80 scale-[0.99]'
                                : 'border-[#E8E3D0] bg-[#FAEEE6]/40 hover:bg-[#FAEEE6]/70 hover:border-[#E36B39]/50'
                                }`}
                        >
                            <Upload size={36} className={`mx-auto mb-3 transition-colors ${isDragging ? 'text-[#E36B39]' : 'text-[#E36B39]/70'
                                }`} />
                            <p className="text-[#6B6B6B] font-medium">
                                {isDragging ? 'Relâchez pour déposer' : 'Glissez une image ici ou cliquez'}
                            </p>
                            <p className="text-sm text-[#9A9A8A] mt-1">PNG, JPG jusqu&apos;à 10Mo</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileInput}
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 border-2 border-[#E8E3D0] rounded-xl px-4 py-3 focus-within:border-[#E36B39] transition-colors bg-white">
                                <ImageIcon size={18} className="text-[#9A9A8A] shrink-0" />
                                <input
                                    type="url"
                                    value={photoUrl}
                                    onChange={e => {
                                        setPhotoUrl(e.target.value)
                                        setPhotoFile(null)
                                        setPhotoPreview(null)
                                    }}
                                    placeholder="https://exemple.com/photo-restaurant.jpg"
                                    className="flex-1 bg-transparent outline-none text-sm text-[#1A1A1A] placeholder:text-[#9A9A8A]"
                                />
                                {photoUrl && (
                                    <button type="button" onClick={clearPhoto} className="text-[#9A9A8A] hover:text-[#E36B39]">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-[#9A9A8A]">Collez l&apos;URL directe vers une image (.jpg, .png, .webp...)</p>
                        </div>
                    )}
                </div>

                {/* ── Soumettre ── */}
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
