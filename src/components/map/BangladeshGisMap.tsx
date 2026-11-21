import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { BANGLADESH_DISTRICTS } from '../../data/bangladeshData';
import { findNearestHospital, findNearestShelter } from '../../utils/geo';
import { recommendRescueTeams } from '../../utils/dispatch';
import {
  buildExternalMapLinks,
  classifyGpsAccuracy,
  formatLocationSourceLabel,
  formatLocationStatusLabel,
  isValidCoordinatePair
} from '../../utils/geolocation';
import { useEmergencyLocation } from '../../hooks/useEmergencyLocation';
import { EmergencyCategory, IncidentReport, IncidentStatus } from '../../types';
import {
  Building2,
  Clock,
  Crosshair,
  ExternalLink,
  Layers,
  MapPin,
  Navigation,
  PhoneCall,
  Radio,
  Search,
  ShieldAlert,
  Target,
  Truck,
  X
} from 'lucide-react';

interface GeocodeSuggestion {
  label: string;
  lat: number;
  lng: number;
  district?: string;
}

type DemoVisibilityMode = 'real_only' | 'include_demo' | 'demo_only';

const CATEGORIES: ('ALL' | EmergencyCategory)[] = [
  'ALL',
  'Flood',
  'Fire',
  'Cyclone',
  'Earthquake',
  'Landslide',
  'Building Collapse',
  'Road Accident',
  'Medical Emergency',
  'Drowning',
  'Missing Person',
  'Other Emergency'
];

const STATUSES: ('ALL' | IncidentStatus)[] = [
  'ALL',
  'PENDING',
  'VERIFIED',
  'ASSIGNED',
  'ACCEPTED',
  'IN_PROGRESS',
  'RESOLVED'
];

export const BangladeshGisMap: React.FC = () => {
  const {
    incidents,
    shelters,
    hospitals,
    rescueTeams,
    focusedIncidentId,
    focusRequestToken,
    focusIncidentOnMap,
    setActiveTab,
    setSosModalOpen,
    language,
    t
  } = useApp();

  const { location, detectGps } = useEmergencyLocation(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Track which incident & coordinate presence has already been auto-focused so we never hijack manual pan/zoom on polling
  const lastFocusedTokenRef = useRef<number>(-1);
  const lastInitialAutoFocusRef = useRef<boolean>(false);
  const seenRealIncidentIdsRef = useRef<Set<string>>(
    new Set(incidents.filter((i) => !i.isDemo).map((i) => i.id))
  );
  const hadCoordsForSelectedRef = useRef<boolean>(false);

  // Real vs Demo visibility: default to REAL ONLY so real SOS locations are never buried under demo clutter
  const [demoVisibility, setDemoVisibility] = useState<DemoVisibilityMode>('real_only');

  // Layer toggles (keep cluttered demo infrastructure off by default until requested)
  const [showIncidents, setShowIncidents] = useState(true);
  const [showShelters, setShowShelters] = useState(false);
  const [showHospitals, setShowHospitals] = useState(false);
  const [showRescueTeams, setShowRescueTeams] = useState(false);
  const [showRiskZones, setShowRiskZones] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);

  // Filters & search
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | EmergencyCategory>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | IncidentStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeSuggestion[]>([]);
  const [searching, setSearching] = useState(false);

  // Selected incident details panel
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(() => {
    if (focusedIncidentId) return focusedIncidentId;
    const newestReal = incidents.find((i) => !i.isDemo);
    return newestReal ? newestReal.id : null;
  });

  // Deduplicated incident list
  const uniqueIncidents = useMemo(() => {
    const map = new Map<string, IncidentReport>();
    for (const inc of incidents) {
      if (inc && inc.id && !map.has(inc.id)) {
        map.set(inc.id, inc);
      }
    }
    return Array.from(map.values());
  }, [incidents]);

  const realIncidents = useMemo(
    () => uniqueIncidents.filter((i) => !i.isDemo && i.dataSource !== 'demo'),
    [uniqueIncidents]
  );

  const demoIncidentsCount = useMemo(
    () => uniqueIncidents.filter((i) => i.isDemo || i.dataSource === 'demo').length,
    [uniqueIncidents]
  );

  const pendingLocationRealIncidents = useMemo(
    () =>
      realIncidents.filter(
        (inc) => !isValidCoordinatePair(inc.location.lat, inc.location.lng)
      ),
    [realIncidents]
  );

  // Incident search matches (ID, district, landmark, address, title)
  const matchingSearchIncidents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return uniqueIncidents
      .filter(
        (inc) =>
          inc.id.toLowerCase().includes(q) ||
          inc.title.toLowerCase().includes(q) ||
          inc.location.district.toLowerCase().includes(q) ||
          inc.location.upazila.toLowerCase().includes(q) ||
          (inc.location.landmark || '').toLowerCase().includes(q) ||
          (inc.location.formattedAddress || '').toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [uniqueIncidents, searchQuery]);

  const filteredIncidents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return uniqueIncidents.filter((inc) => {
      const isDemoRecord = Boolean(inc.isDemo || inc.dataSource === 'demo');
      const isExplicitlySelected =
        inc.id === selectedIncidentId || inc.id === focusedIncidentId;

      if (demoVisibility === 'real_only' && isDemoRecord && !isExplicitlySelected) return false;
      if (demoVisibility === 'demo_only' && !isDemoRecord) return false;

      if (!isExplicitlySelected) {
        if (selectedDistrict !== 'All' && inc.location.district !== selectedDistrict) return false;
        if (selectedCategory !== 'ALL' && inc.category !== selectedCategory) return false;
        if (selectedStatus !== 'ALL' && inc.status !== selectedStatus) return false;
        if (q.length >= 2) {
          const matchesText =
            inc.id.toLowerCase().includes(q) ||
            inc.title.toLowerCase().includes(q) ||
            inc.location.district.toLowerCase().includes(q) ||
            (inc.location.landmark || '').toLowerCase().includes(q) ||
            (inc.location.formattedAddress || '').toLowerCase().includes(q);
          // Only narrow incident markers when query clearly targets an incident ID or incident text match
          if (q.startsWith('resq-') && !matchesText) return false;
        }
      }
      return true;
    });
  }, [
    uniqueIncidents,
    demoVisibility,
    selectedDistrict,
    selectedCategory,
    selectedStatus,
    searchQuery,
    selectedIncidentId,
    focusedIncidentId
  ]);

  const selectedIncident: IncidentReport | null = useMemo(() => {
    if (!selectedIncidentId) return null;
    return uniqueIncidents.find((i) => i.id === selectedIncidentId) || null;
  }, [uniqueIncidents, selectedIncidentId]);

  const nearestResponderForSelected = useMemo(() => {
    if (!selectedIncident) return null;
    const recs = recommendRescueTeams(selectedIncident, rescueTeams);
    return recs[0] || null;
  }, [selectedIncident, rescueTeams]);

  const nearestToUser = useMemo(() => {
    if (typeof location.lat !== 'number' || typeof location.lng !== 'number') return null;
    return {
      shelter: findNearestShelter(location.lat, location.lng, shelters),
      hospital: findNearestHospital(location.lat, location.lng, hospitals)
    };
  }, [location.lat, location.lng, shelters, hospitals]);

  const focusAndFlyToIncident = useCallback(
    (inc: IncidentReport, zoomLevel = 15) => {
      const isDemoRecord = Boolean(inc.isDemo || inc.dataSource === 'demo');
      if (isDemoRecord && demoVisibility === 'real_only') {
        setDemoVisibility('include_demo');
      }
      // Ensure filters never hide a specifically focused emergency
      if (selectedDistrict !== 'All' && inc.location.district !== selectedDistrict) {
        setSelectedDistrict('All');
      }
      if (selectedCategory !== 'ALL' && inc.category !== selectedCategory) {
        setSelectedCategory('ALL');
      }
      if (selectedStatus !== 'ALL' && inc.status !== selectedStatus) {
        setSelectedStatus('ALL');
      }

      setSelectedIncidentId(inc.id);
      const hasValid = isValidCoordinatePair(inc.location.lat, inc.location.lng);
      hadCoordsForSelectedRef.current = hasValid;

      if (hasValid && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([inc.location.lat as number, inc.location.lng as number], zoomLevel, {
          duration: 0.7
        });
      }
    },
    [demoVisibility, selectedDistrict, selectedCategory, selectedStatus]
  );

  const handleFocusLatestSos = useCallback(() => {
    setSelectedDistrict('All');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');

    const target = realIncidents[0] || uniqueIncidents[0];
    if (!target) return;
    if (target.isDemo) {
      setDemoVisibility('include_demo');
    }
    focusIncidentOnMap(target.id, false);
    setSelectedIncidentId(target.id);
    if (isValidCoordinatePair(target.location.lat, target.location.lng) && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.location.lat as number, target.location.lng as number], 15, {
        duration: 0.7
      });
    }
  }, [realIncidents, uniqueIncidents, focusIncidentOnMap]);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialTarget =
      (focusedIncidentId && uniqueIncidents.find((i) => i.id === focusedIncidentId)) ||
      realIncidents[0] ||
      null;

    const initialHasCoords =
      initialTarget &&
      isValidCoordinatePair(initialTarget.location.lat, initialTarget.location.lng);

    const map = L.map(mapContainerRef.current, {
      center: initialHasCoords
        ? [initialTarget!.location.lat as number, initialTarget!.location.lng as number]
        : [23.685, 90.3563],
      zoom: initialHasCoords ? 15 : 7,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      subdomains: ['a', 'b', 'c'],
      maxZoom: 19
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Respond to explicit focus requests (SOS submitted, Operations click, Tracker click, Focus Latest SOS)
  useEffect(() => {
    if (!focusedIncidentId) return;
    if (lastFocusedTokenRef.current === focusRequestToken) return;
    const target = uniqueIncidents.find((i) => i.id === focusedIncidentId);
    if (!target) return;
    lastFocusedTokenRef.current = focusRequestToken;
    lastInitialAutoFocusRef.current = true;
    focusAndFlyToIncident(target, 15);
  }, [focusedIncidentId, focusRequestToken, uniqueIncidents, focusAndFlyToIncident]);

  // Auto-focus newest real emergency on first mount OR when a brand-new real SOS arrives while viewing Live Map
  useEffect(() => {
    const newUnseenReal = realIncidents.find((i) => !seenRealIncidentIdsRef.current.has(i.id));
    if (newUnseenReal) {
      realIncidents.forEach((i) => seenRealIncidentIdsRef.current.add(i.id));
      focusAndFlyToIncident(newUnseenReal, 15);
      lastInitialAutoFocusRef.current = true;
      return;
    }

    if (!lastInitialAutoFocusRef.current && !focusedIncidentId && realIncidents[0]) {
      lastInitialAutoFocusRef.current = true;
      focusAndFlyToIncident(realIncidents[0], 15);
    }
  }, [realIncidents, focusedIncidentId, focusAndFlyToIncident]);

  // If the currently selected LOCATION_PENDING incident receives its first GPS fix asynchronously, zoom to it once
  useEffect(() => {
    if (!selectedIncident) return;
    const hasNow = isValidCoordinatePair(selectedIncident.location.lat, selectedIncident.location.lng);
    if (!hadCoordsForSelectedRef.current && hasNow) {
      hadCoordsForSelectedRef.current = true;
      mapInstanceRef.current?.flyTo(
        [selectedIncident.location.lat as number, selectedIncident.location.lng as number],
        15,
        { duration: 0.7 }
      );
    } else if (!hasNow) {
      hadCoordsForSelectedRef.current = false;
    }
  }, [selectedIncident]);

  // Fly to user's own GPS ONLY when the user explicitly taps "My GPS & Nearest"
  const lastUserGpsRef = useRef<string>('');
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (typeof location.lat === 'number' && typeof location.lng === 'number' && location.source === 'gps') {
      const key = `${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;
      if (lastUserGpsRef.current !== key) {
        lastUserGpsRef.current = key;
        map.flyTo([location.lat, location.lng], 13);
      }
    }
  }, [location.lat, location.lng, location.source]);

  // Render all GIS layers cleanly with zero duplicate markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // High-risk hazard zones (Demo overlay)
    if (showRiskZones) {
      const coastalZone = L.circle([21.8, 91.8], {
        radius: 65000,
        color: '#EF4444',
        fillColor: '#EF4444',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '6, 6'
      });
      coastalZone.bindTooltip('Bay of Bengal Coastal Surge Risk Zone (Demo Layer)');
      layer.addLayer(coastalZone);

      const floodZone = L.circle([25.0, 91.5], {
        radius: 45000,
        color: '#0284C7',
        fillColor: '#0284C7',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '6, 6'
      });
      floodZone.bindTooltip('Sylhet-Sunamganj Flash Flood Haor Basin (Demo Layer)');
      layer.addLayer(floodZone);
    }

    // Active Rescue Routes for visible incidents
    if (showRoutes) {
      filteredIncidents.forEach((inc) => {
        if (!inc.assignedTeamId) return;
        if (!isValidCoordinatePair(inc.location.lat, inc.location.lng)) return;
        const team = rescueTeams.find((rt) => rt.id === inc.assignedTeamId);
        if (!team) return;

        const route = L.polyline(
          [
            [team.currentLocation.lat, team.currentLocation.lng],
            [inc.location.lat as number, inc.location.lng as number]
          ],
          {
            color: '#22D3EE',
            weight: 3,
            dashArray: '8, 6',
            opacity: 0.85
          }
        );
        route.bindTooltip(`Rescue Route: ${team.name} -> ${inc.id}`);
        layer.addLayer(route);
      });
    }

    // Group incidents by approximate coordinate cluster (~1km cell) to display clear count if stacked
    const clusterCounts = new Map<string, number>();
    filteredIncidents.forEach((inc) => {
      if (!isValidCoordinatePair(inc.location.lat, inc.location.lng)) return;
      const key = `${(inc.location.lat as number).toFixed(2)},${(inc.location.lng as number).toFixed(2)}`;
      clusterCounts.set(key, (clusterCounts.get(key) || 0) + 1);
    });

    // Active Incidents (Real SOS prioritized & pulsing; GPS accuracy ring ONLY for genuine GPS fixes)
    if (showIncidents) {
      const renderedIds = new Set<string>();
      filteredIncidents.forEach((inc) => {
        if (renderedIds.has(inc.id)) return;
        renderedIds.add(inc.id);

        if (!isValidCoordinatePair(inc.location.lat, inc.location.lng)) return;
        const lat = inc.location.lat as number;
        const lng = inc.location.lng as number;
        const isDemoRecord = Boolean(inc.isDemo || inc.dataSource === 'demo');
        const isSelected = inc.id === selectedIncidentId;

        // Draw accuracy circle ONLY when source is genuine GPS — never confuse a manual pin with a GPS accuracy ring
        if (
          inc.location.locationSource === 'gps' &&
          typeof inc.location.accuracyMeters === 'number' &&
          inc.location.accuracyMeters > 0
        ) {
          const ringColor = isDemoRecord ? '#F59E0B' : '#EF4444';
          const accRing = L.circle([lat, lng], {
            radius: Math.min(inc.location.accuracyMeters, 1500),
            color: ringColor,
            fillColor: ringColor,
            fillOpacity: isSelected ? 0.18 : 0.1,
            weight: isSelected ? 1.5 : 1,
            dashArray: isDemoRecord ? '4, 4' : undefined
          });
          layer.addLayer(accRing);
        }

        const clusterKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
        const clusterCount = clusterCounts.get(clusterKey) || 1;
        const size = isSelected ? 38 : isDemoRecord ? 26 : 32;
        const bgColor = isDemoRecord
          ? '#D97706'
          : inc.severity === 'Critical' || isSelected
            ? '#EF4444'
            : '#F97316';
        const pulseClass = !isDemoRecord || isSelected ? 'resq-sos-pulse' : '';
        const borderStyle = isDemoRecord ? '2px dashed #FEF3C7' : '3px solid #FFFFFF';

        const icon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `
            <div class="${pulseClass}" style="
              background-color: ${bgColor};
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              border: ${borderStyle};
              box-shadow: 0 4px 14px rgba(0,0,0,0.55);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 800;
              font-size: ${isSelected ? '13px' : '11px'};
              font-family: monospace;
            ">
              ${isDemoRecord ? 'D' : clusterCount > 1 ? clusterCount : 'SOS'}
            </div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2]
        });

        const marker = L.marker([lat, lng], {
          icon,
          zIndexOffset: isSelected ? 1000 : isDemoRecord ? 100 : 600
        });
        marker.on('click', () => {
          setSelectedIncidentId(inc.id);
        });
        const sourceBadge = formatLocationSourceLabel(inc.location.locationSource, language);
        marker.bindTooltip(
          `${isDemoRecord ? '[DEMO] ' : '[LIVE SOS] '}${inc.id} · ${inc.category} (${sourceBadge})`
        );
        layer.addLayer(marker);
      });
    }

    // Rescue Teams (Show all when toggle ON, OR always show teams actively assigned to visible real incidents)
    const assignedTeamIds = new Set(
      filteredIncidents
        .filter((i) => i.assignedTeamId && (!i.isDemo || demoVisibility !== 'real_only'))
        .map((i) => i.assignedTeamId as string)
    );
    rescueTeams.forEach((team) => {
      const isAssignedToVisible = assignedTeamIds.has(team.id);
      if (!showRescueTeams && !isAssignedToVisible) return;
      if (selectedDistrict !== 'All' && team.baseDistrict !== selectedDistrict && !isAssignedToVisible) {
        return;
      }
      const bg = team.available ? '#2563EB' : '#D97706';
      const icon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div style="
            background-color: ${bg};
            width: 26px;
            height: 26px;
            border-radius: 6px;
            border: 2px solid #E2E8F0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
          ">R</div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      const marker = L.marker([team.currentLocation.lat, team.currentLocation.lng], { icon });
      marker.bindPopup(`
        <div style="font-size:12px;min-width:210px;">
          <div style="color:#93C5FD;font-weight:bold;font-size:10px;">RESCUE TEAM (DEMO)</div>
          <strong style="color:#F8FAFC;display:block;margin:2px 0;">${team.name}</strong>
          <div style="font-size:11px;margin:4px 0;">Status: <strong>${team.available ? 'Available' : 'Assigned / Busy'}</strong></div>
          <div style="font-size:11px;color:#CBD5E1;">Skills: ${team.skills.slice(0, 3).join(', ')}</div>
        </div>
      `);
      layer.addLayer(marker);
    });

    // Shelters (Optional Layer)
    if (showShelters) {
      shelters.forEach((shelter) => {
        if (selectedDistrict !== 'All' && shelter.district !== selectedDistrict) return;
        const icon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `
            <div style="
              background-color: #0284C7;
              width: 24px;
              height: 24px;
              border-radius: 6px;
              border: 2px solid #BAE6FD;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 11px;
              font-weight: bold;
            ">S</div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const marker = L.marker([shelter.lat, shelter.lng], { icon });
        const pct = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
        marker.bindPopup(`
          <div style="font-size:12px;min-width:210px;">
            <div style="color:#38BDF8;font-weight:bold;font-size:10px;">SHELTER (DEMO)</div>
            <strong style="color:#F8FAFC;display:block;margin:2px 0;">${shelter.name}</strong>
            <div style="color:#CBD5E1;font-size:11px;">${shelter.upazila}, ${shelter.district}</div>
            <div style="margin-top:6px;font-size:11px;">Occupancy: <strong>${shelter.currentOccupancy}/${shelter.capacity}</strong> (${pct}%)</div>
            <div style="margin-top:4px;font-family:monospace;color:#38BDF8;">Tel: ${shelter.contactNumber}</div>
          </div>
        `);
        layer.addLayer(marker);
      });
    }

    // Hospitals (Optional Layer)
    if (showHospitals) {
      hospitals.forEach((hosp) => {
        if (selectedDistrict !== 'All' && hosp.district !== selectedDistrict) return;
        const icon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `
            <div style="
              background-color: #059669;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 2px solid #A7F3D0;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 13px;
            ">+</div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const marker = L.marker([hosp.lat, hosp.lng], { icon });
        marker.bindPopup(`
          <div style="font-size:12px;min-width:210px;">
            <div style="color:#34D399;font-weight:bold;font-size:10px;">HOSPITAL (DEMO)</div>
            <strong style="color:#F8FAFC;display:block;margin:2px 0;">${hosp.name}</strong>
            <div style="margin-top:4px;font-size:11px;">ICU Beds: <strong>${hosp.availableIcuBeds}</strong> · Ambulances: <strong>${hosp.ambulanceAvailable}</strong></div>
            <div style="margin-top:4px;font-family:monospace;color:#38BDF8;">Tel: ${hosp.contactPhone}</div>
          </div>
        `);
        layer.addLayer(marker);
      });
    }

    // User's own detected GPS marker
    if (typeof location.lat === 'number' && typeof location.lng === 'number' && location.source === 'gps') {
      const userMarker = L.circleMarker([location.lat, location.lng], {
        radius: 7,
        color: '#FFFFFF',
        fillColor: '#06B6D4',
        fillOpacity: 1,
        weight: 2.5
      });
      userMarker.bindTooltip('Your Browser GPS Location');
      layer.addLayer(userMarker);
    }
  }, [
    filteredIncidents,
    selectedIncidentId,
    demoVisibility,
    shelters,
    hospitals,
    rescueTeams,
    showIncidents,
    showShelters,
    showHospitals,
    showRescueTeams,
    showRiskZones,
    showRoutes,
    selectedDistrict,
    location.lat,
    location.lng,
    location.source,
    language
  ]);

  const handleDistrictZoom = (districtName: string) => {
    setSelectedDistrict(districtName);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (districtName === 'All') {
      map.flyTo([23.685, 90.3563], 7);
      return;
    }
    const dist = BANGLADESH_DISTRICTS.find((d) => d.name === districtName);
    if (dist) {
      map.flyTo([dist.lat, dist.lng], 10);
    }
  };

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Prioritize matching Emergency ID / incident search first
    if (matchingSearchIncidents.length > 0 && q.toUpperCase().startsWith('RESQ')) {
      focusAndFlyToIncident(matchingSearchIncidents[0], 15);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(Array.isArray(data.results) ? data.results : []);
        if (data.results?.[0] && mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([data.results[0].lat, data.results[0].lng], 12);
        }
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const openDispatchConsole = (incidentId: string) => {
    try {
      sessionStorage.setItem('resq_selected_incident_id', incidentId);
    } catch {
      // Ignore storage failures
    }
    setActiveTab('operations');
  };

  const selectedAccInfo = selectedIncident
    ? classifyGpsAccuracy(selectedIncident.location.accuracyMeters)
    : null;

  return (
    <div className="space-y-4">
      {/* Real SOS Priority Notice */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-cyan-400">LIVE GIS DISPATCH MAP:</span>
          <span>
            {t(
              `Showing ${realIncidents.length} live SOS incident(s). Preloaded demo data (${demoIncidentsCount} sample scenarios, shelters & hospitals) is hidden by default to prevent clutter.`,
              `${realIncidents.length}টি লাইভ এসওএস প্রদর্শিত হচ্ছে। ম্যাপ পরিষ্কার রাখতে ডেমো তথ্যগুলো ডিফল্টভাবে লুকানো রয়েছে।`
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleFocusLatestSos}
            disabled={uniqueIncidents.length === 0}
            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Target className="w-3.5 h-3.5" />
            <span>{t('Focus Latest SOS', 'সর্বশেষ এসওএস দেখুন')}</span>
          </button>

          <button
            type="button"
            onClick={() => setSosModalOpen(true)}
            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t('Report Emergency SOS', 'জরুরি এসওএস পাঠান')}</span>
          </button>
        </div>
      </div>

      {/* Pending Location Real SOS Alert Strip (so unlocated SOS is never invisible) */}
      {pendingLocationRealIncidents.length > 0 && (
        <div className="bg-amber-950/35 border border-amber-500/40 rounded-xl px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-200 font-semibold">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {t(
                `${pendingLocationRealIncidents.length} active SOS report(s) awaiting GPS lock (Landmark / Location Pending):`,
                `${pendingLocationRealIncidents.length}টি সক্রিয় এসওএস জিপিএস বা পরিচিত স্থানের ওপর ভিত্তি করে রয়েছে:`
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pendingLocationRealIncidents.map((inc) => (
              <button
                key={inc.id}
                type="button"
                onClick={() => focusAndFlyToIncident(inc, 15)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border cursor-pointer ${
                  inc.id === selectedIncidentId
                    ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                    : 'bg-slate-900 text-amber-200 border-amber-500/40 hover:bg-slate-800'
                }`}
              >
                {inc.id} ·{' '}
                {inc.location.landmark ||
                  formatLocationStatusLabel(
                    inc.location.locationStatus,
                    inc.location.locationSource,
                    language
                  )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-[#0F172A] p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Unified Search: Emergency ID, District, Landmark, Address */}
          <form onSubmit={handleLocationSearch} className="lg:col-span-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'Search Emergency ID (RESQ-...), district, landmark, or address...',
                  'জরুরি আইডি (RESQ-...), জেলা বা এলাকা খুঁজুন...'
                )}
                className="w-full min-h-[40px] bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold cursor-pointer"
            >
              {searching ? '...' : t('Search', 'খুঁজুন')}
            </button>
          </form>

          {/* Filters */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select
              aria-label="Demo Data Visibility"
              value={demoVisibility}
              onChange={(e) => setDemoVisibility(e.target.value as DemoVisibilityMode)}
              className="min-h-[40px] bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 font-medium"
            >
              <option value="real_only">
                {t(`Real SOS Only (${realIncidents.length})`, `শুধু আসল এসওএস (${realIncidents.length})`)}
              </option>
              <option value="include_demo">
                {t(`Show Demo Data (+${demoIncidentsCount})`, `ডেমো সহ দেখান (+${demoIncidentsCount})`)}
              </option>
              <option value="demo_only">
                {t(`Demo Only (${demoIncidentsCount})`, `শুধু ডেমো (${demoIncidentsCount})`)}
              </option>
            </select>

            <select
              aria-label="Filter by District"
              value={selectedDistrict}
              onChange={(e) => handleDistrictZoom(e.target.value)}
              className="min-h-[40px] bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5"
            >
              <option value="All">{t('All Districts', 'সকল জেলা')}</option>
              {BANGLADESH_DISTRICTS.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} ({d.nameBn})
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as 'ALL' | EmergencyCategory)}
              className="min-h-[40px] bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? t('All Disasters', 'সকল ধরন') : cat}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'ALL' | IncidentStatus)}
              className="min-h-[40px] bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === 'ALL' ? t('All Statuses', 'সকল অবস্থা') : st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Instant Matching Incidents from Search */}
        {matchingSearchIncidents.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-red-300 font-semibold">
              {t('Matching SOS Records:', 'মিলে যাওয়া জরুরি রিপোর্ট:')}
            </span>
            {matchingSearchIncidents.map((inc) => (
              <button
                key={inc.id}
                type="button"
                onClick={() => focusAndFlyToIncident(inc, 15)}
                className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/70 text-red-200 border border-red-500/40 text-[11px] font-mono cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>{inc.id}</span>
                <span>·</span>
                <span className="font-sans">
                  {inc.category} ({inc.location.district})
                </span>
                {inc.isDemo && <span className="text-amber-300">[DEMO]</span>}
              </button>
            ))}
          </div>
        )}

        {/* Geocode Search Results Chips */}
        {searchResults.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-slate-400">{t('Places:', 'স্থানসমূহ:')}</span>
            {searchResults.map((res, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => mapInstanceRef.current?.flyTo([res.lat, res.lng], 13)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] cursor-pointer"
              >
                {res.label}
              </button>
            ))}
          </div>
        )}

        {/* Layer Toggles & My GPS */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {[
              {
                key: 'incidents',
                active: showIncidents,
                toggle: () => setShowIncidents(!showIncidents),
                label: `${t('Emergencies', 'জরুরি ঘটনা')} (${filteredIncidents.length})`
              },
              {
                key: 'routes',
                active: showRoutes,
                toggle: () => setShowRoutes(!showRoutes),
                label: t('Rescue Routes', 'উদ্ধার রুট')
              },
              {
                key: 'teams',
                active: showRescueTeams,
                toggle: () => setShowRescueTeams(!showRescueTeams),
                label: `${t('Demo Teams', 'ডেমো দল')} (${rescueTeams.length})`
              },
              {
                key: 'shelters',
                active: showShelters,
                toggle: () => setShowShelters(!showShelters),
                label: `${t('Demo Shelters', 'ডেমো আশ্রয়কেন্দ্র')} (${shelters.length})`
              },
              {
                key: 'hospitals',
                active: showHospitals,
                toggle: () => setShowHospitals(!showHospitals),
                label: `${t('Demo Hospitals', 'ডেমো হাসপাতাল')} (${hospitals.length})`
              },
              {
                key: 'risk',
                active: showRiskZones,
                toggle: () => setShowRiskZones(!showRiskZones),
                label: t('Risk Zones', 'ঝুঁকিপূর্ণ এলাকা')
              }
            ].map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={btn.toggle}
                className={`px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                  btn.active
                    ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => detectGps(true)}
            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 text-cyan-300 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{t('My GPS & Nearest', 'আমার জিপিএস')}</span>
          </button>
        </div>

        {/* GPS Nearest Services Banner */}
        {nearestToUser && (
          <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-3">
            {nearestToUser.shelter && (
              <div className="flex items-center gap-2 text-slate-200">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>
                  {t('Nearest Shelter:', 'নিকটতম আশ্রয়কেন্দ্র:')}{' '}
                  <strong>{nearestToUser.shelter.shelter.name}</strong> (
                  <span className="font-mono tabular-nums">
                    {nearestToUser.shelter.distanceKm} km
                  </span>
                  )
                </span>
              </div>
            )}
            {nearestToUser.hospital && (
              <div className="flex items-center gap-2 text-slate-200">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>
                  {t('Nearest Hospital:', 'নিকটতম হাসপাতাল:')}{' '}
                  <strong>{nearestToUser.hospital.hospital.name}</strong> (
                  <span className="font-mono tabular-nums">
                    {nearestToUser.hospital.distanceKm} km
                  </span>
                  )
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Map + Emergency Details Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Container */}
        <div
          className={`${
            selectedIncident ? 'lg:col-span-8' : 'lg:col-span-12'
          } relative h-[520px] sm:h-[600px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl`}
        >
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Empty Real-SOS Overlay Prompt (when no real SOS yet and demo data is hidden) */}
          {realIncidents.length === 0 && demoVisibility === 'real_only' && (
            <div className="absolute top-3 left-14 right-3 sm:right-auto z-20 max-w-md bg-slate-950/90 backdrop-blur-md border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs text-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-xl">
              <span>
                {t(
                  'No live citizen SOS submitted yet. Demo incidents are hidden to keep the map clear.',
                  'এখনো কোনো আসল এসওএস আসেনি। ম্যাপ পরিষ্কার রাখতে ডেমো ঘটনা লুকানো আছে।'
                )}
              </span>
              <button
                type="button"
                onClick={() => setDemoVisibility('include_demo')}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-semibold text-[11px] cursor-pointer"
              >
                {t('Show Demo Incidents', 'ডেমো দেখুন')}
              </button>
            </div>
          )}

          {/* Clear Compact Legend */}
          <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl text-[10px] space-y-1 shadow-xl pointer-events-auto">
            <div className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>{t('Map Legend', 'ম্যাপ নির্দেশিকা')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-white inline-block" />
              <span>{t('Live SOS (Pulsing + GPS circle)', 'লাইভ এসওএস (আসল)')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-amber-600 border border-dashed border-amber-100 inline-block" />
              <span>{t('Demo Incident (Optional filter)', 'ডেমো ঘটনা')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded bg-blue-600 border border-slate-200 inline-block" />
              <span>{t('Rescue Team + Route', 'উদ্ধার দল ও রুট')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded bg-sky-600 border border-sky-200 inline-block" />
              <span>{t('Shelter (S) · Hospital (+)', 'আশ্রয়কেন্দ্র ও হাসপাতাল')}</span>
            </div>
          </div>
        </div>

        {/* Emergency Details Panel */}
        {selectedIncident && (
          <aside className="lg:col-span-4 bg-[#0F172A] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 text-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-cyan-400 font-bold">{selectedIncident.id}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-200 font-semibold">{selectedIncident.status}</span>
                    {selectedIncident.isDemo ? (
                      <span className="text-[10px] text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded">
                        DEMO
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-200 bg-red-600/30 border border-red-500/50 px-1.5 py-0.2 rounded font-bold">
                        LIVE SOS
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{selectedIncident.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIncidentId(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                  aria-label="Close Details Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-slate-300 leading-relaxed">{selectedIncident.description}</p>

              {/* Location Verification Info */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                  <span
                    className={`font-semibold flex items-center gap-1.5 ${
                      selectedIncident.location.locationSource === 'gps'
                        ? 'text-emerald-300'
                        : selectedIncident.location.locationSource === 'map_manual' ||
                            selectedIncident.location.locationSource === 'address_manual' ||
                            selectedIncident.location.locationSource === 'shared_location'
                          ? 'text-cyan-300'
                          : 'text-amber-300'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {formatLocationStatusLabel(
                      selectedIncident.location.locationStatus,
                      selectedIncident.location.locationSource,
                      language
                    )}
                  </span>
                  <span className="font-mono text-slate-400">
                    {t('Source:', 'উৎস:')}{' '}
                    <strong className="text-slate-200">
                      {formatLocationSourceLabel(selectedIncident.location.locationSource, language)}
                    </strong>
                  </span>
                </div>

                {selectedIncident.location.locationSource === 'gps' &&
                  selectedIncident.location.accuracyMeters !== undefined &&
                  selectedAccInfo && (
                    <div className="text-[11px] font-mono text-emerald-300">
                      {t('GPS Accuracy:', 'জিপিএস নির্ভুলতা:')} ±
                      {selectedIncident.location.accuracyMeters} meters (
                      {language === 'bn' ? selectedAccInfo.labelBn : selectedAccInfo.tier})
                    </div>
                  )}

                <div className="text-slate-200 font-medium">
                  {selectedIncident.location.upazila}, {selectedIncident.location.district}
                </div>

                {selectedIncident.location.structuredAddress && (
                  <div className="text-[11px] text-slate-300 flex flex-wrap gap-x-2 gap-y-0.5">
                    {selectedIncident.location.structuredAddress.road && (
                      <span>
                        <strong className="text-slate-400">{t('Road:', 'সড়ক:')}</strong>{' '}
                        {selectedIncident.location.structuredAddress.road}
                      </span>
                    )}
                    {selectedIncident.location.structuredAddress.neighborhood && (
                      <span>
                        <strong className="text-slate-400">{t('Area:', 'এলাকা:')}</strong>{' '}
                        {selectedIncident.location.structuredAddress.neighborhood}
                      </span>
                    )}
                    {selectedIncident.location.structuredAddress.postalCode && (
                      <span>
                        <strong className="text-slate-400">{t('Postal:', 'পোস্ট:')}</strong>{' '}
                        {selectedIncident.location.structuredAddress.postalCode}
                      </span>
                    )}
                  </div>
                )}

                {selectedIncident.location.formattedAddress && (
                  <div className="text-slate-300 text-[11px] leading-snug">
                    {selectedIncident.location.formattedAddress}
                  </div>
                )}

                {selectedIncident.location.nearbyLandmarkName && (
                  <div className="text-cyan-300 text-[11px]">
                    <strong>{t('Nearby Landmark:', 'কাছাকাছি স্থান:')}</strong>{' '}
                    {selectedIncident.location.nearbyLandmarkName}
                    {typeof selectedIncident.location.nearbyLandmarkDistanceMeters === 'number'
                      ? ` (~${selectedIncident.location.nearbyLandmarkDistanceMeters}m)`
                      : ''}
                  </div>
                )}

                {selectedIncident.location.landmark && (
                  <div className="text-slate-300 text-[11px]">
                    <strong>{t('Landmark:', 'পরিচিত স্থান:')}</strong>{' '}
                    {selectedIncident.location.landmark}
                  </div>
                )}

                {(selectedIncident.lastLocationUpdate || selectedIncident.location.locationTimestamp) && (
                  <div className="text-[11px] text-slate-400 font-mono">
                    {t('Last Location Update:', 'সর্বশেষ আপডেট:')}{' '}
                    {new Date(
                      selectedIncident.lastLocationUpdate ||
                        selectedIncident.location.locationTimestamp!
                    ).toLocaleTimeString()}
                  </div>
                )}

                {selectedIncident.isLiveTracking && (
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    <span>{t('Live GPS Tracking Active', 'লাইভ জিপিএস চালু আছে')}</span>
                  </div>
                )}

                {isValidCoordinatePair(selectedIncident.location.lat, selectedIncident.location.lng) ? (
                  <>
                    <div className="font-mono tabular-nums text-cyan-300 pt-0.5">
                      {(selectedIncident.location.lat as number).toFixed(5)},{' '}
                      {(selectedIncident.location.lng as number).toFixed(5)}
                    </div>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <a
                        href={
                          buildExternalMapLinks(
                            selectedIncident.location.lat as number,
                            selectedIncident.location.lng as number
                          ).openStreetMap
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 underline"
                      >
                        <span>OpenStreetMap</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={
                          buildExternalMapLinks(
                            selectedIncident.location.lat as number,
                            selectedIncident.location.lng as number
                          ).googleMaps
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 underline"
                      >
                        <span>Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="text-[11px] text-amber-300 font-medium">
                    {t(
                      'Exact coordinates pending — coordinate via landmark or await async GPS update.',
                      'সঠিক স্থানাঙ্ক এখনো পাওয়া যায়নি — ল্যান্ডমার্ক বা পরবর্তী জিপিএস আপডেটের অপেক্ষায়।'
                    )}
                  </div>
                )}
              </div>

              {/* Nearest Recommended Responder */}
              {nearestResponderForSelected && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{t('Top Recommended Responder', 'সর্বোত্তম উদ্ধার দল')}</span>
                  </div>
                  <div className="font-semibold text-white">
                    {nearestResponderForSelected.team.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {nearestResponderForSelected.reasons.join(' · ')}
                  </div>
                </div>
              )}

              {/* Quick Incident Switcher */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-semibold block">
                  {t('Switch Filtered Incident:', 'অন্য ঘটনা দেখুন:')} ({filteredIncidents.length})
                </span>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                  {filteredIncidents.map((inc) => (
                    <button
                      key={inc.id}
                      type="button"
                      onClick={() => focusAndFlyToIncident(inc, 15)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-[11px] flex items-center justify-between gap-2 cursor-pointer ${
                        inc.id === selectedIncident.id
                          ? 'bg-cyan-950/60 border-cyan-500/60 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">
                        {inc.isDemo ? '[Demo] ' : ''}
                        {inc.title}
                      </span>
                      <span className="font-mono text-[10px] text-cyan-400 shrink-0">
                        {inc.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => openDispatchConsole(selectedIncident.id)}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{t('Open Dispatch Console', 'ডিসপ্যাচ বোর্ডে যান')}</span>
              </button>
              <a
                href="tel:999"
                className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-200 font-semibold flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                <span>{t('Call Official 999', '৯৯৯ কল করুন')}</span>
              </a>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
