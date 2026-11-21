import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { BANGLADESH_DISTRICTS } from '../../data/bangladeshData';
import type { GeocodeSearchResult } from '../../hooks/useEmergencyLocation';
import {
  CheckCircle2,
  Crosshair,
  Loader2,
  MapPin,
  Maximize2,
  Minimize2,
  Search,
  X
} from 'lucide-react';

interface LeafletLocationPickerProps {
  lat: number | null;
  lng: number | null;
  formattedAddress?: string;
  isGeocoding?: boolean;
  locationConfirmed?: boolean;
  onSelectLocation: (lat: number, lng: number) => void;
  onSearchResultSelect?: (item: GeocodeSearchResult) => void;
  onConfirmLocation?: () => void;
  onDetectGps?: () => void;
  isDetectingGps?: boolean;
  language?: 'en' | 'bn';
  t: (en: string, bn: string) => string;
}

export const LeafletLocationPicker: React.FC<LeafletLocationPickerProps> = ({
  lat,
  lng,
  formattedAddress,
  isGeocoding,
  locationConfirmed,
  onSelectLocation,
  onSearchResultSelect,
  onConfirmLocation,
  onDetectGps,
  isDetectingGps,
  language = 'en',
  t
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onSelectRef = useRef(onSelectLocation);
  onSelectRef.current = onSelectLocation;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [jumpDistrict, setJumpDistrict] = useState<string>('');

  // Embedded map search box state
  const [mapQuery, setMapQuery] = useState('');
  const [mapSearchResults, setMapSearchResults] = useState<GeocodeSearchResult[]>([]);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [mapSearchError, setMapSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialLat = typeof lat === 'number' ? lat : 23.8103;
    const initialLng = typeof lng === 'number' ? lng : 90.4125;
    const initialZoom = typeof lat === 'number' ? 15 : 7;

    const map = L.map(containerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      minZoom: 6,
      maxZoom: 18
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      subdomains: ['a', 'b', 'c'],
      maxZoom: 19
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'resq-manual-pin',
      html: `<div style="width:28px;height:28px;border-radius:50%;background:#ef4444;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;border-radius:50%;background:#ffffff;"></div></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: pinIcon
    });

    if (typeof lat === 'number' && typeof lng === 'number') {
      marker.addTo(map);
    }

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onSelectRef.current(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const clickedLat = Number(e.latlng.lat.toFixed(6));
      const clickedLng = Number(e.latlng.lng.toFixed(6));
      marker.setLatLng([clickedLat, clickedLng]);
      if (!map.hasLayer(marker)) {
        marker.addTo(map);
      }
      onSelectRef.current(clickedLat, clickedLng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    setTimeout(() => map.invalidateSize(), 150);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    if (typeof lat === 'number' && typeof lng === 'number') {
      marker.setLatLng([lat, lng]);
      if (!map.hasLayer(marker)) {
        marker.addTo(map);
      }
      const nextZoom = Math.max(map.getZoom(), 15);
      map.setView([lat, lng], nextZoom, { animate: true });
    }
  }, [lat, lng]);

  useEffect(() => {
    const timer = setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 180);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Debounced OSM search inside map picker
  useEffect(() => {
    const trimmed = mapQuery.trim();
    if (trimmed.length < 2) {
      setMapSearchResults([]);
      setMapSearchError(null);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setIsSearchingMap(true);
      setMapSearchError(null);
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(trimmed)}`, {
          signal: ctrl.signal
        });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setHasSearched(true);
        if (data.providerUnavailable) {
          setMapSearchError(
            t(
              'Search service unreachable right now. Tap on the map to drop a pin.',
              'সার্চ সেবা সাময়িকভাবে পাওয়া যাচ্ছে না। ম্যাপে ট্যাপ করে পিন বসান।'
            )
          );
          setMapSearchResults([]);
        } else {
          setMapSearchResults(Array.isArray(data.results) ? data.results : []);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setMapSearchError(
            t('Unable to search right now. Tap the map to drop a pin.', 'অনুসন্ধান করা যাচ্ছে না। ম্যাপে ট্যাপ করুন।')
          );
        }
      } finally {
        setIsSearchingMap(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [mapQuery, t]);

  const handleDistrictJump = (districtName: string) => {
    setJumpDistrict(districtName);
    const d = BANGLADESH_DISTRICTS.find((item) => item.name === districtName);
    if (d && mapRef.current) {
      mapRef.current.flyTo([d.lat, d.lng], 12);
    }
  };

  const handlePickSuggestion = (item: GeocodeSearchResult) => {
    setMapSearchResults([]);
    setHasSearched(false);
    setMapQuery(item.primaryName);
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([item.lat, item.lng]);
      if (!mapRef.current.hasLayer(markerRef.current)) {
        markerRef.current.addTo(mapRef.current);
      }
      mapRef.current.setView([item.lat, item.lng], 16, { animate: true });
    }
    if (onSearchResultSelect) {
      onSearchResultSelect(item);
    } else {
      onSelectLocation(item.lat, item.lng);
    }
  };

  const wrapperClass = isFullscreen
    ? 'fixed inset-0 z-[80] bg-slate-950 flex flex-col p-3 sm:p-5 gap-3'
    : 'space-y-2.5';

  return (
    <div className={wrapperClass} data-testid="leaflet-location-picker">
      {/* Top Search & Map Toolbar */}
      <div className="space-y-2 shrink-0">
        {isFullscreen && (
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">
                {t('Pick Location on Map', 'ম্যাপ থেকে অবস্থান নির্বাচন করুন')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t('Search a place, tap the map, or drag the red marker.', 'স্থানের নাম খুঁজুন বা লাল পিনটি সরান।')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
              aria-label={t('Exit full-screen map', 'ফুল-স্ক্রিন বন্ধ করুন')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Map Search Input */}
        <div className="relative">
          <div className="flex items-center bg-slate-800 border border-slate-700 focus-within:border-cyan-400 rounded-xl px-3 min-h-[46px]">
            <Search className="w-4 h-4 text-cyan-400 shrink-0 mr-2" />
            <input
              type="text"
              value={mapQuery}
              onChange={(e) => setMapQuery(e.target.value)}
              placeholder={t(
                'Search inside map (e.g. Agrabad, GEC Circle, বাংলা)...',
                'ম্যাপে খুঁজুন (যেমন: আগ্রাবাদ, জিইসি মোড়)...'
              )}
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none py-2"
              aria-label={t('Search location on map', 'ম্যাপে অবস্থান খুঁজুন')}
            />
            {isSearchingMap && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0 ml-2" />}
            {mapQuery && !isSearchingMap && (
              <button
                type="button"
                onClick={() => {
                  setMapQuery('');
                  setMapSearchResults([]);
                  setHasSearched(false);
                }}
                className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                aria-label={t('Clear map search', 'সার্চ মুছুন')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Suggestions Dropdown */}
          {(mapSearchResults.length > 0 || mapSearchError || (hasSearched && mapQuery.trim().length >= 2 && !isSearchingMap)) && (
            <div className="absolute left-0 right-0 top-full mt-1 z-[600] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-800">
              {mapSearchError && (
                <div className="p-3 text-xs text-amber-300">{mapSearchError}</div>
              )}
              {!mapSearchError && mapSearchResults.length === 0 && hasSearched && (
                <div className="p-3 text-xs text-slate-400">
                  {t('No matching place found. Tap directly on the map.', 'কোনো স্থান পাওয়া যায়নি। ম্যাপে ট্যাপ করে বাছুন।')}
                </div>
              )}
              {mapSearchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePickSuggestion(item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800 transition-colors cursor-pointer flex items-start gap-2.5"
                >
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {item.primaryName}
                      {item.altName ? <span className="text-slate-400 font-normal ml-1.5">({item.altName})</span> : null}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {[item.category, item.area, item.district].filter(Boolean).join(' · ') || item.label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[160px]">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              aria-label={t('Jump to district on map', 'মানচিত্রে জেলা নির্বাচন করুন')}
              value={jumpDistrict}
              onChange={(e) => handleDistrictJump(e.target.value)}
              className="w-full min-h-[42px] bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">{t('Jump to District...', 'জেলায় যান...')}</option>
              {BANGLADESH_DISTRICTS.map((d) => (
                <option key={d.name} value={d.name}>
                  {language === 'bn' ? `${d.nameBn} (${d.name})` : `${d.name} (${d.nameBn})`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {onDetectGps && (
              <button
                type="button"
                onClick={onDetectGps}
                disabled={isDetectingGps}
                className="min-h-[42px] px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
                <span>{isDetectingGps ? t('Detecting...', 'খোঁজা হচ্ছে...') : t('Use GPS', 'জিপিএস')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="min-h-[42px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              aria-label={isFullscreen ? t('Minimize map', 'ছোট করুন') : t('Expand full-screen map', 'বড় ম্যাপ দেখুন')}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isFullscreen ? t('Done', 'সম্পন্ন') : t('Full Screen', 'বড় ম্যাপ')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div
        className={`relative w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-950 ${
          isFullscreen ? 'flex-1 min-h-0' : 'h-[240px] sm:h-[280px]'
        }`}
      >
        <div ref={containerRef} className="w-full h-full" />
        <div className="absolute bottom-2 left-2 z-[400] bg-slate-950/90 border border-slate-700 px-2.5 py-1 rounded-md text-[11px] text-slate-200 pointer-events-none">
          {t('Tap map or drag red pin to exact spot', 'সঠিক স্থানে ম্যাপে ট্যাপ বা লাল পিন সরান')}
        </div>
      </div>

      {/* Reverse-Geocoded Address Preview & Sticky Confirm Bar */}
      {(typeof lat === 'number' && typeof lng === 'number') && (
        <div className="shrink-0 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0 space-y-0.5">
            <div className="text-[11px] font-mono tabular-nums text-cyan-300">
              {t('Selected Pin:', 'নির্বাচিত স্থান:')} {lat.toFixed(5)}, {lng.toFixed(5)}
            </div>
            <div className="text-xs text-slate-200 truncate">
              {isGeocoding
                ? t('Looking up street & area name...', 'ঠিকানা ও এলাকার নাম খোঁজা হচ্ছে...')
                : formattedAddress || t('Pin placed on map', 'ম্যাপে পিন বসানো হয়েছে')}
            </div>
          </div>

          {onConfirmLocation && (
            <button
              type="button"
              onClick={() => {
                onConfirmLocation();
                if (isFullscreen) setIsFullscreen(false);
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                locationConfirmed
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {locationConfirmed
                  ? t('Location Confirmed', 'অবস্থান নিশ্চিত হয়েছে')
                  : t('Confirm Location', 'অবস্থান নিশ্চিত করুন')}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
