const EARTH_RADIUS_MILES = 3958.8;

/**
 * Calculate the great-circle distance between two points on Earth
 * using the Haversine formula.
 * @returns Distance in miles
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_MILES * c;
}

/**
 * Compute a bounding box around a center point for a given radius.
 * Useful for fast pre-filtering with database queries before applying
 * the more precise haversine distance check.
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusMiles: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = radiusMiles / 69.0; // ~69 miles per degree of latitude
  const lngDelta = radiusMiles / (69.0 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

/**
 * Format a distance in miles for display.
 * Shows "< 0.1 mi" for very short distances, otherwise rounds to one decimal.
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return "< 0.1 mi";
  }
  return `~${miles.toFixed(1)} mi`;
}
