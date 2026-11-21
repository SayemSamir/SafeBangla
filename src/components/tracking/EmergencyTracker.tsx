import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IncidentReport, IncidentStatus, NotificationDeliveryLog } from '../../types';
import { useEmergencyLocation } from '../../hooks/useEmergencyLocation';
import {
  buildExternalMapLinks,
  formatLocationSourceLabel,
  formatLocationStatusLabel
} from '../../utils/geolocation';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  PhoneCall,
  Radio,
  Search,
  ShieldAlert,
  Truck
} from 'lucide-react';

const STATUS_STEPS: IncidentStatus[] = [
  'PENDING',
  'VERIFIED',
  'ASSIGNED',
  'ACCEPTED',
  'IN_PROGRESS',
  'RESOLVED'
];

interface TrackedResponse {
  incident: IncidentReport;
  assignedTeam: {
    id: string;
    name: string;
    type: string;
    baseDistrict: string;
    contactPhone: string;
  } | null;
  deliveryLogs: NotificationDeliveryLog[];
}

export const EmergencyTracker: React.FC = () => {
  const { recentTracking, updateLiveLocation, focusIncidentOnMap, language, t } = useApp();
  const { location, startWatching, stopWatching } = useEmergencyLocation(false);

  const [emergencyId, setEmergencyId] = useState(recentTracking?.id || '');
  const [trackingCode, setTrackingCode] = useState(recentTracking?.trackingCode || '');
  const [tracked, setTracked] = useState<TrackedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async (idToFind: string, codeToVerify: string) => {
    const cleanId = idToFind.trim().toUpperCase();
    const cleanCode = codeToVerify.trim().toUpperCase();
    if (!cleanId || !cleanCode) {
      setError(t('Please enter both Emergency ID and Tracking Code.', 'জরুরি আইডি এবং ট্র্যাকিং কোড দিন।'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/emergencies/track?id=${encodeURIComponent(cleanId)}&code=${encodeURIComponent(cleanCode)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setTracked(null);
        setError(data.error || t('Record not found.', 'তথ্য পাওয়া যায়নি।'));
      } else {
        setTracked(data as TrackedResponse);
      }
    } catch {
      setError(t('Network error while checking status. Dial 999 if urgent.', 'নেটওয়ার্ক সমস্যা। জরুরি হলে ৯৯৯ কল করুন।'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recentTracking?.id && recentTracking?.trackingCode) {
      setEmergencyId(recentTracking.id);
      setTrackingCode(recentTracking.trackingCode);
      void fetchStatus(recentTracking.id, recentTracking.trackingCode);
    }
    return () => {
      stopWatching();
    };
  }, [recentTracking?.id, recentTracking?.trackingCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchStatus(emergencyId, trackingCode);
  };

  const handleToggleLiveSharing = () => {
    if (!tracked) return;
    if (location.isWatching) {
      stopWatching();
      void updateLiveLocation(tracked.incident.id, trackingCode, {
        lat: location.lat || 0,
        lng: location.lng || 0,
        isLiveTracking: false
      });
    } else {
      startWatching((pos) => {
        void updateLiveLocation(tracked.incident.id, trackingCode, {
          lat: pos.lat,
          lng: pos.lng,
          accuracyMeters: pos.accuracyMeters,
          isLiveTracking: true
        });
      });
    }
  };

  const activeStepIndex = tracked ? STATUS_STEPS.indexOf(tracked.incident.status) : -1;
  const hasCoords =
    tracked &&
    typeof tracked.incident.location.lat === 'number' &&
    typeof tracked.incident.location.lng === 'number';
  const mapLinks = hasCoords
    ? buildExternalMapLinks(
        tracked!.incident.location.lat as number,
        tracked!.incident.location.lng as number
      )
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Card */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {t('Secure Guest Emergency Tracker', 'নিরাপদ জরুরি অবস্থা ট্র্যাকার')}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {t(
                'Enter your Emergency ID and 6-character Tracking Code to see responder dispatch progress without logging in.',
                'লগইন ছাড়াই আপনার জরুরি আইডি ও ৬-অক্ষরের ট্র্যাকিং কোড দিয়ে উদ্ধার অগ্রগতি দেখুন।'
              )}
            </p>
          </div>
          <a
            href="tel:999"
            className="min-h-[44px] px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 text-xs font-bold inline-flex items-center gap-2 shrink-0"
          >
            <PhoneCall className="w-4 h-4 text-red-400" />
            <span>{t('Call 999 Hotline', '৯৯৯ নম্বরে কল করুন')}</span>
          </a>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1">
              {t('Emergency ID', 'জরুরি আইডি')}
            </label>
            <input
              type="text"
              value={emergencyId}
              onChange={(e) => setEmergencyId(e.target.value)}
              placeholder="RESQ-2026-XXXX"
              className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">
              {t('Tracking Code', 'ট্র্যাকিং কোড')}
            </label>
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="e.g. DEMO01"
              className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? t('Checking...', 'খোঁজা হচ্ছে...') : t('Track Status', 'অবস্থা দেখুন')}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Tracked Details */}
      {tracked && (
        <div className="space-y-5">
          {/* Status Timeline */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span className="text-cyan-400 font-bold">{tracked.incident.id}</span>
                  <span>·</span>
                  <span>{tracked.incident.category}</span>
                  <span>·</span>
                  <span>{tracked.incident.severity} Priority</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{tracked.incident.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => fetchStatus(tracked.incident.id, trackingCode)}
                className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
              >
                {t('Refresh Status', 'রিফ্রেশ করুন')}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const completed = activeStepIndex >= idx;
                const current = tracked.incident.status === step;
                return (
                  <div
                    key={step}
                    className={`p-2.5 rounded-xl border text-center text-[11px] font-semibold ${
                      current
                        ? 'bg-cyan-600/25 border-cyan-400 text-white'
                        : completed
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      {completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <span>{step.replace('_', ' ')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location & Live Sharing + Assigned Team */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  {formatLocationStatusLabel(
                    tracked.incident.location.locationStatus,
                    tracked.incident.location.locationSource,
                    language
                  )}
                </span>
                <span className="text-cyan-300 font-mono">
                  {formatLocationSourceLabel(tracked.incident.location.locationSource, language)}
                </span>
              </div>

              {hasCoords ? (
                <div className="space-y-1.5">
                  <div className="font-mono tabular-nums text-slate-200">
                    {tracked.incident.location.lat!.toFixed(5)},{' '}
                    {tracked.incident.location.lng!.toFixed(5)}
                    {tracked.incident.location.locationSource === 'gps' &&
                      tracked.incident.location.accuracyMeters !== undefined && (
                        <span className="text-emerald-300 ml-2">
                          (GPS Accuracy: ±{tracked.incident.location.accuracyMeters} meters)
                        </span>
                      )}
                  </div>
                  {(tracked.incident.lastLocationUpdate || tracked.incident.location.locationTimestamp) && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      {t('Last Location Update:', 'সর্বশেষ আপডেট:')}{' '}
                      {new Date(
                        tracked.incident.lastLocationUpdate ||
                          tracked.incident.location.locationTimestamp!
                      ).toLocaleTimeString()}
                    </div>
                  )}
                  {tracked.incident.location.structuredAddress && (
                    <p className="text-[11px] text-slate-300">
                      {[
                        tracked.incident.location.structuredAddress.road,
                        tracked.incident.location.structuredAddress.neighborhood,
                        tracked.incident.location.structuredAddress.upazila,
                        tracked.incident.location.structuredAddress.district
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  {tracked.incident.location.formattedAddress && (
                    <p className="text-slate-300">{tracked.incident.location.formattedAddress}</p>
                  )}
                  {tracked.incident.location.nearbyLandmarkName && (
                    <p className="text-[11px] text-cyan-300">
                      {t('Nearby Landmark:', 'কাছাকাছি স্থান:')}{' '}
                      {tracked.incident.location.nearbyLandmarkName}
                      {typeof tracked.incident.location.nearbyLandmarkDistanceMeters === 'number'
                        ? ` (~${tracked.incident.location.nearbyLandmarkDistanceMeters}m)`
                        : ''}
                    </p>
                  )}
                  {mapLinks && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <a
                        href={mapLinks.openStreetMap}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline"
                      >
                        <span>OpenStreetMap</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={mapLinks.googleMaps}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline"
                      >
                        <span>Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => focusIncidentOnMap(tracked.incident.id, true)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold cursor-pointer"
                      >
                        {t('Focus on Live Map', 'ম্যাপে দেখুন')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-300">
                  {tracked.incident.location.landmark ||
                    `${tracked.incident.location.upazila}, ${tracked.incident.location.district}`}
                </p>
              )}

              {tracked.incident.status !== 'RESOLVED' &&
                tracked.incident.status !== 'CANCELLED' && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-slate-400">
                      {location.isWatching
                        ? t('Live GPS sharing active', 'লাইভ জিপিএস চালু')
                        : t('Share updated GPS position', 'নতুন জিপিএস অবস্থান শেয়ার করুন')}
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleLiveSharing}
                      className={`min-h-[38px] px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                        location.isWatching
                          ? 'bg-red-600/20 text-red-300 border border-red-500/40'
                          : 'bg-cyan-600 text-white hover:bg-cyan-500'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5 inline mr-1" />
                      {location.isWatching ? t('Stop Sharing', 'বন্ধ করুন') : t('Update Live GPS', 'লাইভ আপডেট')}
                    </button>
                  </div>
                )}
            </div>

            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                {t('Assigned Rescue Unit', 'নিযুক্ত উদ্ধারকারী দল')}
              </span>
              {tracked.assignedTeam ? (
                <div className="space-y-2">
                  <div className="text-sm font-bold text-emerald-300">
                    {tracked.assignedTeam.name}
                  </div>
                  <div className="text-slate-300">
                    {tracked.assignedTeam.type} · {tracked.assignedTeam.baseDistrict}
                  </div>
                  <a
                    href={`tel:${tracked.assignedTeam.contactPhone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{tracked.assignedTeam.contactPhone}</span>
                  </a>
                </div>
              ) : (
                <div className="text-slate-400 flex items-start gap-2">
                  <Radio className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {t(
                      'No rescue unit assigned yet. An operator is reviewing your request.',
                      'এখনো দল নিযুক্ত হয়নি। অপারেটর আপনার অনুরোধ যাচাই করছেন।'
                    )}
                  </span>
                </div>
              )}

              {tracked.deliveryLogs.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block">
                    {t('Notification Delivery Status', 'বিজ্ঞপ্তি প্রেরণের অবস্থা')}
                  </span>
                  {tracked.deliveryLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 uppercase font-mono">{log.channel}</span>
                      <span
                        className={
                          log.status === 'delivered' ? 'text-emerald-400' : 'text-amber-300'
                        }
                      >
                        {log.status === 'delivered'
                          ? t('Delivered', 'পৌঁছেছে')
                          : t('Gateway not configured', 'গেটওয়ে কনফিগার করা নেই')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Timeline Updates */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>{t('Live Dispatch Updates', 'অভিযান আপডেটসমূহ')}</span>
            </h3>
            <div className="space-y-2">
              {tracked.incident.updates.map((upd, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-slate-200">{upd.message}</p>
                    <span className="text-[11px] text-slate-400">{upd.updatedBy}</span>
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                    {new Date(upd.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
