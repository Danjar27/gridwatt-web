import { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerMapProps {
    lat?: number;
    lng?: number;
    onChange: (lat: number, lng: number) => void;
}

export function LocationPickerMap({ lat, lng, onChange }: LocationPickerMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    // Keep onChange ref stable so map event listeners always call the latest version
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const pinIcon = L.divIcon({
        className: '',
        html: `<div style="
            width: 22px; height: 22px;
            border-radius: 50%;
            background-color: #FF6F43;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        "></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -14],
    });

    const createMarker = (map: L.Map, latlng: L.LatLng): L.Marker => {
        const marker = L.marker(latlng, { draggable: true, icon: pinIcon }).addTo(map);
        marker.bindTooltip('Arrastra para ajustar', { permanent: false, direction: 'top' });
        marker.on('dragend', () => {
            const pos = marker.getLatLng();
            onChangeRef.current(pos.lat, pos.lng);
        });
        return marker;
    };

    // Initialize map once
    useEffect(() => {
        if (!mapRef.current || leafletMapRef.current) return;

        const map = L.map(mapRef.current, { zoomControl: true }).setView([-0.039568, -78.442251], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
        }).addTo(map);

        map.on('click', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            if (markerRef.current) {
                markerRef.current.setLatLng(e.latlng);
            } else {
                markerRef.current = createMarker(map, e.latlng);
            }
            onChangeRef.current(lat, lng);
        });

        leafletMapRef.current = map;

        return () => {
            map.remove();
            leafletMapRef.current = null;
            markerRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep marker in sync when lat/lng changes from text input
    useEffect(() => {
        const map = leafletMapRef.current;
        if (!map || lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) return;

        const latlng = L.latLng(lat, lng);

        if (markerRef.current) {
            markerRef.current.setLatLng(latlng);
        } else {
            markerRef.current = createMarker(map, latlng);
        }

        // Pan only if the point is outside the current view
        if (!map.getBounds().contains(latlng)) {
            map.setView(latlng, Math.max(map.getZoom(), 15));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lat, lng]);

    return (
        <div className="flex flex-col gap-1">
            <div
                ref={mapRef}
                className="w-full rounded-lg border border-neutral-800 overflow-hidden"
                style={{ height: 400 }}
            />
            <p className="text-xs text-neutral-900">
                Haz clic en el mapa para seleccionar la ubicación. Puedes arrastrar el marcador para ajustar.
            </p>
        </div>
    );
}
