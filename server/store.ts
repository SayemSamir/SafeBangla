import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  AuditLogEntry,
  CycloneShelter,
  DisasterAlert,
  EmergencyCategory,
  Hospital,
  IncidentMedia,
  IncidentReport,
  IncidentStatus,
  LocationCoordinates,
  NotificationDeliveryLog,
  RescueTeam,
  StructuredAddress,
  UserRole
} from '../src/types/index.ts';
import {
  BANGLADESH_DISTRICTS,
  INITIAL_ALERTS,
  INITIAL_HOSPITALS,
  INITIAL_INCIDENTS,
  INITIAL_RESCUE_TEAMS,
  INITIAL_SHELTERS
} from '../src/data/bangladeshData.ts';
import { generateAiAssessment } from '../src/utils/aiEngine.ts';
import { calculateHaversineDistance, findPotentialDuplicates } from '../src/utils/geo.ts';
import { canTransitionStatus } from '../src/utils/dispatch.ts';
import { isValidCoordinatePair, resolveLocationStatus } from '../src/utils/geolocation.ts';
import {
  generateTrackingCode,
  maskPhoneNumber,
  sanitizePlainText
} from '../src/utils/security.ts';

export interface SafePersonRecord {
  id: string;
  name: string;
  phone: string;
  location: string;
  notes: string;
  timestamp: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'urgent' | 'info' | 'dispatch';
  incidentId?: string;
}

export interface DatabaseState {
  incidents: IncidentReport[];
  rescueTeams: RescueTeam[];
  shelters: CycloneShelter[];
  hospitals: Hospital[];
  alerts: DisasterAlert[];
  safePeople: SafePersonRecord[];
  notifications: NotificationRecord[];
  deliveryLogs: NotificationDeliveryLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'resq_db.json');

const PRIVILEGED_ROLES: UserRole[] = [
  'operator',
  'rescue_team',
  'hospital_staff',
  'district_admin',
  'super_admin'
];

const INITIAL_SAFE_PEOPLE: SafePersonRecord[] = [
  {
    id: 'SAFE-1',
    name: 'Farhana Yasmin',
    phone: '01712345678',
    location: "Teknaf High School Shelter, Cox's Bazar",
    notes: 'Reached shelter safely with 2 kids and elder mother.',
    timestamp: '2026-11-05T16:00:00Z'
  },
  {
    id: 'SAFE-2',
    name: 'Mahbubur Rahman',
    phone: '01898765432',
    location: 'Tahirpur Upazila Parishad, Sunamganj',
    notes: 'Safe on high ground, livestock secured.',
    timestamp: '2026-11-05T17:30:00Z'
  }
];

const INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: 'NOTIF-1',
    title: 'Special Cyclone Warning (Signal 7 - Demo)',
    message: "Coastal evacuation guidance active for Cox's Bazar and Chattogram polders.",
    timestamp: '10m ago',
    read: false,
    type: 'urgent'
  },
  {
    id: 'NOTIF-2',
    title: 'Rescue Mission Dispatched (Demo)',
    message: 'Swiftwater Rescue Unit deployed to Tahirpur flash flood zone.',
    timestamp: '25m ago',
    read: false,
    type: 'dispatch'
  }
];

let cachedState: DatabaseState | null = null;
let txChain: Promise<unknown> = Promise.resolve();

function createInitialState(): DatabaseState {
  return {
    incidents: structuredClone(INITIAL_INCIDENTS),
    rescueTeams: structuredClone(INITIAL_RESCUE_TEAMS),
    shelters: structuredClone(INITIAL_SHELTERS),
    hospitals: structuredClone(INITIAL_HOSPITALS),
    alerts: structuredClone(INITIAL_ALERTS),
    safePeople: structuredClone(INITIAL_SAFE_PEOPLE),
    notifications: structuredClone(INITIAL_NOTIFICATIONS),
    deliveryLogs: []
  };
}

async function ensureLoaded(): Promise<DatabaseState> {
  if (cachedState) return cachedState;
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<DatabaseState>;
    const defaults = createInitialState();
    const normalizedIncidents: IncidentReport[] = Array.isArray(parsed.incidents)
      ? parsed.incidents.map((inc) => {
          const isDemo = Boolean(inc.isDemo);
          const loc = inc.location || {
            lat: null,
            lng: null,
            division: 'Bangladesh',
            district: 'Unspecified Area',
            upazila: 'Unspecified',
            locationSource: 'unlocated' as const
          };
          return {
            ...inc,
            isDemo,
            dataSource: inc.dataSource || (isDemo ? 'demo' : 'real'),
            location: {
              ...loc,
              locationStatus:
                loc.locationStatus ||
                resolveLocationStatus(loc.lat, loc.lng, loc.locationSource, loc.landmark)
            }
          };
        })
      : defaults.incidents;

    cachedState = {
      incidents: normalizedIncidents,
      rescueTeams: Array.isArray(parsed.rescueTeams) ? parsed.rescueTeams : defaults.rescueTeams,
      shelters: Array.isArray(parsed.shelters) ? parsed.shelters : defaults.shelters,
      hospitals: Array.isArray(parsed.hospitals) ? parsed.hospitals : defaults.hospitals,
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts : defaults.alerts,
      safePeople: Array.isArray(parsed.safePeople) ? parsed.safePeople : defaults.safePeople,
      notifications: Array.isArray(parsed.notifications)
        ? parsed.notifications
        : defaults.notifications,
      deliveryLogs: Array.isArray(parsed.deliveryLogs) ? parsed.deliveryLogs : []
    };
  } catch {
    cachedState = createInitialState();
    await persistState(cachedState);
  }
  return cachedState;
}

async function persistState(state: DatabaseState): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${DB_FILE}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(state, null, 2), 'utf-8');
  await fs.rename(tempFile, DB_FILE);
}

export async function withTransaction<T>(fn: (state: DatabaseState) => Promise<T> | T): Promise<T> {
  const run = txChain.then(async () => {
    const state = await ensureLoaded();
    const result = await fn(state);
    await persistState(state);
    return result;
  });
  txChain = run.catch(() => {});
  return run;
}

export async function readState(): Promise<DatabaseState> {
  return ensureLoaded();
}

export function sanitizeIncidentForRole(
  inc: IncidentReport,
  role: UserRole,
  includeTrackingCode = false
): IncidentReport {
  const isPrivileged = PRIVILEGED_ROLES.includes(role);
  return {
    ...inc,
    trackingCode: includeTrackingCode ? inc.trackingCode : undefined,
    reporterPhone: isPrivileged ? inc.reporterPhone : maskPhoneNumber(inc.reporterPhone),
    emergencyContactPhone: isPrivileged
      ? inc.emergencyContactPhone
      : inc.emergencyContactPhone
        ? maskPhoneNumber(inc.emergencyContactPhone)
        : undefined,
    reporterName:
      inc.isAnonymous || !isPrivileged
        ? inc.isAnonymous
          ? 'Anonymous Citizen'
          : inc.reporterName || 'Citizen'
        : inc.reporterName
  };
}

function inferDistrictAndDivision(
  lat: number | null,
  lng: number | null,
  fallbackDistrict?: string,
  landmark?: string
) {
  if (typeof lat === 'number' && typeof lng === 'number' && isValidCoordinatePair(lat, lng)) {
    let best = BANGLADESH_DISTRICTS[0];
    let bestDist = Infinity;
    for (const d of BANGLADESH_DISTRICTS) {
      const dist = calculateHaversineDistance(lat, lng, d.lat, d.lng);
      if (dist < bestDist) {
        bestDist = dist;
        best = d;
      }
    }
    if (bestDist <= 120) {
      return {
        division: best.division,
        district: best.name,
        upazila: best.upazilas[0] || 'Sadar'
      };
    }
  }
  const searchPool = `${fallbackDistrict || ''} ${landmark || ''}`.toLowerCase();
  const matched = BANGLADESH_DISTRICTS.find(
    (d) =>
      d.name.toLowerCase() === (fallbackDistrict || '').toLowerCase() ||
      (searchPool.includes(d.name.toLowerCase()) || (d.nameBn && searchPool.includes(d.nameBn)))
  );
  if (matched) {
    return {
      division: matched.division,
      district: matched.name,
      upazila: matched.upazilas[0] || 'Sadar'
    };
  }
  return {
    division: 'Bangladesh',
    district: fallbackDistrict ? sanitizePlainText(fallbackDistrict, 60) : 'Unspecified Area',
    upazila: 'Unspecified'
  };
}

function createDeliveryLogs(
  incidentId: string,
  summaryMessage: string,
  hasPhone: boolean
): NotificationDeliveryLog[] {
  const now = new Date().toISOString();
  const smsConfigured = Boolean(process.env.RESQ_SMS_GATEWAY_URL);
  const emailConfigured = Boolean(process.env.RESQ_SMTP_URL);

  return [
    {
      id: `DLV-${crypto.randomUUID().slice(0, 8)}`,
      incidentId,
      channel: 'in_app',
      status: 'delivered',
      recipientSummary: 'Citizen & Tracking Session',
      message: summaryMessage,
      timestamp: now,
      providerNote: 'Delivered to RESQ in-app notification bus'
    },
    {
      id: `DLV-${crypto.randomUUID().slice(0, 8)}`,
      incidentId,
      channel: 'dashboard_alert',
      status: 'delivered',
      recipientSummary: 'Operators & Authorized Responders',
      message: summaryMessage,
      timestamp: now,
      providerNote: 'Logged on Operations Command Queue'
    },
    {
      id: `DLV-${crypto.randomUUID().slice(0, 8)}`,
      incidentId,
      channel: 'sms',
      status: smsConfigured && hasPhone ? 'delivered' : 'not_configured',
      recipientSummary: hasPhone ? 'Citizen / Emergency Contact SMS' : 'No phone provided',
      message: summaryMessage,
      timestamp: now,
      providerNote: smsConfigured
        ? 'Dispatched via configured SMS gateway'
        : 'SMS gateway not configured (RESQ_SMS_GATEWAY_URL unset); delivery not sent'
    },
    {
      id: `DLV-${crypto.randomUUID().slice(0, 8)}`,
      incidentId,
      channel: 'email',
      status: emailConfigured ? 'delivered' : 'not_configured',
      recipientSummary: 'District Command Duty Email',
      message: summaryMessage,
      timestamp: now,
      providerNote: emailConfigured
        ? 'Dispatched via SMTP relay'
        : 'Email relay not configured (RESQ_SMTP_URL unset); delivery not sent'
    }
  ];
}

export interface CreateEmergencyInput {
  category?: EmergencyCategory;
  lat?: number | null;
  lng?: number | null;
  accuracyMeters?: number;
  locationSource?: LocationCoordinates['locationSource'];
  locationTimestamp?: string;
  formattedAddress?: string;
  structuredAddress?: StructuredAddress;
  landmark?: string;
  nearbyLandmarkName?: string;
  nearbyLandmarkCategory?: string;
  nearbyLandmarkDistanceMeters?: number;
  district?: string;
  upazila?: string;
  division?: string;
  description?: string;
  affectedPeople?: number;
  hasInjured?: boolean;
  hasTrapped?: boolean;
  specialNeeds?: string;
  reporterName?: string;
  reporterPhone?: string;
  emergencyContactPhone?: string;
  isAnonymous?: boolean;
  isLiveTracking?: boolean;
}

function sanitizeStructuredAddress(raw: unknown): StructuredAddress | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;
  const fields: (keyof StructuredAddress)[] = [
    'houseNumber',
    'road',
    'neighborhood',
    'locality',
    'upazila',
    'district',
    'division',
    'postalCode',
    'country'
  ];
  const out: StructuredAddress = {};
  let hasAny = false;
  for (const key of fields) {
    if (typeof obj[key] === 'string' && obj[key].trim()) {
      out[key] = sanitizePlainText(obj[key], 100);
      hasAny = true;
    }
  }
  return hasAny ? out : undefined;
}

const VALID_LOCATION_SOURCES: LocationCoordinates['locationSource'][] = [
  'gps',
  'map_manual',
  'address_manual',
  'landmark',
  'shared_location',
  'unlocated'
];

function sanitizeLocationSource(
  raw: unknown,
  fallback: LocationCoordinates['locationSource']
): LocationCoordinates['locationSource'] {
  return typeof raw === 'string' && VALID_LOCATION_SOURCES.includes(raw as LocationCoordinates['locationSource'])
    ? (raw as LocationCoordinates['locationSource'])
    : fallback;
}

function formatLandmarkTitle(category: EmergencyCategory, place: string): string {
  return /^near\b/i.test(place) ? `${category} SOS ${place}` : `${category} SOS near ${place}`;
}

export async function createEmergencyRecord(input: CreateEmergencyInput): Promise<{
  incident: IncidentReport;
  trackingCode: string;
  deliveryLogs: NotificationDeliveryLog[];
}> {
  return withTransaction((state) => {
    const now = new Date().toISOString();
    const id = `RESQ-2026-${crypto.randomInt(1000, 9999)}`;
    const trackingCode = generateTrackingCode(6);

    const category: EmergencyCategory = input.category || 'Other Emergency';
    const hasCoords = isValidCoordinatePair(input.lat, input.lng);
    const lat = hasCoords ? Number((input.lat as number).toFixed(6)) : null;
    const lng = hasCoords ? Number((input.lng as number).toFixed(6)) : null;

    const structuredAddress = sanitizeStructuredAddress(input.structuredAddress);
    const inferred = inferDistrictAndDivision(lat, lng, input.district || structuredAddress?.district, input.landmark);
    const division = sanitizePlainText(input.division, 60) || structuredAddress?.division || inferred.division;
    const district = sanitizePlainText(input.district, 60) || structuredAddress?.district || inferred.district;
    const upazila = sanitizePlainText(input.upazila, 60) || structuredAddress?.upazila || inferred.upazila;
    const landmark = sanitizePlainText(input.landmark, 160);
    const formattedAddress = sanitizePlainText(input.formattedAddress, 240);
    const nearbyLandmarkName = sanitizePlainText(input.nearbyLandmarkName, 140);
    const nearbyLandmarkCategory = sanitizePlainText(input.nearbyLandmarkCategory, 60);
    const nearbyLandmarkDistanceMeters =
      typeof input.nearbyLandmarkDistanceMeters === 'number' &&
      Number.isFinite(input.nearbyLandmarkDistanceMeters) &&
      input.nearbyLandmarkDistanceMeters >= 0
        ? Math.round(input.nearbyLandmarkDistanceMeters)
        : undefined;

    let locationSource = sanitizeLocationSource(input.locationSource, 'unlocated');
    if (!hasCoords) {
      locationSource = landmark ? 'landmark' : 'unlocated';
    } else if (locationSource === 'unlocated') {
      locationSource = 'map_manual';
    }
    const locationStatus = resolveLocationStatus(lat, lng, locationSource, landmark);
    const gpsAccuracy =
      locationSource === 'gps' &&
      typeof input.accuracyMeters === 'number' &&
      Number.isFinite(input.accuracyMeters)
        ? Math.round(input.accuracyMeters)
        : undefined;

    const description =
      sanitizePlainText(input.description, 800) ||
      `Urgent ${category} SOS request submitted via One-Tap Emergency Button.`;

    const affectedPeople =
      typeof input.affectedPeople === 'number' && Number.isFinite(input.affectedPeople)
        ? Math.max(1, Math.min(5000, Math.round(input.affectedPeople)))
        : 1;

    const hasInjured = Boolean(input.hasInjured);
    const hasTrapped = Boolean(input.hasTrapped);
    const specialNeeds = sanitizePlainText(input.specialNeeds, 240);

    const aiAssessment = generateAiAssessment({
      title: `${category} SOS at ${landmark || upazila}, ${district}`,
      description,
      affectedPeople,
      hasInjured,
      hasTrapped
    });

    const duplicates = findPotentialDuplicates(lat, lng, category, state.incidents, 1.5);
    if (duplicates.length > 0) {
      aiAssessment.isLikelyDuplicate = true;
      aiAssessment.duplicateOfId = duplicates[0].id;
    }

    const isAnonymous = input.isAnonymous !== undefined ? Boolean(input.isAnonymous) : !input.reporterName;
    const reporterPhone = sanitizePlainText(input.reporterPhone, 30);
    const emergencyContactPhone = sanitizePlainText(input.emergencyContactPhone, 30);

    const auditEntry: AuditLogEntry = {
      id: `AUD-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: now,
      action: 'EMERGENCY_CREATED',
      actor: isAnonymous ? 'Guest Citizen' : sanitizePlainText(input.reporterName, 80) || 'Guest Citizen',
      role: 'citizen',
      newStatus: 'PENDING',
      details: `One-Tap SOS created (${locationStatus}${
        typeof gpsAccuracy === 'number' ? `, ±${gpsAccuracy}m` : ''
      })`
    };

    const incident: IncidentReport = {
      id,
      trackingCode,
      timestamp: now,
      lastUpdatedAt: now,
      category,
      title: landmark
        ? formatLandmarkTitle(category, landmark)
        : nearbyLandmarkName
          ? formatLandmarkTitle(category, nearbyLandmarkName)
          : hasCoords
            ? `${category} SOS in ${upazila}, ${district}`
            : `${category} SOS (Location Pending)`,
      description,
      location: {
        lat,
        lng,
        division,
        district,
        upazila,
        addressDetails: landmark || formattedAddress || undefined,
        formattedAddress: formattedAddress || undefined,
        structuredAddress,
        landmark: landmark || undefined,
        nearbyLandmarkName: nearbyLandmarkName || undefined,
        nearbyLandmarkCategory: nearbyLandmarkCategory || undefined,
        nearbyLandmarkDistanceMeters,
        accuracyMeters: gpsAccuracy,
        locationSource,
        locationStatus,
        locationTimestamp: input.locationTimestamp || (hasCoords ? now : undefined)
      },
      status: 'PENDING',
      severity: aiAssessment.severityLevel,
      affectedPeople,
      hasInjured,
      hasTrapped,
      specialNeeds: specialNeeds || undefined,
      reporterName: isAnonymous
        ? 'Anonymous Citizen'
        : sanitizePlainText(input.reporterName, 80) || 'Citizen',
      reporterPhone: reporterPhone || 'Not provided',
      emergencyContactPhone: emergencyContactPhone || undefined,
      isAnonymous,
      isGuest: true,
      isDemo: false,
      dataSource: 'real',
      isLiveTracking: Boolean(input.isLiveTracking && hasCoords && locationSource === 'gps'),
      lastLocationUpdate: hasCoords ? now : undefined,
      aiAssessment,
      media: [],
      updates: [
        {
          timestamp: now,
          message: `One-Tap SOS received (${locationSource}). Awaiting operator verification.`,
          updatedBy: 'RESQ SOS Gateway'
        }
      ],
      auditLogs: [auditEntry]
    };

    state.incidents.unshift(incident);

    const notifMessage = `${incident.category} SOS (${incident.id}) at ${
      landmark || `${upazila}, ${district}`
    }`;

    state.notifications.unshift({
      id: `NOTIF-${crypto.randomUUID().slice(0, 8)}`,
      title: 'New Emergency SOS Received',
      message: notifMessage,
      timestamp: 'Just now',
      read: false,
      type: 'urgent',
      incidentId: incident.id
    });

    const deliveryLogs = createDeliveryLogs(incident.id, notifMessage, Boolean(reporterPhone));
    state.deliveryLogs.unshift(...deliveryLogs);
    state.deliveryLogs = state.deliveryLogs.slice(0, 100);

    return { incident, trackingCode, deliveryLogs };
  });
}

export async function updateEmergencyDetails(
  incidentId: string,
  auth: { trackingCode?: string; role?: UserRole },
  patch: {
    category?: EmergencyCategory;
    description?: string;
    affectedPeople?: number;
    hasInjured?: boolean;
    hasTrapped?: boolean;
    specialNeeds?: string;
    reporterPhone?: string;
    emergencyContactPhone?: string;
    landmark?: string;
    nearbyLandmarkName?: string;
    nearbyLandmarkCategory?: string;
    nearbyLandmarkDistanceMeters?: number;
    lat?: number | null;
    lng?: number | null;
    accuracyMeters?: number;
    locationSource?: LocationCoordinates['locationSource'];
    formattedAddress?: string;
    structuredAddress?: StructuredAddress;
    mediaAttachment?: IncidentMedia;
  }
): Promise<IncidentReport> {
  return withTransaction((state) => {
    const inc = state.incidents.find((i) => i.id === incidentId);
    if (!inc) throw new Error('NOT_FOUND');

    const isPrivileged = auth.role ? PRIVILEGED_ROLES.includes(auth.role) : false;
    const validCode = Boolean(
      auth.trackingCode && inc.trackingCode && auth.trackingCode.toUpperCase() === inc.trackingCode
    );
    if (!isPrivileged && !validCode) {
      throw new Error('FORBIDDEN');
    }

    const now = new Date().toISOString();
    if (patch.category) inc.category = patch.category;
    if (typeof patch.description === 'string' && patch.description.trim()) {
      inc.description = sanitizePlainText(patch.description, 800);
    }
    if (typeof patch.affectedPeople === 'number' && Number.isFinite(patch.affectedPeople)) {
      inc.affectedPeople = Math.max(1, Math.min(5000, Math.round(patch.affectedPeople)));
    }
    if (typeof patch.hasInjured === 'boolean') inc.hasInjured = patch.hasInjured;
    if (typeof patch.hasTrapped === 'boolean') inc.hasTrapped = patch.hasTrapped;
    if (typeof patch.specialNeeds === 'string') {
      inc.specialNeeds = sanitizePlainText(patch.specialNeeds, 240);
    }
    if (typeof patch.reporterPhone === 'string' && patch.reporterPhone.trim()) {
      inc.reporterPhone = sanitizePlainText(patch.reporterPhone, 30);
    }
    if (typeof patch.emergencyContactPhone === 'string' && patch.emergencyContactPhone.trim()) {
      inc.emergencyContactPhone = sanitizePlainText(patch.emergencyContactPhone, 30);
    }
    if (typeof patch.landmark === 'string' && patch.landmark.trim()) {
      const lm = sanitizePlainText(patch.landmark, 160);
      inc.location.landmark = lm;
      inc.location.addressDetails = lm;
      if (!isValidCoordinatePair(inc.location.lat, inc.location.lng)) {
        inc.location.locationSource = 'landmark';
        inc.location.locationStatus = 'LANDMARK_ONLY';
      }
      inc.title = formatLandmarkTitle(inc.category, lm);
    }
    if (typeof patch.nearbyLandmarkName === 'string' && patch.nearbyLandmarkName.trim()) {
      inc.location.nearbyLandmarkName = sanitizePlainText(patch.nearbyLandmarkName, 140);
      if (typeof patch.nearbyLandmarkCategory === 'string') {
        inc.location.nearbyLandmarkCategory = sanitizePlainText(patch.nearbyLandmarkCategory, 60);
      }
      if (
        typeof patch.nearbyLandmarkDistanceMeters === 'number' &&
        Number.isFinite(patch.nearbyLandmarkDistanceMeters)
      ) {
        inc.location.nearbyLandmarkDistanceMeters = Math.round(patch.nearbyLandmarkDistanceMeters);
      }
    }
    const sanitizedPatchStruct = sanitizeStructuredAddress(patch.structuredAddress);
    if (sanitizedPatchStruct) {
      inc.location.structuredAddress = sanitizedPatchStruct;
    }
    if (isValidCoordinatePair(patch.lat, patch.lng)) {
      const requestedSource = sanitizeLocationSource(patch.locationSource, 'map_manual');
      const nextSource = requestedSource === 'unlocated' ? 'map_manual' : requestedSource;
      inc.location.lat = Number((patch.lat as number).toFixed(6));
      inc.location.lng = Number((patch.lng as number).toFixed(6));
      inc.location.locationSource = nextSource;
      inc.location.locationStatus = resolveLocationStatus(
        inc.location.lat,
        inc.location.lng,
        nextSource,
        inc.location.landmark
      );
      inc.location.locationTimestamp = now;
      if (nextSource === 'gps' && typeof patch.accuracyMeters === 'number' && Number.isFinite(patch.accuracyMeters)) {
        inc.location.accuracyMeters = Math.round(patch.accuracyMeters);
      } else if (nextSource !== 'gps') {
        inc.location.accuracyMeters = undefined;
      }
      if (patch.formattedAddress) {
        inc.location.formattedAddress = sanitizePlainText(patch.formattedAddress, 240);
      }
      const inferred = inferDistrictAndDivision(
        inc.location.lat,
        inc.location.lng,
        sanitizedPatchStruct?.district
      );
      inc.location.division = sanitizedPatchStruct?.division || inferred.division;
      inc.location.district = sanitizedPatchStruct?.district || inferred.district;
      inc.location.upazila = sanitizedPatchStruct?.upazila || inferred.upazila;
      if (!inc.location.landmark) {
        inc.title = `${inc.category} SOS in ${inc.location.upazila}, ${inc.location.district}`;
      }
      inc.lastLocationUpdate = now;
    }
    if (patch.mediaAttachment) {
      inc.media.push(patch.mediaAttachment);
    }

    inc.aiAssessment = generateAiAssessment({
      title: inc.title,
      description: inc.description,
      affectedPeople: inc.affectedPeople,
      hasInjured: inc.hasInjured,
      hasTrapped: inc.hasTrapped
    });
    inc.severity = inc.aiAssessment.severityLevel;
    inc.lastUpdatedAt = now;

    inc.updates.push({
      timestamp: now,
      message: patch.mediaAttachment
        ? `Victim attached ${patch.mediaAttachment.type} evidence.`
        : 'Additional victim details updated.',
      updatedBy: isPrivileged ? 'Operator' : 'Victim / Guest Reporter'
    });

    inc.auditLogs = inc.auditLogs || [];
    inc.auditLogs.push({
      id: `AUD-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: now,
      action: 'DETAILS_UPDATED',
      actor: isPrivileged ? 'Operator' : 'Guest Reporter',
      role: auth.role || 'citizen',
      newStatus: inc.status,
      details: patch.mediaAttachment
        ? `Attached ${patch.mediaAttachment.type} media`
        : 'Updated emergency details'
    });

    return inc;
  });
}

export async function updateEmergencyLiveLocation(
  incidentId: string,
  auth: { trackingCode?: string; role?: UserRole },
  loc: {
    lat?: number | null;
    lng?: number | null;
    accuracyMeters?: number;
    locationSource?: LocationCoordinates['locationSource'];
    formattedAddress?: string;
    structuredAddress?: StructuredAddress;
    nearbyLandmarkName?: string;
    nearbyLandmarkCategory?: string;
    nearbyLandmarkDistanceMeters?: number;
    isLiveTracking: boolean;
  }
): Promise<IncidentReport> {
  return withTransaction((state) => {
    const inc = state.incidents.find((i) => i.id === incidentId);
    if (!inc) throw new Error('NOT_FOUND');

    const isPrivileged = auth.role ? PRIVILEGED_ROLES.includes(auth.role) : false;
    const validCode = Boolean(
      auth.trackingCode && inc.trackingCode && auth.trackingCode.toUpperCase() === inc.trackingCode
    );
    if (!isPrivileged && !validCode) {
      throw new Error('FORBIDDEN');
    }

    const now = new Date().toISOString();
    inc.isLiveTracking = Boolean(loc.isLiveTracking);

    const sanitizedStruct = sanitizeStructuredAddress(loc.structuredAddress);
    if (sanitizedStruct) {
      inc.location.structuredAddress = sanitizedStruct;
    }
    if (typeof loc.nearbyLandmarkName === 'string' && loc.nearbyLandmarkName.trim()) {
      inc.location.nearbyLandmarkName = sanitizePlainText(loc.nearbyLandmarkName, 140);
      if (typeof loc.nearbyLandmarkCategory === 'string') {
        inc.location.nearbyLandmarkCategory = sanitizePlainText(loc.nearbyLandmarkCategory, 60);
      }
      if (
        typeof loc.nearbyLandmarkDistanceMeters === 'number' &&
        Number.isFinite(loc.nearbyLandmarkDistanceMeters)
      ) {
        inc.location.nearbyLandmarkDistanceMeters = Math.round(loc.nearbyLandmarkDistanceMeters);
      }
    }

    if (isValidCoordinatePair(loc.lat, loc.lng)) {
      const requestedSource = sanitizeLocationSource(loc.locationSource, 'gps');
      const nextSource = requestedSource === 'unlocated' ? 'gps' : requestedSource;

      // Never allow background GPS to silently overwrite user-selected manual pin / address / shared location
      const isUserExplicitLocation =
        inc.location.locationSource === 'map_manual' ||
        inc.location.locationSource === 'address_manual' ||
        inc.location.locationSource === 'shared_location';
      if (isUserExplicitLocation && nextSource === 'gps' && !loc.isLiveTracking) {
        inc.lastUpdatedAt = now;
        return inc;
      }

      const wasUnlocated = !isValidCoordinatePair(inc.location.lat, inc.location.lng);
      inc.location.lat = Number((loc.lat as number).toFixed(6));
      inc.location.lng = Number((loc.lng as number).toFixed(6));
      inc.location.locationSource = nextSource;
      inc.location.locationStatus = resolveLocationStatus(
        inc.location.lat,
        inc.location.lng,
        nextSource,
        inc.location.landmark
      );
      inc.location.locationTimestamp = now;
      if (
        nextSource === 'gps' &&
        typeof loc.accuracyMeters === 'number' &&
        Number.isFinite(loc.accuracyMeters)
      ) {
        inc.location.accuracyMeters = Math.round(loc.accuracyMeters);
      } else if (nextSource !== 'gps') {
        inc.location.accuracyMeters = undefined;
      }
      if (loc.formattedAddress) {
        inc.location.formattedAddress = sanitizePlainText(loc.formattedAddress, 240);
      }
      const inferred = inferDistrictAndDivision(
        inc.location.lat,
        inc.location.lng,
        sanitizedStruct?.district
      );
      inc.location.division = sanitizedStruct?.division || inferred.division;
      inc.location.district = sanitizedStruct?.district || inferred.district;
      inc.location.upazila = sanitizedStruct?.upazila || inferred.upazila;
      if (!inc.location.landmark) {
        inc.title = `${inc.category} SOS in ${inc.location.upazila}, ${inc.location.district}`;
      }
      inc.lastLocationUpdate = now;

      if (wasUnlocated) {
        inc.updates.push({
          timestamp: now,
          message: `Location acquired (${nextSource}: ${inc.location.lat.toFixed(5)}, ${inc.location.lng.toFixed(5)}${
            typeof inc.location.accuracyMeters === 'number' ? `, ±${inc.location.accuracyMeters}m` : ''
          }).`,
          updatedBy: 'RESQ Location Service'
        });
      }
    }
    inc.lastUpdatedAt = now;
    return inc;
  });
}

export async function verifyIncidentRecord(
  incidentId: string,
  operatorName: string,
  role: UserRole
): Promise<IncidentReport> {
  return withTransaction((state) => {
    const inc = state.incidents.find((i) => i.id === incidentId);
    if (!inc) throw new Error('NOT_FOUND');

    const check = canTransitionStatus(inc.status, 'VERIFIED', role);
    if (!check.allowed) throw new Error(check.reason || 'FORBIDDEN');

    const now = new Date().toISOString();
    const prev = inc.status;
    inc.status = 'VERIFIED';
    inc.verifiedBy = sanitizePlainText(operatorName, 80) || 'Duty Officer';
    inc.verifiedAt = now;
    inc.lastUpdatedAt = now;
    inc.updates.push({
      timestamp: now,
      message: `Incident verified by ${inc.verifiedBy}. Ready for responder dispatch.`,
      updatedBy: inc.verifiedBy
    });
    inc.auditLogs = inc.auditLogs || [];
    inc.auditLogs.push({
      id: `AUD-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: now,
      action: 'INCIDENT_VERIFIED',
      actor: inc.verifiedBy,
      role,
      previousStatus: prev,
      newStatus: 'VERIFIED',
      details: 'Operator verified coordinates and emergency credibility'
    });
    return inc;
  });
}

export async function assignIncidentTeam(
  incidentId: string,
  teamId: string,
  role: UserRole,
  actorName = 'Operations Dispatcher'
): Promise<{ incident: IncidentReport; team: RescueTeam }> {
  return withTransaction((state) => {
    const inc = state.incidents.find((i) => i.id === incidentId);
    if (!inc) throw new Error('NOT_FOUND');
    const team = state.rescueTeams.find((t) => t.id === teamId);
    if (!team) throw new Error('TEAM_NOT_FOUND');

    const check = canTransitionStatus(inc.status, 'ASSIGNED', role);
    if (!check.allowed) throw new Error(check.reason || 'FORBIDDEN');
    if (!team.available) throw new Error('TEAM_UNAVAILABLE');

    const now = new Date().toISOString();
    const prev = inc.status;
    inc.status = 'ASSIGNED';
    inc.assignedTeamId = team.id;
    inc.lastUpdatedAt = now;
    inc.updates.push({
      timestamp: now,
      message: `Assigned to rescue unit: ${team.name}. Awaiting unit acceptance.`,
      updatedBy: sanitizePlainText(actorName, 80)
    });
    inc.auditLogs = inc.auditLogs || [];
    inc.auditLogs.push({
      id: `AUD-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: now,
      action: 'TEAM_ASSIGNED',
      actor: sanitizePlainText(actorName, 80),
      role,
      previousStatus: prev,
      newStatus: 'ASSIGNED',
      details: `Assigned ${team.name} (${team.id})`
    });

    team.available = false;
    team.activeMissionId = `MISSION-${inc.id}`;

    const msg = `${team.name} assigned to ${inc.id} (${inc.category})`;
    state.notifications.unshift({
      id: `NOTIF-${crypto.randomUUID().slice(0, 8)}`,
      title: 'Responder Unit Assigned',
      message: msg,
      timestamp: 'Just now',
      read: false,
      type: 'dispatch',
      incidentId: inc.id
    });
    state.deliveryLogs.unshift(...createDeliveryLogs(inc.id, msg, Boolean(inc.reporterPhone)));

    return { incident: inc, team };
  });
}

export async function transitionIncidentStatus(
  incidentId: string,
  nextStatus: IncidentStatus,
  role: UserRole,
  note?: string,
  actorName?: string
): Promise<IncidentReport> {
  return withTransaction((state) => {
    const inc = state.incidents.find((i) => i.id === incidentId);
    if (!inc) throw new Error('NOT_FOUND');

    const check = canTransitionStatus(inc.status, nextStatus, role);
    if (!check.allowed) throw new Error(check.reason || 'FORBIDDEN');

    const now = new Date().toISOString();
    const prev = inc.status;
    inc.status = nextStatus;
    inc.lastUpdatedAt = now;
    if (nextStatus === 'RESOLVED' || nextStatus === 'CANCELLED' || nextStatus === 'REJECTED') {
      inc.isLiveTracking = false;
    }

    const cleanNote =
      sanitizePlainText(note, 300) || `Status updated from ${prev} to ${nextStatus}`;
    const actor = sanitizePlainText(actorName, 80) || role;

    inc.updates.push({
      timestamp: now,
      message: cleanNote,
      updatedBy: actor
    });

    inc.auditLogs = inc.auditLogs || [];
    inc.auditLogs.push({
      id: `AUD-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: now,
      action: `STATUS_${nextStatus}`,
      actor,
      role,
      previousStatus: prev,
      newStatus: nextStatus,
      details: cleanNote
    });

    if (
      (nextStatus === 'RESOLVED' || nextStatus === 'CANCELLED' || nextStatus === 'REJECTED') &&
      inc.assignedTeamId
    ) {
      const team = state.rescueTeams.find((t) => t.id === inc.assignedTeamId);
      if (team) {
        team.available = true;
        team.activeMissionId = undefined;
      }
    }

    state.notifications.unshift({
      id: `NOTIF-${crypto.randomUUID().slice(0, 8)}`,
      title: `Emergency ${inc.id} → ${nextStatus}`,
      message: cleanNote,
      timestamp: 'Just now',
      read: false,
      type: nextStatus === 'RESOLVED' ? 'info' : 'dispatch',
      incidentId: inc.id
    });

    return inc;
  });
}

export async function addSafePersonRecord(input: {
  name: string;
  phone: string;
  location: string;
  notes: string;
}): Promise<SafePersonRecord> {
  return withTransaction((state) => {
    const record: SafePersonRecord = {
      id: `SAFE-${crypto.randomUUID().slice(0, 8)}`,
      name: sanitizePlainText(input.name, 80),
      phone: sanitizePlainText(input.phone, 30),
      location: sanitizePlainText(input.location, 160) || 'Current Safe Location',
      notes: sanitizePlainText(input.notes, 300) || 'Marked safe during disaster event',
      timestamp: new Date().toISOString()
    };
    state.safePeople.unshift(record);
    return record;
  });
}

export async function markNotificationReadRecord(notifId: string): Promise<void> {
  await withTransaction((state) => {
    const n = state.notifications.find((item) => item.id === notifId);
    if (n) n.read = true;
  });
}
