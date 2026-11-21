import React, { useEffect, useRef, useState } from 'react';
import { BANGLADESH_DISTRICTS } from '../../data/bangladeshData';
import type {
  EmergencyLocationState,
  GeocodeSearchResult,
  NearbyLandmarkItem
} from '../../hooks/useEmergencyLocation';
import {
  classifyGpsAccuracy,
  formatLocationSourceLabel,
  formatLocationStatusLabel,
  parseSharedLocationUrl
} from '../../utils/geolocation';
import { LeafletLocationPicker } from '../map/LeafletLocationPicker';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Edit3,
  Link2,
  Loader2,
  MapPin,
  Mic,
  MicOff,
  Navigation,
  RefreshCw,
  Search,
  Sparkles,
  X
} from 'lucide-react';

export type LocationPickerMode = 'search' | 'gps' | 'map' | 'address';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SmartLocationPickerProps {
  location: EmergencyLocationState;
  language: 'en' | 'bn';
  t: (en: string, bn: string) => string;
  onDetectGps: (explicitUserTrigger?: boolean) => void;
  onSelectMapPin: (lat: number, lng: number) => void;
  onSelectSearchResult: (item: GeocodeSearchResult) => void;
  onConfirmSharedCoords: (lat: number, lng: number) => void;
  onAttachNearbyLandmark: (item: NearbyLandmarkItem) => void;
  onUpdateLandmarkNote: (note: string) => void;
  onUpdateManualAddress: (details: {
    road?: string;
    neighborhood?: string;
    upazila?: string;
    district?: string;
    landmark?: string;
  }) => void;
  onConfirmLocation: () => void;
}

export const SmartLocationPicker: React.FC<SmartLocationPickerProps> = ({
  location,
  language,
  t,
  onDetectGps,
  onSelectMapPin,
  onSelectSearchResult,
  onConfirmSharedCoords,
  onAttachNearbyLandmark,
  onUpdateLandmarkNote,
  onUpdateManualAddress,
  onConfirmLocation
}) => {
  const [activeMode, setActiveMode] = useState<LocationPickerMode>('gps');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);

  // Voice search state (optional Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Manual address state (Option D)
  const [landmarkField, setLandmarkField] = useState(location.landmark || '');
  const [roadField, setRoadField] = useState(location.structuredAddress?.road || '');
  const [areaField, setAreaField] = useState(location.structuredAddress?.neighborhood || '');
  const [upazilaField, setUpazilaField] = useState(location.upazila || '');
  const [districtField, setDistrictField] = useState(location.district || '');

  // Shared link paste state (Option D expandable)
  const [showSharedLinkBox, setShowSharedLinkBox] = useState(false);
  const [sharedLinkInput, setSharedLinkInput] = useState('');

  // Nearby landmarks expand toggle
  const [showNearbyLandmarks, setShowNearbyLandmarks] = useState(true);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // Debounced bilingual location search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      searchAbortRef.current?.abort();
      const ctrl = new AbortController();
      searchAbortRef.current = ctrl;
      setIsSearching(true);
      setSearchError(null);

      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(trimmed)}`, {
          signal: ctrl.signal
        });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setHasSearched(true);
        if (data.providerUnavailable) {
          setSearchError(
            t(
              'Location search service is temporarily unreachable. Pick on Map or Enter Address instead.',
              'অবস্থান অনুসন্ধান সেবা সাময়িকভাবে পাওয়া যাচ্ছে না। ম্যাপ থেকে পিন করুন অথবা ঠিকানা লিখুন।'
            )
          );
          setSearchResults([]);
        } else {
          setSearchResults(Array.isArray(data.results) ? data.results : []);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setSearchError(
            t(
              'Unable to search locations right now. Try Map Pin or Manual Address.',
              'এই মুহূর্তে অনুসন্ধান করা যাচ্ছে না। ম্যাপ বা ঠিকানা ব্যবহার করুন।'
            )
          );
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, t]);

  const handleVoiceSearch = () => {
    setVoiceNotice(null);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setVoiceNotice(
        t(
          'Voice typing is unavailable in this browser. Type a place name in English or Bangla above.',
          'এই ব্রাউজারে ভয়েস সার্চ সমর্থিত নয়। উপরে বাংলা বা ইংরেজিতে স্থানের নাম লিখুন।'
        )
      );
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (event) => {
        const spoken = event.results?.[0]?.[0]?.transcript?.trim();
        if (spoken) {
          setSearchQuery(spoken);
        }
        setIsListening(false);
      };
      rec.onerror = () => {
        setIsListening(false);
        setVoiceNotice(
          t('Could not capture speech cleanly. Please type the location name.', 'কণ্ঠস্বর স্পষ্ট নয়। অনুগ্রহ করে লিখে খুঁজুন।')
        );
      };
      rec.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = rec;
      setIsListening(true);
      rec.start();
    } catch {
      setIsListening(false);
      setVoiceNotice(
        t('Voice search could not start. Please type the location name.', 'ভয়েস সার্চ চালু করা যায়নি।')
      );
    }
  };

  const handlePickSearchResult = (item: GeocodeSearchResult) => {
    onSelectSearchResult(item);
    setSearchResults([]);
    setHasSearched(false);
    setSearchQuery(item.primaryName);
  };

  const accuracyInfo = classifyGpsAccuracy(location.accuracyMeters);
  const gpsFailed =
    location.status === 'permission_denied' ||
    location.status === 'position_unavailable' ||
    location.status === 'timeout' ||
    location.status === 'unsupported' ||
    location.status === 'unknown';

  const parsedSharedLink = sharedLinkInput.trim()
    ? parseSharedLocationUrl(sharedLinkInput)
    : null;

  const struct = location.structuredAddress;
  const structuredEntries: { label: string; value: string }[] = [];
  if (struct?.houseNumber) structuredEntries.push({ label: t('House', 'বাড়ি'), value: struct.houseNumber });
  if (struct?.road) structuredEntries.push({ label: t('Road', 'সড়ক'), value: struct.road });
  if (struct?.neighborhood) structuredEntries.push({ label: t('Area', 'এলাকা'), value: struct.neighborhood });
  if (struct?.locality && struct.locality !== struct.neighborhood) {
    structuredEntries.push({ label: t('Locality', 'অঞ্চল'), value: struct.locality });
  }
  if (struct?.upazila) structuredEntries.push({ label: t('Upazila / Thana', 'উপজেলা / থানা'), value: struct.upazila });
  if (struct?.district) structuredEntries.push({ label: t('District', 'জেলা'), value: struct.district });
  if (struct?.division) structuredEntries.push({ label: t('Division', 'বিভাগ'), value: struct.division });
  if (struct?.postalCode) structuredEntries.push({ label: t('Postal Code', 'পোস্ট কোড'), value: struct.postalCode });

  return (
    <div
      className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4"
      data-testid="smart-location-picker"
    >
      {/* Clear Human-Centered Title & Subtitle */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
            {t('Where do you need help?', 'কোথায় সাহায্য প্রয়োজন?')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            {t('Find your location or select it on the map.', 'আপনার অবস্থান খুঁজুন অথবা ম্যাপ থেকে বেছে নিন।')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveMode('gps');
            onDetectGps(true);
          }}
          disabled={location.status === 'detecting'}
          className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${location.status === 'detecting' ? 'animate-spin' : ''}`} />
          <span>{t('Refresh GPS', 'জিপিএস রিফ্রেশ')}</span>
        </button>
      </div>

      {/* Four Prominent Mobile-First Location Methods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="tablist" aria-label={t('Location methods', 'অবস্থান নির্ধারণের পদ্ধতি')}>
        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'search'}
          onClick={() => setActiveMode('search')}
          className={`min-h-[54px] px-3.5 py-2.5 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
            activeMode === 'search'
              ? 'bg-cyan-600/20 border-cyan-400 text-white'
              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold leading-tight">
              {t('Search Location', 'অবস্থান খুঁজুন')}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {t('Place, road, market, hospital · খুঁজুন', 'এলাকা, রাস্তা, হাসপাতাল বা বাজার')}
            </div>
          </div>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'gps'}
          onClick={() => {
            setActiveMode('gps');
            onDetectGps(true);
          }}
          className={`min-h-[54px] px-3.5 py-2.5 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
            activeMode === 'gps'
              ? 'bg-cyan-600/20 border-cyan-400 text-white'
              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Crosshair className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold leading-tight">
              {t('Use My Current Location', 'আমার বর্তমান অবস্থান')}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {t('Auto GPS detection · বর্তমান অবস্থান', 'স্বয়ংক্রিয় জিপিএস নির্ণয়')}
            </div>
          </div>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'map'}
          onClick={() => setActiveMode('map')}
          className={`min-h-[54px] px-3.5 py-2.5 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
            activeMode === 'map'
              ? 'bg-cyan-600/20 border-cyan-400 text-white'
              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <MapPin className="w-5 h-5 text-red-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold leading-tight">
              {t('Pick Location on Map', 'ম্যাপ থেকে পিন করুন')}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {t('Tap map or drag pin · পিন করুন', 'ম্যাপে ট্যাপ করে সঠিক স্থান বাছুন')}
            </div>
          </div>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'address'}
          onClick={() => setActiveMode('address')}
          className={`min-h-[54px] px-3.5 py-2.5 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
            activeMode === 'address'
              ? 'bg-cyan-600/20 border-cyan-400 text-white'
              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Edit3 className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold leading-tight">
              {t('Enter Address or Landmark', 'ঠিকানা বা পরিচিত স্থান')}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {t('Type details or paste map link · ঠিকানা', 'রাস্তা, পরিচিত স্থান বা ম্যাপ লিংক')}
            </div>
          </div>
        </button>
      </div>

      {/* OPTION A: Bilingual Autocomplete Search + Voice Search + Map Adjust */}
      {activeMode === 'search' && (
        <div className="space-y-3 bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 flex items-center bg-slate-800 border border-slate-700 focus-within:border-cyan-400 rounded-xl px-3 min-h-[48px]">
              <Search className="w-4 h-4 text-cyan-400 shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'Search area, road, hospital, school, or বাংলা...',
                  'এলাকা, রাস্তা, হাসপাতাল, স্কুল বা বাজার খুঁজুন...'
                )}
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none py-2"
                aria-label={t('Search emergency location', 'জরুরি অবস্থান খুঁজুন')}
              />
              {isSearching && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0 ml-2" />}
              {searchQuery && !isSearching && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setHasSearched(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                  aria-label={t('Clear search text', 'লেখা মুছুন')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`min-h-[48px] min-w-[48px] px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-red-600 border-red-400 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-cyan-300'
              }`}
              aria-label={t('Voice location search', 'কণ্ঠস্বরের মাধ্যমে খুঁজুন')}
              title={t('Speak place name', 'স্থানের নাম বলুন')}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isListening ? t('Listening', 'শুনছি...') : t('Voice', 'ভয়েস')}
              </span>
            </button>
          </div>

          {voiceNotice && (
            <div className="text-xs text-amber-300 bg-amber-950/30 border border-amber-500/30 rounded-lg px-3 py-2">
              {voiceNotice}
            </div>
          )}

          {searchError && (
            <div className="text-xs text-amber-200 bg-amber-950/40 border border-amber-500/40 rounded-xl p-3">
              {searchError}
            </div>
          )}

          {!searchError && hasSearched && !isSearching && searchResults.length === 0 && (
            <div className="text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-xl p-3">
              {t(
                'No matching place found. Try district spelling, nearby landmark, or switch to Pick Location on Map.',
                'কোনো স্থান পাওয়া যায়নি। অন্য নাম লিখে দেখুন অথবা ম্যাপ থেকে পিন বসান।'
              )}
            </div>
          )}

          {searchResults.length > 0 && (
            <div
              className="bg-slate-900 border border-slate-700 rounded-xl divide-y divide-slate-800 max-h-60 overflow-y-auto"
              role="listbox"
              aria-label={t('Search suggestions', 'অনুসন্ধানের ফলাফল')}
            >
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  onClick={() => handlePickSearchResult(item)}
                  className="w-full text-left px-3.5 py-3 hover:bg-slate-800 transition-colors cursor-pointer flex items-start gap-2.5 min-h-[52px]"
                >
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-semibold text-white">
                      {item.primaryName}
                      {item.altName && (
                        <span className="text-slate-400 font-normal ml-1.5">({item.altName})</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {[item.category, item.area, item.district].filter(Boolean).join(' · ') || item.label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Embedded Map Preview After Selecting a Search Result so User Can Adjust Pin & Confirm */}
          {typeof location.lat === 'number' && typeof location.lng === 'number' && (
            <div className="pt-1 space-y-2">
              <div className="text-xs text-slate-300 flex items-center justify-between">
                <span>{t('Adjust pin on map if needed, then confirm:', 'প্রয়োজনে ম্যাপে পিন সরিয়ে নিশ্চিত করুন:')}</span>
              </div>
              <LeafletLocationPicker
                lat={location.lat}
                lng={location.lng}
                formattedAddress={location.formattedAddress}
                isGeocoding={location.isGeocoding}
                locationConfirmed={location.locationConfirmed}
                onSelectLocation={onSelectMapPin}
                onSearchResultSelect={onSelectSearchResult}
                onConfirmLocation={onConfirmLocation}
                onDetectGps={() => onDetectGps(true)}
                isDetectingGps={location.status === 'detecting'}
                language={language}
                t={t}
              />
            </div>
          )}
        </div>
      )}

      {/* OPTION B: GPS Status Feedback */}
      {activeMode === 'gps' && (
        <div className="space-y-2.5">
          {location.status === 'detecting' && (
            <div className="p-3 rounded-xl bg-cyan-950/35 border border-cyan-500/35 text-xs text-cyan-200 flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>
                {location.stage === 'stage_b_refining'
                  ? t(
                      'Acquiring high-precision GPS (you can press Send SOS right now without waiting)...',
                      'উচ্চ-নির্ভুল জিপিএস খোঁজা হচ্ছে (অপেক্ষা না করেই এখনই এসওএস পাঠাতে পারেন)...'
                    )
                  : t(
                      'Detecting your current GPS location quickly...',
                      'দ্রুত আপনার বর্তমান জিপিএস অবস্থান খোঁজা হচ্ছে...'
                    )}
              </span>
            </div>
          )}

          {gpsFailed && location.source !== 'map_manual' && location.source !== 'address_manual' && location.source !== 'shared_location' && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-2">
              <p className="leading-relaxed">
                {language === 'bn' ? location.errorMessageBn : location.errorMessageEn}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMode('search')}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
                >
                  {t('Search Location', 'অবস্থান খুঁজুন')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('map')}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
                >
                  {t('Pick on Map', 'ম্যাপে পিন করুন')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('address')}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
                >
                  {t('Enter Address', 'ঠিকানা লিখুন')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* OPTION C: Interactive Map Picker */}
      {activeMode === 'map' && (
        <LeafletLocationPicker
          lat={location.lat}
          lng={location.lng}
          formattedAddress={location.formattedAddress}
          isGeocoding={location.isGeocoding}
          locationConfirmed={location.locationConfirmed}
          onSelectLocation={onSelectMapPin}
          onSearchResultSelect={onSelectSearchResult}
          onConfirmLocation={onConfirmLocation}
          onDetectGps={() => onDetectGps(true)}
          isDetectingGps={location.status === 'detecting'}
          language={language}
          t={t}
        />
      )}

      {/* OPTION D: Enter Address or Landmark + Paste Shared Maps Link */}
      {activeMode === 'address' && (
        <div className="space-y-3 bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t('Nearby Landmark, Building, Mosque, School, or Market', 'কাছাকাছি পরিচিত স্থান, মসজিদ, স্কুল বা বাজার')}
            </label>
            <input
              type="text"
              value={landmarkField}
              onChange={(e) => {
                const val = e.target.value;
                setLandmarkField(val);
                onUpdateManualAddress({
                  road: roadField,
                  neighborhood: areaField,
                  upazila: upazilaField,
                  district: districtField,
                  landmark: val
                });
              }}
              placeholder={t(
                'e.g. Opposite Chittagong Medical Main Gate, 2nd floor',
                'যেমন: চট্টগ্রাম মেডিকেল গেটের বিপরীতে, ২য় তলা'
              )}
              className="w-full min-h-[46px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('Road / Street (Optional)', 'সড়ক / রাস্তা (ঐচ্ছিক)')}
              </label>
              <input
                type="text"
                value={roadField}
                onChange={(e) => {
                  const val = e.target.value;
                  setRoadField(val);
                  onUpdateManualAddress({
                    road: val,
                    neighborhood: areaField,
                    upazila: upazilaField,
                    district: districtField,
                    landmark: landmarkField
                  });
                }}
                placeholder={t('e.g. Agrabad Access Road', 'যেমন: আগ্রাবাদ এক্সেস রোড')}
                className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('Area / Neighborhood (Optional)', 'এলাকা / মহল্লা (ঐচ্ছিক)')}
              </label>
              <input
                type="text"
                value={areaField}
                onChange={(e) => {
                  const val = e.target.value;
                  setAreaField(val);
                  onUpdateManualAddress({
                    road: roadField,
                    neighborhood: val,
                    upazila: upazilaField,
                    district: districtField,
                    landmark: landmarkField
                  });
                }}
                placeholder={t('e.g. Halishahar, Mirpur 10', 'যেমন: হালিশহর, মিরপুর ১০')}
                className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('Upazila / Thana (Optional)', 'উপজেলা / থানা (ঐচ্ছিক)')}
              </label>
              <input
                type="text"
                value={upazilaField}
                onChange={(e) => {
                  const val = e.target.value;
                  setUpazilaField(val);
                  onUpdateManualAddress({
                    road: roadField,
                    neighborhood: areaField,
                    upazila: val,
                    district: districtField,
                    landmark: landmarkField
                  });
                }}
                placeholder={t('e.g. Double Mooring', 'যেমন: ডবলমুরিং')}
                className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('District', 'জেলা')}
              </label>
              <select
                value={districtField}
                onChange={(e) => {
                  const val = e.target.value;
                  setDistrictField(val);
                  onUpdateManualAddress({
                    road: roadField,
                    neighborhood: areaField,
                    upazila: upazilaField,
                    district: val,
                    landmark: landmarkField
                  });
                }}
                className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="">{t('Select District (if known)', 'জেলা নির্বাচন করুন')}</option>
                {BANGLADESH_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.nameBn})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expandable Shared Google Maps / OpenStreetMap Link Input */}
          <div className="border-t border-slate-800 pt-2.5">
            <button
              type="button"
              onClick={() => setShowSharedLinkBox((prev) => !prev)}
              className="min-h-[42px] w-full flex items-center justify-between text-xs font-semibold text-cyan-300 hover:text-cyan-200 cursor-pointer px-1"
            >
              <span className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                <span>{t('Paste Shared Google Maps or OpenStreetMap Link', 'শেয়ার করা Google Maps / OpenStreetMap লিংক দিন')}</span>
              </span>
              {showSharedLinkBox ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSharedLinkBox && (
              <div className="mt-2 space-y-2">
                <input
                  type="url"
                  value={sharedLinkInput}
                  onChange={(e) => setSharedLinkInput(e.target.value)}
                  placeholder="https://www.google.com/maps?q=22.3569,91.7832 or https://www.openstreetmap.org/?mlat=..."
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  aria-label={t('Shared map URL', 'শেয়ারকৃত ম্যাপ লিংক')}
                />

                {parsedSharedLink && !parsedSharedLink.valid && (
                  <p className="text-xs text-amber-300">
                    {language === 'bn' ? parsedSharedLink.errorBn : parsedSharedLink.errorEn}
                  </p>
                )}

                {parsedSharedLink && parsedSharedLink.valid && parsedSharedLink.lat !== undefined && parsedSharedLink.lng !== undefined && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/35 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-emerald-200 font-mono">
                      {parsedSharedLink.lat.toFixed(5)}, {parsedSharedLink.lng.toFixed(5)}
                      <span className="text-slate-400 font-sans ml-2">
                        ({parsedSharedLink.provider === 'google_maps' ? 'Google Maps' : 'OpenStreetMap'})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onConfirmSharedCoords(parsedSharedLink.lat!, parsedSharedLink.lng!)}
                      className="min-h-[40px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('Confirm Shared Location', 'শেয়ারকৃত অবস্থান নিশ্চিত করুন')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Location Summary + Structured Address + Nearby Landmarks */}
      {(location.lat !== null || location.formattedAddress || location.landmark) && (
        <div
          className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/35 text-xs space-y-2.5"
          data-testid="selected-location-summary"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{formatLocationStatusLabel(location.locationStatus, location.source, language)}</span>
            </span>

            <span className="text-slate-300 font-medium">
              {formatLocationSourceLabel(location.source, language)}
              {location.source === 'gps' && location.accuracyMeters !== undefined && (
                <span
                  className={`ml-2 font-mono tabular-nums ${
                    accuracyInfo.isReliable ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  · {language === 'bn' ? accuracyInfo.labelBn : accuracyInfo.labelEn}
                </span>
              )}
            </span>
          </div>

          {location.lat !== null && location.lng !== null && (
            <div className="font-mono tabular-nums text-slate-300 flex flex-wrap items-center gap-2">
              <span>
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </span>
              {location.stage === 'stage_b_refining' && (
                <span className="text-cyan-300 font-sans">
                  · {t('Refining GPS...', 'আরও নির্ভুল করা হচ্ছে...')}
                </span>
              )}
              {location.timestamp && (
                <span className="text-slate-400">
                  · {new Date(location.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}

          {location.isGeocoding ? (
            <div className="text-slate-300 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>{t('Detecting street & area address...', 'রাস্তা ও এলাকার ঠিকানা বের করা হচ্ছে...')}</span>
            </div>
          ) : (
            location.formattedAddress && (
              <div className="text-slate-100 leading-relaxed">{location.formattedAddress}</div>
            )
          )}

          {/* Structured Reverse-Geocoded Fields (ONLY fields actually returned) */}
          {structuredEntries.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 text-[11px]">
              {structuredEntries.map((entry) => (
                <div
                  key={entry.label}
                  className="bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5"
                >
                  <span className="text-slate-400 block">{entry.label}</span>
                  <span className="text-slate-100 font-medium">{entry.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Add or Correct Landmark Quick Clarification Field */}
          <div className="pt-1">
            <label className="block text-[11px] text-slate-400 mb-1">
              {t('Add or clarify exact spot / landmark (optional)', 'সঠিক স্থান বা পরিচিত চিহ্ন যোগ করুন (ঐচ্ছিক)')}
            </label>
            <input
              type="text"
              value={location.landmark}
              onChange={(e) => {
                setLandmarkField(e.target.value);
                onUpdateLandmarkNote(e.target.value);
              }}
              placeholder={t('e.g. Beside mosque gate, 3rd floor', 'যেমন: মসজিদ গেটের পাশে, ৩য় তলা')}
              className="w-full min-h-[40px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Nearby Landmarks Discovery (Overpass API) */}
          {(location.isFetchingNearby || location.nearbyLandmarks.length > 0) && (
            <div className="border-t border-emerald-500/20 pt-2.5 space-y-2">
              <button
                type="button"
                onClick={() => setShowNearbyLandmarks((prev) => !prev)}
                className="w-full flex items-center justify-between text-[11px] font-semibold text-cyan-300 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {t(
                      'Nearby Landmarks (Tap to add as rescue reference — keeps your GPS intact)',
                      'কাছাকাছি পরিচিত স্থান (রেফারেন্স হিসেবে যুক্ত করতে ট্যাপ করুন)'
                    )}
                  </span>
                </span>
                {showNearbyLandmarks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showNearbyLandmarks && (
                <>
                  {location.isFetchingNearby ? (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      <span>{t('Finding nearby hospitals, schools & landmarks...', 'কাছাকাছি হাসপাতাল, স্কুল ও স্থান খোঁজা হচ্ছে...')}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {location.nearbyLandmarks.slice(0, 6).map((lm) => {
                        const selected = location.nearbyLandmarkName === lm.name;
                        return (
                          <button
                            key={lm.id}
                            type="button"
                            onClick={() => {
                              setLandmarkField(`${lm.name} (${lm.category}, ~${lm.distanceMeters}m away)`);
                              onAttachNearbyLandmark(lm);
                            }}
                            className={`min-h-[42px] px-2.5 py-1.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                              selected
                                ? 'bg-cyan-600/25 border-cyan-400 text-white'
                                : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold truncate">{lm.name}</div>
                              <div className="text-[10px] text-slate-400 truncate">{lm.category}</div>
                            </div>
                            <span className="text-[10px] font-mono tabular-nums text-cyan-300 shrink-0 flex items-center gap-0.5">
                              <Navigation className="w-2.5 h-2.5" />
                              {lm.distanceMeters}m
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
