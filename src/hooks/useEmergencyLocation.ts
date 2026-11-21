import { useCallback, useEffect, useRef, useState } from 'react';
import type { LocationSource, LocationStatus, StructuredAddress } from '../types';
import {
  classifyGpsAccuracy,
  GPS_FALLBACK_GUIDANCE_BN,
  GPS_FALLBACK_GUIDANCE_EN,
  isCoordinateFresh,
  isValidCoordinatePair,
  mapGeolocationError,
  resolveLocationStatus,
  shouldReplaceGpsFix
} from '../utils/geolocation';

export type GpsDetectionStatus =
  | 'idle'
  | 'detecting'
  | 'ready'
  | 'poor_accuracy'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'unsupported'
  | 'unknown';

export type GpsAcquisitionStage =
  | 'idle'
  | 'stage_a_fast'
  | 'stage_b_refining'
  | 'complete'
  | 'fallback';

export interface GeocodeSearchResult {
  id: string;
  label: string;
  primaryName: string;
  altName?: string;
  category: string;
  area: string;
  upazila: string;
  district: string;
  lat: number;
  lng: number;
  structuredAddress?: StructuredAddress;
  source: 'nominatim';
}

export interface NearbyLandmarkItem {
  id: string;
  name: string;
  nameEn?: string;
  nameBn?: string;
  category: string;
  lat: number;
  lng: number;
  distanceMeters: number;
}

export interface EmergencyLocationState {
  status: GpsDetectionStatus;
  stage: GpsAcquisitionStage;
  locationStatus: LocationStatus;
  lat: number | null;
  lng: number | null;
  accuracyMeters?: number;
  timestamp?: string;
  source: LocationSource;
  formattedAddress: string;
  structuredAddress?: StructuredAddress;
  district: string;
  upazila: string;
  division: string;
  landmark: string;
  nearbyLandmarkName?: string;
  nearbyLandmarkCategory?: string;
  nearbyLandmarkDistanceMeters?: number;
  nearbyLandmarks: NearbyLandmarkItem[];
  isFetchingNearby: boolean;
  locationConfirmed: boolean;
  errorMessageEn: string | null;
  errorMessageBn: string | null;
  isWatching: boolean;
  isGeocoding: boolean;
}

const reverseCache = new Map<
  string,
  {
    formattedAddress: string;
    structuredAddress?: StructuredAddress;
    district: string;
    upazila: string;
    division: string;
  }
>();
const nearbyCache = new Map<string, NearbyLandmarkItem[]>();

export function useEmergencyLocation(autoDetectOnMount = false) {
  const [state, setState] = useState<EmergencyLocationState>({
    status: 'idle',
    stage: 'idle',
    locationStatus: 'LOCATION_PENDING',
    lat: null,
    lng: null,
    source: 'unlocated',
    formattedAddress: '',
    structuredAddress: undefined,
    district: '',
    upazila: '',
    division: '',
    landmark: '',
    nearbyLandmarks: [],
    isFetchingNearby: false,
    locationConfirmed: false,
    errorMessageEn: null,
    errorMessageBn: null,
    isWatching: false,
    isGeocoding: false
  });

  const watchIdRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const stateRef = useRef(state);
  stateRef.current = state;
  const detectionSessionRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const fetchNearbyLandmarks = useCallback(async (lat: number, lng: number) => {
    if (!isValidCoordinatePair(lat, lng)) return;
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = nearbyCache.get(cacheKey);
    if (cached) {
      setState((prev) => ({
        ...prev,
        nearbyLandmarks: cached,
        isFetchingNearby: false
      }));
      return;
    }

    setState((prev) => ({ ...prev, isFetchingNearby: true }));
    try {
      const res = await fetch(`/api/geocode/nearby?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error('Nearby search failed');
      const data = await res.json();
      if (!mountedRef.current) return;
      const list = Array.isArray(data.landmarks) ? (data.landmarks as NearbyLandmarkItem[]) : [];
      if (list.length > 0) {
        nearbyCache.set(cacheKey, list);
      }
      setState((prev) => ({
        ...prev,
        nearbyLandmarks: list,
        isFetchingNearby: false
      }));
    } catch {
      if (!mountedRef.current) return;
      setState((prev) => ({ ...prev, isFetchingNearby: false }));
    }
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!isValidCoordinatePair(lat, lng)) return '';
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = reverseCache.get(cacheKey);
    if (cached) {
      setState((prev) => ({
        ...prev,
        formattedAddress: cached.formattedAddress,
        structuredAddress: cached.structuredAddress,
        district: cached.district || prev.district,
        upazila: cached.upazila || prev.upazila,
        division: cached.division || prev.division,
        isGeocoding: false
      }));
      return cached.formattedAddress;
    }

    setState((prev) => ({ ...prev, isGeocoding: true }));
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error('Geocode failed');
      const data = await res.json();
      if (!mountedRef.current) return '';
      const formatted = data.formattedAddress || '';
      const structured = data.structuredAddress as StructuredAddress | undefined;
      if (data.source === 'nominatim' && formatted) {
        reverseCache.set(cacheKey, {
          formattedAddress: formatted,
          structuredAddress: structured,
          district: data.district || '',
          upazila: data.upazila || '',
          division: data.division || ''
        });
      }
      setState((prev) => ({
        ...prev,
        formattedAddress: formatted,
        structuredAddress: structured,
        district: data.district || prev.district,
        upazila: data.upazila || prev.upazila,
        division: data.division || prev.division,
        isGeocoding: false
      }));
      return formatted;
    } catch {
      if (!mountedRef.current) return '';
      setState((prev) => ({ ...prev, isGeocoding: false }));
      return '';
    }
  }, []);

  const applyGpsFix = useCallback(
    (
      pos: GeolocationPosition,
      nextStage: GpsAcquisitionStage,
      allowOverwriteManual = false
    ): boolean => {
      const { latitude, longitude, accuracy } = pos.coords;
      const fixTimeMs = pos.timestamp || Date.now();
      if (!isValidCoordinatePair(latitude, longitude)) return false;
      if (!isCoordinateFresh(fixTimeMs, Date.now(), 2 * 60 * 1000)) return false;

      const latFixed = Number(latitude.toFixed(6));
      const lngFixed = Number(longitude.toFixed(6));
      const accRounded =
        typeof accuracy === 'number' && Number.isFinite(accuracy) && accuracy > 0
          ? Math.round(accuracy)
          : undefined;

      const current = stateRef.current;
      if (
        !allowOverwriteManual &&
        !shouldReplaceGpsFix(
          {
            lat: current.lat,
            lng: current.lng,
            accuracyMeters: current.accuracyMeters,
            source: current.source
          },
          { lat: latFixed, lng: lngFixed, accuracyMeters: accRounded }
        )
      ) {
        return false;
      }

      const accInfo = classifyGpsAccuracy(accRounded);
      const ts = new Date(fixTimeMs).toISOString();

      setState((prev) => ({
        ...prev,
        status: accInfo.isReliable ? 'ready' : 'poor_accuracy',
        stage: nextStage,
        locationStatus: 'GPS_RECEIVED',
        lat: latFixed,
        lng: lngFixed,
        accuracyMeters: accRounded,
        timestamp: ts,
        source: 'gps',
        locationConfirmed: true,
        errorMessageEn: null,
        errorMessageBn: null
      }));

      void reverseGeocode(latFixed, lngFixed);
      void fetchNearbyLandmarks(latFixed, lngFixed);
      return true;
    },
    [reverseGeocode, fetchNearbyLandmarks]
  );

  // Two-Stage GPS Acquisition:
  // Stage A: Fast initial position (2.5s timeout, recent cached fix accepted up to 60s)
  // Stage B: Asynchronous high-accuracy refinement (12s timeout, fresh fix)
  const detectGps = useCallback(
    (explicitUserTrigger = false) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setState((prev) => ({
          ...prev,
          status: 'unsupported',
          stage: 'fallback',
          locationStatus: resolveLocationStatus(prev.lat, prev.lng, prev.source, prev.landmark),
          errorMessageEn: GPS_FALLBACK_GUIDANCE_EN,
          errorMessageBn: GPS_FALLBACK_GUIDANCE_BN
        }));
        return;
      }

      const sessionId = ++detectionSessionRef.current;
      let stageAResolved = false;
      let stageBResolved = false;

      setState((prev) => ({
        ...prev,
        status: 'detecting',
        stage: 'stage_a_fast',
        errorMessageEn: null,
        errorMessageBn: null
      }));

      // Stage A: Quick lock
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!mountedRef.current || detectionSessionRef.current !== sessionId) return;
          stageAResolved = true;
          const alreadyHighPrecision =
            typeof pos.coords.accuracy === 'number' && pos.coords.accuracy <= 25;
          applyGpsFix(
            pos,
            alreadyHighPrecision ? 'complete' : 'stage_b_refining',
            explicitUserTrigger
          );
        },
        (err) => {
          if (!mountedRef.current || detectionSessionRef.current !== sessionId) return;
          if (err.code === 1) {
            const mapped = mapGeolocationError(err.code);
            setState((prev) => ({
              ...prev,
              status: 'permission_denied',
              stage: 'fallback',
              locationStatus: resolveLocationStatus(prev.lat, prev.lng, prev.source, prev.landmark),
              errorMessageEn: mapped.messageEn,
              errorMessageBn: mapped.messageBn
            }));
          } else {
            setState((prev) => ({
              ...prev,
              stage: prev.stage === 'stage_a_fast' ? 'stage_b_refining' : prev.stage
            }));
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 2500,
          maximumAge: 60000
        }
      );

      // Stage B: High-accuracy asynchronous refinement
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!mountedRef.current || detectionSessionRef.current !== sessionId) return;
          stageBResolved = true;
          applyGpsFix(pos, 'complete', explicitUserTrigger && !stageAResolved);
        },
        (err) => {
          if (!mountedRef.current || detectionSessionRef.current !== sessionId) return;
          if (stageAResolved || stageBResolved) {
            setState((prev) => ({ ...prev, stage: 'complete' }));
            return;
          }
          const mapped = mapGeolocationError(err.code);
          setState((prev) => ({
            ...prev,
            status:
              mapped.reason === 'permission_denied'
                ? 'permission_denied'
                : mapped.reason === 'position_unavailable'
                  ? 'position_unavailable'
                  : mapped.reason === 'timeout'
                    ? 'timeout'
                    : 'unknown',
            stage: 'fallback',
            locationStatus: resolveLocationStatus(prev.lat, prev.lng, prev.source, prev.landmark),
            errorMessageEn: mapped.messageEn,
            errorMessageBn: mapped.messageBn
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0
        }
      );
    },
    [applyGpsFix]
  );

  useEffect(() => {
    if (autoDetectOnMount) {
      detectGps(false);
    }
  }, [autoDetectOnMount, detectGps]);

  const setManualMapLocation = useCallback(
    (lat: number, lng: number, confirmed = true) => {
      if (!isValidCoordinatePair(lat, lng)) return;
      detectionSessionRef.current += 1;
      const now = new Date().toISOString();
      const fixedLat = Number(lat.toFixed(6));
      const fixedLng = Number(lng.toFixed(6));
      setState((prev) => ({
        ...prev,
        status: 'ready',
        stage: 'complete',
        locationStatus: 'MANUAL_PIN',
        lat: fixedLat,
        lng: fixedLng,
        accuracyMeters: undefined,
        timestamp: now,
        source: 'map_manual',
        locationConfirmed: confirmed,
        errorMessageEn: null,
        errorMessageBn: null
      }));
      void reverseGeocode(fixedLat, fixedLng);
      void fetchNearbyLandmarks(fixedLat, fixedLng);
    },
    [reverseGeocode, fetchNearbyLandmarks]
  );

  const setSearchSelectedLocation = useCallback(
    (item: GeocodeSearchResult, confirmed = true) => {
      if (!isValidCoordinatePair(item.lat, item.lng)) return;
      detectionSessionRef.current += 1;
      const now = new Date().toISOString();
      const fixedLat = Number(item.lat.toFixed(6));
      const fixedLng = Number(item.lng.toFixed(6));
      setState((prev) => ({
        ...prev,
        status: 'ready',
        stage: 'complete',
        locationStatus: 'MANUAL_PIN',
        lat: fixedLat,
        lng: fixedLng,
        accuracyMeters: undefined,
        timestamp: now,
        source: 'address_manual',
        formattedAddress: item.label,
        structuredAddress: item.structuredAddress,
        district: item.district || item.structuredAddress?.district || prev.district,
        upazila: item.upazila || item.structuredAddress?.upazila || prev.upazila,
        division: item.structuredAddress?.division || prev.division,
        locationConfirmed: confirmed,
        errorMessageEn: null,
        errorMessageBn: null
      }));
      void fetchNearbyLandmarks(fixedLat, fixedLng);
    },
    [fetchNearbyLandmarks]
  );

  const setSharedLocationCoords = useCallback(
    (lat: number, lng: number, confirmed = true) => {
      if (!isValidCoordinatePair(lat, lng)) return;
      detectionSessionRef.current += 1;
      const now = new Date().toISOString();
      const fixedLat = Number(lat.toFixed(6));
      const fixedLng = Number(lng.toFixed(6));
      setState((prev) => ({
        ...prev,
        status: 'ready',
        stage: 'complete',
        locationStatus: 'MANUAL_PIN',
        lat: fixedLat,
        lng: fixedLng,
        accuracyMeters: undefined,
        timestamp: now,
        source: 'shared_location',
        locationConfirmed: confirmed,
        errorMessageEn: null,
        errorMessageBn: null
      }));
      void reverseGeocode(fixedLat, fixedLng);
      void fetchNearbyLandmarks(fixedLat, fixedLng);
    },
    [reverseGeocode, fetchNearbyLandmarks]
  );

  // Attach a nearby landmark reference while keeping victim's real GPS intact
  const attachNearbyLandmark = useCallback((item: NearbyLandmarkItem) => {
    setState((prev) => {
      const hasExistingCoords = isValidCoordinatePair(prev.lat, prev.lng);
      const nextSource: LocationSource = hasExistingCoords ? prev.source : 'landmark';
      const referenceText = `${item.name} (${item.category}, ~${item.distanceMeters}m away)`;
      return {
        ...prev,
        nearbyLandmarkName: item.name,
        nearbyLandmarkCategory: item.category,
        nearbyLandmarkDistanceMeters: item.distanceMeters,
        landmark: referenceText,
        source: nextSource,
        locationStatus: resolveLocationStatus(prev.lat, prev.lng, nextSource, referenceText)
      };
    });
  }, []);

  const updateLandmarkNote = useCallback((landmark: string) => {
    setState((prev) => {
      const hasExistingCoords = isValidCoordinatePair(prev.lat, prev.lng);
      const nextSource: LocationSource = hasExistingCoords
        ? prev.source
        : landmark.trim()
          ? 'landmark'
          : 'unlocated';
      return {
        ...prev,
        landmark,
        source: nextSource,
        locationStatus: resolveLocationStatus(prev.lat, prev.lng, nextSource, landmark)
      };
    });
  }, []);

  const setManualAddressDetails = useCallback(
    (input: {
      road?: string;
      neighborhood?: string;
      upazila?: string;
      district?: string;
      landmark?: string;
    }) => {
      detectionSessionRef.current += 1;
      setState((prev) => {
        const struct: StructuredAddress = {};
        if (input.road?.trim()) struct.road = input.road.trim();
        if (input.neighborhood?.trim()) struct.neighborhood = input.neighborhood.trim();
        if (input.upazila?.trim()) struct.upazila = input.upazila.trim();
        if (input.district?.trim()) struct.district = input.district.trim();

        const hasStructuredFields = Object.keys(struct).length > 0;
        const lm = (input.landmark ?? prev.landmark).trim();
        const addressParts = [
          lm ? `Near ${lm}` : '',
          struct.road,
          struct.neighborhood,
          struct.upazila,
          struct.district
        ].filter(Boolean);
        const formatted = addressParts.join(', ');

        const keepCoords = isValidCoordinatePair(prev.lat, prev.lng);
        const nextSource: LocationSource = keepCoords
          ? prev.source
          : hasStructuredFields
            ? 'address_manual'
            : lm
              ? 'landmark'
              : 'unlocated';

        return {
          ...prev,
          landmark: input.landmark !== undefined ? input.landmark : prev.landmark,
          district: input.district !== undefined ? input.district : prev.district,
          upazila: input.upazila !== undefined ? input.upazila : prev.upazila,
          structuredAddress: hasStructuredFields ? struct : prev.structuredAddress,
          formattedAddress: formatted || prev.formattedAddress,
          source: nextSource,
          locationConfirmed: Boolean(hasStructuredFields || lm),
          locationStatus: resolveLocationStatus(prev.lat, prev.lng, nextSource, lm)
        };
      });
    },
    []
  );

  const confirmLocation = useCallback(() => {
    setState((prev) => ({ ...prev, locationConfirmed: true }));
  }, []);

  const startWatching = useCallback(
    (
      onUpdate: (loc: {
        lat: number;
        lng: number;
        accuracyMeters: number;
        timestamp: string;
      }) => void
    ) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      const id = navigator.geolocation.watchPosition(
        (pos) => {
          if (!mountedRef.current) return;
          const { latitude, longitude, accuracy } = pos.coords;
          if (!isValidCoordinatePair(latitude, longitude)) return;
          const ts = new Date(pos.timestamp || Date.now()).toISOString();
          const latFixed = Number(latitude.toFixed(6));
          const lngFixed = Number(longitude.toFixed(6));
          const accRounded =
            typeof accuracy === 'number' && Number.isFinite(accuracy) ? Math.round(accuracy) : 25;

          setState((prev) => ({
            ...prev,
            status: classifyGpsAccuracy(accRounded).isReliable ? 'ready' : 'poor_accuracy',
            stage: 'complete',
            locationStatus: 'GPS_RECEIVED',
            lat: latFixed,
            lng: lngFixed,
            accuracyMeters: accRounded,
            timestamp: ts,
            source: 'gps',
            isWatching: true,
            errorMessageEn: null,
            errorMessageBn: null
          }));

          onUpdate({
            lat: latFixed,
            lng: lngFixed,
            accuracyMeters: accRounded,
            timestamp: ts
          });
        },
        (err) => {
          if (!mountedRef.current) return;
          const mapped = mapGeolocationError(err.code);
          setState((prev) => ({
            ...prev,
            isWatching: false,
            errorMessageEn: mapped.messageEn,
            errorMessageBn: mapped.messageBn
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000
        }
      );

      watchIdRef.current = id;
      setState((prev) => ({ ...prev, isWatching: true }));
      return true;
    },
    []
  );

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((prev) => ({ ...prev, isWatching: false }));
  }, []);

  return {
    location: state,
    detectGps,
    setManualMapLocation,
    setSearchSelectedLocation,
    setSharedLocationCoords,
    attachNearbyLandmark,
    updateLandmarkNote,
    setManualAddressDetails,
    confirmLocation,
    startWatching,
    stopWatching
  };
}
