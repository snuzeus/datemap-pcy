import type { Place } from '@/types';

const EARTH_RADIUS_KM = 6371;
const WALKING_SPEED_KM_PER_HOUR = 4.5;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function isValidCoordinate(place: Place) {
  return Number.isFinite(place.lat) && Number.isFinite(place.lng);
}

function distanceKm(from: Place, to: Place) {
  const latDelta = toRadians(to.lat - from.lat);
  const lngDelta = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export type CourseSummary = {
  placeCount: number;
  distanceKm: number | null;
  durationMinutes: number | null;
  hasEnoughCoordinates: boolean;
};

export function getCourseSummary(places: Place[]): CourseSummary {
  const points = places.filter(isValidCoordinate);

  if (points.length < 2) {
    return {
      placeCount: places.length,
      distanceKm: null,
      durationMinutes: null,
      hasEnoughCoordinates: false,
    };
  }

  const distance = points.slice(1).reduce((total, point, index) => {
    return total + distanceKm(points[index], point);
  }, 0);

  return {
    placeCount: places.length,
    distanceKm: distance,
    durationMinutes: Math.max(1, Math.round((distance / WALKING_SPEED_KM_PER_HOUR) * 60)),
    hasEnoughCoordinates: points.length === places.length,
  };
}

export function formatDistance(distanceKm: number | null) {
  if (distanceKm === null) return '계산 불가';
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  return `${distanceKm.toFixed(1)}km`;
}

export function formatDuration(durationMinutes: number | null) {
  if (durationMinutes === null) return '계산 불가';
  if (durationMinutes < 60) return `약 ${durationMinutes}분`;

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return minutes > 0 ? `약 ${hours}시간 ${minutes}분` : `약 ${hours}시간`;
}
