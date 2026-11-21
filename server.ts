import 'dotenv/config';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  EmergencyCategory,
  IncidentStatus,
  StructuredAddress,
  UserRole
} from './src/types/index.ts';
import { BANGLADESH_DISTRICTS } from './src/data/bangladeshData.ts';
import { calculateHaversineDistance } from './src/utils/geo.ts';
import { buildBangladeshQueryVariants, isValidCoordinatePair } from './src/utils/geolocation.ts';
import {
  sanitizePlainText,
  SlidingWindowRateLimiter,
  validateMediaUpload
} from './src/utils/security.ts';
import {
  addSafePersonRecord,
  assignIncidentTeam,
  createEmergencyRecord,
  markNotificationReadRecord,
  readState,
  sanitizeIncidentForRole,
  transitionIncidentStatus,
  updateEmergencyDetails,
  updateEmergencyLiveLocation,
  verifyIncidentRecord
} from './server/store.ts';

const PORT = 3000;
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const sosRateLimiter = new SlidingWindowRateLimiter(15, 5 * 60 * 1000);
const uploadRateLimiter = new SlidingWindowRateLimiter(25, 5 * 60 * 1000);

const GEOCODER_BASE_URL = (
  process.env.RESQ_GEOCODER_BASE_URL || 'https://nominatim.openstreetmap.org'
).replace(/\/+$/, '');
const OVERPASS_URL =
  process.env.RESQ_OVERPASS_URL || 'https://overpass-api.de/api/interpreter';

interface GeocodeCacheEntry {
  expiresAt: number;
  data: unknown;
}
const geocodeCache = new Map<string, GeocodeCacheEntry>();
let lastNominatimCallMs = 0;

interface NominatimItem {
  place_id?: number | string;
  display_name?: string;
  lat?: string;
  lon?: string;
  type?: string;
  class?: string;
  name?: string;
  namedetails?: Record<string, string>;
  address?: Record<string, string>;
}

function extractStructuredAddress(address?: Record<string, string>): StructuredAddress | undefined {
  if (!address || typeof address !== 'object') return undefined;
  const result: StructuredAddress = {};
  if (address.house_number) result.houseNumber = address.house_number;
  if (address.road || address.pedestrian || address.footway) {
    result.road = address.road || address.pedestrian || address.footway;
  }
  if (address.neighbourhood || address.quarter || address.suburb || address.residential) {
    result.neighborhood =
      address.neighbourhood || address.quarter || address.suburb || address.residential;
  }
  if (address.city_district || address.village || address.hamlet) {
    result.locality = address.city_district || address.village || address.hamlet;
  }
  if (address.town || address.city || address.municipality || address.county) {
    result.upazila = address.town || address.city || address.municipality || address.county;
  }
  if (address.state_district || address.county) {
    result.district = address.state_district || address.county;
  }
  if (address.state) {
    result.division = address.state.replace(/\s+Division$/i, '').trim();
  }
  if (address.postcode) {
    result.postalCode = address.postcode;
  }
  if (address.country) {
    result.country = address.country;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function extractBilingualNames(item: NominatimItem): {
  primaryName: string;
  altName?: string;
  nameEn?: string;
  nameBn?: string;
} {
  const nd = item.namedetails || {};
  const nameEn = nd['name:en'] || undefined;
  const nameBn = nd['name:bn'] || undefined;
  const rawName = item.name || nd.name || item.display_name?.split(',')[0]?.trim() || 'Location';
  const altName =
    nameBn && nameBn !== rawName
      ? nameBn
      : nameEn && nameEn !== rawName
        ? nameEn
        : undefined;
  return {
    primaryName: rawName,
    altName,
    nameEn: nameEn || rawName,
    nameBn
  };
}

function formatOsmCategory(item: NominatimItem): string {
  const raw = item.type || item.class || 'place';
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchNominatimJson(url: string): Promise<unknown | null> {
  const now = Date.now();
  const elapsed = now - lastNominatimCallMs;
  if (elapsed < 1050) {
    await new Promise((r) => setTimeout(r, 1050 - elapsed));
  }
  lastNominatimCallMs = Date.now();

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RESQ-Bangladesh-Academic-SDP/1.0 (https://github.com/SayemSamir/ResQ-Bangladesh)',
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(5500)
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function parseRole(raw: unknown): UserRole {
  const valid: UserRole[] = [
    'citizen',
    'volunteer',
    'rescue_team',
    'operator',
    'hospital_staff',
    'relief_org',
    'district_admin',
    'super_admin'
  ];
  return typeof raw === 'string' && valid.includes(raw as UserRole)
    ? (raw as UserRole)
    : 'citizen';
}

async function startServer() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await readState();

  const app = express();
  app.use(express.json({ limit: '6mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'RESQ Bangladesh API', timestamp: new Date().toISOString() });
  });

  app.get('/api/config/maps', (_req, res) => {
    res.json({ apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || '' });
  });

  app.get('/api/bootstrap', async (req, res) => {
    try {
      const role = parseRole(req.query.role);
      const state = await readState();
      res.json({
        incidents: state.incidents.map((inc) => sanitizeIncidentForRole(inc, role, false)),
        rescueTeams: state.rescueTeams,
        shelters: state.shelters,
        hospitals: state.hospitals,
        alerts: state.alerts,
        safePeople: state.safePeople,
        notifications: state.notifications,
        deliveryLogs: state.deliveryLogs.slice(0, 40)
      });
    } catch {
      res.status(500).json({ error: 'Failed to load operational state.' });
    }
  });

  // One-Tap Guest & Authenticated Emergency Creation
  app.post('/api/emergencies', async (req, res) => {
    const ip = getClientIp(req);
    const limit = sosRateLimiter.check(ip);
    if (!limit.allowed) {
      res.status(429).json({
        error: `Too many SOS submissions from this network. Please wait ${limit.retryAfterSeconds}s or dial 999 directly.`
      });
      return;
    }

    try {
      const body = req.body || {};
      const result = await createEmergencyRecord({
        category: body.category as EmergencyCategory | undefined,
        lat: typeof body.lat === 'number' ? body.lat : null,
        lng: typeof body.lng === 'number' ? body.lng : null,
        accuracyMeters: typeof body.accuracyMeters === 'number' ? body.accuracyMeters : undefined,
        locationSource: body.locationSource,
        locationTimestamp: typeof body.locationTimestamp === 'string' ? body.locationTimestamp : undefined,
        formattedAddress: body.formattedAddress,
        structuredAddress: body.structuredAddress,
        landmark: body.landmark,
        nearbyLandmarkName: body.nearbyLandmarkName,
        nearbyLandmarkCategory: body.nearbyLandmarkCategory,
        nearbyLandmarkDistanceMeters:
          typeof body.nearbyLandmarkDistanceMeters === 'number'
            ? body.nearbyLandmarkDistanceMeters
            : undefined,
        district: body.district,
        upazila: body.upazila,
        division: body.division,
        description: body.description,
        affectedPeople: typeof body.affectedPeople === 'number' ? body.affectedPeople : undefined,
        hasInjured: Boolean(body.hasInjured),
        hasTrapped: Boolean(body.hasTrapped),
        specialNeeds: body.specialNeeds,
        reporterName: body.reporterName,
        reporterPhone: body.reporterPhone,
        emergencyContactPhone: body.emergencyContactPhone,
        isAnonymous: body.isAnonymous,
        isLiveTracking: Boolean(body.isLiveTracking)
      });

      res.status(201).json({
        incident: result.incident,
        trackingCode: result.trackingCode,
        deliveryLogs: result.deliveryLogs
      });
    } catch {
      res.status(400).json({ error: 'Unable to create emergency request.' });
    }
  });

  // Secure Guest Tracking Lookup (requires Emergency ID + Tracking Code)
  app.get('/api/emergencies/track', async (req, res) => {
    const id = sanitizePlainText(req.query.id, 40).toUpperCase();
    const code = sanitizePlainText(req.query.code, 16).toUpperCase();

    if (!id || !code) {
      res.status(400).json({ error: 'Both Emergency ID and Tracking Code are required.' });
      return;
    }

    const state = await readState();
    const inc = state.incidents.find((item) => item.id.toUpperCase() === id);
    if (!inc || !inc.trackingCode || inc.trackingCode.toUpperCase() !== code) {
      res.status(404).json({
        error: 'Emergency record not found or tracking code does not match.'
      });
      return;
    }

    const assignedTeam = inc.assignedTeamId
      ? state.rescueTeams.find((t) => t.id === inc.assignedTeamId) || null
      : null;

    res.json({
      incident: {
        ...inc,
        reporterPhone: inc.reporterPhone,
        emergencyContactPhone: inc.emergencyContactPhone
      },
      assignedTeam: assignedTeam
        ? {
            id: assignedTeam.id,
            name: assignedTeam.name,
            type: assignedTeam.type,
            baseDistrict: assignedTeam.baseDistrict,
            contactPhone: assignedTeam.contactPhone
          }
        : null,
      deliveryLogs: state.deliveryLogs.filter((d) => d.incidentId === inc.id)
    });
  });

  // Optional Additional Details Update After One-Tap SOS
  app.patch('/api/emergencies/:id/details', async (req, res) => {
    try {
      const body = req.body || {};
      const updated = await updateEmergencyDetails(
        req.params.id,
        {
          trackingCode: typeof body.trackingCode === 'string' ? body.trackingCode : undefined,
          role: body.role ? parseRole(body.role) : undefined
        },
        body
      );
      res.json({ incident: updated });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ERROR';
      if (msg === 'NOT_FOUND') {
        res.status(404).json({ error: 'Emergency not found.' });
        return;
      }
      if (msg === 'FORBIDDEN') {
        res.status(403).json({ error: 'Valid tracking code or responder authorization required.' });
        return;
      }
      res.status(400).json({ error: 'Failed to update emergency details.' });
    }
  });

  // Live Location Tracking & Delayed GPS Refinement Update
  app.patch('/api/emergencies/:id/location', async (req, res) => {
    try {
      const body = req.body || {};
      const updated = await updateEmergencyLiveLocation(
        req.params.id,
        {
          trackingCode: typeof body.trackingCode === 'string' ? body.trackingCode : undefined,
          role: body.role ? parseRole(body.role) : undefined
        },
        {
          lat: typeof body.lat === 'number' ? body.lat : null,
          lng: typeof body.lng === 'number' ? body.lng : null,
          accuracyMeters: typeof body.accuracyMeters === 'number' ? body.accuracyMeters : undefined,
          locationSource: body.locationSource,
          formattedAddress: body.formattedAddress,
          structuredAddress: body.structuredAddress,
          nearbyLandmarkName: body.nearbyLandmarkName,
          nearbyLandmarkCategory: body.nearbyLandmarkCategory,
          nearbyLandmarkDistanceMeters:
            typeof body.nearbyLandmarkDistanceMeters === 'number'
              ? body.nearbyLandmarkDistanceMeters
              : undefined,
          isLiveTracking: Boolean(body.isLiveTracking)
        }
      );
      res.json({ incident: updated });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ERROR';
      if (msg === 'NOT_FOUND') {
        res.status(404).json({ error: 'Emergency not found.' });
        return;
      }
      if (msg === 'FORBIDDEN') {
        res.status(403).json({ error: 'Valid tracking code or responder authorization required.' });
        return;
      }
      res.status(400).json({ error: 'Failed to update live location.' });
    }
  });

  // Operator Verification
  app.post('/api/emergencies/:id/verify', async (req, res) => {
    try {
      const body = req.body || {};
      const role = parseRole(body.role);
      const updated = await verifyIncidentRecord(
        req.params.id,
        body.operatorName || 'Duty Officer',
        role
      );
      res.json({ incident: updated });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to verify incident.';
      const status = msg === 'NOT_FOUND' ? 404 : 403;
      res.status(status).json({ error: msg });
    }
  });

  // Authorized Responder Assignment
  app.post('/api/emergencies/:id/assign', async (req, res) => {
    try {
      const body = req.body || {};
      const role = parseRole(body.role);
      const teamId = sanitizePlainText(body.teamId, 40);
      if (!teamId) {
        res.status(400).json({ error: 'Rescue team ID is required.' });
        return;
      }
      const result = await assignIncidentTeam(
        req.params.id,
        teamId,
        role,
        body.actorName || 'Operations Dispatcher'
      );
      res.json(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to assign rescue team.';
      const status = msg === 'NOT_FOUND' || msg === 'TEAM_NOT_FOUND' ? 404 : 400;
      res.status(status).json({ error: msg });
    }
  });

  // Responder / Operator Status Transition (ACCEPTED, IN_PROGRESS, RESOLVED, CANCELLED, REJECTED)
  app.patch('/api/emergencies/:id/status', async (req, res) => {
    try {
      const body = req.body || {};
      const role = parseRole(body.role);
      const nextStatus = body.status as IncidentStatus;
      const updated = await transitionIncidentStatus(
        req.params.id,
        nextStatus,
        role,
        body.note,
        body.actorName
      );
      res.json({ incident: updated });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Status update failed.';
      const status = msg === 'NOT_FOUND' ? 404 : 403;
      res.status(status).json({ error: msg });
    }
  });

  // Secure Photo / Video / Voice Upload
  app.post('/api/uploads', async (req, res) => {
    const ip = getClientIp(req);
    const limit = uploadRateLimiter.check(ip);
    if (!limit.allowed) {
      res.status(429).json({ error: `Upload rate limit reached. Try again in ${limit.retryAfterSeconds}s.` });
      return;
    }

    try {
      const { dataUrl, mimeType } = req.body || {};
      if (typeof dataUrl !== 'string' || !dataUrl.includes(',')) {
        res.status(400).json({ error: 'Invalid media payload.' });
        return;
      }

      const [header, base64Part] = dataUrl.split(',', 2);
      const headerMimeMatch = /^data:([^;]+);base64$/i.exec(header);
      const resolvedMime = mimeType || (headerMimeMatch ? headerMimeMatch[1] : '');
      const buffer = Buffer.from(base64Part, 'base64');

      const validation = validateMediaUpload(resolvedMime, buffer.byteLength);
      if (!validation.valid || !validation.ext || !validation.mediaType) {
        res.status(400).json({ error: validation.error || 'Invalid file.' });
        return;
      }

      const filename = `${crypto.randomUUID()}.${validation.ext}`;
      const targetPath = path.resolve(UPLOADS_DIR, filename);
      if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
        res.status(400).json({ error: 'Invalid storage path.' });
        return;
      }

      await fs.writeFile(targetPath, buffer);
      res.status(201).json({
        id: `MED-${crypto.randomUUID().slice(0, 8)}`,
        url: `/api/uploads/${filename}`,
        type: validation.mediaType,
        mimeType: resolvedMime
      });
    } catch {
      res.status(500).json({ error: 'Failed to store uploaded file.' });
    }
  });

  app.get('/api/uploads/:filename', async (req, res) => {
    const safeName = path.basename(req.params.filename || '');
    const resolved = path.resolve(UPLOADS_DIR, safeName);
    if (!resolved.startsWith(UPLOADS_DIR + path.sep)) {
      res.status(400).json({ error: 'Invalid file request.' });
      return;
    }
    try {
      await fs.access(resolved);
      res.sendFile(resolved);
    } catch {
      res.status(404).json({ error: 'Media file not found.' });
    }
  });

  // Reverse Geocoding Proxy with Structured Address Extraction & Caching
  app.get('/api/geocode/reverse', async (req, res) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!isValidCoordinatePair(lat, lng)) {
      res.status(400).json({ error: 'Valid lat and lng parameters are required.' });
      return;
    }

    const cacheKey = `rev:${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = geocodeCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      res.json(cached.data);
      return;
    }

    let nearestDist = BANGLADESH_DISTRICTS[0];
    let minKm = Infinity;
    for (const d of BANGLADESH_DISTRICTS) {
      const dist = calculateHaversineDistance(lat, lng, d.lat, d.lng);
      if (dist < minKm) {
        minKm = dist;
        nearestDist = d;
      }
    }

    const upstreamUrl = `${GEOCODER_BASE_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&namedetails=1&accept-language=en,bn`;
    const nominatim = (await fetchNominatimJson(upstreamUrl)) as NominatimItem | null;

    if (nominatim?.display_name) {
      const structuredAddress = extractStructuredAddress(nominatim.address);
      const names = extractBilingualNames(nominatim);
      const payload = {
        formattedAddress: nominatim.display_name,
        structuredAddress,
        district: structuredAddress?.district || nearestDist.name,
        upazila: structuredAddress?.upazila || structuredAddress?.neighborhood || nearestDist.upazilas[0],
        division: structuredAddress?.division || nearestDist.division,
        nameEn: names.nameEn,
        nameBn: names.nameBn,
        source: 'nominatim'
      };
      geocodeCache.set(cacheKey, { expiresAt: Date.now() + 15 * 60 * 1000, data: payload });
      res.json(payload);
      return;
    }

    const fallbackPayload = {
      formattedAddress: `Approximate area near ${nearestDist.name}, ${nearestDist.division} (~${minKm} km from district center)`,
      structuredAddress: undefined,
      district: nearestDist.name,
      upazila: nearestDist.upazilas[0],
      division: nearestDist.division,
      source: 'local_fallback'
    };
    geocodeCache.set(cacheKey, { expiresAt: Date.now() + 2 * 60 * 1000, data: fallbackPayload });
    res.json(fallbackPayload);
  });

  // Bilingual OpenStreetMap Location & Landmark Search (no hardcoded/fake results)
  app.get('/api/geocode/search', async (req, res) => {
    const q = sanitizePlainText(req.query.q, 140);
    if (q.length < 2) {
      res.json({ results: [] });
      return;
    }

    const cacheKey = `search:${q.toLowerCase()}`;
    const cached = geocodeCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      res.json(cached.data);
      return;
    }

    const variants = buildBangladeshQueryVariants(q);
    let upstream: NominatimItem[] | null = null;

    for (const variant of variants) {
      const upstreamUrl = `${GEOCODER_BASE_URL}/search?format=jsonv2&countrycodes=bd&limit=8&addressdetails=1&namedetails=1&accept-language=en,bn&q=${encodeURIComponent(
        variant
      )}`;
      const resJson = (await fetchNominatimJson(upstreamUrl)) as NominatimItem[] | null;
      if (resJson === null) {
        upstream = null;
        break;
      }
      upstream = resJson;
      if (Array.isArray(resJson) && resJson.length > 0) {
        break;
      }
    }

    if (upstream === null) {
      res.json({
        results: [],
        providerUnavailable: true,
        error: 'Location search service is temporarily unreachable. You can pick on map or enter address details below.'
      });
      return;
    }

    const results = upstream
      .filter((item) => isValidCoordinatePair(Number(item.lat), Number(item.lon)))
      .map((item) => {
        const structuredAddress = extractStructuredAddress(item.address);
        const names = extractBilingualNames(item);
        const area =
          structuredAddress?.neighborhood ||
          structuredAddress?.locality ||
          structuredAddress?.upazila ||
          '';
        const district = structuredAddress?.district || structuredAddress?.division || '';
        return {
          id: String(item.place_id || `${item.lat},${item.lon}`),
          label: item.display_name || names.primaryName,
          primaryName: names.primaryName,
          altName: names.altName,
          category: formatOsmCategory(item),
          area,
          upazila: structuredAddress?.upazila || '',
          district,
          lat: Number(Number(item.lat).toFixed(6)),
          lng: Number(Number(item.lon).toFixed(6)),
          structuredAddress,
          source: 'nominatim'
        };
      });

    const payload = { results };
    geocodeCache.set(cacheKey, { expiresAt: Date.now() + 15 * 60 * 1000, data: payload });
    res.json(payload);
  });

  // Nearby Landmarks Discovery via OpenStreetMap Overpass API + Nominatim Bounded POI Fallback
  app.get('/api/geocode/nearby', async (req, res) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!isValidCoordinatePair(lat, lng)) {
      res.status(400).json({ error: 'Valid lat and lng parameters are required.' });
      return;
    }

    const cacheKey = `nearby:${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = geocodeCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      res.json(cached.data);
      return;
    }

    const overpassQuery = `[out:json][timeout:4];(node(around:1500,${lat},${lng})[amenity~"^(hospital|clinic|pharmacy|police|fire_station|school|college|marketplace|bus_station|place_of_worship)$"];way(around:1500,${lat},${lng})[amenity~"^(hospital|clinic|pharmacy|police|fire_station|school|college|marketplace|bus_station|place_of_worship)$"];node(around:1500,${lat},${lng})[railway="station"];);out center 25;`;

    interface NearbyLandmarkOut {
      id: string;
      name: string;
      nameEn?: string;
      nameBn?: string;
      category: string;
      lat: number;
      lng: number;
      distanceMeters: number;
    }

    let landmarks: NearbyLandmarkOut[] = [];
    let resolvedSource: 'overpass' | 'nominatim_nearby' | 'unavailable' = 'unavailable';

    try {
      const response = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent': 'RESQ-Bangladesh-Academic-SDP/1.0'
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
        signal: AbortSignal.timeout(3500)
      });

      if (response.ok) {
        const data = (await response.json()) as {
          elements?: Array<{
            id: number | string;
            type?: string;
            lat?: number;
            lon?: number;
            center?: { lat: number; lon: number };
            tags?: Record<string, string>;
          }>;
        };

        const seenNames = new Set<string>();
        landmarks = (Array.isArray(data.elements) ? data.elements : [])
          .map((el): NearbyLandmarkOut | null => {
            const tags = el.tags || {};
            const name = tags['name:en'] || tags.name || tags['name:bn'];
            const pLat = typeof el.lat === 'number' ? el.lat : el.center?.lat;
            const pLng = typeof el.lon === 'number' ? el.lon : el.center?.lon;
            if (!name || !isValidCoordinatePair(pLat, pLng)) return null;
            const key = name.trim().toLowerCase();
            if (seenNames.has(key)) return null;
            seenNames.add(key);

            const rawCategory =
              tags.amenity || (tags.railway === 'station' ? 'railway_station' : 'landmark');
            const category = rawCategory
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());
            const distanceMeters = Math.round(
              calculateHaversineDistance(lat, lng, pLat as number, pLng as number) * 1000
            );

            return {
              id: `${el.type || 'node'}-${el.id}`,
              name: tags.name || name,
              nameEn: tags['name:en'] || undefined,
              nameBn: tags['name:bn'] || undefined,
              category,
              lat: Number((pLat as number).toFixed(6)),
              lng: Number((pLng as number).toFixed(6)),
              distanceMeters
            };
          })
          .filter((item): item is NearbyLandmarkOut => item !== null)
          .sort((a, b) => a.distanceMeters - b.distanceMeters)
          .slice(0, 12);

        if (landmarks.length > 0) {
          resolvedSource = 'overpass';
        }
      }
    } catch {
      // Fall back to bounded Nominatim POI search below
    }

    // Fallback to OpenStreetMap Nominatim bounded viewbox POI lookup when Overpass is unavailable
    if (landmarks.length === 0) {
      const delta = 0.018;
      const viewbox = `${(lng - delta).toFixed(5)},${(lat + delta).toFixed(5)},${(lng + delta).toFixed(5)},${(lat - delta).toFixed(5)}`;
      const poiTerms = ['hospital', 'school', 'mosque', 'bazar'];
      const seenNames = new Set<string>();
      const fallbackCollected: NearbyLandmarkOut[] = [];

      for (const term of poiTerms) {
        const nomUrl = `${GEOCODER_BASE_URL}/search?format=jsonv2&countrycodes=bd&bounded=1&viewbox=${encodeURIComponent(
          viewbox
        )}&limit=4&namedetails=1&accept-language=en,bn&q=${encodeURIComponent(term)}`;
        const items = (await fetchNominatimJson(nomUrl)) as NominatimItem[] | null;
        if (!Array.isArray(items)) continue;
        for (const item of items) {
          const pLat = Number(item.lat);
          const pLng = Number(item.lon);
          if (!isValidCoordinatePair(pLat, pLng)) continue;
          const names = extractBilingualNames(item);
          const key = names.primaryName.trim().toLowerCase();
          if (seenNames.has(key)) continue;
          seenNames.add(key);

          const distanceMeters = Math.round(calculateHaversineDistance(lat, lng, pLat, pLng) * 1000);
          if (distanceMeters > 2500) continue;

          fallbackCollected.push({
            id: `nom-${item.place_id || `${pLat},${pLng}`}`,
            name: names.primaryName,
            nameEn: names.nameEn,
            nameBn: names.nameBn,
            category: formatOsmCategory(item),
            lat: Number(pLat.toFixed(6)),
            lng: Number(pLng.toFixed(6)),
            distanceMeters
          });
        }
      }

      if (fallbackCollected.length > 0) {
        landmarks = fallbackCollected
          .sort((a, b) => a.distanceMeters - b.distanceMeters)
          .slice(0, 12);
        resolvedSource = 'nominatim_nearby';
      }
    }

    const payload = { landmarks, source: resolvedSource };
    if (landmarks.length > 0) {
      geocodeCache.set(cacheKey, { expiresAt: Date.now() + 15 * 60 * 1000, data: payload });
    }
    res.json(payload);
  });

  // Safe Registry & Notifications
  app.post('/api/safe-people', async (req, res) => {
    const { name, phone, location, notes } = req.body || {};
    if (!name || !phone) {
      res.status(400).json({ error: 'Name and phone number are required.' });
      return;
    }
    const record = await addSafePersonRecord({ name, phone, location, notes });
    res.status(201).json({ person: record });
  });

  app.post('/api/notifications/:id/read', async (req, res) => {
    await markNotificationReadRecord(req.params.id);
    res.json({ ok: true });
  });

  // Vite dev middleware or static production build
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RESQ Bangladesh full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start RESQ Bangladesh server:', err);
  process.exit(1);
});
