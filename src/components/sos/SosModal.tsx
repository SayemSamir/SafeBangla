import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmergencyCategory, IncidentReport, NotificationDeliveryLog } from '../../types';
import { useEmergencyLocation } from '../../hooks/useEmergencyLocation';
import {
  buildExternalMapLinks,
  formatLocationSourceLabel,
  formatLocationStatusLabel
} from '../../utils/geolocation';
import { SmartLocationPicker } from './SmartLocationPicker';
import {
  Activity,
  AlertTriangle,
  Building2,
  Camera,
  Car,
  CheckCircle2,
  ExternalLink,
  Flame,
  HelpCircle,
  Loader2,
  MapPin,
  Mic,
  Navigation,
  PhoneCall,
  Radio,
  ShieldAlert,
  Square,
  UserSearch,
  Users,
  Video,
  Waves,
  Wind,
  X
} from 'lucide-react';

const QUICK_CATEGORIES: {
  id: EmergencyCategory;
  labelEn: string;
  labelBn: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'Flood', labelEn: 'Flood / Water Rescue', labelBn: 'বন্যা / পানি উদ্ধার', icon: Waves },
  { id: 'Fire', labelEn: 'Fire', labelBn: 'আগুন', icon: Flame },
  { id: 'Medical Emergency', labelEn: 'Medical Emergency', labelBn: 'জরুরি চিকিৎসা', icon: Activity },
  { id: 'Road Accident', labelEn: 'Road Accident', labelBn: 'সড়ক দুর্ঘটনা', icon: Car },
  { id: 'Building Collapse', labelEn: 'Building Collapse', labelBn: 'ভবন ধস', icon: Building2 },
  { id: 'Cyclone', labelEn: 'Cyclone', labelBn: 'ঘূর্ণিঝড়', icon: Wind },
  { id: 'Earthquake', labelEn: 'Earthquake', labelBn: 'ভূমিকম্প', icon: AlertTriangle },
  { id: 'Missing Person', labelEn: 'Trapped / Missing', labelBn: 'আটকে পড়া / নিখোঁজ', icon: UserSearch },
  { id: 'Other Emergency', labelEn: 'Other Emergency', labelBn: 'অন্যান্য জরুরি', icon: HelpCircle }
];

const SPECIAL_ASSISTANCE_OPTIONS = [
  { id: 'Infants / Children', bn: 'শিশু রয়েছে' },
  { id: 'Elderly Person', bn: 'বয়স্ক ব্যক্তি' },
  { id: 'Wheelchair / Disabled', bn: 'প্রতিবন্ধী সহায়তা' },
  { id: 'Oxygen / Medical Aid', bn: 'অক্সিজেন / চিকিৎসা' },
  { id: 'Clean Drinking Water', bn: 'বিশুদ্ধ পানি প্রয়োজন' }
];

export const SosModal: React.FC = () => {
  const {
    incidents,
    sosModalOpen,
    setSosModalOpen,
    submitGuestSos,
    updateSosDetails,
    updateLiveLocation,
    uploadMediaFile,
    focusIncidentOnMap,
    setActiveTab,
    isOnline,
    language,
    t
  } = useApp();

  const {
    location,
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
  } = useEmergencyLocation(false);

  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Post-SOS submission state (Step 2)
  const [submittedRecord, setSubmittedRecord] = useState<{
    incident: IncidentReport;
    trackingCode: string;
    deliveryLogs: NotificationDeliveryLog[];
    queuedOffline: boolean;
  } | null>(null);

  // Optional follow-up details (Step 2)
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [hasInjured, setHasInjured] = useState(false);
  const [hasTrapped, setHasTrapped] = useState(false);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [shortNote, setShortNote] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [emergencyContactInput, setEmergencyContactInput] = useState('');
  const [detailsSavedNotice, setDetailsSavedNotice] = useState<string | null>(null);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Trigger automatic GPS detection as soon as SOS modal opens
  useEffect(() => {
    if (sosModalOpen && !submittedRecord) {
      detectGps();
    }
    if (!sosModalOpen) {
      stopWatching();
    }
  }, [sosModalOpen, submittedRecord, detectGps, stopWatching]);

  if (!sosModalOpen) return null;

  // Keep Step 2 synced with any background Stage-B GPS updates in context
  const liveSubmittedIncident = submittedRecord
    ? incidents.find((i) => i.id === submittedRecord.incident.id) || submittedRecord.incident
    : null;

  const handleOneTapSos = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitGuestSos({
        category: selectedCategory || 'Other Emergency',
        lat: location.lat,
        lng: location.lng,
        accuracyMeters: location.accuracyMeters,
        locationSource: location.source,
        locationTimestamp: location.timestamp,
        formattedAddress: location.formattedAddress,
        structuredAddress: location.structuredAddress,
        landmark: location.landmark,
        nearbyLandmarkName: location.nearbyLandmarkName,
        nearbyLandmarkCategory: location.nearbyLandmarkCategory,
        nearbyLandmarkDistanceMeters: location.nearbyLandmarkDistanceMeters,
        district: location.district,
        upazila: location.upazila,
        division: location.division,
        isAnonymous: true,
        isLiveTracking: location.source === 'gps' && Boolean(location.lat)
      });
      setSubmittedRecord(result);
    } catch {
      setSubmitError(
        t(
          'Unable to submit right now. Please dial 999 directly for immediate assistance.',
          'এই মুহূর্তে পাঠানো যাচ্ছে না। তাৎক্ষণিক সহায়তার জন্য সরাসরি ৯৯৯ নম্বরে কল করুন।'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLiveTracking = () => {
    if (!submittedRecord) return;
    if (location.isWatching) {
      stopWatching();
      void updateLiveLocation(submittedRecord.incident.id, submittedRecord.trackingCode, {
        lat: location.lat || 0,
        lng: location.lng || 0,
        isLiveTracking: false
      });
    } else {
      startWatching((pos) => {
        void updateLiveLocation(submittedRecord.incident.id, submittedRecord.trackingCode, {
          lat: pos.lat,
          lng: pos.lng,
          accuracyMeters: pos.accuracyMeters,
          isLiveTracking: true
        });
      });
    }
  };

  const handleSaveAdditionalDetails = async () => {
    if (!submittedRecord) return;
    setIsSavingDetails(true);
    setDetailsSavedNotice(null);

    const updated = await updateSosDetails(
      submittedRecord.incident.id,
      submittedRecord.trackingCode,
      {
        category: selectedCategory || submittedRecord.incident.category,
        affectedPeople: peopleCount,
        hasInjured,
        hasTrapped,
        specialNeeds: selectedNeeds.join(', '),
        description: shortNote || undefined,
        reporterPhone: phoneInput || undefined,
        emergencyContactPhone: emergencyContactInput || undefined,
        landmark: location.landmark || undefined,
        nearbyLandmarkName: location.nearbyLandmarkName,
        nearbyLandmarkCategory: location.nearbyLandmarkCategory,
        nearbyLandmarkDistanceMeters: location.nearbyLandmarkDistanceMeters,
        lat: location.lat,
        lng: location.lng,
        accuracyMeters: location.accuracyMeters,
        locationSource: location.source,
        formattedAddress: location.formattedAddress,
        structuredAddress: location.structuredAddress
      }
    );

    setIsSavingDetails(false);
    if (updated) {
      setSubmittedRecord((prev) => (prev ? { ...prev, incident: updated } : prev));
      setDetailsSavedNotice(
        t('Additional help details saved and sent to responders.', 'অতিরিক্ত তথ্য সফলভাবে পাঠানো হয়েছে।')
      );
    } else {
      setDetailsSavedNotice(
        t(
          'Saved locally on device (offline or pending sync).',
          'ডিভাইসে সংরক্ষিত হয়েছে (সংযোগ পেলে সিঙ্ক হবে)।'
        )
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !submittedRecord) return;
    setUploadStatus(t('Uploading media...', 'ফাইল আপলোড হচ্ছে...'));
    try {
      const uploaded = await uploadMediaFile(file);
      if (!uploaded) {
        setUploadStatus(
          t('Upload failed (max 4MB JPG/PNG/WebP/MP4/WebM).', 'আপলোড ব্যর্থ হয়েছে (সর্বোচ্চ ৪ মেগাবাইট)।')
        );
        return;
      }
      const updated = await updateSosDetails(
        submittedRecord.incident.id,
        submittedRecord.trackingCode,
        { mediaAttachment: uploaded }
      );
      if (updated) {
        setSubmittedRecord((prev) => (prev ? { ...prev, incident: updated } : prev));
      }
      setUploadStatus(t('Media attached to emergency report.', 'ছবি/ভিডিও সংযুক্ত হয়েছে।'));
    } catch {
      setUploadStatus(t('Unable to upload file.', 'ফাইল আপলোড করা যায়নি।'));
    }
  };

  const handleStartStopVoice = async () => {
    setVoiceError(null);
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoiceError(
        t('Voice recording is not supported in this browser.', 'এই ব্রাউজারে ভয়েস রেকর্ডিং সমর্থিত নয়।')
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (!submittedRecord || audioBlob.size === 0) return;
        setUploadStatus(t('Uploading voice message...', 'ভয়েস মেসেজ আপলোড হচ্ছে...'));
        const uploaded = await uploadMediaFile(audioBlob, 'audio/webm');
        if (uploaded) {
          const updated = await updateSosDetails(
            submittedRecord.incident.id,
            submittedRecord.trackingCode,
            { mediaAttachment: uploaded }
          );
          if (updated) {
            setSubmittedRecord((prev) => (prev ? { ...prev, incident: updated } : prev));
          }
          setUploadStatus(t('Voice message attached.', 'ভয়েস মেসেজ যুক্ত হয়েছে।'));
        } else {
          setUploadStatus(t('Voice upload failed.', 'ভয়েস আপলোড ব্যর্থ হয়েছে।'));
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setVoiceError(
        t('Microphone permission denied or unavailable.', 'মাইক্রোফোন অনুমতি পাওয়া যায়নি।')
      );
    }
  };

  const handleClose = () => {
    stopWatching();
    setSosModalOpen(false);
    setSubmittedRecord(null);
    setDetailsSavedNotice(null);
    setUploadStatus(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t('Emergency SOS Request', 'জরুরি এসওএস অনুরোধ')}
    >
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-red-500/50 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {submittedRecord
                  ? t('SOS Request Sent — Help Is Being Coordinated', 'এসওএস পাঠানো হয়েছে')
                  : t('One-Tap Emergency SOS', 'এক-ট্যাপে জরুরি সাহায্য চান')}
              </h2>
              <p className="text-xs text-slate-400">
                {submittedRecord
                  ? t('No login required · Save your Emergency ID & Code', 'লগইন ছাড়াই ট্র্যাক করতে পারবেন')
                  : t('No form required · Press Send SOS immediately', 'কোনো ফর্ম ছাড়াই সাহায্য পাঠান')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label={t('Close SOS window', 'বন্ধ করুন')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {!submittedRecord ? (
            <>
              {/* 1. Primary Immediate Action — Works with 1 tap and zero typing */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleOneTapSos}
                  disabled={isSubmitting}
                  className="w-full min-h-[60px] py-4 px-5 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-bold text-base sm:text-lg shadow-xl shadow-red-950/60 border border-red-400/50 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>{t('SENDING EMERGENCY SOS...', 'এসওএস পাঠানো হচ্ছে...')}</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-6 h-6 shrink-0" />
                      <span>{t('SEND EMERGENCY SOS NOW', 'এখনই জরুরি সাহায্য পাঠান')}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span>
                    {t(
                      'Works without typing, login, or GPS. Add details afterward if safe.',
                      'টাইপিং, লগইন বা জিপিএস ছাড়াই কাজ করে।'
                    )}
                  </span>
                  <a
                    href="tel:999"
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-red-300 font-semibold border border-slate-700"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{t('Call 999', '৯৯৯ কল')}</span>
                  </a>
                </div>

                {submitError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200">
                    {submitError}
                  </div>
                )}
              </div>

              {/* 2. Redesigned Human-Centered Smart Location Picker */}
              <SmartLocationPicker
                location={location}
                language={language}
                t={t}
                onDetectGps={detectGps}
                onSelectMapPin={setManualMapLocation}
                onSelectSearchResult={setSearchSelectedLocation}
                onConfirmSharedCoords={setSharedLocationCoords}
                onAttachNearbyLandmark={attachNearbyLandmark}
                onUpdateLandmarkNote={updateLandmarkNote}
                onUpdateManualAddress={setManualAddressDetails}
                onConfirmLocation={confirmLocation}
              />

              {/* 3. Optional Quick Emergency Categories (Large Touch Targets) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    {t('What kind of emergency? (Optional)', 'কী ধরনের জরুরি অবস্থা? (ঐচ্ছিক)')}
                  </span>
                  {selectedCategory && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(undefined)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      {t('Clear', 'মুছুন')}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUICK_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const active = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(active ? undefined : cat.id)}
                        className={`min-h-[48px] px-3 py-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                          active
                            ? 'bg-red-600/25 border-red-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-red-400' : 'text-cyan-400'}`} />
                        <span className="leading-snug">
                          {language === 'bn' ? cat.labelBn : cat.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* STEP 2: Confirmation + Live Tracking + Optional Additional Help */
            <div className="space-y-5">
              {/* Receipt Card */}
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">
                      {submittedRecord.queuedOffline
                        ? t('SOS Saved Offline — Will Send Automatically', 'অফলাইনে সংরক্ষিত হয়েছে')
                        : t('Emergency Request Received', 'জরুরি অনুরোধ গৃহীত হয়েছে')}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {t(
                        'Authorized operators have been alerted. Keep this ID and Code to track rescue status.',
                        'অপারেটরদের কাছে বার্তা পৌঁছেছে। অবস্থা জানতে এই আইডি ও কোড সংরক্ষণ করুন।'
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <span className="text-[11px] text-slate-400 block">
                      {t('Emergency ID', 'জরুরি আইডি')}
                    </span>
                    <span className="text-lg font-mono font-bold text-white tabular-nums">
                      {submittedRecord.incident.id}
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <span className="text-[11px] text-slate-400 block">
                      {t('Private Tracking Code', 'গোপন ট্র্যাকিং কোড')}
                    </span>
                    <span className="text-lg font-mono font-bold text-cyan-300 tracking-widest">
                      {submittedRecord.trackingCode}
                    </span>
                  </div>
                </div>

                {/* Synced Location Summary on Receipt */}
                {liveSubmittedIncident && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {formatLocationStatusLabel(
                          liveSubmittedIncident.location.locationStatus,
                          liveSubmittedIncident.location.locationSource,
                          language
                        )}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {formatLocationSourceLabel(liveSubmittedIncident.location.locationSource, language)}
                        {liveSubmittedIncident.location.locationSource === 'gps' &&
                          liveSubmittedIncident.location.accuracyMeters !== undefined &&
                          ` · ±${liveSubmittedIncident.location.accuracyMeters}m`}
                      </span>
                    </div>
                    {typeof liveSubmittedIncident.location.lat === 'number' &&
                    typeof liveSubmittedIncident.location.lng === 'number' ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-300">
                        <span>
                          {liveSubmittedIncident.location.lat.toFixed(5)},{' '}
                          {liveSubmittedIncident.location.lng.toFixed(5)}
                        </span>
                        <div className="flex items-center gap-3 font-sans">
                          <a
                            href={
                              buildExternalMapLinks(
                                liveSubmittedIncident.location.lat,
                                liveSubmittedIncident.location.lng
                              ).googleMaps
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 underline"
                          >
                            <span>Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={
                              buildExternalMapLinks(
                                liveSubmittedIncident.location.lat,
                                liveSubmittedIncident.location.lng
                              ).openStreetMap
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 underline"
                          >
                            <span>OpenStreetMap</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-200">
                        {liveSubmittedIncident.location.landmark
                          ? `${t('Landmark:', 'পরিচিত স্থান:')} ${liveSubmittedIncident.location.landmark}`
                          : t(
                              'Location Pending — waiting for GPS fix or add landmark/map pin below.',
                              'অবস্থান প্রক্রিয়াধীন — জিপিএসের জন্য অপেক্ষা করা হচ্ছে অথবা নিচে এলাকা/পিন যোগ করুন।'
                            )}
                      </div>
                    )}
                    {liveSubmittedIncident.location.formattedAddress && (
                      <p className="text-[11px] text-slate-300">
                        {liveSubmittedIncident.location.formattedAddress}
                      </p>
                    )}
                    {liveSubmittedIncident.location.nearbyLandmarkName && (
                      <p className="text-[11px] text-cyan-300">
                        {t('Reference:', 'রেফারেন্স:')} {liveSubmittedIncident.location.nearbyLandmarkName}
                        {typeof liveSubmittedIncident.location.nearbyLandmarkDistanceMeters === 'number'
                          ? ` (~${liveSubmittedIncident.location.nearbyLandmarkDistanceMeters}m)`
                          : ''}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {t('Current Status:', 'বর্তমান অবস্থা:')}{' '}
                      <strong className="text-white">
                        {liveSubmittedIncident?.status || submittedRecord.incident.status}
                      </strong>
                    </span>
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const id = submittedRecord.incident.id;
                        handleClose();
                        focusIncidentOnMap(id, true);
                      }}
                      className="min-h-[38px] px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t('Focus on Live Map', 'লাইভ ম্যাপে দেখুন')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        setActiveTab('track');
                      }}
                      className="min-h-[38px] px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold cursor-pointer"
                    >
                      {t('Open Live Tracker', 'লাইভ ট্র্যাকার খুলুন')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Location Sharing Control */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Navigation className="w-4 h-4 text-cyan-400" />
                    <span>{t('Live Location Sharing', 'লাইভ অবস্থান শেয়ারিং')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleLiveTracking}
                    disabled={!isOnline}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                      location.isWatching
                        ? 'bg-red-600/20 text-red-300 border border-red-500/40 hover:bg-red-600/30'
                        : 'bg-cyan-600 text-white hover:bg-cyan-500'
                    }`}
                  >
                    {location.isWatching
                      ? t('Stop Sharing Location', 'লোকেশন শেয়ার বন্ধ করুন')
                      : t('Start Live Location Sharing', 'লাইভ লোকেশন চালু করুন')}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {location.isWatching
                    ? t(
                        `Sharing live GPS updates while this browser page stays open. Last coordinates: ${location.lat?.toFixed(5) || '—'}, ${location.lng?.toFixed(5) || '—'} (±${location.accuracyMeters || '?'}m)`,
                        `পেজ খোলা থাকা অবস্থায় লাইভ জিপিএস আপডেট পাঠানো হচ্ছে।`
                      )
                    : t(
                        'Optional: Keep sharing your moving location while the browser stays open. Browser restrictions pause background GPS if the screen is locked.',
                        'ঐচ্ছিক: ব্রাউজার খোলা রেখে আপনার চলমান অবস্থান উদ্ধারকারীদের জানান।'
                      )}
                </p>
              </div>

              {/* Optional Additional Help (Simple Icons & Buttons) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {t('Add Helpful Details (Optional)', 'সহায়ক তথ্য যোগ করুন (ঐচ্ছিক)')}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {t(
                      'Only fill what you can safely share right now.',
                      'নিরাপদ থাকলে নিচের তথ্যগুলো যুক্ত করতে পারেন।'
                    )}
                  </p>
                </div>

                {/* Victim Count & Injury / Trapped Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      {t('People Needing Rescue', 'কতজন আটকা পড়েছেন')}
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 3, 6, 15].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setPeopleCount(cnt)}
                          className={`min-h-[42px] rounded-lg text-xs font-bold border cursor-pointer ${
                            peopleCount === cnt
                              ? 'bg-cyan-600 border-cyan-400 text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          {cnt === 15 ? '10+' : cnt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-300 block">
                      {t('Urgent Medical / Extraction State', 'জরুরি অবস্থা')}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setHasInjured(!hasInjured)}
                        className={`min-h-[42px] px-2.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                          hasInjured
                            ? 'bg-rose-600/30 border-rose-400 text-rose-200'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {t('Injured', 'আহত রয়েছে')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasTrapped(!hasTrapped)}
                        className={`min-h-[42px] px-2.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                          hasTrapped
                            ? 'bg-amber-600/30 border-amber-400 text-amber-200'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {t('Trapped', 'আটকা পড়েছে')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Special Assistance Chips */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-300 block">
                    {t('Special Assistance Needed', 'বিশেষ সহায়তা প্রয়োজন')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SPECIAL_ASSISTANCE_OPTIONS.map((opt) => {
                      const active = selectedNeeds.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setSelectedNeeds((prev) =>
                              active ? prev.filter((x) => x !== opt.id) : [...prev, opt.id]
                            )
                          }
                          className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                            active
                              ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          {language === 'bn' ? opt.bn : opt.id}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Voice, Photo, Video Evidence */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-300 block">
                    {t('Voice Message, Photo, or Video', 'ভয়েস, ছবি বা ভিডিও পাঠান')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleStartStopVoice}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border cursor-pointer ${
                        isRecording
                          ? 'bg-red-600 border-red-400 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      }`}
                    >
                      {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4 text-cyan-400" />}
                      <span>
                        {isRecording
                          ? t('Stop Voice Recording', 'রেকর্ডিং থামান')
                          : t('Record Voice Message', 'ভয়েস মেসেজ রেকর্ড')}
                      </span>
                    </button>

                    <label className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>{t('Upload Photo', 'ছবি আপলোড')}</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="sr-only" />
                    </label>

                    <label className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer">
                      <Video className="w-4 h-4 text-amber-400" />
                      <span>{t('Upload Video', 'ভিডিও আপলোড')}</span>
                      <input type="file" accept="video/*" onChange={handleFileUpload} className="sr-only" />
                    </label>
                  </div>
                  {voiceError && <p className="text-xs text-amber-300">{voiceError}</p>}
                  {uploadStatus && <p className="text-xs text-cyan-300">{uploadStatus}</p>}
                </div>

                {/* Optional Phone, Emergency Contact & Short Note */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t('Your Phone (Optional, kept private)', 'আপনার মোবাইল নম্বর (গোপন থাকবে)')}
                    </label>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full min-h-[42px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t('Family Emergency Contact (Optional)', 'স্বজনের জরুরি নম্বর (ঐচ্ছিক)')}
                    </label>
                    <input
                      type="tel"
                      value={emergencyContactInput}
                      onChange={(e) => setEmergencyContactInput(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full min-h-[42px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {t('Short Note (Optional)', 'সংক্ষিপ্ত তথ্য (ঐচ্ছিক)')}
                  </label>
                  <input
                    type="text"
                    value={shortNote}
                    onChange={(e) => setShortNote(e.target.value)}
                    placeholder={t('e.g. 2nd floor, water rising', 'যেমন: ২য় তলায় আটকে আছি')}
                    className="w-full min-h-[42px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  {detailsSavedNotice ? (
                    <span className="text-xs text-emerald-300">{detailsSavedNotice}</span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {t('Your personal phone is masked on public views.', 'আপনার নম্বর জনসম্মুখে গোপন রাখা হবে।')}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveAdditionalDetails}
                    disabled={isSavingDetails}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                  >
                    {isSavingDetails
                      ? t('Saving...', 'সংরক্ষণ হচ্ছে...')
                      : t('Save Additional Help Info', 'অতিরিক্ত তথ্য পাঠান')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
