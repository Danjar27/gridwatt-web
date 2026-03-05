import { utmToLatLng } from './coordinates.ts';
import type { AreaCoordinate } from '@interfaces/area.interface.ts';
import type { OrderMapPoint } from '@interfaces/order.interface.ts';

export function isPointInPolygon(lat: number, lng: number, coords: Array<AreaCoordinate>): boolean {
    if (coords.length < 3) return false;
    let inside = false;
    const n = coords.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = coords[i].lng;
        const yi = coords[i].lat;
        const xj = coords[j].lng;
        const yj = coords[j].lat;
        const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

export function getOrderIdsInPolygon(orders: Array<OrderMapPoint>, coords: Array<AreaCoordinate>): Array<string> {
    return orders
        .filter((order) => {
            if (order.coordinateX == null || order.coordinateY == null) return false;
            const wgs = utmToLatLng(order.coordinateX, order.coordinateY);
            return wgs !== null && isPointInPolygon(wgs[0], wgs[1], coords);
        })
        .map((order) => order.id);
}
