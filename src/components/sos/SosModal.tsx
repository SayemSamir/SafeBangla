import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  EmergencyCategory,
  IncidentReport,
  LocationCoordinates
} from '../../types';
import { BANGLADESH_DISTRICTS } from '../../data/bangladeshData';
import { generateAiAssessment, analyzeImageDamage } from '../../utils/aiEngine';
import { findPotentialDuplicates } from '../../utils/geo';
import {
  X,
  AlertTriangle,
  MapPin,
  Camera,
  Users,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Waves,
  Wind,
  Activity,
  Sparkles,
  HelpCircle,
  Radio
} from 'lucide-react';

export const SosModal: React.FC = () => {
  const {
    sosModalOpen,
    setSosModalOpen,
    addIncident,
    incidents,
    language,
    isOnline,
    t
  } = useApp();

  const [category, setCategory] = useState<EmergencyCategory>('Flood');
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('Sunamganj');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('Tahirpur');
  const [addressDetails, setAddressDetails] = useState<string>('');
  const [lat, setLat] = useState<number>(25.088);
  const [lng, setLng] = useState<number>(91.189);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [description, setDescription] = useState<string>('');
  const [affectedCount, setAffectedCount] = useState<number>(12);
  const [hasInjured, setHasInjured] = useState<boolean>(false);
  const [hasTrapped, setHasTrapped] = useState<boolean>(true);
  const [specialNeeds, setSpecialNeeds] = useState<string>('Drinking water, infant formula');

  const [reporterName, setReporterName] = useState<string>('');
  const [reporterPhone, setReporterPhone] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const [samplePhoto, setSamplePhoto] = useState<string | null>(null);
  const [createdIncidentId, setCreatedIncidentId] = useState<string | null>(null);

  if (!sosModalOpen) return null;

  const currentDistrict =
    BANGLADESH_DISTRICTS.find((d) => d.name === selectedDistrictName) ||
    BANGLADESH_DISTRICTS[0];

  // Real-time AI explainability assessment
  const aiScore = generateAiAssessment({
    title: `${category} emergency reported in ${selectedUpazila}, ${selectedDistrictName}`,
    description,
    affectedPeople: affectedCount,
    hasInjured,
    hasTrapped
  });

  // Check for potential duplicate reports
  const duplicateCandidates = findPotentialDuplicates(
    lat,
    lng,
    category,
    incidents,
    3.0
  );

  const handleGpsDetect = () => {
    setIsDetectingGps(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setIsDetectingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setIsDetectingGps(false);
      },
      (err) => {
        setGpsError(`Unable to retrieve GPS: ${err.message}. Using default district center.`);
        setIsDetectingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleDistrictChange = (distName: string) => {
    setSelectedDistrictName(distName);
    const dist = BANGLADESH_DISTRICTS.find((d) => d.name === distName);
    if (dist) {
      setSelectedUpazila(dist.upazilas[0] || 'Sadar');
      setLat(dist.lat);
      setLng(dist.lng);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trackingId = `RESQ-${Date.now().toString().slice(-4)}`;

    const newReport: IncidentReport = {
      id: trackingId,
      timestamp: new Date().toISOString(),
      category,
      title: `${category} Crisis at ${selectedUpazila}, ${selectedDistrictName}`,
      description: description || `Urgent ${category} emergency reported. Immediate assistance required.`,
      location: {
        lat,
        lng,
        division: currentDistrict.division,
        district: selectedDistrictName,
        upazila: selectedUpazila,
        addressDetails
      },
      status: 'PENDING',
      severity: aiScore.severityLevel,
      affectedPeople: affectedCount,
      hasInjured,
      hasTrapped,
      specialNeeds,
      reporterName: isAnonymous ? 'Anonymous Citizen' : reporterName || 'Citizen',
      reporterPhone: isAnonymous ? 'Hidden' : reporterPhone || 'Not provided',
      isAnonymous,
      aiAssessment: aiScore,
      media: samplePhoto
        ? [
            {
              id: `MED-${Date.now()}`,
              url: samplePhoto,
              type: 'image',
              caption: 'Incident damage preview'
            }
          ]
        : [],
      updates: [
        {
          timestamp: new Date().toISOString(),
          message: 'SOS Report logged into RESQ Emergency Dispatch Queue.',
          updatedBy: 'Citizen SOS Gateway'
        }
      ]
    };

    addIncident(newReport);
    setCreatedIncidentId(trackingId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-[#0F172A] border border-red-500/50 rounded-2xl shadow-2xl shadow-red-950/60 overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-b border-red-500/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/30 border border-red-500/60 text-red-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-white font-mono flex items-center gap-2">
                <span>{t('EMERGENCY SOS DISPATCH', 'জরুরি এসওএস রিপোর্ট')}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white font-sans font-bold">
                  {t('PRIORITY 1', 'অগ্রাধিকার ১')}
                </span>
              </h2>
              <p className="text-xs text-red-200/80">
                {t(
                  'Transmitted directly to National Rescue Command, Fire Service, and Volunteers',
                  'ফায়ার সার্ভিস, বিডিআরসিএস এবং উদ্ধারকারী দলের সাথে সরাসরি সংযোগ'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSosModalOpen(false);
              setCreatedIncidentId(null);
            }}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation State if just submitted */}
        {createdIncidentId ? (
          <div className="p-6 md:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              {t('Emergency SOS Broadcasted Successfully!', 'জরুরি এসওএস সফলভাবে সম্প্রচারিত হয়েছে!')}
            </h3>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              {t(
                'Your emergency report has been prioritized by the AI dispatcher and assigned to regional emergency control rooms.',
                'আপনার রিপোর্টটি কৃত্রিম বুদ্ধিমত্তা দ্বারা অগ্রাধিকার প্রাপ্ত হয়ে আঞ্চলিক জরুরি নিয়ন্ত্রণ কক্ষে প্রেরিত হয়েছে।'
              )}
            </p>

            <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-4 max-w-md mx-auto text-left font-mono">
              <div className="text-xs text-cyan-400 font-semibold mb-1">
                {t('EMERGENCY TRACKING ID:', 'জরুরি ট্র্যাকিং আইডি:')}
              </div>
              <div className="text-xl font-bold text-white tracking-widest">{createdIncidentId}</div>
              <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>{t('Status: Pending Operator Verification & Team Dispatch', 'অবস্থা: অপারেটর যাচাই ও দল প্রেরণের অপেক্ষায়')}</span>
              </div>
            </div>

            {!isOnline && (
              <div className="p-3 bg-amber-950/60 border border-amber-500/50 rounded-xl text-amber-200 text-xs text-left max-w-md mx-auto">
                <strong>{t('Offline Notice:', 'অফলাইন বিজ্ঞপ্তি:')}</strong>{' '}
                {t(
                  'Saved locally in offline cache. It will sync automatically as soon as internet connection is restored.',
                  'ইন্টারনেট সংযোগ না থাকায় স্থানীয় মেমরিতে জমা রয়েছে। সংযোগ পেলেই স্বয়ংক্রিয়ভাবে সার্ভারে জমা হবে।'
                )}
              </div>
            )}

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <a
                href="tel:999"
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 text-sm"
              >
                <span>{t('Call 999 Hotline Directly', 'সরাসরি ৯৯৯ নম্বরে কল করুন')}</span>
              </a>
              <button
                onClick={() => {
                  setSosModalOpen(false);
                  setCreatedIncidentId(null);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-5 py-2.5 rounded-xl text-sm border border-slate-700"
              >
                {t('Close & Track on Map', 'বন্ধ করুন ও ম্যাপে দেখুন')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                1. {t('Select Disaster Type', 'দুর্যোগের ধরন নির্ধারণ করুন')} *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    'Flood',
                    'Cyclone',
                    'Fire',
                    'Earthquake',
                    'Landslide',
                    'Building Collapse',
                    'Drowning',
                    'Medical Emergency'
                  ] as EmergencyCategory[]
                ).map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all border text-left ${
                        isSelected
                          ? 'bg-red-600/30 border-red-500 text-red-200 shadow-md shadow-red-600/20'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {cat === 'Flood' && <Waves className="w-4 h-4 text-cyan-400" />}
                      {cat === 'Cyclone' && <Wind className="w-4 h-4 text-teal-400" />}
                      {cat === 'Fire' && <Flame className="w-4 h-4 text-amber-500" />}
                      {cat === 'Medical Emergency' && <Activity className="w-4 h-4 text-rose-400" />}
                      {!['Flood', 'Cyclone', 'Fire', 'Medical Emergency'].includes(cat) && (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      )}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  2. {t('Location & Geographic Coordinates', 'অবস্থান ও ভৌগোলিক তথ্য')} *
                </span>
                <button
                  type="button"
                  onClick={handleGpsDetect}
                  disabled={isDetectingGps}
                  className="text-xs font-semibold px-3 py-1 rounded-lg bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/50 flex items-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {isDetectingGps
                      ? t('Detecting GPS...', 'জিপিএস খোঁজা হচ্ছে...')
                      : t('Detect My GPS', 'আমার জিপিএস শনাক্ত করুন')}
                  </span>
                </button>
              </div>

              {gpsError && (
                <div className="text-[11px] text-amber-400 bg-amber-950/40 p-2 rounded border border-amber-800/50">
                  {gpsError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {t('District (জেলা)', 'জেলা')}
                  </label>
                  <select
                    value={selectedDistrictName}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {BANGLADESH_DISTRICTS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} ({d.nameBn}) - {d.division} Division
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {t('Upazila / Thana (উপজেলা/থানা)', 'উপজেলা/থানা')}
                  </label>
                  <select
                    value={selectedUpazila}
                    onChange={(e) => setSelectedUpazila(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {currentDistrict.upazilas.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {t('Specific Landmark / Village / Road (নির্দিষ্ট ঠিকানা বা ল্যান্ডমার্ক)', 'ল্যান্ডমার্ক')}
                </label>
                <input
                  type="text"
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  placeholder="e.g. Near Paschim Para Primary School, roof of green building"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>
                  Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                </span>
                <span className="text-cyan-400">{currentDistrict.division} Division</span>
              </div>
            </div>

            {/* Impact & Needs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  3. {t('Affected People & Conditions', 'আক্রান্ত মানুষের সংখ্যা')}
                </label>
                <div className="space-y-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {t('Estimated Affected Persons', 'আক্রান্ত ব্যক্তি সংখ্যা')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={affectedCount}
                      onChange={(e) => setAffectedCount(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasTrapped}
                        onChange={(e) => setHasTrapped(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-0"
                      />
                      <span className="text-red-300 font-medium">
                        {t('People are actively trapped / marooned', 'মানুষ পানিবন্দি বা ধ্বংসস্তূপে আটকা পড়েছে')}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasInjured}
                        onChange={(e) => setHasInjured(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-rose-600 focus:ring-0"
                      />
                      <span className="text-rose-300 font-medium">
                        {t('Severe injuries reported (needs ambulance/medic)', 'আহত ব্যক্তি রয়েছে')}
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {t('Special Needs (Infants, Elderly, Sick)', 'জরুরি প্রয়োজন')}
                    </label>
                    <input
                      type="text"
                      value={specialNeeds}
                      onChange={(e) => setSpecialNeeds(e.target.value)}
                      placeholder="e.g. 3 infants, insulin patient, oxygen"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Description & Photo */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  4. {t('Description & Disaster Photo', 'পরিস্থিতির বিবরণ ও ছবি')}
                </label>
                <div className="space-y-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {t('Detailed Situation', 'পরিস্থিতি বিস্তারিত লিখুন')} *
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t(
                        'Describe what is happening, water level, fire spread, road accessibility...',
                        'পানির উচ্চতা, আগুনের তীব্রতা বা সড়কের অবস্থা লিখুন...'
                      )}
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">
                      {t('Attach Damage Photograph (Simulated)', 'দুর্যোগের ছবি সংযুক্ত করুন')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSamplePhoto(
                            'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80'
                          )
                        }
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[11px] text-slate-300"
                      >
                        {t('Attach Sample Flood Photo', 'বন্যার ছবি যোগ করুন')}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSamplePhoto(
                            'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=600&q=80'
                          )
                        }
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[11px] text-slate-300"
                      >
                        {t('Attach Cyclone Debris Photo', 'ঝড়ের ছবি যোগ করুন')}
                      </button>
                    </div>

                    {samplePhoto && (
                      <div className="mt-2 relative rounded-lg overflow-hidden border border-cyan-500/40">
                        <img
                          src={samplePhoto}
                          alt="Damage sample"
                          className="h-20 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setSamplePhoto(null)}
                          className="absolute top-1 right-1 bg-black/70 p-1 rounded-full text-slate-300 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Explainable AI Live Triage Card */}
            <div className="bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/40 rounded-xl p-3.5 text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-cyan-200">
                    {t('AI Triage Assessment & Explainability', 'এআই ট্রায়াজ ও যৌক্তিকতা বিশ্লেষণ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Score: {aiScore.severityScore} / 10
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                      aiScore.severityLevel === 'Critical'
                        ? 'bg-red-600 text-white'
                        : aiScore.severityLevel === 'High'
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {aiScore.severityLevel}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-slate-300 text-[11px]">
                {aiScore.rationale.map((r, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              {duplicateCandidates.length > 0 && (
                <div className="mt-2.5 p-2 bg-amber-950/60 border border-amber-500/50 rounded-lg text-amber-200 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {t(
                      `Duplicate Alert: ${duplicateCandidates.length} existing ${category} report found nearby in ${selectedUpazila}. AI will recommend merging reports to avoid dispatch duplication.`,
                      `সতর্কবার্তা: একই এলাকায় ইতিমধ্যে ${duplicateCandidates.length}টি রিপোর্ট পাওয়া গেছে।`
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Reporter Contact Info */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">
                  5. {t('Reporter Details (ঐচ্ছিক)', 'তথ্যদাতার বিবরণ')}
                </span>
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-cyan-600"
                  />
                  <span>{t('Report Anonymously', 'গোপনীয়ভাবে রিপোর্ট করুন')}</span>
                </label>
              </div>

              {!isAnonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {t('Your Name', 'আপনার নাম')}
                    </label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="e.g. Asif Mahmud"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {t('Mobile Phone Number (ফর কলব্যাক)', 'মোবাইল নম্বর')}
                    </label>
                    <input
                      type="tel"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                {t(
                  'End-to-End Encrypted & Audited by National Operations Command',
                  'নিরাপদ ও জাতীয় দুর্যোগ কমান্ড দ্বারা অডিটকৃত'
                )}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSosModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  {t('Cancel', 'বাতিল')}
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 font-mono tracking-wider"
                >
                  <AlertTriangle className="w-4 h-4 text-white animate-pulse" />
                  <span>{t('SUBMIT EMERGENCY SOS', 'এসওএস রিপোর্ট পাঠান')}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
