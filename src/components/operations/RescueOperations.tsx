import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IncidentStatus } from '../../types';
import { canTransitionStatus, recommendRescueTeams } from '../../utils/dispatch';
import { findPotentialDuplicates } from '../../utils/geo';
import {
  buildExternalMapLinks,
  formatLocationSourceLabel,
  formatLocationStatusLabel
} from '../../utils/geolocation';
import {
  ShieldAlert,
  CheckCircle2,
  Truck,
  MapPin,
  ExternalLink,
  AlertCircle,
  Search,
  PhoneCall,
  Radio,
  Target,
  XCircle
} from 'lucide-react';

const STATUS_FILTERS: ('ALL' | IncidentStatus)[] = [
  'ALL',
  'PENDING',
  'VERIFIED',
  'ASSIGNED',
  'ACCEPTED',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
  'CANCELLED'
];

export const RescueOperations: React.FC = () => {
  const {
    incidents,
    rescueTeams,
    deliveryLogs,
    verifyIncident,
    assignMission,
    updateIncidentWorkflowStatus,
    focusIncidentOnMap,
    currentRole,
    language,
    t
  } = useApp();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(() => {
    try {
      return sessionStorage.getItem('resq_selected_incident_id') || '';
    } catch {
      return '';
    }
  });
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionNote, setActionNote] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (!selectedIncidentId && incidents[0]?.id) {
      setSelectedIncidentId(incidents[0].id);
    }
  }, [incidents, selectedIncidentId]);

  const filteredIncidents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return incidents.filter((inc) => {
      if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
      if (!q) return true;
      return (
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.location.district.toLowerCase().includes(q) ||
        inc.category.toLowerCase().includes(q)
      );
    });
  }, [incidents, statusFilter, searchTerm]);

  const selectedIncident =
    incidents.find((i) => i.id === selectedIncidentId) || filteredIncidents[0] || null;

  const recommendedTeams = useMemo(() => {
    if (!selectedIncident) return [];
    return recommendRescueTeams(selectedIncident, rescueTeams);
  }, [selectedIncident, rescueTeams]);

  const potentialDuplicates = useMemo(() => {
    if (!selectedIncident) return [];
    return findPotentialDuplicates(
      selectedIncident.location.lat,
      selectedIncident.location.lng,
      selectedIncident.category,
      incidents.filter((i) => i.id !== selectedIncident.id)
    );
  }, [selectedIncident, incidents]);

  const incidentDeliveryLogs = useMemo(() => {
    if (!selectedIncident) return [];
    return deliveryLogs.filter((d) => d.incidentId === selectedIncident.id);
  }, [deliveryLogs, selectedIncident]);

  const canVerify = selectedIncident
    ? canTransitionStatus(selectedIncident.status, 'VERIFIED', currentRole)
    : { allowed: false };
  const canReject = selectedIncident
    ? canTransitionStatus(selectedIncident.status, 'REJECTED', currentRole)
    : { allowed: false };
  const canAssign = selectedIncident
    ? canTransitionStatus(selectedIncident.status, 'ASSIGNED', currentRole)
    : { allowed: false };
  const canAccept = selectedIncident
    ? canTransitionStatus(selectedIncident.status, 'ACCEPTED', currentRole)
    : { allowed: false };
  const canInProgress = selectedIncident
    ? canTransitionStatus(selectedIncident.status, 'IN_PROGRESS', currentRole)
    : { allowed: false };
  const canResolve = selectedIncident
    ? canTransitionStatus(selectedIncident.status, 'RESOLVED', currentRole)
    : { allowed: false };
  const canCancel = selectedIncident
    ? canTransitionStatus(selectedIncident.status, 'CANCELLED', currentRole)
    : { allowed: false };

  const handleStatusChange = async (nextStatus: IncidentStatus, defaultNote: string) => {
    if (!selectedIncident) return;
    setFeedback(null);
    const res = await updateIncidentWorkflowStatus(
      selectedIncident.id,
      nextStatus,
      actionNote.trim() || defaultNote
    );
    if (!res.ok) {
      setFeedback({ type: 'err', text: res.error || 'Status update failed.' });
    } else {
      setActionNote('');
      setFeedback({ type: 'ok', text: `Updated status to ${nextStatus}.` });
    }
  };

  const handleAssign = async () => {
    if (!selectedIncident || !selectedTeamId) return;
    setFeedback(null);
    const res = await assignMission(selectedIncident.id, selectedTeamId);
    if (!res.ok) {
      setFeedback({ type: 'err', text: res.error || 'Team assignment failed.' });
    } else {
      setSelectedTeamId('');
      setFeedback({ type: 'ok', text: 'Rescue team assigned and notified.' });
    }
  };

  const hasCoords =
    selectedIncident &&
    typeof selectedIncident.location.lat === 'number' &&
    typeof selectedIncident.location.lng === 'number';
  const mapLinks = hasCoords
    ? buildExternalMapLinks(
        selectedIncident!.location.lat as number,
        selectedIncident!.location.lng as number
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#0F172A] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-cyan-400" />
              <h1 className="text-lg sm:text-xl font-extrabold text-white font-mono">
                {t('RESCUE DISPATCH & OPERATIONS COMMAND', 'উদ্ধার অভিযান ও প্রেরণ কমান্ড')}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t(
                'Authorized workflow: PENDING -> VERIFIED -> ASSIGNED -> ACCEPTED -> IN_PROGRESS -> RESOLVED. No automatic dispatch without operator approval.',
                'অনুমোদিত ধাপ: PENDING -> VERIFIED -> ASSIGNED -> ACCEPTED -> IN_PROGRESS -> RESOLVED। অপারেটর অনুমোদন ছাড়া স্বয়ংক্রিয় দল প্রেরণ হয় না।'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl">
            <span className="text-slate-400">{t('Active Role:', 'বর্তমান ভূমিকা:')}</span>
            <strong className="text-cyan-300 uppercase">{currentRole}</strong>
          </div>
        </div>

        {/* Search + Status Filters */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('Filter by ID, district, or keyword...', 'আইডি বা জেলা দিয়ে খুঁজুন...')}
              className="w-full min-h-[40px] bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1.5 rounded-lg font-mono font-semibold transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>
              {t('Incident Queue', 'জরুরি তালিকা')} ({filteredIncidents.length})
            </span>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center bg-[#0F172A] rounded-2xl border border-slate-800 text-slate-400 text-xs">
                {t('No incidents match the current filter.', 'কোনো ঘটনা পাওয়া যায়নি।')}
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    className={`rounded-xl border transition-colors text-xs ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500 ring-1 ring-cyan-500/40'
                        : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIncidentId(inc.id);
                        setSelectedTeamId('');
                        setFeedback(null);
                      }}
                      className="w-full text-left p-3.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase font-mono ${
                              inc.severity === 'Critical'
                                ? 'bg-red-600 text-white'
                                : inc.severity === 'High'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-blue-600 text-white'
                            }`}
                          >
                            {inc.severity}
                          </span>
                          <span className="font-bold text-white">{inc.category}</span>
                          {inc.isDemo && (
                            <span className="text-[10px] font-mono text-amber-300 border border-amber-500/40 px-1.5 rounded">
                              DEMO
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{inc.id}</span>
                      </div>

                      <h3 className="font-semibold text-slate-200 line-clamp-1">{inc.title}</h3>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">
                            {inc.location.upazila}, {inc.location.district}
                          </span>
                        </span>
                        <span className="font-mono font-semibold text-cyan-300 shrink-0">
                          {inc.status}
                        </span>
                      </div>
                    </button>

                    <div className="px-3.5 pb-2.5 flex items-center justify-between gap-2 text-[11px] border-t border-slate-800/40 pt-2">
                      <span className="text-slate-400">
                        {formatLocationStatusLabel(
                          inc.location.locationStatus,
                          inc.location.locationSource,
                          language
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => focusIncidentOnMap(inc.id, true)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Target className="w-3 h-3" />
                        <span>{t('Focus on Live Map', 'লাইভ ম্যাপে দেখুন')}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Dispatch Console */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-5 text-xs">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    <span className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-bold">
                      {selectedIncident.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-600/20 border border-cyan-500/40 text-cyan-200 font-bold">
                      {selectedIncident.status}
                    </span>
                    {selectedIncident.isGuest && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Guest SOS
                      </span>
                    )}
                    {selectedIncident.isDemo && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
                        Seeded Demo
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-white mt-1.5">{selectedIncident.title}</h2>
                </div>

                <div className="text-left sm:text-right font-mono text-slate-400 text-[11px]">
                  <div>{new Date(selectedIncident.timestamp).toLocaleString()}</div>
                  <div>{selectedIncident.location.division} Division</div>
                </div>
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    feedback.type === 'ok'
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                      : 'bg-red-950/50 border-red-500/40 text-red-200'
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              {potentialDuplicates.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {t(
                      `Potential duplicate signal: ${potentialDuplicates.length} nearby ${selectedIncident.category} incident(s) within 1.5 km (${potentialDuplicates.map((d) => d.id).join(', ')}).`,
                      `সম্ভাব্য ডুপ্লিকেট: ১.৫ কিমির মধ্যে একই ধরনের ${potentialDuplicates.length}টি রিপোর্ট রয়েছে (${potentialDuplicates.map((d) => d.id).join(', ')})।`
                    )}
                  </span>
                </div>
              )}

              {/* Facts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">{t('Affected', 'আক্রান্ত')}</span>
                  <span className="text-sm font-bold text-white font-mono tabular-nums">
                    {selectedIncident.affectedPeople}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">{t('Trapped', 'আটকে পড়া')}</span>
                  <span
                    className={`font-bold ${
                      selectedIncident.hasTrapped ? 'text-red-400' : 'text-slate-300'
                    }`}
                  >
                    {selectedIncident.hasTrapped ? 'YES' : 'No'}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">{t('Injured', 'আহত')}</span>
                  <span
                    className={`font-bold ${
                      selectedIncident.hasInjured ? 'text-rose-400' : 'text-slate-300'
                    }`}
                  >
                    {selectedIncident.hasInjured ? 'YES' : 'No'}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">
                    {t('Assigned Team', 'নিযুক্ত দল')}
                  </span>
                  <span className="font-bold text-cyan-300 font-mono">
                    {selectedIncident.assignedTeamId || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Location & Reporter Privacy Info */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    {t('Location & Contact Verification', 'অবস্থান ও যোগাযোগ তথ্য')}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-cyan-300 font-semibold">
                      {formatLocationStatusLabel(
                        selectedIncident.location.locationStatus,
                        selectedIncident.location.locationSource,
                        language
                      )}{' '}
                      · {formatLocationSourceLabel(selectedIncident.location.locationSource, language)}
                      {selectedIncident.location.locationSource === 'gps' &&
                        selectedIncident.location.accuracyMeters !== undefined &&
                        ` (±${selectedIncident.location.accuracyMeters}m)`}
                    </span>
                    <button
                      type="button"
                      onClick={() => focusIncidentOnMap(selectedIncident.id, true)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Target className="w-3 h-3" />
                      <span>{t('Focus on Live Map', 'ম্যাপে দেখুন')}</span>
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">{selectedIncident.description}</p>

                <div className="text-slate-300 space-y-1 pt-1">
                  <div>
                    <strong>{t('Area:', 'এলাকা:')}</strong> {selectedIncident.location.upazila},{' '}
                    {selectedIncident.location.district} ({selectedIncident.location.division})
                  </div>
                  {selectedIncident.location.structuredAddress && (
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-300">
                      {selectedIncident.location.structuredAddress.road && (
                        <span>
                          <strong>{t('Road:', 'সড়ক:')}</strong>{' '}
                          {selectedIncident.location.structuredAddress.road}
                        </span>
                      )}
                      {selectedIncident.location.structuredAddress.neighborhood && (
                        <span>
                          <strong>{t('Neighborhood:', 'এলাকা:')}</strong>{' '}
                          {selectedIncident.location.structuredAddress.neighborhood}
                        </span>
                      )}
                      {selectedIncident.location.structuredAddress.postalCode && (
                        <span>
                          <strong>{t('Postal:', 'পোস্ট:')}</strong>{' '}
                          {selectedIncident.location.structuredAddress.postalCode}
                        </span>
                      )}
                    </div>
                  )}
                  {selectedIncident.location.formattedAddress && (
                    <div>
                      <strong>{t('Address:', 'ঠিকানা:')}</strong>{' '}
                      {selectedIncident.location.formattedAddress}
                    </div>
                  )}
                  {selectedIncident.location.nearbyLandmarkName && (
                    <div className="text-cyan-300">
                      <strong>{t('Nearby Reference:', 'কাছাকাছি স্থান:')}</strong>{' '}
                      {selectedIncident.location.nearbyLandmarkName}
                      {selectedIncident.location.nearbyLandmarkCategory
                        ? ` (${selectedIncident.location.nearbyLandmarkCategory})`
                        : ''}
                      {typeof selectedIncident.location.nearbyLandmarkDistanceMeters === 'number'
                        ? ` · ~${selectedIncident.location.nearbyLandmarkDistanceMeters}m`
                        : ''}
                    </div>
                  )}
                  {selectedIncident.location.landmark && (
                    <div>
                      <strong>{t('Landmark:', 'পরিচিত স্থান:')}</strong>{' '}
                      {selectedIncident.location.landmark}
                    </div>
                  )}
                  {(selectedIncident.lastLocationUpdate || selectedIncident.location.locationTimestamp) && (
                    <div className="font-mono text-[11px] text-slate-400">
                      <strong>{t('Last Location Update:', 'সর্বশেষ আপডেট:')}</strong>{' '}
                      {new Date(
                        selectedIncident.lastLocationUpdate ||
                          selectedIncident.location.locationTimestamp!
                      ).toLocaleTimeString()}
                    </div>
                  )}
                  {hasCoords && (
                    <div className="font-mono tabular-nums text-cyan-300 flex flex-wrap items-center gap-3 pt-1">
                      <span>
                        {selectedIncident.location.lat!.toFixed(5)},{' '}
                        {selectedIncident.location.lng!.toFixed(5)}
                      </span>
                      {mapLinks && (
                        <>
                          <a
                            href={mapLinks.openStreetMap}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 underline text-cyan-400 hover:text-cyan-300"
                          >
                            <span>OpenStreetMap</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={mapLinks.googleMaps}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 underline text-cyan-400 hover:text-cyan-300"
                          >
                            <span>Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-300">
                    <strong>{t('Reporter Phone:', 'রিপোর্টার ফোন:')}</strong>{' '}
                    <span className="font-mono">{selectedIncident.reporterPhone || 'Not provided'}</span>
                    {selectedIncident.reporterPhone && !selectedIncident.reporterPhone.includes('*') && (
                      <a
                        href={`tel:${selectedIncident.reporterPhone}`}
                        className="ml-2 text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    )}
                  </span>
                  {selectedIncident.isLiveTracking && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5" />
                      <span>{t('Live GPS Sharing Active', 'লাইভ জিপিএস চালু')}</span>
                    </span>
                  )}
                </div>

                {selectedIncident.specialNeeds && (
                  <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-cyan-200 text-[11px]">
                    <strong>{t('Special Needs:', 'বিশেষ প্রয়োজন:')}</strong>{' '}
                    {selectedIncident.specialNeeds}
                  </div>
                )}

                {/* Uploaded Evidence (Audio / Photo / Video) */}
                {selectedIncident.media.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      {t('Attached Evidence', 'সংযুক্ত প্রমাণ')} ({selectedIncident.media.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedIncident.media.map((m) => (
                        <div key={m.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                          {m.type === 'image' && (
                            <img
                              src={m.url}
                              alt={m.caption || 'Incident evidence'}
                              className="w-full h-32 object-cover rounded"
                            />
                          )}
                          {m.type === 'audio' && (
                            <audio controls src={m.url} className="w-full h-9" />
                          )}
                          {m.type === 'video' && (
                            <video controls src={m.url} className="w-full h-32 rounded" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Authorized Workflow Controls */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h3 className="font-bold text-white uppercase tracking-wider text-xs">
                  {t('Authorized Dispatch Controls', 'অনুমোদিত ডিসপ্যাচ নিয়ন্ত্রণ')}
                </h3>

                {/* Verification Step */}
                {selectedIncident.status === 'PENDING' && (
                  <div className="bg-amber-950/25 border border-amber-500/40 p-4 rounded-xl space-y-3">
                    <div className="font-bold text-amber-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>
                        {t(
                          'Step 1: Operator Verification Required Before Dispatch',
                          'ধাপ ১: দল পাঠানোর আগে অপারেটর যাচাইকরণ প্রয়োজন'
                        )}
                      </span>
                    </div>

                    {canVerify.allowed ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => verifyIncident(selectedIncident.id, `Officer (${currentRole})`)}
                          className="min-h-[42px] px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold inline-flex items-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t('Verify & Approve SOS', 'যাচাই ও অনুমোদন করুন')}</span>
                        </button>
                        {canReject.allowed && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange('REJECTED', 'Marked invalid / duplicate by operator')}
                            className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-900/60 text-red-200 border border-red-500/40 font-semibold inline-flex items-center gap-2 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>{t('Reject', 'বাতিল করুন')}</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-300 text-[11px]">
                        {t(
                          'Switch role to Operator, District Admin, or Super Admin in the top bar to verify or reject incidents.',
                          'ঘটনা যাচাই বা বাতিল করতে উপরের মেনু থেকে Operator বা Admin ভূমিকা নির্বাচন করুন।'
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* Smart Responder Recommendations & Assignment */}
                {selectedIncident.status === 'VERIFIED' && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        {t('Step 2: Smart Responder Recommendations', 'ধাপ ২: স্মার্ট উদ্ধার দল সুপারিশ')}
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400">
                        Ranked by availability, distance, skills & equipment
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {recommendedTeams.slice(0, 4).map((rec) => (
                        <button
                          key={rec.team.id}
                          type="button"
                          disabled={!rec.team.available}
                          onClick={() => setSelectedTeamId(rec.team.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer disabled:opacity-50 ${
                            selectedTeamId === rec.team.id
                              ? 'bg-cyan-950/60 border-cyan-400'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-white">{rec.team.name}</span>
                            <span className="font-mono text-[11px] text-emerald-300">
                              Score {rec.matchScore}
                              {rec.distanceKm !== null ? ` · ${rec.distanceKm} km` : ''}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {rec.team.type} · {rec.reasons.join(' · ')}
                          </div>
                        </button>
                      ))}
                    </div>

                    {canAssign.allowed ? (
                      <button
                        type="button"
                        disabled={!selectedTeamId}
                        onClick={handleAssign}
                        className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Truck className="w-4 h-4" />
                        <span>{t('Dispatch Selected Rescue Unit', 'নির্বাচিত দল প্রেরণ করুন')}</span>
                      </button>
                    ) : (
                      <p className="text-slate-400 text-[11px]">
                        {t(
                          'Operator or Admin role is required to assign a rescue team.',
                          'দল প্রেরণের জন্য Operator বা Admin ভূমিকা প্রয়োজন।'
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* Responder & Lifecycle Transitions */}
                {(selectedIncident.status === 'ASSIGNED' ||
                  selectedIncident.status === 'ACCEPTED' ||
                  selectedIncident.status === 'IN_PROGRESS') && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <span className="font-bold text-white block">
                      {t('Step 3: Responder Execution & Resolution', 'ধাপ ৩: অভিযান পরিচালনা ও সমাপ্তি')}
                    </span>

                    <input
                      type="text"
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder={t(
                        'Optional field update note (e.g. Boat arrived on site, 8 rescued)...',
                        'ঐচ্ছিক অগ্রগতি নোট লিখুন...'
                      )}
                      className="w-full min-h-[40px] bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />

                    <div className="flex flex-wrap gap-2">
                      {selectedIncident.status === 'ASSIGNED' && canAccept.allowed && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange('ACCEPTED', 'Rescue team accepted mission')}
                          className="min-h-[42px] px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer"
                        >
                          {t('Accept Mission', 'দায়িত্ব গ্রহণ')}
                        </button>
                      )}

                      {canInProgress.allowed && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange('IN_PROGRESS', 'Rescue unit en route / active on scene')
                          }
                          className="min-h-[42px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                        >
                          {t('Mark In Progress', 'চলমান চিহ্নিত করুন')}
                        </button>
                      )}

                      {canResolve.allowed && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange('RESOLVED', 'Victims safely evacuated. Incident resolved.')
                          }
                          className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t('Mark Resolved', 'সফল সমাপ্তি')}</span>
                        </button>
                      )}

                      {canCancel.allowed && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange('CANCELLED', 'Mission cancelled by user/operator')}
                          className="min-h-[42px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                        >
                          {t('Cancel', 'বাতিল')}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Honest Notification Delivery Logs + Audit Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t('Audit & Activity Timeline', 'কার্যক্রম টাইমলাইন')}
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {selectedIncident.updates.map((upd, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px]"
                        >
                          <div className="text-slate-200">{upd.message}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex justify-between font-mono">
                            <span>{upd.updatedBy}</span>
                            <span>{new Date(upd.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t('Notification Delivery Logs', 'বিজ্ঞপ্তি প্রেরণের অবস্থা')}
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {incidentDeliveryLogs.length === 0 ? (
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                          {t(
                            'No dispatch delivery logs recorded for this record yet.',
                            'এই ঘটনার জন্য এখনো কোনো বিজ্ঞপ্তি লগ নেই।'
                          )}
                        </div>
                      ) : (
                        incidentDeliveryLogs.map((log) => (
                          <div
                            key={log.id}
                            className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] space-y-0.5"
                          >
                            <div className="flex items-center justify-between font-mono">
                              <span className="text-white uppercase font-bold">{log.channel}</span>
                              <span
                                className={
                                  log.status === 'delivered'
                                    ? 'text-emerald-400'
                                    : 'text-amber-300'
                                }
                              >
                                {log.status === 'delivered' ? 'DELIVERED' : 'NOT CONFIGURED'}
                              </span>
                            </div>
                            <div className="text-slate-400 text-[10px]">{log.providerNote}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#0F172A] border border-slate-800 rounded-2xl text-slate-400 text-xs">
              {t('Select an incident from the queue to inspect and dispatch.', 'একটি ঘটনা নির্বাচন করুন।')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
