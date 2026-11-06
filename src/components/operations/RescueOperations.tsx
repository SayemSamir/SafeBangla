import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IncidentStatus, MissionStatus } from '../../types';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  Clock,
  Navigation,
  ArrowRight,
  AlertCircle,
  Truck,
  Phone,
  Flame,
  Waves,
  MapPin,
  ChevronRight,
  Filter
} from 'lucide-react';

export const RescueOperations: React.FC = () => {
  const {
    incidents,
    rescueTeams,
    verifyIncident,
    assignMission,
    updateMissionStatus,
    currentRole,
    language,
    t
  } = useApp();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionNote, setActionNote] = useState<string>('');

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId);

  const filteredIncidents = incidents.filter((i) => {
    if (statusFilter === 'ALL') return true;
    return i.status === statusFilter;
  });

  const availableTeams = rescueTeams.filter((t) => t.available);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-[#0F172A] p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            <h2 className="text-lg md:text-xl font-extrabold text-white font-mono">
              {t('NATIONAL DISASTER DISPATCH & RESCUE COMMAND', 'জাতীয় দুর্যোগ প্রেরণ ও উদ্ধার অভিযান কমান্ড')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t(
              'Coordinate verified emergency incidents with Fire Service, Red Crescent CPP, Coast Guard, and Volunteer Brigades.',
              'ফায়ার সার্ভিস, রেড ক্রিসেন্ট সিপিপি এবং স্বেচ্ছাসেবক বাহিনীর সাথে সমন্বিত অভিযান।'
            )}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['ALL', 'PENDING', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Command Split: Incident Feed on Left, Selected Dispatch Console on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incidents List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>{t('Active Incident Queue', 'জরুরি ঘটনার তালিকা')} ({filteredIncidents.length})</span>
            <span className="font-mono text-cyan-400">
              Role: <strong className="text-white uppercase">{currentRole}</strong>
            </span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center bg-[#0F172A] rounded-2xl border border-slate-800 text-slate-400 text-xs">
                {t('No incidents match this status filter.', 'এই ফিল্টারে কোনো ঘটনা পাওয়া যায়নি।')}
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = inc.id === selectedIncidentId;
                const isCritical = inc.severity === 'Critical';
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                        : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase font-mono ${
                            isCritical
                              ? 'bg-red-600 text-white'
                              : inc.severity === 'High'
                              ? 'bg-amber-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {inc.severity}
                        </span>
                        <span className="font-bold text-white text-xs">{inc.category}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{inc.id}</span>
                    </div>

                    <h4 className="font-semibold text-slate-200 text-xs line-clamp-1 mb-1">
                      {inc.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{inc.location.upazila}, {inc.location.district}</span>
                      </div>
                      <span
                        className={`font-semibold px-2 py-0.2 rounded text-[10px] ${
                          inc.status === 'PENDING'
                            ? 'text-amber-300 bg-amber-950/60 border border-amber-800/50'
                            : inc.status === 'VERIFIED'
                            ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-800/50'
                            : inc.status === 'ASSIGNED' || inc.status === 'IN_PROGRESS'
                            ? 'text-blue-300 bg-blue-950/60 border border-blue-800/50'
                            : 'text-emerald-300 bg-emerald-950/60 border border-emerald-800/50'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Mission Dispatch & Actions Console */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5 text-xs">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {selectedIncident.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        selectedIncident.status === 'PENDING'
                          ? 'bg-amber-600 text-white'
                          : selectedIncident.status === 'RESOLVED'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-cyan-600 text-white'
                      }`}
                    >
                      {selectedIncident.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {selectedIncident.title}
                  </h3>
                </div>

                <div className="text-right font-mono text-slate-400 text-[11px]">
                  <div>Logged: {new Date(selectedIncident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div>Division: {selectedIncident.location.division}</div>
                </div>
              </div>

              {/* Incident Facts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t('Affected Count', 'আক্রান্ত ব্যক্তি')}</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {selectedIncident.affectedPeople} Persons
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t('Trapped Victims', 'আটকে পড়া ব্যক্তি')}</span>
                  <span className={`text-xs font-bold ${selectedIncident.hasTrapped ? 'text-red-400' : 'text-slate-300'}`}>
                    {selectedIncident.hasTrapped ? 'YES (Active)' : 'None reported'}
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t('Casualties / Injured', 'আহত ব্যক্তি')}</span>
                  <span className={`text-xs font-bold ${selectedIncident.hasInjured ? 'text-rose-400' : 'text-slate-300'}`}>
                    {selectedIncident.hasInjured ? 'YES (Medical Alert)' : 'None reported'}
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t('Assigned Unit', 'নিযুক্ত দল')}</span>
                  <span className="text-xs font-bold text-cyan-300">
                    {selectedIncident.assignedTeamId || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Description & Location */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 text-[11px] block font-bold uppercase tracking-wider">
                  {t('Field Description & Specific Location', 'পরিস্থিতির বিবরণ ও অবস্থান')}
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedIncident.description}</p>
                <div className="text-slate-400 text-[11px] font-mono flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {selectedIncident.location.addressDetails || 'Standard Coordinates'}, {selectedIncident.location.upazila}, {selectedIncident.location.district} ({selectedIncident.location.lat.toFixed(4)}, {selectedIncident.location.lng.toFixed(4)})
                  </span>
                </div>
                {selectedIncident.specialNeeds && (
                  <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/50 text-cyan-200 text-[11px]">
                    <strong>Special Needs:</strong> {selectedIncident.specialNeeds}
                  </div>
                )}
              </div>

              {/* Action Workflow Controls */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-white block uppercase tracking-wider">
                  {t('Operations Dispatch & Verification Workflow', 'অভিযান প্রেরণ ও যাচাইকরণ')}
                </span>

                {/* Step 1: Verification (if PENDING) */}
                {selectedIncident.status === 'PENDING' && (
                  <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <AlertCircle className="w-4 h-4" />
                      <span>{t('Step 1: Operator Incident Verification Required', 'ধাপ ১: অপারেটর যাচাইকরণ প্রয়োজন')}</span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      {t(
                        'Verify reporter phone contact, validate local upazila administration signals, and approve for dispatch.',
                        'তথ্যদাতার নম্বর পরীক্ষা ও তথ্য যাচাই করে দল প্রেরণের জন্য অনুমোদন দিন।'
                      )}
                    </p>
                    <button
                      onClick={() => verifyIncident(selectedIncident.id, 'Duty Officer (HQ Dispatch)')}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('Verify & Approve Incident', 'যাচাই ও অনুমোদন করুন')}</span>
                    </button>
                  </div>
                )}

                {/* Step 2: Assign Rescue Team (if VERIFIED or reassignment) */}
                {(selectedIncident.status === 'VERIFIED' || selectedIncident.status === 'PENDING') && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">
                        {t('Step 2: Assign Suitable Rescue Team', 'ধাপ ২: উদ্ধারকারী দল নিয়োগ করুন')}
                      </span>
                      <span className="text-[11px] text-cyan-400 font-mono">
                        {availableTeams.length} {t('teams available', 'টি দল প্রস্তুত')}
                      </span>
                    </div>

                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    >
                      <option value="">-- {t('Select Available Rescue Team', 'উপলব্ধ উদ্ধারকারী দল নির্বাচন করুন')} --</option>
                      {rescueTeams.map((team) => (
                        <option
                          key={team.id}
                          value={team.id}
                          disabled={!team.available}
                        >
                          {team.name} ({team.type}) - {team.baseDistrict} [{team.available ? 'AVAILABLE' : 'BUSY'}]
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        if (selectedTeamId) {
                          assignMission(selectedIncident.id, selectedTeamId);
                          setSelectedTeamId('');
                        }
                      }}
                      disabled={!selectedTeamId}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow flex items-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      <span>{t('Dispatch Rescue Unit', 'উদ্ধারকারী দল প্রেরণ করুন')}</span>
                    </button>
                  </div>
                )}

                {/* Step 3: Mission In Progress & Updates */}
                {(selectedIncident.status === 'ASSIGNED' || selectedIncident.status === 'IN_PROGRESS') && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <span className="font-bold text-slate-200 block">
                      {t('Step 3: Field Mission Status & Completion', 'ধাপ ৩: মাঠপর্যায়ের অগ্রগতি ও সমাপ্তি')}
                    </span>

                    <div>
                      <input
                        type="text"
                        value={actionNote}
                        onChange={(e) => setActionNote(e.target.value)}
                        placeholder="e.g. 14 people extracted safely to high school shelter..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white mb-2"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          updateMissionStatus(selectedIncident.id, 'IN_PROGRESS', actionNote || 'Rescue team actively on scene conducting evacuation');
                          setActionNote('');
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg"
                      >
                        {t('Mark In Progress', 'অভিযান চলমান')}
                      </button>

                      <button
                        onClick={() => {
                          updateMissionStatus(selectedIncident.id, 'COMPLETED', actionNote || 'All victims evacuated safely. Incident resolved.');
                          setActionNote('');
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-700/30 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('Mark Mission Resolved', 'অভিযান সফল সমাপ্তি')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Audit & Updates History */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    {t('Dispatch Activity Log & Timeline', 'অভিযান অগ্রগতি লগ')}
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedIncident.updates.map((upd, idx) => (
                      <div key={idx} className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px] flex items-start justify-between gap-2">
                        <span className="text-slate-200">{upd.message}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {new Date(upd.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#0F172A] border border-slate-800 rounded-2xl text-slate-400">
              {t('Select an incident from the queue to view dispatch details.', 'বিস্তারিত দেখতে যেকোনো রিপোর্ট নির্বাচন করুন।')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
