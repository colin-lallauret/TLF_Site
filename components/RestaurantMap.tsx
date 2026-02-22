'use client'

import { useEffect, useRef } from 'react'

interface MapRestaurant {
    id: string
    name: string
    address: string | null
    city: string | null
    lat: number | null
    lng: number | null
    image_url: string | null
}

interface Props {
    restaurants: MapRestaurant[]
}

export default function RestaurantMap({ restaurants }: Props) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)

    useEffect(() => {
        if (!mapRef.current) return

        // ✅ Flag pour annuler l'init async si le composant démonte avant la fin
        let cancelled = false

        // ✅ Toujours cleanup l'instance existante avant de réinitialiser
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove()
            mapInstanceRef.current = null
        }

        const withCoords = restaurants.filter(r => r.lat !== null && r.lng !== null)

        // Injecter le CSS Leaflet si pas déjà fait
        if (!document.querySelector('link[href*="leaflet.css"]')) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            document.head.appendChild(link)
        }

        import('leaflet').then(L => {
            // ✅ Si le composant a démonté entre-temps, on annule
            if (cancelled || !mapRef.current) return

            // Fix icônes Leaflet cassées par webpack/turbopack
            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            })

            const defaultCenter: [number, number] = withCoords.length > 0
                ? [
                    withCoords.reduce((s, r) => s + r.lat!, 0) / withCoords.length,
                    withCoords.reduce((s, r) => s + r.lng!, 0) / withCoords.length,
                ]
                : [43.1167, 5.9333]

            const map = L.map(mapRef.current!, {
                center: defaultCenter,
                zoom: withCoords.length === 1 ? 14 : 10,
                zoomControl: true,
                scrollWheelZoom: false,
            })

            mapInstanceRef.current = map

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map)

            const greenIcon = L.divIcon({
                className: '',
                html: `<div style="
                    width: 32px; height: 32px;
                    background: #00703C;
                    border: 3px solid white;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                "></div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -36],
            })

            withCoords.forEach(r => {
                const popup = `
                    <div style="font-family: system-ui, sans-serif; min-width: 160px;">
                        ${r.image_url
                        ? `<img src="${r.image_url}" alt="${r.name}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:8px;">`
                        : ''}
                        <strong style="font-size:13px;color:#1A1A1A;">${r.name}</strong>
                        ${r.address || r.city
                        ? `<p style="font-size:11px;color:#6B6B6B;margin:4px 0 0;">${[r.address, r.city].filter(Boolean).join(', ')}</p>`
                        : ''}
                        <a href="/restaurant/${r.id}" style="display:inline-block;margin-top:8px;font-size:11px;color:#00703C;font-weight:600;">Voir le détail →</a>
                    </div>
                `
                L.marker([r.lat!, r.lng!], { icon: greenIcon })
                    .addTo(map)
                    .bindPopup(popup, { maxWidth: 220 })
            })
        })

        return () => {
            // ✅ Annule l'init async en cours si elle n'est pas encore finie
            cancelled = true
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [restaurants])

    return (
        <div
            ref={mapRef}
            className="w-full h-full"
            style={{ minHeight: '288px' }}
        />
    )
}

