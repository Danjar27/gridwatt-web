import proj4 from 'proj4';

/**
 * Ecuador UTM Zone 17S (EPSG:32717).
 * Orders store coordinates as (X=Easting, Y=Northing) in this projection.
 * Leaflet/OpenStreetMap expect (lat, lng) in WGS84.
 */
const UTM_17S = '+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs';
const WGS84 = '+proj=longlat +datum=WGS84 +no_defs';

/**
 * Convert UTM Zone 17S easting/northing to WGS84 [latitude, longitude].
 * Returns null if the inputs are not valid UTM values.
 */
export function utmToLatLng(
    easting: number,
    northing: number
): [number, number] | null {
    // Basic sanity check – UTM 17S valid range
    if (easting < 100_000 || easting > 900_000 || northing < 0 || northing > 10_000_000) {
        return null;
    }
    try {
        const [lng, lat] = proj4(UTM_17S, WGS84, [easting, northing]);
        return [lat, lng];
    } catch {
        return null;
    }
}
