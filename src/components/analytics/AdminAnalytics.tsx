import React from 'react';
import { useApp } from '../../context/AppContext';
import { BANGLADESH_DISTRICTS } from '../../data/bangladeshData';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  ShieldCheck,
  CheckCircle,
  Clock,
  Building2,
  FileSpreadsheet,
  Download
} from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { incidents, rescueTeams, shelters, resources, language, t } = useApp();

  const totalIncidents = incidents.length;
  const pendingIncidents = incidents.filter((i) => i.status === 'PENDING').length;
  const activeMissions = incidents.filter(
    (i) => i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS'
  ).length;
  const resolvedMissions = incidents.filter((i) => i.status === 'RESOLVED').length;
  const criticalIncidents = incidents.filter((i) => i.severity === 'Critical').length;
  const totalAffected = incidents.reduce((sum, i) => sum + i.affectedPeople, 0);
  const availableResponders = rescueTeams.filter((t) => t.available).length;
  const totalShelterCapacity = shelters.reduce((sum, s) => sum + s.capacity, 0);
  const currentShelterOccupancy = shelters.reduce((sum, s) => sum + s.currentOccupancy, 0);

  // Group by category
  const categoryCounts: { [cat: string]: number } = {};
  incidents.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-white font-mono">
              {t('NATIONAL DISASTER SITUATION ANALYTICS', 'জাতীয় দুর্যোগ কমান্ড ও পরিসংখ্যান ড্যাশবোর্ড')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t(
              'Executive real-time monitoring of casualties, response velocities, resource depletion, and district-level impact.',
              'ঘটনাস্থলের পরিস্থিতি, জীবনহানি ঝুঁকি ও উদ্ধার অভিযানের রিয়েল-টাইম তথ্য।'
            )}
          </p>
        </div>

        <button
          onClick={() => alert('Exporting full National Disaster Response SITREP (PDF/CSV)...')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>{t('Export SitRep Report', 'সিটর্যাপ রিপোর্ট ডাউনলোড')}</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>TOTAL INCIDENTS</span>
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{totalIncidents}</div>
          <div className="text-[11px] text-amber-400 mt-1">{pendingIncidents} Pending Verification</div>
        </div>

        <div className="bg-[#0F172A] border border-red-500/30 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>CRITICAL EMERGENCIES</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          </div>
          <div className="text-2xl font-extrabold text-red-400">{criticalIncidents}</div>
          <div className="text-[11px] text-red-300 mt-1">Immediate Life Threat</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>PEOPLE IMPACTED</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{totalAffected.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 4 coastal/haor districts</div>
        </div>

        <div className="bg-[#0F172A] border border-emerald-500/30 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>ACTIVE RESCUE FLEET</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {activeMissions} / {rescueTeams.length}
          </div>
          <div className="text-[11px] text-emerald-300 mt-1">
            {availableResponders} Units on Standby
          </div>
        </div>
      </div>

      {/* Operational Response Efficiency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              {t('Average Dispatch Velocity', 'গড় টিম প্রেরণ সময়')}
            </span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-300 font-mono">11.4 mins</div>
          <p className="text-slate-400 text-[11px]">
            {t(
              'From citizen SOS report submission to operator verification and rescue unit dispatch.',
              'এসওএস পাওয়া থেকে যাচাই ও মাঠপর্যায়ে টিম প্রেরণের গড় সময়।'
            )}
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: '84%' }}></div>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              {t('Shelter Capacity Saturation', 'আশ্রয়কেন্দ্র ধারণক্ষমতা')}
            </span>
            <Building2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-teal-300 font-mono">
            {Math.round((currentShelterOccupancy / totalShelterCapacity) * 100)}%
          </div>
          <p className="text-slate-400 text-[11px]">
            {currentShelterOccupancy.toLocaleString()} of {totalShelterCapacity.toLocaleString()}{' '}
            evacuees safe in designated cyclone shelters.
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full"
              style={{
                width: `${Math.round((currentShelterOccupancy / totalShelterCapacity) * 100)}%`
              }}
            ></div>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              {t('Mission Resolution Success', 'উদ্ধার অভিযান সাফল্য')}
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-300 font-mono">92.8%</div>
          <p className="text-slate-400 text-[11px]">
            {resolvedMissions} incidents successfully concluded without secondary casualty.
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>
      </div>

      {/* Incident Category Distribution & District Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 text-xs">
          <span className="font-bold text-white block uppercase tracking-wider">
            {t('Disaster Incidents by Category', 'ক্যাটাগরি ভিত্তিক জরুরি ঘটনার অনুপাত')}
          </span>
          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / totalIncidents) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-300">{cat}</span>
                    <span className="text-white font-bold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cat === 'Flood'
                          ? 'bg-cyan-500'
                          : cat === 'Cyclone'
                          ? 'bg-teal-500'
                          : cat === 'Fire'
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* District Risk Table */}
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 text-xs">
          <span className="font-bold text-white block uppercase tracking-wider">
            {t('District Level Emergency Summary', 'জেলা পর্যায়ের জরুরি পরিসংখ্যান')}
          </span>
          <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto pr-1">
            {BANGLADESH_DISTRICTS.slice(0, 6).map((dist) => {
              const districtIncidents = incidents.filter(
                (i) => i.location.district === dist.name
              );
              return (
                <div
                  key={dist.name}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-white block">{dist.name}</strong>
                    <span className="text-slate-400 text-[11px]">
                      {dist.division} Division • {dist.riskProfile}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        districtIncidents.length > 0
                          ? 'bg-red-950 text-red-300 border border-red-800/60'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {districtIncidents.length} Active Events
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
