import { CycloneShelter, Hospital, IncidentReport } from '../types';

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula (returns distance in kilometers).
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Finds the nearest cyclone shelter from a given coordinate.
 */
export function findNearestShelter(
  lat: number,
  lng: number,
  shelters: CycloneShelter[]
): { shelter: CycloneShelter; distanceKm: number } | null {
  if (!shelters || shelters.length === 0) return null;

  let nearest = shelters[0];
  let minDistance = calculateHaversineDistance(lat, lng, nearest.lat, nearest.lng);

  for (let i = 1; i < shelters.length; i++) {
    const dist = calculateHaversineDistance(lat, lng, shelters[i].lat, shelters[i].lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = shelters[i];
    }
  }

  return { shelter: nearest, distanceKm: minDistance };
}

/**
 * Finds the nearest hospital from a given coordinate.
 */
export function findNearestHospital(
  lat: number,
  lng: number,
  hospitals: Hospital[]
): { hospital: Hospital; distanceKm: number } | null {
  if (!hospitals || hospitals.length === 0) return null;

  let nearest = hospitals[0];
  let minDistance = calculateHaversineDistance(lat, lng, nearest.lat, nearest.lng);

  for (let i = 1; i < hospitals.length; i++) {
    const dist = calculateHaversineDistance(lat, lng, hospitals[i].lat, hospitals[i].lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = hospitals[i];
    }
  }

  return { hospital: nearest, distanceKm: minDistance };
}

/**
 * Checks if a new incident is a duplicate of an existing incident
 * based on spatial proximity (< 1.5 km) and matching disaster category.
 */
export function findPotentialDuplicates(
  newLat: number,
  newLng: number,
  category: string,
  existingIncidents: IncidentReport[],
  thresholdKm = 1.5
): IncidentReport[] {
  return existingIncidents.filter((incident) => {
    if (incident.category !== category) return false;
    const dist = calculateHaversineDistance(newLat, newLng, incident.location.lat, incident.location.lng);
    return dist <= thresholdKm;
  });
}
