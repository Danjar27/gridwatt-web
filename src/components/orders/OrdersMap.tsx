import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as L from 'leaflet';
import { utmToLatLng } from '@utils/coordinates.ts';
import { isPointInPolygon } from '@utils/map.ts';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { useTranslations } from 'use-intl';

import { SealWarningIcon, PolygonIcon } from '@phosphor-icons/react';
import type { User } from '@interfaces/user.interface.ts';
import type { OrderMapPoint } from '@interfaces/order.interface.ts';
import type { MapArea, AreaCoordinate } from '@interfaces/area.interface.ts';

import Modal from '@components/Modal/Modal';
import Window from '@components/Modal/blocks/Window';
import Form from '@components/Form/Form';
import Actions from '@components/Form/blocks/Actions';

const LEAFLET_DARK_CSS = `
.leaflet-popup-content-wrapper {
    background: var(--neutral-500);
    border: 1px solid var(--neutral-800);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.18);
    padding: 0;
    overflow: hidden;
    color: inherit;
}
.leaflet-popup-tip-container { display: none; }
.leaflet-popup-content { margin: 0; }
.leaflet-popup-close-button {
    top: 8px !important;
    right: 8px !important;
    color: var(--neutral-900) !important;
    font-size: 16px !important;
}
.ow-order-popup { min-width: 220px; font-family: inherit; }
.ow-popup-header {
    padding: 10px 14px 8px;
    border-bottom: 1px solid var(--neutral-800);
    background: var(--neutral-600);
}
.ow-popup-name { font-weight: 600; font-size: 13px; }
.ow-popup-table { width: 100%; border-collapse: collapse; }
.ow-popup-table tr:not(:last-child) td { border-bottom: 1px solid var(--neutral-800); }
.ow-lbl { padding: 5px 8px 5px 14px; color: var(--neutral-900); white-space: nowrap; font-size: 11px; }
.ow-val { padding: 5px 14px 5px 4px; font-size: 11px; }
.ow-area-tip {
    background: var(--neutral-600) !important;
    border: 1px solid var(--neutral-800) !important;
    color: inherit !important;
    font-size: 12px !important;
    border-radius: 6px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
    padding: 4px 10px !important;
}
.ow-area-tip::before { display: none !important; }
.leaflet-interactive:focus { outline: none !important; }
.leaflet-container.ow-drawing,
.leaflet-container.ow-drawing * { cursor: crosshair !important; }
.ow-area-popup { min-width: 180px; font-family: inherit; }
.ow-area-popup-header {
    padding: 10px 14px 8px;
    border-bottom: 1px solid var(--neutral-800);
    background: var(--neutral-600);
}
.ow-area-popup-header-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--neutral-900);
}
.ow-area-popup-header-name { font-size: 13px; font-weight: 600; }
.ow-area-popup-actions { padding: 8px; display: flex; flex-direction: column; gap: 4px; }
.ow-area-btn {
    width: 100%;
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid var(--neutral-800);
    background: transparent;
    color: inherit;
    font-size: 12px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
}
.ow-area-btn:hover { background: var(--neutral-700); }
.ow-area-btn.danger { color: var(--secondary-500); border-color: var(--secondary-600); }
.ow-area-btn.danger:hover { background: var(--secondary-500); color: white; }
`;

function buildOrderPopupHtml(order: OrderMapPoint): string {
    const techName = order.technician ? `${order.technician.name} ${order.technician.lastName}` : null;
    const rows: Array<[string, string]> = [
        ['Técnico', techName ?? 'Sin asignar'],
        ['Cédula', order.clientId ?? ''],
        ['Tipo', order.type ?? ''],
        ['Dirección', order.address ?? ''],
        ['Cuenta', order.clientAccount ?? ''],
        ['Medidor', order.meterId ?? ''],
        ...(order.coordinateX !== null ? [['Coord X', String(order.coordinateX)] as [string, string]] : []),
        ...(order.coordinateY !== null ? [['Coord Y', String(order.coordinateY)] as [string, string]] : []),
        ['Orden', order.id ?? ''],
    ];
    const rowsHtml = rows
        .filter(([, v]) => v)
        .map(([l, v]) => `<tr><td class="ow-lbl">${l}</td><td class="ow-val">${v}</td></tr>`)
        .join('');

    return `<div class="ow-order-popup"><div class="ow-popup-header"><span class="ow-popup-name">${order.clientName ?? ''} ${order.clientLastName ?? ''}</span></div><table class="ow-popup-table">${rowsHtml}</table></div>`;
}

interface OrdersMapProps {
    orders: Array<OrderMapPoint>;
    technicians: Array<User>;
    areas?: Array<MapArea>;
    onDrawComplete?: (coords: Array<AreaCoordinate>) => void;
    onAreaEditRequest?: (area: MapArea) => void;
    onAreaShapeUpdate?: (id: number, coords: Array<AreaCoordinate>) => void;
    onAreaDelete?: (id: number) => void;
    isAreaMutating?: boolean;
}

export function OrdersMap({
    orders,
    technicians: _technicians,
    areas = [],
    onDrawComplete,
    onAreaEditRequest,
    onAreaShapeUpdate,
    onAreaDelete,
    isAreaMutating,
}: OrdersMapProps) {
    const i18n = useTranslations();

    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<Map<string, L.Marker>>(new Map());
    const hasFittedRef = useRef(false);
    const prevDataLenRef = useRef(0);
    // ─── Area layers and shape-editing state ──────────────────────────────────
    const areasLayerRef = useRef<Map<number, L.Polygon>>(new Map());
    const [drawMode, setDrawMode] = useState(false);
    const [liveDrawCount, setLiveDrawCount] = useState<number | null>(null);
    const [isEditingShape, setIsEditingShape] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const editingShapeAreaIdRef = useRef<number | null>(null);
    const editingAreaOriginalCoordsRef = useRef<Array<L.LatLng> | null>(null);

    // ─── Refs mirroring state for event-handler closures ─────────────────────
    const drawModeRef = useRef(false);
    const isEditingShapeRef = useRef(false);

    // Refs for callbacks updated each render
    const onDrawCompleteRef = useRef(onDrawComplete);
    const onAreaEditRequestRef = useRef(onAreaEditRequest);
    const onAreaShapeUpdateRef = useRef(onAreaShapeUpdate);
    const onAreaDeleteRef = useRef(onAreaDelete);
    const areasDataRef = useRef(areas);

    useEffect(() => {
        onDrawCompleteRef.current = onDrawComplete;
    }, [onDrawComplete]);
    useEffect(() => {
        onAreaEditRequestRef.current = onAreaEditRequest;
    }, [onAreaEditRequest]);
    useEffect(() => {
        onAreaShapeUpdateRef.current = onAreaShapeUpdate;
    }, [onAreaShapeUpdate]);
    useEffect(() => {
        onAreaDeleteRef.current = onAreaDelete;
    }, [onAreaDelete]);
    useEffect(() => {
        areasDataRef.current = areas;
    }, [areas]);

    // ─── Drawing working refs ─────────────────────────────────────────────────
    const drawingVerticesRef = useRef<Array<L.LatLng>>([]);
    const drawingPolylineRef = useRef<L.Polyline | null>(null);
    const drawingPreviewPolygonRef = useRef<L.Polygon | null>(null);
    const drawingVertexMarkersRef = useRef<Array<L.CircleMarker>>([]);
    const mouseDownPointRef = useRef<L.Point | null>(null);
    const freehandActiveRef = useRef(false);
    const finishDrawingRef = useRef<(coords: Array<L.LatLng>) => void>(() => {});

    // ─── Memos ────────────────────────────────────────────────────────────────
    const markersData = useMemo(() => {
        // Build order → area color map using point-in-polygon (coordinates must be WGS84)
        const orderAreaColor = new Map<string, string>();
        areas.forEach((area) => {
            orders.forEach((order) => {
                if (order.coordinateX === null || order.coordinateX === undefined || order.coordinateY === null || order.coordinateY === undefined) {
                    return;
                }

                const wgs = utmToLatLng(order.coordinateX, order.coordinateY);
                if (wgs && isPointInPolygon(wgs[0], wgs[1], area.coordinates)) {
                    orderAreaColor.set(order.id, area.color);
                }
            });
        });

        return orders
            .map((order) => {
                if (order.coordinateX === null || order.coordinateX === undefined || order.coordinateY === null || order.coordinateY === undefined) {
                    return null;
                }

                const wgs = utmToLatLng(order.coordinateX, order.coordinateY);
                if (!wgs) {
                    return null;
                }

                return {
                    id: order.id,
                    position: wgs,
                    color: orderAreaColor.get(order.id),
                    order,
                };
            })
            .filter((m): m is NonNullable<typeof m> => m !== null);
    }, [orders, areas]);

    const markersDataRef = useRef<typeof markersData>([]);
    useEffect(() => {
        markersDataRef.current = markersData;
    }, [markersData]);

    // Count orders per area (and unassigned)
    const areaStats = useMemo(() => {
        const counts = new Map<number, number>();
        let unassigned = 0;
        orders.forEach((order) => {
            if (order.coordinateX === null || order.coordinateX === undefined || order.coordinateY === null || order.coordinateY === undefined) {
                unassigned++;

                return;
            }

            const wgs = utmToLatLng(order.coordinateX, order.coordinateY);
            if (!wgs) {
                unassigned++;

                return;
            }

            let matched = false;
            areas.forEach((area) => {
                if (isPointInPolygon(wgs[0], wgs[1], area.coordinates)) {
                    counts.set(area.id, (counts.get(area.id) ?? 0) + 1);
                    matched = true;
                }
            });
            if (!matched) {
                unassigned++;
            }
        });

        return { counts, unassigned };
    }, [orders, areas]);

    const createIcon = useCallback(
        (color: string) =>
            L.divIcon({
                className: '',
                html: `<div style="width:14px;height:14px;border-radius:50%;background-color:${color};box-shadow:0 2px 6px rgba(0,0,0,0.45),inset 0 1px 2px rgba(255,255,255,0.25);"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7],
                popupAnchor: [0, -8],
            }),
        []
    );

    // ─── Map initialisation (runs once) ───────────────────────────────────────
    useEffect(() => {
        if (!mapRef.current || leafletMapRef.current) {
            return;
        }

        const map = L.map(mapRef.current, { zoomControl: true, doubleClickZoom: false }).setView(
            [-0.039568, -78.442251],
            13
        );

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
        }).addTo(map);

        // ── Dark-themed popup CSS (injected once) ────────────────────────────
        if (!document.getElementById('ow-leaflet-dark')) {
            const style = document.createElement('style');
            style.id = 'ow-leaflet-dark';
            style.textContent = LEAFLET_DARK_CSS;
            document.head.appendChild(style);
        }

        // ── Drawing helpers ──────────────────────────────────────────────────
        const clearDrawingPreview = () => {
            if (drawingPolylineRef.current) {
                map.removeLayer(drawingPolylineRef.current);
                drawingPolylineRef.current = null;
            }
            if (drawingPreviewPolygonRef.current) {
                map.removeLayer(drawingPreviewPolygonRef.current);
                drawingPreviewPolygonRef.current = null;
            }
            drawingVertexMarkersRef.current.forEach((m) => map.removeLayer(m));
            drawingVertexMarkersRef.current = [];
        };

        const addVertexMarker = (latlng: L.LatLng) => {
            const dot = L.circleMarker(latlng, {
                radius: 5,
                color: '#6366f1',
                fillColor: '#6366f1',
                fillOpacity: 1,
                weight: 2,
            }).addTo(map);
            drawingVertexMarkersRef.current.push(dot);
        };

        const updatePreviewPolyline = (cursorLatLng?: L.LatLng) => {
            const verts = drawingVerticesRef.current;
            if (verts.length === 0) {
                return;
            }
            const pts = cursorLatLng ? [...verts, cursorLatLng] : verts;

            // Dashed edge line
            if (drawingPolylineRef.current) {
                drawingPolylineRef.current.setLatLngs(pts);
            } else {
                drawingPolylineRef.current = L.polyline(pts, { color: '#6366f1', weight: 2, dashArray: '6 3' }).addTo(
                    map
                );
            }

            // Live shaded polygon — shown once ≥3 points are on screen
            if (pts.length >= 3) {
                if (drawingPreviewPolygonRef.current) {
                    drawingPreviewPolygonRef.current.setLatLngs(pts);
                } else {
                    drawingPreviewPolygonRef.current = L.polygon(pts, {
                        color: '#6366f1',
                        fillColor: '#6366f1',
                        fillOpacity: 0.18,
                        weight: 0,
                        interactive: false,
                    }).addTo(map);
                }

                // Update live count with the cursor-extended polygon
                const poly = pts.map((ll) => ({ lat: ll.lat, lng: ll.lng }));
                let count = 0;
                markersDataRef.current.forEach((md) => {
                    if (isPointInPolygon(md.position[0], md.position[1], poly)) {
                        count++;
                    }
                });
                setLiveDrawCount(count);
            } else if (drawingPreviewPolygonRef.current) {
                map.removeLayer(drawingPreviewPolygonRef.current);
                drawingPreviewPolygonRef.current = null;
                setLiveDrawCount(null);
            }
        };

        finishDrawingRef.current = (coords: Array<L.LatLng>) => {
            clearDrawingPreview();
            setDrawMode(false);
            setLiveDrawCount(null);
            if (onDrawCompleteRef.current && coords.length >= 3) {
                onDrawCompleteRef.current(coords.map((ll) => ({ lat: ll.lat, lng: ll.lng })));
            }
        };

        // ── Mouse events ─────────────────────────────────────────────────────
        map.on('mousedown', (e: L.LeafletMouseEvent) => {
            if (isEditingShapeRef.current) {
                return;
            }

            if (!drawModeRef.current) {
                return;
            }
            mouseDownPointRef.current = e.containerPoint;
            freehandActiveRef.current = false;
            map.dragging.disable();
        });

        map.on('mousemove', (e: L.LeafletMouseEvent) => {
            if (isEditingShapeRef.current) {
                return;
            }

            if (!drawModeRef.current) {
                return;
            }

            if (mouseDownPointRef.current) {
                const dx = e.containerPoint.x - mouseDownPointRef.current.x;
                const dy = e.containerPoint.y - mouseDownPointRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (!freehandActiveRef.current && dist > 8) {
                    freehandActiveRef.current = true;
                    drawingVerticesRef.current = [e.latlng];
                } else if (freehandActiveRef.current) {
                    drawingVerticesRef.current.push(e.latlng);
                    updatePreviewPolyline();
                }
            } else if (drawingVerticesRef.current.length > 0) {
                updatePreviewPolyline(e.latlng);
            }
        });

        map.on('mouseup', () => {
            if (isEditingShapeRef.current) {
                return;
            }

            if (!drawModeRef.current) {
                return;
            }

            if (freehandActiveRef.current) {
                freehandActiveRef.current = false;
                mouseDownPointRef.current = null;
                map.dragging.enable();
                const coords = [...drawingVerticesRef.current];
                drawingVerticesRef.current = [];
                clearDrawingPreview();
                if (coords.length >= 3) {
                    finishDrawingRef.current(coords);
                }
            } else {
                mouseDownPointRef.current = null;
                map.dragging.enable();
            }
        });

        // Click → add vertex, or snap-to-close if near first vertex
        map.on('click', (e: L.LeafletMouseEvent) => {
            if (isEditingShapeRef.current || !drawModeRef.current || freehandActiveRef.current) {
                return;
            }
            const verts = drawingVerticesRef.current;

            // Snap-to-close: click within 20px of first vertex with ≥3 verts placed
            if (verts.length >= 3) {
                const firstPx = map.latLngToContainerPoint(verts[0]);
                const dx = e.containerPoint.x - firstPx.x;
                const dy = e.containerPoint.y - firstPx.y;
                if (Math.sqrt(dx * dx + dy * dy) < 20) {
                    const final = [...verts];
                    drawingVerticesRef.current = [];
                    clearDrawingPreview();
                    map.dragging.enable();
                    finishDrawingRef.current(final);

                    return;
                }
            }

            verts.push(e.latlng);
            addVertexMarker(e.latlng);

            // Highlight first vertex green once polygon can be closed
            if (verts.length === 3 && drawingVertexMarkersRef.current[0]) {
                drawingVertexMarkersRef.current[0].setStyle({ color: '#22c55e', fillColor: '#22c55e', radius: 7 });
            }

            updatePreviewPolyline();

            // Live count is now updated inside updatePreviewPolyline via cursor extension;
            // for click-only path (no cursor arg), force-update count from placed verts.
            if (verts.length >= 3) {
                const poly = verts.map((ll) => ({ lat: ll.lat, lng: ll.lng }));
                let count = 0;
                markersDataRef.current.forEach((md) => {
                    if (isPointInPolygon(md.position[0], md.position[1], poly)) {
                        count++;
                    }
                });
                setLiveDrawCount(count);
            }
        });

        // Double-click → close polygon (strip 2 spurious pre-dblclick vertices)
        map.on('dblclick', (e: L.LeafletMouseEvent) => {
            if (isEditingShapeRef.current || !drawModeRef.current || freehandActiveRef.current) {
                return;
            }
            L.DomEvent.stop(e);
            const verts = drawingVerticesRef.current;
            if (verts.length >= 2) {
                verts.splice(verts.length - 2, 2);
            }
            const final = [...verts];
            drawingVerticesRef.current = [];
            clearDrawingPreview();
            map.dragging.enable();
            if (final.length >= 3) {
                finishDrawingRef.current(final);
            }
        });

        leafletMapRef.current = map;

        return () => {
            map.remove();
            leafletMapRef.current = null;
            hasFittedRef.current = false;
            // Clear stale polygon refs so areas are re-created on next mount
            areasLayerRef.current.clear();
        };
    }, []);

    // ─── Sync state→refs for event-handler closures ───────────────────────────
    useEffect(() => {
        drawModeRef.current = drawMode;
    }, [drawMode]);
    useEffect(() => {
        isEditingShapeRef.current = isEditingShape;
    }, [isEditingShape]);

    // ─── Fit bounds when order set changes ────────────────────────────────────
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

    // ─── Render markers (no zoom/pan) ────────────────────────────────────────
    useEffect(() => {
        if (!leafletMapRef.current) {
            return;
        }
        const map = leafletMapRef.current;

        markersRef.current.forEach((marker) => map.removeLayer(marker));
        markersRef.current.clear();

        markersData.forEach((md) => {
            const color = md.color ?? '#f59e0b';
            const marker = L.marker(md.position, { icon: createIcon(color) }).addTo(map);
            marker.bindPopup(buildOrderPopupHtml(md.order), { maxWidth: 310 });
            markersRef.current.set(md.id, marker);
        });
    }, [markersData, createIcon]);

    // ─── Render area polygons ─────────────────────────────────────────────────
    useEffect(() => {
        const map = leafletMapRef.current;
        if (!map) {
            return;
        }

        const layer = areasLayerRef.current;

        // Remove polygons for deleted areas
        const currentIds = new Set(areas.map((a) => a.id));
        layer.forEach((polygon, id) => {
            if (!currentIds.has(id)) {
                map.removeLayer(polygon);
                layer.delete(id);
            }
        });

        // Add or update
        areas.forEach((area) => {
            const coords = area.coordinates.map((c) => L.latLng(c.lat, c.lng));
            const existing = layer.get(area.id);

            if (existing) {
                existing.setLatLngs(coords);
                existing.setStyle({ color: area.color, fillColor: area.color });
            } else {
                const polygon = L.polygon(coords, {
                    color: area.color,
                    fillColor: area.color,
                    fillOpacity: 0.15,
                    weight: 2,
                }).addTo(map);

                // Permanent tooltip: technician name + order count
                const techTooltip = area.technician
                    ? `${area.technician.name} ${area.technician.lastName}`
                    : 'Sin asignar';
                polygon.bindTooltip(techTooltip, { sticky: false, direction: 'center', className: 'ow-area-tip' });

                // Popup with actions (dark themed)
                const popupEl = document.createElement('div');
                const techLabel = area.technician
                    ? `${area.technician.name} ${area.technician.lastName}`
                    : 'Sin asignar';
                popupEl.innerHTML = `
                    <div class="ow-area-popup">
                        <div class="ow-area-popup-header">
                            <div class="ow-area-popup-header-label">Área</div>
                            <div class="ow-area-popup-header-name">${techLabel}</div>
                        </div>
                        <div class="ow-area-popup-actions">
                            <button class="ow-area-btn" id="area-assign-${area.id}">Asignar técnico</button>
                            <button class="ow-area-btn" id="area-edit-shape-${area.id}">Editar forma</button>
                            <button class="ow-area-btn danger" id="area-delete-${area.id}">Eliminar área</button>
                        </div>
                    </div>`;
                polygon.bindPopup(popupEl);

                polygon.on('popupopen', () => {
                    setTimeout(() => {
                        document.getElementById(`area-assign-${area.id}`)?.addEventListener('click', () => {
                            polygon.closePopup();
                            onAreaEditRequestRef.current?.(area);
                        });
                        document.getElementById(`area-edit-shape-${area.id}`)?.addEventListener('click', () => {
                            polygon.closePopup();
                            editingShapeAreaIdRef.current = area.id;
                            editingAreaOriginalCoordsRef.current = area.coordinates.map((c) => L.latLng(c.lat, c.lng));
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (polygon as any).pm.enable({ snappable: false });
                            setIsEditingShape(true);

                            // Live count while dragging vertices
                            polygon.on('pm:change', () => {
                                const lls = (polygon.getLatLngs() as Array<Array<L.LatLng>>)[0];
                                if (!lls || lls.length < 3) {
                                    return;
                                }

                                const poly = lls.map((ll) => ({ lat: ll.lat, lng: ll.lng }));
                                let count = 0;
                                markersDataRef.current.forEach((md) => {
                                    if (isPointInPolygon(md.position[0], md.position[1], poly)) {
                                        count++;
                                    }
                                });
                                setLiveDrawCount(count);
                            });

                            // Show initial count
                            const initLls = (polygon.getLatLngs() as Array<Array<L.LatLng>>)[0];
                            if (initLls && initLls.length >= 3) {
                                const poly = initLls.map((ll) => ({ lat: ll.lat, lng: ll.lng }));
                                let count = 0;
                                markersDataRef.current.forEach((md) => {
                                    if (isPointInPolygon(md.position[0], md.position[1], poly)) {
                                        count++;
                                    }
                                });
                                setLiveDrawCount(count);
                            }
                        });
                        document.getElementById(`area-delete-${area.id}`)?.addEventListener('click', () => {
                            polygon.closePopup();
                            setDeleteConfirmId(area.id);
                        });
                    }, 0);
                });

                layer.set(area.id, polygon);
            }
        });
    }, [areas]);

    // ─── Cursor for draw mode ─────────────────────────────────────────────────
    useEffect(() => {
        const container = mapRef.current;
        if (!container) {
            return;
        }

        container.classList.toggle('ow-drawing', drawMode);
        if (!drawMode) {
            setLiveDrawCount(null);
            leafletMapRef.current?.dragging.enable();
        }
    }, [drawMode]);

    // ─── Shape save / cancel ─────────────────────────────────────────────────
    const handleShapeSave = useCallback(() => {
        const id = editingShapeAreaIdRef.current;
        if (!id) {
            return;
        }
        const polygon = areasLayerRef.current.get(id);
        if (!polygon) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (polygon as any).pm.disable();
        polygon.off('pm:change');
        const rawLatLngs = polygon.getLatLngs() as Array<Array<L.LatLng>>;
        const coords = rawLatLngs[0].map((ll) => ({ lat: ll.lat, lng: ll.lng }));
        setIsEditingShape(false);
        setLiveDrawCount(null);
        editingShapeAreaIdRef.current = null;
        editingAreaOriginalCoordsRef.current = null;
        onAreaShapeUpdateRef.current?.(id, coords);
    }, []);

    const handleShapeCancel = useCallback(() => {
        const id = editingShapeAreaIdRef.current;
        if (!id) {
            return;
        }
        const polygon = areasLayerRef.current.get(id);
        if (!polygon) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (polygon as any).pm.disable();
        polygon.off('pm:change');
        if (editingAreaOriginalCoordsRef.current) {
            polygon.setLatLngs(editingAreaOriginalCoordsRef.current);
        }
        setIsEditingShape(false);
        setLiveDrawCount(null);
        editingShapeAreaIdRef.current = null;
        editingAreaOriginalCoordsRef.current = null;
    }, []);

    // ─── Mode toggles ─────────────────────────────────────────────────────────
    const handleToggleDrawMode = useCallback(() => {
        setDrawMode((d) => !d);
    }, []);

    return (
        <div
            className="w-full h-full rounded-lg border border-neutral-800 flex flex-col overflow-hidden isolate"
            style={{ minHeight: 320 }}
        >
            {/* Toolbar */}
            <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-neutral-800 bg-neutral-600/40 flex-wrap">
                {isEditingShape ? (
                    <>
                        <span className="text-xs text-neutral-400 mr-1">{i18n('pages.orders.map.editShapeHint')}</span>
                        <button
                            onClick={handleShapeSave}
                            disabled={isAreaMutating}
                            className="rounded-md px-3 py-1.5 text-xs font-medium bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 transition"
                        >
                            {i18n('pages.orders.map.saveShape')}
                        </button>
                        <button
                            onClick={handleShapeCancel}
                            className="rounded-md px-3 py-1.5 text-xs font-medium border border-neutral-800 hover:bg-neutral-600 transition"
                        >
                            {i18n('pages.orders.map.cancelEdit')}
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleToggleDrawMode}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${drawMode ? 'bg-primary-500 text-white' : 'border border-neutral-800 hover:bg-neutral-600'}`}
                        >
                            {drawMode ? i18n('pages.orders.map.cancelDraw') : i18n('pages.orders.map.drawArea')}
                        </button>
                        {drawMode && (
                            <span className="text-xs text-neutral-900">{i18n('pages.orders.map.drawHint')}</span>
                        )}
                        {drawMode && liveDrawCount !== null && (
                            <span className="ml-1 rounded-full bg-primary-500/20 px-2 py-0.5 text-xs font-semibold text-primary-500">
                                {liveDrawCount} {liveDrawCount === 1 ? 'orden' : 'órdenes'}
                            </span>
                        )}
                    </>
                )}
            </div>

            {/* Map + Sidebar */}
            <div className="flex-1 min-h-0 flex">
                <div ref={mapRef} className="flex-1 min-h-0" />

                {/* Stats sidebar */}
                <div className="w-44 shrink-0 flex flex-col border-l border-neutral-800 bg-neutral-600/40 overflow-hidden">
                    <div className="px-3 py-2 border-b border-neutral-800">
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-900">
                            {i18n('pages.orders.map.areas')}
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {/* Unassigned row */}
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-800/60">
                            <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white/40" />
                            <span className="flex-1 text-xs text-neutral-900 truncate">
                                {i18n('pages.orders.map.unassigned')}
                            </span>
                            <span className="shrink-0 min-w-5 text-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-neutral-700 text-neutral-900">
                                {areaStats.unassigned}
                            </span>
                        </div>
                        {/* One row per area */}
                        {areas.map((area) => {
                            const count = areaStats.counts.get(area.id) ?? 0;
                            const tech = area.technician
                                ? `${area.technician.name} ${area.technician.lastName}`
                                : 'Sin asignar';

                            return (
                                <div
                                    key={area.id}
                                    className="flex items-center gap-2 px-3 py-2 border-b border-neutral-800/60 last:border-b-0"
                                >
                                    <span
                                        className="shrink-0 w-2.5 h-2.5 rounded border border-white/30"
                                        style={{ backgroundColor: area.color }}
                                    />
                                    <span className="flex-1 text-xs truncate" title={tech}>
                                        {tech}
                                    </span>
                                    <span
                                        className="shrink-0 min-w-5 text-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
                                        style={{ backgroundColor: area.color }}
                                    >
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                        {areas.length === 0 && (
                            <p className="text-xs text-neutral-900 px-3 py-3">{i18n('pages.orders.map.noAreas')}</p>
                        )}
                    </div>
                    {/* Total */}
                    <div className="px-3 py-2 border-t border-neutral-800 flex items-center justify-between">
                        <span className="text-xs text-neutral-900">Total</span>
                        <span className="text-xs font-semibold">{orders.length}</span>
                    </div>
                </div>
            </div>

            {/* Delete area confirmation dialog */}
            <Modal
                id="delete-area-confirm"
                isOpen={deleteConfirmId !== null}
                onOpen={() => {}}
                onClose={() => setDeleteConfirmId(null)}
            >
                <Window title="Eliminar área" icon={PolygonIcon} className="w-full max-w-sm px-4">
                    <Form
                        onSubmit={() => {
                            if (deleteConfirmId !== null) {
                                onAreaDeleteRef.current?.(deleteConfirmId);
                                setDeleteConfirmId(null);
                            }
                        }}
                    >
                        <div className="flex flex-col items-center gap-3 py-4 text-center">
                            <SealWarningIcon size={40} className="text-secondary-500" weight="duotone" />
                            <p className="text-sm">
                                ¿Eliminar esta área? Las órdenes asignadas a través de ella serán desasignadas.
                            </p>
                        </div>
                        <Actions
                            submitLabel="Eliminar"
                            onCancel={() => setDeleteConfirmId(null)}
                            isLoading={isAreaMutating ?? false}
                        />
                    </Form>
                </Window>
            </Modal>
        </div>
    );
}
