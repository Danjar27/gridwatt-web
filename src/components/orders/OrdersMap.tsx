import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { INPUT_CLASS } from '@components/Form/utils/constants';
import type { Order, User } from '@lib/api-client.ts';

interface OrdersMapProps {
    orders: Array<Order>;
    technicians: Array<User>;
    onBulkAssign?: (orderIds: Array<number>, technicianId: number) => void;
    isAssigning?: boolean;
}

export function OrdersMap({ orders, technicians, onBulkAssign, isAssigning }: OrdersMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<Map<number, L.Marker>>(new Map());
    const hasFittedRef = useRef(false);
    const prevDataLenRef = useRef(0);
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());
    const [assignTechnicianId, setAssignTechnicianId] = useState<number | null>(null);
    const [selectMode, setSelectMode] = useState(false);

    // Refs for the custom rectangle selection
    const selectModeRef = useRef(false);
    const selStartRef = useRef<L.LatLng | null>(null);
    const selRectRef = useRef<L.Rectangle | null>(null);

    // Keep the ref in sync with state
    useEffect(() => {
        selectModeRef.current = selectMode;
    }, [selectMode]);

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
        const colorMap = new Map<number, string>();
        technicians.forEach((tech, index) => {
            colorMap.set(tech.id, colors[index % colors.length]);
        });

        return colorMap;
    }, [technicians]);

    // Convert orders to markers data
    const markersData = useMemo(
        () =>
            orders
                .filter((order) => order.latitude && order.longitude)
                .map((order) => ({
                    id: order.id,
                    position: [order.latitude, order.longitude] as [number, number],
                    title: `Order #${order.id}`,
                    description: `${order.serviceType} - ${order.firstName} ${order.lastName}${order.technician ? `\nTech: ${order.technician.name}` : ''}`,
                    icon: order.technicianId ? 'default' : 'warning',
                    color: order.technicianId ? technicianColors.get(order.technicianId) : undefined,
                    technicianId: order.technicianId as number | undefined,
                })),
        [orders, technicianColors]
    );

    // Technicians that actually appear in the current order set
    const activeTechnicians = useMemo(() => {
        const techIdsInOrders = new Set(orders.filter((o) => o.technicianId).map((o) => o.technicianId));

        return technicians.filter((t) => techIdsInOrders.has(t.id));
    }, [orders, technicians]);

    const createIcon = useCallback((color: string, size: number, selected: boolean) => {
        const ring = selected
            ? `box-shadow: 0 0 0 4px rgba(99,102,241,0.7), 0 2px 4px rgba(0,0,0,0.3);`
            : `box-shadow: 0 2px 4px rgba(0,0,0,0.3);`;

        return L.divIcon({
            className: 'custom-marker-icon',
            html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; ${ring}"></div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2],
        });
    }, []);

    // Initialize map once
    useEffect(() => {
        if (!mapRef.current || leafletMapRef.current) {
            return;
        }
        const map = L.map(mapRef.current, { zoomControl: true }).setView([-0.039568, -78.442251], 13);

        // CartoDB Voyager — clean, modern tile style
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
        }).addTo(map);

        // --- Custom rectangle selection via mousedown/mousemove/mouseup ---
        map.on('mousedown', (e: L.LeafletMouseEvent) => {
            if (!selectModeRef.current) {
                return;
            }
            // Prevent normal map drag
            map.dragging.disable();
            selStartRef.current = e.latlng;
            // Create a zero-size rectangle
            selRectRef.current = L.rectangle(
                [
                    [e.latlng.lat, e.latlng.lng],
                    [e.latlng.lat, e.latlng.lng],
                ],
                { color: '#6366f1', weight: 2, fillOpacity: 0.15, dashArray: '6 3' }
            ).addTo(map);
        });

        map.on('mousemove', (e: L.LeafletMouseEvent) => {
            if (!selStartRef.current || !selRectRef.current) {
                return;
            }
            selRectRef.current.setBounds(L.latLngBounds(selStartRef.current, e.latlng));
        });

        map.on('mouseup', () => {
            if (!selStartRef.current || !selRectRef.current) {
                return;
            }
            const bounds = selRectRef.current.getBounds();
            map.removeLayer(selRectRef.current);
            selRectRef.current = null;
            selStartRef.current = null;
            map.dragging.enable();

            // Find markers within drawn rectangle
            const idsInBounds: Array<number> = [];
            markersRef.current.forEach((marker, id) => {
                if (bounds.contains(marker.getLatLng())) {
                    idsInBounds.push(id);
                }
            });
            if (idsInBounds.length > 0) {
                setSelectedOrderIds((prev) => {
                    const next = new Set(prev);
                    idsInBounds.forEach((id) => next.add(id));

                    return next;
                });
            }
        });

        leafletMapRef.current = map;

        return () => {
            map.remove();
            leafletMapRef.current = null;
            hasFittedRef.current = false;
        };
    }, []);

    // Fit bounds when the actual data set changes (new/different orders), not on selection
    useEffect(() => {
        if (!leafletMapRef.current || markersData.length === 0) {
            return;
        }
        if (!hasFittedRef.current || markersData.length !== prevDataLenRef.current) {
            const bounds = L.latLngBounds(markersData.map((m) => m.position));
            leafletMapRef.current.fitBounds(bounds, { padding: [40, 40] });
            hasFittedRef.current = true;
            prevDataLenRef.current = markersData.length;
        }
    }, [markersData]);

    // Update marker icons when data or selection changes — no zoom/pan
    useEffect(() => {
        if (!leafletMapRef.current) {
            return;
        }
        const map = leafletMapRef.current;

        // Remove old markers
        markersRef.current.forEach((marker) => map.removeLayer(marker));
        markersRef.current.clear();

        // Create new markers
        markersData.forEach((markerData) => {
            const isSelected = selectedOrderIds.has(markerData.id);
            const color = markerData.icon === 'warning' ? '#f59e0b' : markerData.color || '#3b82f6';
            const size = isSelected ? 32 : 24;
            const icon = createIcon(color, size, isSelected);

            const marker = L.marker(markerData.position, { icon }).addTo(map);
            marker.bindPopup(
                `<strong>${markerData.title}</strong><br/>${markerData.description.replace(/\n/g, '<br/>')}`
            );

            // Click to toggle selection
            marker.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                setSelectedOrderIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(markerData.id)) {
                        next.delete(markerData.id);
                    } else {
                        next.add(markerData.id);
                    }

                    return next;
                });
            });

            markersRef.current.set(markerData.id, marker);
        });
    }, [markersData, selectedOrderIds, createIcon]);

    // Toggle cursor style when selection mode changes
    useEffect(() => {
        if (!mapRef.current) {
            return;
        }
        mapRef.current.style.cursor = selectMode ? 'crosshair' : '';
    }, [selectMode]);

    const handleAssign = () => {
        if (onBulkAssign && assignTechnicianId && selectedOrderIds.size > 0) {
            onBulkAssign(Array.from(selectedOrderIds), assignTechnicianId);
            setSelectedOrderIds(new Set());
            setAssignTechnicianId(null);
        }
    };

    const handleClear = () => {
        setSelectedOrderIds(new Set());
    };

    return (
        <div
            className="w-full h-full rounded-lg border border-neutral-800 flex flex-col overflow-hidden"
            style={{ minHeight: 320 }}
        >
            {/* Toolbar */}
            <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-neutral-800 bg-neutral-600/40">
                <button
                    onClick={() => setSelectMode(!selectMode)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        selectMode ? 'bg-primary-500 text-white' : 'border border-neutral-800 hover:bg-neutral-600'
                    }`}
                >
                    {selectMode ? 'Selection On' : 'Select Area'}
                </button>
                {selectMode && (
                    <span className="text-xs text-neutral-900">Click and drag on the map to select orders</span>
                )}
            </div>

            {/* Map */}
            <div ref={mapRef} className="flex-1 min-h-0" />

            {/* Assignment bar */}
            {selectedOrderIds.size > 0 && (
                <div className="shrink-0 p-3 border-t border-neutral-800 bg-neutral-600 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium">
                        {selectedOrderIds.size} order{selectedOrderIds.size > 1 ? 's' : ''} selected
                    </span>
                    <select
                        value={assignTechnicianId || ''}
                        onChange={(e) => setAssignTechnicianId(Number(e.target.value) || null)}
                        className={INPUT_CLASS}
                        style={{ maxWidth: 220 }}
                    >
                        <option value="">Select technician...</option>
                        {technicians.map((tech) => (
                            <option key={tech.id} value={tech.id}>
                                {tech.name} {tech.lastName}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleAssign}
                        disabled={!assignTechnicianId || isAssigning}
                        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                    >
                        {isAssigning ? 'Assigning...' : 'Assign'}
                    </button>
                    <button
                        onClick={handleClear}
                        className="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-600/40"
                    >
                        Clear
                    </button>
                </div>
            )}

            {/* Legend — only technicians with assigned orders */}
            <div className="shrink-0 px-3 py-2 border-t border-neutral-800 bg-neutral-600/40">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shadow-sm" />
                        <span className="text-xs text-neutral-900">Unassigned</span>
                    </div>
                    {activeTechnicians.map((tech) => (
                        <div key={tech.id} className="flex items-center gap-1.5">
                            <span
                                className="inline-block w-2.5 h-2.5 rounded-full border border-white shadow-sm"
                                style={{ backgroundColor: technicianColors.get(tech.id) }}
                            />
                            <span className="text-xs text-neutral-900 truncate max-w-24">{tech.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
