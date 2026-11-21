import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BANGLADESH_DISTRICTS,
  EMERGENCY_HOTLINES,
  PREPAREDNESS_GUIDES
} from '../../data/bangladeshData';
import { useEmergencyLocation } from '../../hooks/useEmergencyLocation';
import { findNearestHospital, findNearestShelter } from '../../utils/geo';
import { buildExternalMapLinks, formatLocationSourceLabel } from '../../utils/geolocation';
import {
  ShieldAlert,
  MapPin,
  Building2,
  HeartHandshake,
  ArrowRight,
  PhoneCall,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search,
  Users,
  Stethoscope,
  RefreshCw,
  Radio
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const {
    incidents,
    rescueTeams,
    shelters,
    hospitals,
    alerts,
    safePeople,
    setActiveTab,
    setSosModalOpen,
    setMarkSafeModalOpen,
    recentTracking,
    language,
    t
  } = useApp();

  const { location, detectGps } = useEmergencyLocation(false);
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('Dhaka');
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(PREPAREDNESS_GUIDES[0]?.id || null);

  const liveIncidentsCount = incidents.filter((i) => !i.isDemo).length;
  const demoIncidentsCount = incidents.filter((i) => i.isDemo).length;
  const availableTeamsCount = rescueTeams.filter((team) => team.available).length;
  const totalOccupancy = shelters.reduce((sum, s) => sum + s.currentOccupancy, 0);

  // Reference point for Nearest Shelter/Hospital: real GPS if detected, otherwise selected district centroid (explicitly labeled)
  const referenceCoords = useMemo(() => {
    if (typeof location.lat === 'number' && typeof location.lng === 'number') {
      return {
        lat: location.lat,
        lng: location.lng,
        isGps: true,
        label: location.formattedAddress || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
      };
    }
    const dist =
      BANGLADESH_DISTRICTS.find((d) => d.name === selectedDistrictName) || BANGLADESH_DISTRICTS[4];
    return {
      lat: dist.lat,
      lng: dist.lng,
      isGps: false,
      label: `${dist.name} (${dist.nameBn})`
    };
  }, [location.lat, location.lng, location.formattedAddress, selectedDistrictName]);

  const nearestShelter = useMemo(
    () => findNearestShelter(referenceCoords.lat, referenceCoords.lng, shelters),
    [referenceCoords, shelters]
  );

  const nearestHospital = useMemo(
    () => findNearestHospital(referenceCoords.lat, referenceCoords.lng, hospitals),
    [referenceCoords, hospitals]
  );

  const gpsMapLinks =
    typeof location.lat === 'number' && typeof location.lng === 'number'
      ? buildExternalMapLinks(location.lat, location.lng)
      : null;

  return (
    <div className="space-y-10">
      {/* 1. HERO: ONE-TAP SOS + AUTOMATIC GPS STATUS */}
      <section className="rounded-3xl bg-[#0F172A] border border-slate-800 shadow-2xl p-5 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left: Immediate Emergency Action */}
          <div className="lg:col-span-7 space-y-5">
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              {t(
                'Emergency Rescue & Coordination • Bangladesh',
                'জরুরি উদ্ধার ও সহায়তা সমন্বয় • বাংলাদেশ'
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
              {t('Need Emergency Rescue?', 'জরুরি সাহায্য প্রয়োজন?')}
              <span className="block text-cyan-400 mt-1.5 text-xl sm:text-2xl lg:text-3xl font-bold">
                {t(
                  'Send Your Location & Get Help in One Tap.',
                  'এক ট্যাপেই আপনার অবস্থান পাঠান এবং উদ্ধার সহায়তা নিন।'
                )}
              </span>
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t(
                'No account or form required. Press SOS to automatically detect your GPS location (or pick on map / landmark) and alert rescue operators immediately.',
                'কোনো অ্যাকাউন্ট বা ফর্ম ছাড়াই সাহায্য চান। এসওএস চাপুন—স্বয়ংক্রিয় জিপিএস বা এলাকার নামসহ আপনার জরুরি বার্তা তাৎক্ষণিক পৌঁছে যাবে।'
              )}
            </p>

            {/* Primary One-Tap SOS + Quick Actions */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSosModalOpen(true)}
                className="min-h-[56px] px-7 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-mono font-black text-base tracking-wide shadow-xl shadow-red-900/40 border border-red-400/60 flex items-center justify-center gap-3 cursor-pointer transition-colors"
              >
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <span>{t('ONE-TAP EMERGENCY SOS', 'এক-ট্যাপে জরুরি এসওএস')}</span>
              </button>

              <a
                href="tel:999"
                className="min-h-[56px] px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-red-200 border border-red-500/40 font-mono font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneCall className="w-5 h-5 text-red-400 shrink-0" />
                <span>{t('Call 999 Directly', 'সরাসরি ৯৯৯ কল করুন')}</span>
              </a>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>{t('Explore Live Disaster Map', 'লাইভ দুর্যোগ ম্যাপ')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Search className="w-4 h-4 text-cyan-400" />
                <span>
                  {recentTracking
                    ? t(`Track Active SOS (${recentTracking.id})`, `ট্র্যাক করুন (${recentTracking.id})`)
                    : t('Track Guest SOS Status', 'এসওএস অবস্থা ট্র্যাক করুন')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMarkSafeModalOpen(true)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-200 text-xs font-semibold border border-emerald-500/40 inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <span>{t('Mark Myself Safe', 'নিরাপদ আছি জানান')}</span>
              </button>
            </div>
          </div>

          {/* Right: Live Automatic GPS Status Card */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white">
                  {t('Automatic GPS Location Status', 'স্বয়ংক্রিয় জিপিএস অবস্থান')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => detectGps(true)}
                disabled={location.status === 'detecting'}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${location.status === 'detecting' ? 'animate-spin' : ''}`}
                />
                <span>
                  {location.status === 'detecting'
                    ? t('Detecting...', 'খোঁজা হচ্ছে...')
                    : t('Detect GPS', 'জিপিএস খুঁজুন')}
                </span>
              </button>
            </div>

            {typeof location.lat === 'number' && typeof location.lng === 'number' ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {formatLocationSourceLabel(location.source, language)}
                  </span>
                  {location.accuracyMeters !== undefined && (
                    <span className="font-mono tabular-nums text-slate-300">
                      ±{location.accuracyMeters} m
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono tabular-nums text-slate-200 space-y-1">
                  <div>
                    Lat: {location.lat.toFixed(5)} · Lng: {location.lng.toFixed(5)}
                  </div>
                  {location.formattedAddress && (
                    <div className="font-sans text-slate-300 text-[11px] leading-snug">
                      {location.formattedAddress}
                    </div>
                  )}
                </div>

                {gpsMapLinks && (
                  <div className="flex items-center gap-4 text-[11px]">
                    <a
                      href={gpsMapLinks.openStreetMap}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 underline"
                    >
                      <span>OpenStreetMap</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={gpsMapLinks.googleMaps}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 underline"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {location.errorMessageEn ? (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 leading-relaxed">
                    {language === 'bn' ? location.errorMessageBn : location.errorMessageEn}
                  </div>
                ) : (
                  <p className="text-slate-300 leading-relaxed">
                    {t(
                      'Location is only requested when you tap Detect GPS or press Emergency SOS. If GPS fails or is denied, you can pick a point on the map or type a nearby landmark.',
                      'আপনি "জিপিএস খুঁজুন" বা "জরুরি এসওএস" চাপলেই অবস্থান নেওয়া হবে। জিপিএস কাজ না করলে ম্যাপ থেকে পিন বা এলাকার নাম দিতে পারবেন।'
                    )}
                  </p>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>{t('Complements 999 Official Service', '৯৯৯ সরকারি সেবার সহায়ক')}</span>
              <span className="font-mono text-cyan-400">HTTPS Geolocation Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CURRENT EMERGENCY STATISTICS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Emergency Statistics">
        <div className="bg-[#0F172A] border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>{t('ACTIVE REPORTS', 'চলমান রিপোর্ট')}</span>
            <Radio className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
            {incidents.length}
          </div>
          <p className="text-[11px] text-slate-400 tabular-nums">
            {liveIncidentsCount} {t('live', 'লাইভ')} · {demoIncidentsCount} {t('demo scenarios', 'ডেমো')}
          </p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>{t('READY UNITS', 'প্রস্তুত দল')}</span>
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono tabular-nums">
            {availableTeamsCount} / {rescueTeams.length}
          </div>
          <p className="text-[11px] text-slate-400">
            {t('Demo responder units available', 'উদ্ধারকারী দল প্রস্তুত (ডেমো)')}
          </p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>{t('IN SHELTERS', 'আশ্রয়কেন্দ্রে')}</span>
            <Building2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-300 font-mono tabular-nums">
            {totalOccupancy.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 tabular-nums">
            {t(`Across ${shelters.length} sample shelters`, `${shelters.length}টি নমুনা আশ্রয়কেন্দ্রে`)}
          </p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>{t('SAFE CHECK-INS', 'নিরাপদ তথ্য')}</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tabular-nums">
            {safePeople.length}
          </div>
          <p className="text-[11px] text-slate-400">
            {t('Family safety confirmations', 'পরিবারের নিরাপদ অবস্থান নিশ্চিত')}
          </p>
        </div>
      </section>

      {/* 3. FIND NEAREST SHELTER & HOSPITAL */}
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              {t('Find Nearest Shelter & Hospital', 'নিকটতম আশ্রয়কেন্দ্র ও হাসপাতাল খুঁজুন')}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {referenceCoords.isGps
                ? t(
                    `Calculated from your detected GPS (${referenceCoords.label})`,
                    `আপনার শনাক্তকৃত জিপিএস অবস্থান থেকে দূরত্ব (${referenceCoords.label})`
                  )
                : t(
                    `Calculated from ${referenceCoords.label} center. Detect GPS for exact distance.`,
                    `${referenceCoords.label} কেন্দ্র থেকে দূরত্ব। সঠিক দূরত্বের জন্য জিপিএস ব্যবহার করুন।`
                  )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!referenceCoords.isGps && (
              <select
                aria-label="Select Reference District"
                value={selectedDistrictName}
                onChange={(e) => setSelectedDistrictName(e.target.value)}
                className="min-h-[40px] bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5"
              >
                {BANGLADESH_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.nameBn})
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold cursor-pointer"
            >
              {t('View All on Map', 'ম্যাপে সব দেখুন')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nearestShelter && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {t('Nearest Shelter (Seeded Demo)', 'নিকটতম আশ্রয়কেন্দ্র (নমুনা)')}
                </span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {nearestShelter.distanceKm} km
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{nearestShelter.shelter.name}</h3>
              <p className="text-slate-400">
                {nearestShelter.shelter.upazila}, {nearestShelter.shelter.district} · Occupancy:{' '}
                <span className="tabular-nums text-slate-200">
                  {nearestShelter.shelter.currentOccupancy}/{nearestShelter.shelter.capacity}
                </span>
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <a
                  href={`tel:${nearestShelter.shelter.contactNumber}`}
                  className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 font-mono font-semibold"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{nearestShelter.shelter.contactNumber}</span>
                </a>
                <a
                  href={buildExternalMapLinks(nearestShelter.shelter.lat, nearestShelter.shelter.lng).googleMaps}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline"
                >
                  <span>{t('Directions', 'দিকনির্দেশনা')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {nearestHospital && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4" />
                  {t('Nearest Hospital (Seeded Demo)', 'নিকটতম হাসপাতাল (নমুনা)')}
                </span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {nearestHospital.distanceKm} km
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{nearestHospital.hospital.name}</h3>
              <p className="text-slate-400">
                {nearestHospital.hospital.district} · ICU Beds:{' '}
                <span className="tabular-nums text-rose-300 font-semibold">
                  {nearestHospital.hospital.availableIcuBeds}
                </span>{' '}
                · Ambulances:{' '}
                <span className="tabular-nums text-emerald-300 font-semibold">
                  {nearestHospital.hospital.ambulanceAvailable}
                </span>
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <a
                  href={`tel:${nearestHospital.hospital.contactPhone}`}
                  className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 font-mono font-semibold"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{nearestHospital.hospital.contactPhone}</span>
                </a>
                <a
                  href={buildExternalMapLinks(nearestHospital.hospital.lat, nearestHospital.hospital.lng).googleMaps}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline"
                >
                  <span>{t('Directions', 'দিকনির্দেশনা')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. DISASTER WARNING SECTION */}
      {alerts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>{t('Active Disaster Warnings', 'দুর্যোগ সতর্কবার্তা')}</span>
            </h2>
            <span className="text-[11px] font-mono text-amber-300">
              {t('Simulated / Demonstration Advisories', 'ডেমো সতর্কবার্তা')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-[#0F172A] border border-amber-500/40 rounded-2xl p-4 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-amber-300">
                    {alert.warningLevel} · {alert.type}
                  </span>
                  {alert.isDemo && (
                    <span className="text-[10px] font-mono uppercase text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">
                      Demo Alert
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white">
                  {language === 'bn' ? alert.titleBn : alert.titleEn}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {language === 'bn' ? alert.instructionsBn : alert.instructionsEn}
                </p>
                <div className="text-[11px] text-slate-400 pt-1">
                  <strong>{t('Districts:', 'জেলা:')}</strong> {alert.affectedDistricts.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. OFFLINE-READY PREPAREDNESS & FIRST AID GUIDES */}
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white">
              {t('Emergency Preparedness & Survival Guides', 'জরুরি প্রস্তুতি ও প্রাথমিক সুরক্ষা নির্দেশিকা')}
            </h2>
            <p className="text-xs text-slate-400">
              {t(
                'Bundled offline in English & Bangla for cyclones, floods, fires, and earthquakes.',
                'ঘূর্ণিঝড়, বন্যা, অগ্নিকাণ্ড ও ভূমিকম্পে করণীয়—অফলাইনেও সহজলভ্য।'
              )}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {PREPAREDNESS_GUIDES.map((guide) => {
            const isOpen = expandedGuideId === guide.id;
            return (
              <div
                key={guide.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedGuideId(isOpen ? null : guide.id)}
                  className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {language === 'bn' ? guide.titleBn : guide.titleEn}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <strong className="text-cyan-400 block mb-1.5">
                        {t('Before', 'পূর্বে করণীয়')}
                      </strong>
                      <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                        {guide.before.map((item, idx) => (
                          <li key={idx}>{language === 'bn' ? item.bn : item.en}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong className="text-amber-400 block mb-1.5">
                        {t('During Emergency', 'জরুরি মুহূর্তে')}
                      </strong>
                      <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                        {guide.during.map((item, idx) => (
                          <li key={idx}>{language === 'bn' ? item.bn : item.en}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong className="text-emerald-400 block mb-1.5">
                        {t('After & Emergency Kit', 'পরবর্তী পদক্ষেপ ও কিট')}
                      </strong>
                      <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                        {guide.after.map((item, idx) => (
                          <li key={idx}>{language === 'bn' ? item.bn : item.en}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. HOW RESQ WORKS + OFFICIAL HOTLINES */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">
            {t('How RESQ Bangladesh Works', 'RESQ বাংলাদেশ কীভাবে কাজ করে')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="font-mono font-bold text-red-400">01. ONE-TAP SOS</div>
              <p className="text-slate-300 leading-relaxed">
                {t(
                  'Tap SOS without signing in. Automatic GPS, manual map pin, or landmark fallback sends your alert.',
                  'লগইন ছাড়াই এসওএস চাপুন। জিপিএস, ম্যাপ পিন বা এলাকার নামসহ বার্তা পৌঁছায়।'
                )}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="font-mono font-bold text-cyan-400">02. SMART DISPATCH</div>
              <p className="text-slate-300 leading-relaxed">
                {t(
                  'Authorized operators verify incidents and match nearby rescue teams by distance, skills, and equipment.',
                  'অপারেটররা তথ্য যাচাই করে দূরত্ব ও সরঞ্জাম অনুযায়ী নিকটতম দল নিয়োগ করেন।'
                )}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="font-mono font-bold text-emerald-400">03. LIVE TRACKING</div>
              <p className="text-slate-300 leading-relaxed">
                {t(
                  'Track rescue status securely using your Emergency ID and 6-character code, and share live GPS if needed.',
                  'জরুরি আইডি ও কোড দিয়ে উদ্ধারের অগ্রগতি দেখুন ও প্রয়োজনে লাইভ জিপিএস শেয়ার করুন।'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-bold text-white">
            {t('Official Bangladesh Emergency Numbers', 'সরকারি জরুরি যোগাযোগ নম্বর')}
          </h2>
          <p className="text-xs text-slate-400">
            {t(
              'RESQ complements official agencies and does not replace national emergency dispatch.',
              'RESQ সরকারি জরুরি সেবার পরিপূরক; বিকল্প নয়।'
            )}
          </p>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {EMERGENCY_HOTLINES.slice(0, 4).map((hotline) => (
              <a
                key={hotline.number}
                href={`tel:${hotline.number}`}
                className="min-h-[52px] p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between gap-2 transition-colors"
              >
                <div>
                  <div className="font-mono font-black text-white text-sm">{hotline.number}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">
                    {language === 'bn' ? hotline.titleBn : hotline.titleEn}
                  </div>
                </div>
                <PhoneCall className="w-4 h-4 text-red-400 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
