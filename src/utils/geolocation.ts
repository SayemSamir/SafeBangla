import type { LocationSource, LocationStatus } from '../types';

export type GpsAccuracyTier = 'high' | 'moderate' | 'poor' | 'unknown';

export type GeolocationFailureReason =
  | 'unsupported'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'poor_accuracy'
  | 'invalid_coordinates'
  | 'unknown';

export const GPS_FALLBACK_GUIDANCE_EN =
  'Your location could not be detected. You can still request emergency help. Select your location on the map or enter a nearby landmark.';

export const GPS_FALLBACK_GUIDANCE_BN =
  'আপনার অবস্থান শনাক্ত করা যায়নি। তবুও আপনি জরুরি সহায়তা চাইতে পারবেন। ম্যাপ থেকে অবস্থান বেছে নিন অথবা কাছাকাছি কোনো পরিচিত স্থান লিখুন।';

export function isValidCoordinatePair(lat: unknown, lng: unknown): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  // Reject 0,0 null-island unless explicitly set (Bangladesh is ~20-27N, 88-93E)
  if (lat === 0 && lng === 0) return false;
  return true;
}

export function isWithinBangladeshBounds(lat: number, lng: number): boolean {
  return lat >= 20.3 && lat <= 26.7 && lng >= 88.0 && lng <= 92.8;
}

export function isCoordinateFresh(
  timestampMs: number,
  nowMs = Date.now(),
  maxAgeMs = 2 * 60 * 1000
): boolean {
  if (!Number.isFinite(timestampMs) || timestampMs <= 0) return false;
  return nowMs - timestampMs <= maxAgeMs;
}

export function resolveLocationStatus(
  lat: number | null | undefined,
  lng: number | null | undefined,
  locationSource: LocationSource,
  landmark?: string
): LocationStatus {
  const hasCoords = isValidCoordinatePair(lat, lng);
  if (hasCoords && locationSource === 'gps') return 'GPS_RECEIVED';
  if (
    hasCoords &&
    (locationSource === 'map_manual' ||
      locationSource === 'address_manual' ||
      locationSource === 'shared_location')
  ) {
    return 'MANUAL_PIN';
  }
  if (locationSource === 'landmark' || (landmark && landmark.trim().length > 0)) {
    return 'LANDMARK_ONLY';
  }
  return 'LOCATION_PENDING';
}

export function shouldReplaceGpsFix(
  current: {
    lat: number | null;
    lng: number | null;
    accuracyMeters?: number;
    source: LocationSource;
  },
  incoming: {
    lat: number;
    lng: number;
    accuracyMeters?: number;
  }
): boolean {
  if (!isValidCoordinatePair(incoming.lat, incoming.lng)) return false;
  // Never silently overwrite an explicit user-confirmed pin, address, or shared location with background GPS
  if (
    (current.source === 'map_manual' ||
      current.source === 'address_manual' ||
      current.source === 'shared_location') &&
    isValidCoordinatePair(current.lat, current.lng)
  ) {
    return false;
  }
  if (!isValidCoordinatePair(current.lat, current.lng) || current.source !== 'gps') {
    return true;
  }
  if (typeof incoming.accuracyMeters !== 'number' || !Number.isFinite(incoming.accuracyMeters)) {
    return false;
  }
  if (typeof current.accuracyMeters !== 'number' || !Number.isFinite(current.accuracyMeters)) {
    return true;
  }
  // Replace if accuracy improves or is already high precision fresh fix
  return incoming.accuracyMeters < current.accuracyMeters || incoming.accuracyMeters <= 25;
}

export function classifyGpsAccuracy(accuracyMeters?: number): {
  tier: GpsAccuracyTier;
  labelEn: string;
  labelBn: string;
  isReliable: boolean;
} {
  if (typeof accuracyMeters !== 'number' || !Number.isFinite(accuracyMeters) || accuracyMeters <= 0) {
    return {
      tier: 'unknown',
      labelEn: 'Accuracy unknown',
      labelBn: 'নির্ভুলতা অজানা',
      isReliable: false
    };
  }
  if (accuracyMeters <= 35) {
    return {
      tier: 'high',
      labelEn: `High accuracy (±${Math.round(accuracyMeters)}m)`,
      labelBn: `উচ্চ নির্ভুলতা (±${Math.round(accuracyMeters)} মিটার)`,
      isReliable: true
    };
  }
  if (accuracyMeters <= 150) {
    return {
      tier: 'moderate',
      labelEn: `Moderate accuracy (±${Math.round(accuracyMeters)}m)`,
      labelBn: `মাঝারি নির্ভুলতা (±${Math.round(accuracyMeters)} মিটার)`,
      isReliable: true
    };
  }
  return {
    tier: 'poor',
    labelEn: `Low GPS precision (±${Math.round(accuracyMeters)}m) — verify on map`,
    labelBn: `কম নির্ভুলতা (±${Math.round(accuracyMeters)} মিটার) — ম্যাপে যাচাই করুন`,
    isReliable: false
  };
}

export function mapGeolocationError(code?: number): {
  reason: GeolocationFailureReason;
  messageEn: string;
  messageBn: string;
} {
  if (code === 1) {
    return {
      reason: 'permission_denied',
      messageEn: GPS_FALLBACK_GUIDANCE_EN,
      messageBn: GPS_FALLBACK_GUIDANCE_BN
    };
  }
  if (code === 2) {
    return {
      reason: 'position_unavailable',
      messageEn: GPS_FALLBACK_GUIDANCE_EN,
      messageBn: GPS_FALLBACK_GUIDANCE_BN
    };
  }
  if (code === 3) {
    return {
      reason: 'timeout',
      messageEn: GPS_FALLBACK_GUIDANCE_EN,
      messageBn: GPS_FALLBACK_GUIDANCE_BN
    };
  }
  return {
    reason: 'unknown',
    messageEn: GPS_FALLBACK_GUIDANCE_EN,
    messageBn: GPS_FALLBACK_GUIDANCE_BN
  };
}

export function formatLocationSourceLabel(
  source: LocationSource,
  language: 'en' | 'bn' = 'en'
): string {
  if (source === 'gps') return language === 'bn' ? 'স্বয়ংক্রিয় জিপিএস' : 'GPS';
  if (source === 'map_manual') return language === 'bn' ? 'ম্যাপ পিন (ম্যানুয়াল)' : 'Manual Pin';
  if (source === 'address_manual') {
    return language === 'bn' ? 'নির্বাচিত / লিখিত ঠিকানা' : 'Manual Address';
  }
  if (source === 'shared_location') {
    return language === 'bn' ? 'শেয়ারকৃত অবস্থান (SHARED_LOCATION)' : 'Shared Location (SHARED_LOCATION)';
  }
  if (source === 'landmark') return language === 'bn' ? 'পরিচিত স্থান / ল্যান্ডমার্ক' : 'Landmark';
  return language === 'bn' ? 'অবস্থান প্রক্রিয়াধীন' : 'Location Pending';
}

export function formatLocationStatusLabel(
  status: LocationStatus | undefined,
  source: LocationSource,
  language: 'en' | 'bn' = 'en'
): string {
  if (source === 'shared_location') {
    return language === 'bn' ? 'শেয়ারকৃত অবস্থান নিশ্চিত' : 'Shared Location Received';
  }
  if (source === 'address_manual') {
    return language === 'bn' ? 'ঠিকানা নির্বাচিত' : 'Address Confirmed';
  }
  const effective: LocationStatus =
    status ||
    (source === 'gps'
      ? 'GPS_RECEIVED'
      : source === 'map_manual'
        ? 'MANUAL_PIN'
        : source === 'landmark'
          ? 'LANDMARK_ONLY'
          : 'LOCATION_PENDING');
  if (effective === 'GPS_RECEIVED') {
    return language === 'bn' ? 'জিপিএস অবস্থান গৃহীত' : 'GPS Location Received';
  }
  if (effective === 'MANUAL_PIN') {
    return language === 'bn' ? 'ম্যানুয়াল পিন নির্বাচিত' : 'Manual Pin Selected';
  }
  if (effective === 'LANDMARK_ONLY') {
    return language === 'bn' ? 'ল্যান্ডমার্ক প্রদান করা হয়েছে' : 'Landmark Provided';
  }
  return language === 'bn' ? 'অবস্থান প্রক্রিয়াধীন' : 'Location Pending';
}

export function buildExternalMapLinks(lat: number, lng: number) {
  const safeLat = Number(lat.toFixed(6));
  const safeLng = Number(lng.toFixed(6));
  return {
    openStreetMap: `https://www.openstreetmap.org/?mlat=${safeLat}&mlon=${safeLng}#map=16/${safeLat}/${safeLng}`,
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${safeLat},${safeLng}`,
    googleDirections: `https://www.google.com/maps/dir/?api=1&destination=${safeLat},${safeLng}`
  };
}

export interface ParsedSharedLocationResult {
  valid: boolean;
  lat?: number;
  lng?: number;
  provider?: 'google_maps' | 'openstreetmap';
  errorEn?: string;
  errorBn?: string;
}

const GOOGLE_MAPS_HOSTS = new Set([
  'google.com',
  'www.google.com',
  'maps.google.com',
  'www.google.com.bd',
  'google.com.bd'
]);

const OSM_HOSTS = new Set(['openstreetmap.org', 'www.openstreetmap.org']);

function parseCoordPairFromString(raw: string | null): { lat: number; lng: number } | null {
  if (!raw) return null;
  const match = raw.trim().match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!isValidCoordinatePair(lat, lng)) return null;
  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
}

export function parseSharedLocationUrl(rawInput: string): ParsedSharedLocationResult {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) {
    return {
      valid: false,
      errorEn: 'Paste a Google Maps or OpenStreetMap location link.',
      errorBn: 'একটি Google Maps বা OpenStreetMap লোকেশন লিংক দিন।'
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      errorEn: 'Invalid link format. Copy the full https:// Google Maps or OpenStreetMap link.',
      errorBn: 'সঠিক লিংক নয়। সম্পূর্ণ https:// Google Maps বা OpenStreetMap লিংক কপি করুন।'
    };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      valid: false,
      errorEn: 'Unsupported link protocol. Only http/https map links are allowed.',
      errorBn: 'অসমর্থিত লিংক। শুধুমাত্র http/https ম্যাপ লিংক গ্রহণযোগ্য।'
    };
  }

  const host = parsed.hostname.toLowerCase();

  if (host === 'maps.app.goo.gl' || host === 'goo.gl') {
    return {
      valid: false,
      errorEn:
        'Shortened links cannot be safely expanded offline. Open the link in Maps, copy the full URL containing coordinates, or search the area name above.',
      errorBn:
        'শর্ট লিংক থেকে সরাসরি স্থানাঙ্ক বের করা যায় না। ম্যাপে খুলে পূর্ণ লিংক কপি করুন অথবা উপরে এলাকার নাম দিয়ে খুঁজুন।'
    };
  }

  if (GOOGLE_MAPS_HOSTS.has(host)) {
    const queryCandidates = [
      parsed.searchParams.get('q'),
      parsed.searchParams.get('query'),
      parsed.searchParams.get('ll'),
      parsed.searchParams.get('destination'),
      parsed.searchParams.get('center')
    ];
    for (const candidate of queryCandidates) {
      const coords = parseCoordPairFromString(candidate);
      if (coords) {
        return { valid: true, lat: coords.lat, lng: coords.lng, provider: 'google_maps' };
      }
    }

    const atMatch = parsed.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (atMatch) {
      const lat = Number(atMatch[1]);
      const lng = Number(atMatch[2]);
      if (isValidCoordinatePair(lat, lng)) {
        return {
          valid: true,
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          provider: 'google_maps'
        };
      }
    }

    const bangMatch = parsed.href.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (bangMatch) {
      const lat = Number(bangMatch[1]);
      const lng = Number(bangMatch[2]);
      if (isValidCoordinatePair(lat, lng)) {
        return {
          valid: true,
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          provider: 'google_maps'
        };
      }
    }

    return {
      valid: false,
      errorEn: 'No coordinates found in this Google Maps URL.',
      errorBn: 'এই Google Maps লিংকে কোনো অক্ষাংশ/দ্রাঘিমাংশ পাওয়া যায়নি।'
    };
  }

  if (OSM_HOSTS.has(host)) {
    const mlat = Number(parsed.searchParams.get('mlat'));
    const mlon = Number(parsed.searchParams.get('mlon'));
    if (isValidCoordinatePair(mlat, mlon)) {
      return {
        valid: true,
        lat: Number(mlat.toFixed(6)),
        lng: Number(mlon.toFixed(6)),
        provider: 'openstreetmap'
      };
    }

    const hashMatch = parsed.hash.match(/#map=\d+\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/);
    if (hashMatch) {
      const lat = Number(hashMatch[1]);
      const lng = Number(hashMatch[2]);
      if (isValidCoordinatePair(lat, lng)) {
        return {
          valid: true,
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          provider: 'openstreetmap'
        };
      }
    }

    return {
      valid: false,
      errorEn: 'No coordinates found in this OpenStreetMap URL.',
      errorBn: 'এই OpenStreetMap লিংকে কোনো স্থানাঙ্ক পাওয়া যায়নি।'
    };
  }

  return {
    valid: false,
    errorEn: 'Only Google Maps or OpenStreetMap links are supported.',
    errorBn: 'শুধুমাত্র Google Maps অথবা OpenStreetMap লিংক সমর্থিত।'
  };
}

const BD_SPELLING_PAIRS: [RegExp, string][] = [
  [/\bchittagong\b/gi, 'Chattogram'],
  [/\bchattogram\b/gi, 'Chittagong'],
  [/\bbarisal\b/gi, 'Barishal'],
  [/\bbarishal\b/gi, 'Barisal'],
  [/\bjessore\b/gi, 'Jashore'],
  [/\bjashore\b/gi, 'Jessore'],
  [/\bcomilla\b/gi, 'Cumilla'],
  [/\bcumilla\b/gi, 'Comilla'],
  [/\bbogra\b/gi, 'Bogura'],
  [/\bbogura\b/gi, 'Bogra'],
  [/\bdacca\b/gi, 'Dhaka']
];

export function buildBangladeshQueryVariants(query: string): string[] {
  const clean = query.trim();
  if (!clean) return [];
  const variants = new Set<string>([clean]);
  for (const [pattern, replacement] of BD_SPELLING_PAIRS) {
    if (pattern.test(clean)) {
      variants.add(clean.replace(pattern, replacement));
    }
  }
  return Array.from(variants);
}

