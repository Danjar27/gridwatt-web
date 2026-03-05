import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as L from 'leaflet';
import { utmToLatLng } from '@utils/coordinates.ts';
import 'leaflet/dist/leaflet.css';

import type { Job } from '@interfaces/job.interface.ts';

interface TechnicianOrdersMapProps {
    jobs: Array<Job>;
    onJobClick: (job: Job) => void;
}

const DOT_COLOR = '#f59e0b';

const TechnicianOrdersMap = ({ jobs, onJobClick }: TechnicianOrdersMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<Map<number, L.Marker>>(new Map());
    const hasFittedRef = useRef(false);
    const prevDataLenRef = useRef(0);
    const onJobClickRef = useRef(onJobClick);

    useEffect(() => {
        onJobClickRef.current = onJobClick;
    }, [onJobClick]);

    const createIcon = useCallback(
        () =>
            L.divIcon({
                className: '',
                html: `<div style="width:14px;height:14px;border-radius:50%;background-color:${DOT_COLOR};box-shadow:0 2px 6px rgba(0,0,0,0.45),inset 0 1px 2px rgba(255,255,255,0.25);"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7],
            }),
        []
    );

    const markersData = useMemo(
        () =>
            jobs
                .map((job) => {
                    const order = job.order;

                    if (!order || order.coordinateX === null || order.coordinateX === undefined) {
                        return null;
                    }

                    if (order.coordinateY === null || order.coordinateY === undefined) {
                        return null;
                    }

                    const wgs = utmToLatLng(order.coordinateX, order.coordinateY);

                    if (!wgs) {
                        return null;
                    }

                    return { id: job.id, position: wgs, job };
                })
                .filter((marker): marker is NonNullable<typeof marker> => marker !== null),
        [jobs]
    );

    useEffect(() => {
        if (!mapRef.current || leafletMapRef.current) {
            return;
        }

        const map = L.map(mapRef.current, { zoomControl: true }).setView([-0.039568, -78.442251], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
        }).addTo(map);

        leafletMapRef.current = map;

        return () => {
            map.remove();
            leafletMapRef.current = null;
            hasFittedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!leafletMapRef.current || markersData.length === 0) {
            return;
        }

        if (!hasFittedRef.current || markersData.length !== prevDataLenRef.current) {
            const bounds = L.latLngBounds(markersData.map((marker) => marker.position));
            leafletMapRef.current.fitBounds(bounds, { padding: [40, 40] });
            hasFittedRef.current = true;
            prevDataLenRef.current = markersData.length;
        }
    }, [markersData]);

    useEffect(() => {
        if (!leafletMapRef.current) {
            return;
        }

        const map = leafletMapRef.current;

        markersRef.current.forEach((marker) => map.removeLayer(marker));
        markersRef.current.clear();

        markersData.forEach((markerData) => {
            const marker = L.marker(markerData.position, { icon: createIcon() }).addTo(map);
            marker.on('click', () => onJobClickRef.current(markerData.job));
            markersRef.current.set(markerData.id, marker);
        });
    }, [markersData, createIcon]);

    return (
        <div
            className="w-full h-full rounded-lg border border-neutral-800 overflow-hidden isolate"
            style={{ minHeight: 320 }}
        >
            <div ref={mapRef} className="w-full h-full" />
        </div>
    );
};

export default TechnicianOrdersMap;
