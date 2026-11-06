import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { BANGLADESH_DISTRICTS } from '../../data/bangladeshData';
import { findNearestShelter, findNearestHospital } from '../../utils/geo';
import {
  MapPin,
  Layers,
  Search,
  Crosshair,
  ShieldAlert,
  Building2,
  Navigation,
  Compass,
  Filter,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

export const BangladeshGisMap: React.FC = () => {
  const {
    incidents,
    shelters,
    hospitals,
    rescueTeams,
    setActiveTab,
    setSosModalOpen,
    language,
    t
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Layer filters
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [showShelters, setShowShelters] = useState<boolean>(true);
  const [showHospitals, setShowHospitals] = useState<boolean>(true);
  const [showRescueTeams, setShowRescueTeams] = useState<boolean>(true);
  const [showRiskZones, setShowRiskZones] = useState<boolean>(true);

  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestInfo, setNearestInfo] = useState<{
    shelterName: string;
    shelterDist: number;
    hospitalName: string;
    hospitalDist: number;
  } | null>(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Bangladesh center coordinates
    const map = L.map(mapContainerRef.current, {
      center: [23.685, 90.3563],
      zoom: 7,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: true
    });

    // Standard OpenStreetMap public tiles (free, reliable, no API key required)
    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19
      }
    ).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;

    // Cleanup on unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map markers when filters or incidents change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Render Active Incidents
    if (showIncidents) {
      incidents.forEach((inc) => {
        if (selectedDistrict !== 'All' && inc.location.district !== selectedDistrict) {
          return;
        }

        const isCritical = inc.severity === 'Critical';
        const isHigh = inc.severity === 'High';
        const color = isCritical ? '#EF4444' : isHigh ? '#F97316' : '#EAB308';

        const customIcon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `
            <div style="
              background-color: ${color};
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 14px ${color};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 13px;
            ">
              ⚠️
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([inc.location.lat, inc.location.lng], { icon: customIcon });

        const popupContent = `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; min-width: 200px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">
                ${inc.severity} ${inc.category}
              </span>
              <span style="font-family: monospace; font-size: 10px; color: #94A3B8;">${inc.id}</span>
            </div>
            <strong style="font-size: 13px; color: #F8FAFC; display: block; margin-bottom: 4px;">${inc.title}</strong>
            <p style="color: #CBD5E1; margin: 4px 0; font-size: 11px;">${inc.location.upazila}, ${inc.location.district}</p>
            <div style="background: #1E293B; padding: 6px; border-radius: 6px; margin: 6px 0; font-size: 11px;">
              <div><strong>Affected:</strong> ${inc.affectedPeople} persons</div>
              <div><strong>Status:</strong> ${inc.status}</div>
              ${inc.specialNeeds ? `<div style="color: #38BDF8; margin-top: 2px;"><strong>Needs:</strong> ${inc.specialNeeds}</div>` : ''}
            </div>
            <div style="display: flex; gap: 4px; margin-top: 6px;">
              <button onclick="window.resqDispatch && window.resqDispatch('${inc.id}')" style="background: #0284C7; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; width: 100%; font-weight: bold;">
                View Rescue Operation
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        layer.addLayer(marker);
      });
    }

    // 2. Render Cyclone Shelters
    if (showShelters) {
      shelters.forEach((shelter) => {
        if (selectedDistrict !== 'All' && shelter.district !== selectedDistrict) {
          return;
        }

        const icon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `
            <div style="
              background-color: #0284C7;
              width: 24px;
              height: 24px;
              border-radius: 6px;
              border: 2px solid #BAE6FD;
              box-shadow: 0 0 10px rgba(2, 132, 199, 0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 11px;
            ">
              🏠
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([shelter.lat, shelter.lng], { icon });
        const pct = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; min-width: 220px;">
            <div style="color: #38BDF8; font-weight: bold; font-size: 10px; text-transform: uppercase;">Cyclone Shelter</div>
            <strong style="color: #F8FAFC; font-size: 13px;">${shelter.name}</strong>
            <div style="color: #94A3B8; font-size: 11px; margin-bottom: 6px;">${shelter.upazila}, ${shelter.district}</div>
            <div style="background: #1E293B; padding: 6px; border-radius: 6px; font-size: 11px;">
              <div>Occupancy: <strong>${shelter.currentOccupancy} / ${shelter.capacity}</strong> (${pct}%)</div>
              <div style="margin-top: 4px; font-size: 10px; color: #A7F3D0;">
                ${shelter.hasDrinkingWater ? '✓ Drinking Water ' : ''}
                ${shelter.hasElectricityOrSolar ? '✓ Solar Power ' : ''}
                ${shelter.hasFemaleSafeSpace ? '✓ Female Space' : ''}
              </div>
            </div>
            <div style="margin-top: 6px; font-size: 11px; font-family: monospace; color: #38BDF8;">
              Emergency Contact: ${shelter.contactNumber}
            </div>
          </div>
        `);
        layer.addLayer(marker);
      });
    }

    // 3. Render Hospitals
    if (showHospitals) {
      hospitals.forEach((hosp) => {
        if (selectedDistrict !== 'All' && hosp.district !== selectedDistrict) {
          return;
        }

        const icon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `
            <div style="
              background-color: #059669;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 2px solid #A7F3D0;
              box-shadow: 0 0 10px rgba(5, 150, 105, 0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
            ">
              +
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([hosp.lat, hosp.lng], { icon });
        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; min-width: 220px;">
            <div style="color: #34D399; font-weight: bold; font-size: 10px;">HOSPITAL & TRAUMA CENTER</div>
            <strong style="color: #F8FAFC; font-size: 13px;">${hosp.name}</strong>
            <div style="background: #1E293B; padding: 6px; border-radius: 6px; margin: 6px 0; font-size: 11px;">
              <div>Available ICU Beds: <strong style="color: #F87171;">${hosp.availableIcuBeds}</strong></div>
              <div>Available General Beds: <strong style="color: #34D399;">${hosp.availableGeneralBeds}</strong></div>
              <div>Ambulances Standing By: <strong>${hosp.ambulanceAvailable}</strong></div>
            </div>
            <div style="font-size: 11px; font-family: monospace; color: #38BDF8;">Hotline: ${hosp.contactPhone}</div>
          </div>
        `);
        layer.addLayer(marker);
      });
    }

    // 4. Render Rescue Teams
    if (showRescueTeams) {
      rescueTeams.forEach((team) => {
        const icon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `
            <div style="
              background-color: ${team.available ? '#2563EB' : '#475569'};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 2px solid #93C5FD;
              box-shadow: 0 0 8px rgba(37, 99, 235, 0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 11px;
            ">
              🛡️
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([team.currentLocation.lat, team.currentLocation.lng], { icon });
        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; min-width: 200px;">
            <div style="color: #60A5FA; font-weight: bold; font-size: 10px;">RESCUE UNIT</div>
            <strong style="color: #F8FAFC; font-size: 13px;">${team.name}</strong>
            <div style="margin: 4px 0; font-size: 11px;">
              Status: <strong style="color: ${team.available ? '#34D399' : '#FBBF24'};">${team.available ? 'Available' : 'Dispatched / In Mission'}</strong>
            </div>
            <div style="background: #1E293B; padding: 6px; border-radius: 6px; font-size: 10px; color: #CBD5E1;">
              <strong>Equipment:</strong> ${team.equipment.slice(0, 3).join(', ')}
            </div>
          </div>
        `);
        layer.addLayer(marker);
      });
    }

    // 5. Render High-Risk Vulnerability Zones (Coastal cyclone belt & Haor flood basin)
    if (showRiskZones) {
      // Bay of Bengal Coastal Surge Zone
      const coastalZone = L.circle([21.8, 91.8], {
        radius: 65000,
        color: '#EF4444',
        fillColor: '#EF4444',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '6, 6'
      });
      coastalZone.bindTooltip('High Cyclone & Tidal Surge Risk Zone (Bay of Bengal Coast)', {
        permanent: false
      });
      layer.addLayer(coastalZone);

      // Sylhet-Sunamganj Flash Flood Basin
      const floodZone = L.circle([25.0, 91.5], {
        radius: 45000,
        color: '#0284C7',
        fillColor: '#0284C7',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '6, 6'
      });
      floodZone.bindTooltip('Active Flash Flood Haor Basin (Surma & Kushiyara river system)', {
        permanent: false
      });
      layer.addLayer(floodZone);
    }
  }, [
    incidents,
    shelters,
    hospitals,
    rescueTeams,
    showIncidents,
    showShelters,
    showHospitals,
    showRescueTeams,
    showRiskZones,
    selectedDistrict
  ]);

  // Hook global dispatch shortcut
  useEffect(() => {
    (window as any).resqDispatch = (incidentId: string) => {
      setActiveTab('operations');
    };
    return () => {
      delete (window as any).resqDispatch;
    };
  }, [setActiveTab]);

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

  const locateUserPosition = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setUserLocation({ lat: uLat, lng: uLng });

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([uLat, uLng], 12);
        }

        const nearestS = findNearestShelter(uLat, uLng, shelters);
        const nearestH = findNearestHospital(uLat, uLng, hospitals);

        if (nearestS && nearestH) {
          setNearestInfo({
            shelterName: nearestS.shelter.name,
            shelterDist: nearestS.distanceKm,
            hospitalName: nearestH.hospital.name,
            hospitalDist: nearestH.distanceKm
          });
        }
      },
      () => {
        // Fallback default: Dhaka center
        const uLat = 23.8103;
        const uLng = 90.4125;
        setUserLocation({ lat: uLat, lng: uLng });
        const nearestS = findNearestShelter(uLat, uLng, shelters);
        const nearestH = findNearestHospital(uLat, uLng, hospitals);
        if (nearestS && nearestH) {
          setNearestInfo({
            shelterName: nearestS.shelter.name,
            shelterDist: nearestS.distanceKm,
            hospitalName: nearestH.hospital.name,
            hospitalDist: nearestH.distanceKm
          });
        }
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Map Toolbar */}
      <div className="bg-[#0F172A] p-3.5 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* District Zoomer */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-300">{t('Focus District:', 'জেলা নির্বাচন:')}</span>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictZoom(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
          >
            <option value="All">{t('All Bangladesh (সমগ্র বাংলাদেশ)', 'সমগ্র বাংলাদেশ')}</option>
            {BANGLADESH_DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.nameBn}) - {d.division}
              </option>
            ))}
          </select>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 font-medium">
          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
              showIncidents
                ? 'bg-red-950/80 border-red-500 text-red-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>{t('Incidents', 'জরুরি ঘটনা')} ({incidents.length})</span>
          </button>

          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
              showShelters
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span>🏠 {t('Shelters', 'আশ্রয়কেন্দ্র')} ({shelters.length})</span>
          </button>

          <button
            onClick={() => setShowHospitals(!showHospitals)}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
              showHospitals
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span>🏥 {t('Hospitals', 'হাসপাতাল')} ({hospitals.length})</span>
          </button>

          <button
            onClick={() => setShowRescueTeams(!showRescueTeams)}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
              showRescueTeams
                ? 'bg-blue-950/80 border-blue-500 text-blue-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span>🛡️ {t('Rescue Units', 'উদ্ধারকারী দল')} ({rescueTeams.length})</span>
          </button>

          <button
            onClick={() => setShowRiskZones(!showRiskZones)}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
              showRiskZones
                ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span>⚠️ {t('Risk Zones', 'ঝুঁকিপূর্ণ জোন')}</span>
          </button>
        </div>

        {/* Geolocation Button */}
        <button
          onClick={locateUserPosition}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition-all"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>{t('Locate Nearest Services', 'নিকটবর্তী সেবা খুঁজুন')}</span>
        </button>
      </div>

      {/* Nearest Services Alert Pill */}
      {nearestInfo && (
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 border border-cyan-500/40 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-slate-300 font-medium">
              {t('Nearest Shelter:', 'নিকটতম সাইক্লোন শেল্টার:')}{' '}
              <strong className="text-white">{nearestInfo.shelterName}</strong> ({nearestInfo.shelterDist} km away)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-medium">
              {t('Nearest Hospital:', 'নিকটতম হাসপাতাল:')}{' '}
              <strong className="text-white">{nearestInfo.hospitalName}</strong> ({nearestInfo.hospitalDist} km away)
            </span>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl text-xs space-y-1.5 shadow-xl max-w-xs pointer-events-auto">
          <div className="font-bold text-slate-200 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('Map Legend & Status', 'ম্যাপ নির্দেশিকা')}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white"></span>
            <span>{t('Critical Incident (SOS Pending/Active)', 'মারাত্মক জরুরি অবস্থা')}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-md bg-cyan-600 border border-cyan-200"></span>
            <span>{t('Cyclone / Flood Shelter (Safe Haven)', 'সাইক্লোন আশ্রয়কেন্দ্র')}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-emerald-200"></span>
            <span>{t('Hospital / Medical Center', 'হাসপাতাল ও ট্রমা সেন্টার')}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-blue-200"></span>
            <span>{t('Rescue Flotilla / Volunteer Unit', 'উদ্ধারকারী দল')}</span>
          </div>
        </div>

        {/* Quick SOS Trigger Overlay on Map */}
        <div className="absolute top-4 right-4 z-20 pointer-events-auto">
          <button
            onClick={() => setSosModalOpen(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-extrabold px-3.5 py-2 rounded-xl shadow-lg shadow-red-600/40 border border-red-400 text-xs animate-emergency-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{t('REPORT SOS AT LOCATION', 'এই অবস্থানে এসওএস দিন')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
