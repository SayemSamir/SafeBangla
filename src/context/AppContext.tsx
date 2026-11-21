import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
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
} from '../types';
import {
  INITIAL_ALERTS,
  INITIAL_HOSPITALS,
  INITIAL_INCIDENTS,
  INITIAL_RESCUE_TEAMS,
  INITIAL_SHELTERS
} from '../data/bangladeshData';
import { generateAiAssessment } from '../utils/aiEngine';
import { generateTrackingCode } from '../utils/security';
import {
  isValidCoordinatePair,
  resolveLocationStatus,
  shouldReplaceGpsFix
} from '../utils/geolocation';

export interface SafePerson {
  id: string;
  name: string;
  phone: string;
  location: string;
  notes: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'urgent' | 'info' | 'dispatch';
  incidentId?: string;
}

export interface CreateSosPayload {
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

export interface TrackingSession {
  id: string;
  trackingCode: string;
}

interface AppContextType {
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  incidents: IncidentReport[];
  rescueTeams: RescueTeam[];
  shelters: CycloneShelter[];
  hospitals: Hospital[];
  alerts: DisasterAlert[];
  safePeople: SafePerson[];
  notifications: NotificationItem[];
  deliveryLogs: NotificationDeliveryLog[];
  offlineQueue: CreateSosPayload[];
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  sosModalOpen: boolean;
  setSosModalOpen: (open: boolean) => void;
  markSafeModalOpen: boolean;
  setMarkSafeModalOpen: (open: boolean) => void;
  recentTracking: TrackingSession | null;
  setRecentTracking: (session: TrackingSession | null) => void;
  focusedIncidentId: string | null;
  focusRequestToken: number;
  focusIncidentOnMap: (incidentId: string, navigateToMap?: boolean) => void;
  submitGuestSos: (payload: CreateSosPayload) => Promise<{
    incident: IncidentReport;
    trackingCode: string;
    deliveryLogs: NotificationDeliveryLog[];
    queuedOffline: boolean;
  }>;
  updateSosDetails: (
    incidentId: string,
    trackingCode: string | undefined,
    patch: Record<string, unknown>
  ) => Promise<IncidentReport | null>;
  updateLiveLocation: (
    incidentId: string,
    trackingCode: string | undefined,
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
  ) => Promise<IncidentReport | null>;
  uploadMediaFile: (file: Blob | File, fallbackMime?: string) => Promise<IncidentMedia | null>;
  verifyIncident: (incidentId: string, operatorName: string) => Promise<void>;
  assignMission: (incidentId: string, teamId: string) => Promise<{ ok: boolean; error?: string }>;
  updateIncidentWorkflowStatus: (
    incidentId: string,
    status: IncidentStatus,
    note?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  markPersonSafe: (person: Omit<SafePerson, 'id' | 'timestamp'>) => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  t: (keyEn: string, keyBn: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const OFFLINE_QUEUE_KEY = 'resq_offline_sos_queue';
const TRACKING_SESSION_KEY = 'resq_last_tracking_session';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>(INITIAL_RESCUE_TEAMS);
  const [shelters, setShelters] = useState<CycloneShelter[]>(INITIAL_SHELTERS);
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [alerts, setAlerts] = useState<DisasterAlert[]>(INITIAL_ALERTS);
  const [safePeople, setSafePeople] = useState<SafePerson[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<NotificationDeliveryLog[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<CreateSosPayload[]>(() => {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [recentTracking, setRecentTrackingState] = useState<TrackingSession | null>(() => {
    try {
      const raw = sessionStorage.getItem(TRACKING_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [sosModalOpen, setSosModalOpen] = useState<boolean>(false);
  const [markSafeModalOpen, setMarkSafeModalOpen] = useState<boolean>(false);
  const [focusedIncidentId, setFocusedIncidentId] = useState<string | null>(null);
  const [focusRequestToken, setFocusRequestToken] = useState<number>(0);

  const focusIncidentOnMap = useCallback((incidentId: string, navigateToMap = true) => {
    setFocusedIncidentId(incidentId);
    setFocusRequestToken((prev) => prev + 1);
    if (navigateToMap) {
      setActiveTab('map');
    }
  }, []);

  const deduplicateIncidents = useCallback((list: IncidentReport[]) => {
    const seen = new Set<string>();
    const unique: IncidentReport[] = [];
    for (const item of list) {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    return unique;
  }, []);

  const setRecentTracking = (session: TrackingSession | null) => {
    setRecentTrackingState(session);
    try {
      if (session) {
        sessionStorage.setItem(TRACKING_SESSION_KEY, JSON.stringify(session));
      } else {
        sessionStorage.removeItem(TRACKING_SESSION_KEY);
      }
    } catch {
      // Ignore storage failures
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
    } catch {
      // Ignore storage failures
    }
  }, [offlineQueue]);

  const refreshData = useCallback(async () => {
    if (!isOnline) return;
    try {
      const res = await fetch(`/api/bootstrap?role=${encodeURIComponent(currentRole)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.incidents)) {
        setIncidents(deduplicateIncidents(data.incidents));
      }
      if (Array.isArray(data.rescueTeams)) setRescueTeams(data.rescueTeams);
      if (Array.isArray(data.shelters)) setShelters(data.shelters);
      if (Array.isArray(data.hospitals)) setHospitals(data.hospitals);
      if (Array.isArray(data.alerts)) setAlerts(data.alerts);
      if (Array.isArray(data.safePeople)) setSafePeople(data.safePeople);
      if (Array.isArray(data.notifications)) setNotifications(data.notifications);
      if (Array.isArray(data.deliveryLogs)) setDeliveryLogs(data.deliveryLogs);
    } catch {
      // Keep current in-memory data if backend temporarily unavailable
    }
  }, [currentRole, isOnline]);

  useEffect(() => {
    void refreshData();
    const timer = setInterval(() => {
      void refreshData();
    }, 15000);
    return () => clearInterval(timer);
  }, [refreshData]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const t = (keyEn: string, keyBn: string) => (language === 'bn' ? keyBn : keyEn);

  const updateLiveLocation = useCallback(
    async (
      incidentId: string,
      trackingCode: string | undefined,
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
    ): Promise<IncidentReport | null> => {
      if (!isOnline) return null;
      try {
        const res = await fetch(`/api/emergencies/${encodeURIComponent(incidentId)}/location`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...loc, trackingCode, role: currentRole })
        });
        if (!res.ok) return null;
        const data = await res.json();
        const updated = data.incident as IncidentReport;
        setIncidents((prev) =>
          deduplicateIncidents(prev.map((i) => (i.id === incidentId ? updated : i)))
        );
        return updated;
      } catch {
        return null;
      }
    },
    [currentRole, deduplicateIncidents, isOnline]
  );

  const attachDelayedStageBGps = useCallback(
    (createdIncident: IncidentReport, trackingCode: string) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation || !isOnline) return;
      // Never overwrite a user's explicit manual map pin, address selection, or shared location link
      if (
        createdIncident.location.locationSource === 'map_manual' ||
        createdIncident.location.locationSource === 'address_manual' ||
        createdIncident.location.locationSource === 'shared_location'
      ) {
        return;
      }
      // Skip if we already received a high-accuracy GPS fix
      const hasHighPrecision =
        createdIncident.location.locationSource === 'gps' &&
        isValidCoordinatePair(createdIncident.location.lat, createdIncident.location.lng) &&
        typeof createdIncident.location.accuracyMeters === 'number' &&
        createdIncident.location.accuracyMeters <= 30;
      if (hasHighPrecision) return;

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          if (!isValidCoordinatePair(latitude, longitude)) return;
          const accRounded =
            typeof accuracy === 'number' && Number.isFinite(accuracy)
              ? Math.round(accuracy)
              : undefined;
          const shouldPatch = shouldReplaceGpsFix(
            {
              lat: createdIncident.location.lat,
              lng: createdIncident.location.lng,
              accuracyMeters: createdIncident.location.accuracyMeters,
              source: createdIncident.location.locationSource
            },
            { lat: latitude, lng: longitude, accuracyMeters: accRounded }
          );
          if (!shouldPatch) return;

          let formattedAddress: string | undefined;
          let structuredAddress: StructuredAddress | undefined;
          try {
            const geoRes = await fetch(
              `/api/geocode/reverse?lat=${Number(latitude.toFixed(6))}&lng=${Number(longitude.toFixed(6))}`
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              formattedAddress = geoData.formattedAddress || undefined;
              structuredAddress = geoData.structuredAddress || undefined;
            }
          } catch {
            // Optional address enrichment
          }

          await updateLiveLocation(createdIncident.id, trackingCode, {
            lat: Number(latitude.toFixed(6)),
            lng: Number(longitude.toFixed(6)),
            accuracyMeters: accRounded,
            locationSource: 'gps',
            formattedAddress,
            structuredAddress,
            isLiveTracking: Boolean(createdIncident.isLiveTracking)
          });
        },
        () => {
          // Delayed GPS not available; leave record safely as-is
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    },
    [isOnline, updateLiveLocation]
  );

  const submitGuestSos = async (payload: CreateSosPayload) => {
    if (isOnline) {
      try {
        const res = await fetch('/api/emergencies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          const created = data.incident as IncidentReport;
          setIncidents((prev) => deduplicateIncidents([created, ...prev]));
          if (Array.isArray(data.deliveryLogs)) {
            setDeliveryLogs((prev) => [...data.deliveryLogs, ...prev].slice(0, 60));
          }
          setRecentTracking({ id: created.id, trackingCode: data.trackingCode });
          focusIncidentOnMap(created.id, false);
          attachDelayedStageBGps(created, data.trackingCode as string);
          void refreshData();
          return {
            incident: created,
            trackingCode: data.trackingCode as string,
            deliveryLogs: (data.deliveryLogs || []) as NotificationDeliveryLog[],
            queuedOffline: false
          };
        }
      } catch {
        // Fall through to offline queue
      }
    }

    // Offline resilient fallback: queue locally and provide provisional tracking receipt
    const provisionalId = `RESQ-OFFLINE-${Date.now().toString().slice(-4)}`;
    const provisionalCode = generateTrackingCode(6);
    const now = new Date().toISOString();
    const category = payload.category || 'Other Emergency';
    const ai = generateAiAssessment({
      title: `${category} SOS`,
      description: payload.description || '',
      affectedPeople: payload.affectedPeople || 1,
      hasInjured: payload.hasInjured,
      hasTrapped: payload.hasTrapped
    });
    const locSource = payload.locationSource || 'unlocated';

    const localIncident: IncidentReport = {
      id: provisionalId,
      trackingCode: provisionalCode,
      timestamp: now,
      category,
      title: payload.landmark ? `${category} SOS near ${payload.landmark}` : `${category} SOS`,
      description: payload.description || 'Queued offline — will sync when connection returns.',
      location: {
        lat: typeof payload.lat === 'number' ? payload.lat : null,
        lng: typeof payload.lng === 'number' ? payload.lng : null,
        division: payload.division || 'Bangladesh',
        district: payload.district || 'Offline Area',
        upazila: payload.upazila || 'Pending Sync',
        landmark: payload.landmark,
        formattedAddress: payload.formattedAddress,
        structuredAddress: payload.structuredAddress,
        nearbyLandmarkName: payload.nearbyLandmarkName,
        nearbyLandmarkCategory: payload.nearbyLandmarkCategory,
        nearbyLandmarkDistanceMeters: payload.nearbyLandmarkDistanceMeters,
        accuracyMeters: locSource === 'gps' ? payload.accuracyMeters : undefined,
        locationSource: locSource,
        locationStatus: resolveLocationStatus(
          payload.lat,
          payload.lng,
          locSource,
          payload.landmark
        ),
        locationTimestamp: payload.locationTimestamp || now
      },
      status: 'PENDING',
      severity: ai.severityLevel,
      affectedPeople: payload.affectedPeople || 1,
      hasInjured: Boolean(payload.hasInjured),
      hasTrapped: Boolean(payload.hasTrapped),
      specialNeeds: payload.specialNeeds,
      reporterName: payload.isAnonymous ? 'Anonymous Citizen' : payload.reporterName || 'Citizen',
      reporterPhone: payload.reporterPhone || 'Not provided',
      isAnonymous: Boolean(payload.isAnonymous),
      isGuest: true,
      isDemo: false,
      dataSource: 'real',
      aiAssessment: ai,
      media: [],
      updates: [
        {
          timestamp: now,
          message: 'Saved offline locally. Waiting for internet signal to transmit.',
          updatedBy: 'Offline Emergency Cache'
        }
      ]
    };

    setOfflineQueue((prev) => [payload, ...prev]);
    setIncidents((prev) => deduplicateIncidents([localIncident, ...prev]));
    setRecentTracking({ id: provisionalId, trackingCode: provisionalCode });
    focusIncidentOnMap(provisionalId, false);

    return {
      incident: localIncident,
      trackingCode: provisionalCode,
      deliveryLogs: [],
      queuedOffline: true
    };
  };

  const updateSosDetails = async (
    incidentId: string,
    trackingCode: string | undefined,
    patch: Record<string, unknown>
  ): Promise<IncidentReport | null> => {
    if (!isOnline) return null;
    try {
      const res = await fetch(`/api/emergencies/${encodeURIComponent(incidentId)}/details`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...patch, trackingCode, role: currentRole })
      });
      if (!res.ok) return null;
      const data = await res.json();
      setIncidents((prev) =>
        deduplicateIncidents(prev.map((i) => (i.id === incidentId ? data.incident : i)))
      );
      return data.incident as IncidentReport;
    } catch {
      return null;
    }
  };

  const uploadMediaFile = async (
    file: Blob | File,
    fallbackMime?: string
  ): Promise<IncidentMedia | null> => {
    if (!isOnline) return null;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataUrl,
        mimeType: file.type || fallbackMime || 'application/octet-stream'
      })
    });
    if (!res.ok) return null;
    const media = (await res.json()) as IncidentMedia;
    return media;
  };

  const verifyIncident = async (incidentId: string, operatorName: string) => {
    try {
      const res = await fetch(`/api/emergencies/${encodeURIComponent(incidentId)}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorName, role: currentRole })
      });
      if (res.ok) {
        await refreshData();
      }
    } catch {
      // Ignore transient errors
    }
  };

  const assignMission = async (incidentId: string, teamId: string) => {
    try {
      const res = await fetch(`/api/emergencies/${encodeURIComponent(incidentId)}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, role: currentRole, actorName: `Officer (${currentRole})` })
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Assignment failed' };
      }
      await refreshData();
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error assigning team' };
    }
  };

  const updateIncidentWorkflowStatus = async (
    incidentId: string,
    status: IncidentStatus,
    note?: string
  ) => {
    try {
      const res = await fetch(`/api/emergencies/${encodeURIComponent(incidentId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          note,
          role: currentRole,
          actorName: currentRole
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Status update failed' };
      }
      await refreshData();
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error updating status' };
    }
  };

  const markPersonSafe = async (person: Omit<SafePerson, 'id' | 'timestamp'>) => {
    try {
      const res = await fetch('/api/safe-people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(person)
      });
      if (res.ok) {
        const data = await res.json();
        setSafePeople((prev) => [data.person, ...prev]);
        return;
      }
    } catch {
      // Fall back locally if offline
    }
    setSafePeople((prev) => [
      { ...person, id: `SAFE-${Date.now()}`, timestamp: new Date().toISOString() },
      ...prev
    ]);
  };

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0 || !isOnline) return;
    const remaining: CreateSosPayload[] = [];
    for (const item of offlineQueue) {
      try {
        const res = await fetch('/api/emergencies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        if (!res.ok) remaining.push(item);
      } catch {
        remaining.push(item);
      }
    }
    setOfflineQueue(remaining);
    await refreshData();
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' });
    } catch {
      // Ignore
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        incidents,
        rescueTeams,
        shelters,
        hospitals,
        alerts,
        safePeople,
        notifications,
        deliveryLogs,
        offlineQueue,
        isOnline,
        setIsOnline,
        sosModalOpen,
        setSosModalOpen,
        markSafeModalOpen,
        setMarkSafeModalOpen,
        recentTracking,
        setRecentTracking,
        focusedIncidentId,
        focusRequestToken,
        focusIncidentOnMap,
        submitGuestSos,
        updateSosDetails,
        updateLiveLocation,
        uploadMediaFile,
        verifyIncident,
        assignMission,
        updateIncidentWorkflowStatus,
        markPersonSafe,
        syncOfflineQueue,
        markNotificationRead,
        refreshData,
        t
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
