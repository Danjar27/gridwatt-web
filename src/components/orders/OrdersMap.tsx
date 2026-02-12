import { useEffect, useMemo, useRef } from 'react';
import * as leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function OrdersMap({ orders, technicians }: { orders: any[]; technicians: any[] }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef(null);

    // Color palette for technicians
    const technicianColors = useMemo(() => {
        const colors = [
            '#3b82f6',
            '#10b981',
            '#8b5cf6',
            '#ec4899',
            '#06b6d4',
            '#f97316',
            '#84cc16',
            '#6366f1',
            '#14b8a6',
            '#a855f7',
        ];
        const colorMap = new Map();
        technicians.forEach((tech, index) => {
            colorMap.set(tech.id, colors[index % colors.length]);
        });
        return colorMap;
    }, [technicians]);

    // Convert orders to markers
    const markers = useMemo(
        () =>
            orders
                .filter((order) => order.latitude && order.longitude)
                .map((order) => ({
                    id: order.id,
                    position: [order.latitude, order.longitude],
                    title: `Order #${order.id}`,
                    description: `${order.serviceType} - ${order.firstName} ${order.lastName}${order.technician ? `\nTechnician: ${order.technician.name}` : ''}`,
                    icon: order.technicianId ? 'default' : 'warning',
                    color: order.technicianId ? technicianColors.get(order.technicianId) : undefined,
                })),
        [orders, technicianColors]
    );

    // Calculate map center
    const mapCenter = useMemo(() => {
        if (markers.length === 0) return [-0.039568, -78.442251]; // Quito
        const avgLat = markers.reduce((sum, m) => sum + m.position[0], 0) / markers.length;
        const avgLng = markers.reduce((sum, m) => sum + m.position[1], 0) / markers.length;
        return [avgLat, avgLng];
    }, [markers]);

    useEffect(() => {
        if (!mapRef.current || leafletMapRef.current) return;
        const map = leaflet.map(mapRef.current).setView(mapCenter, 13);
        leaflet
            .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '© OpenStreetMap contributors',
            })
            .addTo(map);
        leafletMapRef.current = map;
    }, []);

    useEffect(() => {
        if (!leafletMapRef.current) return;
        // Remove old markers
        leafletMapRef.current.eachLayer((layer) => {
            if (layer.options && layer.options.pane === 'markerPane') {
                leafletMapRef.current.removeLayer(layer);
            }
        });
        // Add new markers
        markers.forEach((markerData) => {
            let icon;
            if (markerData.icon === 'warning') {
                icon = leaflet.divIcon({
                    className: 'custom-marker-icon',
                    html: `<div style="background-color: #f59e0b; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                    popupAnchor: [0, -12],
                });
            } else if (markerData.color) {
                icon = leaflet.divIcon({
                    className: 'custom-marker-icon',
                    html: `<div style="background-color: ${markerData.color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                    popupAnchor: [0, -12],
                });
            } else {
                icon = undefined;
            }
            const marker = leaflet.marker(markerData.position, { icon }).addTo(leafletMapRef.current);
            marker.bindPopup(
                `<strong>${markerData.title}</strong><br/>${markerData.description.replace(/\n/g, '<br/>')}`
            );
        });
        // Center map
        leafletMapRef.current.setView(mapCenter, 13);
    }, [markers, mapCenter]);

    return (
        <div className="h-96 w-full rounded border bg-card flex flex-col">
            <div ref={mapRef} className="flex-1 rounded" style={{ minHeight: 320 }} />
            <div className="p-2 border-t bg-muted/50">
                <div className="font-medium mb-2">Legend:</div>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm" />
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                    </div>
                    {technicians.map((tech) => (
                        <div key={tech.id} className="flex items-center gap-2">
                            <span
                                className="inline-block w-3 h-3 rounded-full border border-white shadow-sm"
                                style={{ backgroundColor: technicianColors.get(tech.id) }}
                            />
                            <span className="text-xs text-muted-foreground truncate">{tech.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
